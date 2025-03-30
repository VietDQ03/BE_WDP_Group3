import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Job, JobDocument } from './shemas/job.schema';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose, { Types } from 'mongoose';
import { UserDocument } from 'src/users/schemas/user.schema';
import { CvDocument } from 'src/cv/schemas/cv.schema';
import { CvService } from 'src/cv/cv.service';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/mail/mail.service';
import { CompanyDocument } from 'src/companies/schemas/company.schemas';
import { CompaniesService } from 'src/companies/companies.service';
import { NotificationService } from 'src/notifications/notification.service';
import { SkillsService } from 'src/cv/skills/skills.service';
import { SkillDocument } from 'src/cv/skills/schemas/skill.schema';

@Injectable()
export class JobsService implements OnModuleInit {
  private checkJobStatusInterval: NodeJS.Timeout;

  constructor(
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
    private cvService: CvService,
    private usersService: UsersService,
    @Inject(forwardRef(() => MailService))
    private mailService: MailService,
    @InjectModel('User')
    private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel('Skill')
    private skillModel: SoftDeleteModel<SkillDocument>,
    private companiesService: CompaniesService,
    private notificationService: NotificationService,
    private skillService: SkillsService,
  ) { }

  onModuleInit() {
    // Check job status every minute
    this.checkJobStatusInterval = setInterval(() => {
      this.updateExpiredJobs();
    }, 60000); // 60000 ms = 1 minute
  }

  onModuleDestroy() {
    if (this.checkJobStatusInterval) {
      clearInterval(this.checkJobStatusInterval);
    }
  }

  private async updateExpiredJobs() {
    try {
      const currentDate = new Date();
      
      // Find and update all jobs where endDate has passed and isActive is still true
      const result = await this.jobModel.updateMany(
        {
          endDate: { $lt: currentDate },
          isActive: true
        },
        {
          $set: { isActive: false }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`Updated ${result.modifiedCount} expired jobs to inactive`);
      }
    } catch (error) {
      console.error('Error updating expired jobs:', error);
    }
  }

