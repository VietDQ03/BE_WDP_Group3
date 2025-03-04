import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { MailService } from 'src/mail/mail.service';
import { JobsService } from 'src/jobs/jobs.service';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Job, JobDocument } from 'src/jobs/shemas/job.schema';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>,
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
    private jobService: JobsService,
    private mailService: MailService
  ) { }
  

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const searchConditions: any[] = [];
    const searchType = filter.searchType || 'or'; // mặc định là OR nếu không specified
    delete filter.searchType;

    // Thêm điều kiện tìm kiếm cho email và status và company
    if (filter.email) {
      searchConditions.push({
        email: { $regex: filter.email, $options: 'i' }
      });
    }

    if (filter.status) {
      searchConditions.push({
        status: filter.status
      });
    }

    if (filter.company) {
      searchConditions.push({
        company: { $regex: filter.company, $options: 'i' }
      });
    }

    // Xóa các trường đã xử lý
    delete filter.email;
    delete filter.status;
    delete filter.company;

    // Tạo finalFilter
    let finalFilter: any = { ...filter };

    // Kiểm tra nếu có điều kiện tìm kiếm
    if (searchConditions.length > 0) {
      finalFilter = {
        ...filter,
        [searchType === 'and' ? '$and' : '$or']: searchConditions
      };
    }

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.resumeModel.find(finalFilter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel
      .find(finalFilter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found resume');
    }

    return await this.resumeModel.findById(id);
  }
  async findByUsers(user: IUser) {
    return await this.resumeModel.find({
      userId: user._id,
    })
      .sort("-createdAt")
      .populate([
        {
          path: "companyId",
          select: { name: 1 }
        },
        {
          path: "jobId",
          select: { name: 1 }
        }
      ])
  }


  async update(_id: string, status: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException('not found resume');
    }

    const updated = await this.resumeModel.updateOne(
      { _id },
      {
        status,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
        $push: {
          history: {
            status: status,
            updatedAt: new Date(),
            updatedBy: {
              _id: user._id,
              email: user.email,
            },
          },
        },
      },
    );

    return updated;
  }

  async remove(id: string, user: IUser) {
    await this.resumeModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return this.resumeModel.softDelete({
      _id: id
    })
  }
  async findByCompany(companyId: string, currentPage: number, limit: number, qs: string) {
    try {
      const { filter, sort, population } = aqp(qs);
      delete filter.current;
      delete filter.pageSize;

      const baseConditions = {
        companyId: companyId,
        isDeleted: false
      };

      const searchType = filter.searchType || 'or';
      delete filter.searchType;

      let searchConditions: any[] = [];

      if (filter.email) {
        searchConditions.push({
          email: { $regex: filter.email, $options: 'i' }
        });
      }

      if (filter.status) {
        searchConditions.push({
          status: filter.status.toUpperCase()
        });
      }

      delete filter.email;
      delete filter.status;

      let finalFilter: any = {
        ...baseConditions,
        ...filter
      };

      if (searchConditions.length > 0) {
        if (searchType === 'or') {
          finalFilter = {
            $and: [
              baseConditions,
              { $or: searchConditions }
            ]
          };
        } else {
          finalFilter = {
            $and: [
              baseConditions,
              ...searchConditions
            ]
          };
        }
      }

      const offset = (+currentPage - 1) * +limit;
      const defaultLimit = +limit ? +limit : 10;

      const [totalItems, resumes] = await Promise.all([
        this.resumeModel.countDocuments(finalFilter),
        this.resumeModel
          .find(finalFilter)
          .skip(offset)
          .limit(defaultLimit)
          .sort(sort as any)
          .lean()
      ]);

      const userIds = [...new Set(resumes.map(resume => resume.userId))];
      const jobIds = [...new Set(resumes.map(resume => resume.jobId))];

      const [users, jobs] = await Promise.all([
        this.userModel.find({
          _id: { $in: userIds },
          isDeleted: false
        })
          .select('_id name')
          .lean(),

        this.jobModel.find({
          _id: { $in: jobIds },
          isDeleted: false
        })
          .select('_id name')
          .lean()
      ]);

      const userMap = new Map(users.map(user => [user._id.toString(), user]));
      const jobMap = new Map(jobs.map(job => [job._id.toString(), job]));

      const transformedResult = resumes.map(resume => {
        const user = userMap.get(resume.userId.toString());
        const job = jobMap.get(resume.jobId.toString());

        return {
          ...resume,
          userName: user?.name,
          jobName: job?.name
        };
      });

      return {
        meta: {
          current: +currentPage,
          pageSize: +limit,
          pages: Math.ceil(totalItems / defaultLimit),
          total: totalItems
        },
        result: transformedResult
      };

    } catch (error) {
      console.error('Error in findByCompany:', error);
      throw error;
    }
  }
}