  async create(createJobDto: CreateJobDto, user: IUser) {
    const {
      name,
      skills,
      company,
      salary,
      quantity,
      level,
      description,
      startDate,
      endDate,
      isActive,
      location,
    } = createJobDto;

    try {
      // Validate date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      const currentDate = new Date();
      
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Check if endDate has already passed
      const initialActiveStatus = end > currentDate;

      // Check premium của user
      const currentUser = await this.userModel.findById(user._id);
      if (currentUser.premium === 0) {
        throw new BadRequestException(
          'Bạn đã hết lượt đăng tin, bạn cần nâng cấp tài khoản của bạn',
        );
      }

      let newJob = await this.jobModel.create({
        name,
        skills,
        company,
        salary,
        quantity,
        level,
        description,
        startDate,
        endDate,
        isActive: initialActiveStatus,
        location,
        createdBy: {
          _id: user._id,
          email: user.email,
        },
      });

      this.NotificationForUser(newJob._id.toString());

      // Giảm số lượt premium còn lại
      await this.userModel.findByIdAndUpdate(user._id, {
        premium: currentUser.premium - 1,
      });

      return {
        _id: newJob?._id,
        createdAt: newJob?.createdAt,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Error creating job: ${error.message}`);
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    let searchFilter: any = {};

    if (filter.name) {
      searchFilter.name = { $regex: filter.name, $options: 'i' };
    }

    if (filter.company) {
      searchFilter.company = new mongoose.Types.ObjectId(filter.company);
    }

    if (filter.location) {
      searchFilter.location = { $regex: filter.location, $options: 'i' };
    }

    if (filter.level) {
      searchFilter.level = { $regex: filter.level, $options: 'i' };
    }

    if (filter.skills) {
      const skillNames = Array.isArray(filter.skills) 
        ? filter.skills 
        : [filter.skills];
      
      const skills = await this.skillModel.find({
        name: { $in: skillNames.map(name => new RegExp(name, 'i')) }
      }).select('_id');

      const skillIds = skills.map(skill => skill._id);
      
      if (skillIds.length > 0) {
        searchFilter.skills = {
          $all: skillIds
        };
      }
    }

    if (filter.isActive !== undefined) {
      searchFilter.isActive = filter.isActive === 'true';
    }

    delete filter.name;
    delete filter.company;
    delete filter.location;
    delete filter.level;
    delete filter.skills;
    delete filter.isActive;

    const finalFilter = { ...searchFilter, ...filter };

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit || 10;

    try {
      const [totalItems, result] = await Promise.all([
        this.jobModel.countDocuments(finalFilter),
        this.jobModel
          .find(finalFilter)
          .skip(offset)
          .limit(defaultLimit)
          .sort(sort as any)
          .populate({
            path: 'skills',
            select: 'name description',
          })
          .populate({
            path: 'company',
            select: '_id name logo'
          })
          .populate(population)
          .lean()
      ]);

      return {
        meta: {
          current: +currentPage,
          pageSize: +limit,
          pages: Math.ceil(totalItems / defaultLimit),
          total: totalItems,
        },
        result,
      };
    } catch (error) {
      throw new Error(`Error finding jobs: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<JobDocument | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid job ID format');
      }

      const job = await this.jobModel.findById(id)
        .populate({
          path: 'skills',
          select: 'name description'
        })
        .populate({
          path: 'company',
          select: '_id name logo'
        })
        .populate({
          path: 'createdBy',
          select: 'email name avatar'
        })
        .populate({
          path: 'updatedBy',
          select: 'email name avatar'
        });

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      if (job.isDeleted) {
        throw new BadRequestException('Job has been deleted');
      }

      return job;

    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error finding job: ${error.message}`);
    }
  }

  async update(_id: string, updateJobDto: UpdateJobDto, user: IUser) {
    if (updateJobDto.startDate || updateJobDto.endDate) {
      const currentJob = await this.jobModel.findById(_id);
      const start = new Date(updateJobDto.startDate || currentJob.startDate);
      const end = new Date(updateJobDto.endDate || currentJob.endDate);
      const currentDate = new Date();

      // Update isActive based on new endDate
      if (updateJobDto.endDate) {
        updateJobDto.isActive = end > currentDate;
      }

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const updated = await this.jobModel.updateOne(
      { _id },
      {
        ...updateJobDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return updated;
  }

  async NotificationForUser(JobId: string) {
    try {
      const job = await this.jobModel.findById(JobId);
      if (!job) {
        throw new NotFoundException('Job not found');
      }
      const company = await this.companiesService.findOne(job.company.toString());
      if (!company) {
        throw new NotFoundException('Company not found');
      }

      const skillArray = Array.isArray(job.skills) ? job.skills : [job.skills];
      const skillIds = skillArray.map(skillId =>
        new Types.ObjectId(skillId.toString())
      );

      const uniqueUserIds = new Set<string>();

      for (const skillId of skillArray) {
        const cvs = await this.cvService.findBySkill(skillId.toString());

        cvs.forEach(cv => {
          if (cv.user_id && mongoose.Types.ObjectId.isValid(cv.user_id.toString())) {
            uniqueUserIds.add(cv.user_id.toString());
          }
        });
      }

      const notifications = await Promise.all(
        Array.from(uniqueUserIds).map(userId =>
          this.notificationService.create({
            userId: new Types.ObjectId(userId),
            jobId: new Types.ObjectId(JobId),
            companyId: new Types.ObjectId(company._id.toString()),
            skillId: skillIds,
          })
        )
      );

      return notifications;

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to create notifications');
    }
  }

  async findByCompany(
    companyId: string,
    currentPage: number,
    limit: number,
    qs: string,
  ) {
    try {
      const { filter, sort, population } = aqp(qs);

      delete filter.current;
      delete filter.pageSize;

      let searchFilter: any = {
        company: new mongoose.Types.ObjectId(companyId),
      };

      if (filter.name) {
        searchFilter.name = { $regex: filter.name, $options: 'i' };
      }

      if (filter.company) {
        searchFilter.company = new mongoose.Types.ObjectId(filter.company);
      }

      if (filter.location) {
        searchFilter.location = { $regex: filter.location, $options: 'i' };
      }

      if (filter.level) {
        searchFilter.level = { $regex: filter.level, $options: 'i' };
      }

      if (filter.skills) {
        const skillIds = Array.isArray(filter.skills)
          ? filter.skills
          : [filter.skills];

        searchFilter.skills = {
          $all: skillIds.map((id) => new mongoose.Types.ObjectId(id)),
        };
      }

      if (filter.isActive !== undefined) {
        searchFilter.isActive = filter.isActive === 'true';
      }

      if (filter.minSalary || filter.maxSalary) {
        searchFilter.salary = {};
        if (filter.minSalary)
          searchFilter.salary.$gte = parseInt(filter.minSalary);
        if (filter.maxSalary)
          searchFilter.salary.$lte = parseInt(filter.maxSalary);
      }

      delete filter.name;
      delete filter.company;
      delete filter.location;
      delete filter.level;
      delete filter.skills;
      delete filter.isActive;
      delete filter.minSalary;
      delete filter.maxSalary;

      const finalFilter = { ...searchFilter, ...filter };

      const offset = (+currentPage - 1) * +limit;
      const defaultLimit = +limit || 10;

      const [totalItems, result] = await Promise.all([
        this.jobModel.countDocuments(finalFilter),
        this.jobModel
          .find(finalFilter)
          .skip(offset)
          .limit(defaultLimit)
          .sort(sort as any)
          .populate({
            path: 'skills',
            select: 'name description',
          })
          .populate({
            path: 'company',
            select: '_id name logo'
          })
          .populate(population)
          .lean(),
      ]);

      return {
        meta: {
          current: +currentPage,
          pageSize: +limit,
          pages: Math.ceil(totalItems / defaultLimit),
          total: totalItems,
        },
        result,
      };
    } catch (error) {
      console.error('Error in findByCompany:', error);
      throw new Error(`Failed to find jobs by company: ${error.message}`);
    }
  }
  async remove(_id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) return `not found job`;

    await this.jobModel.updateOne(
      { _id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.jobModel.softDelete({
      _id,
    });
  }
}