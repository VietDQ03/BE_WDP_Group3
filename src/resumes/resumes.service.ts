import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { CompaniesService } from 'src/companies/companies.service';
import { CompanyDocument } from 'src/companies/schemas/company.schemas';

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
    @Inject(forwardRef(() => MailService))
    private mailService: MailService,
    private companiesService: CompaniesService,
  ) { }
  // async create(createUserCvDto: CreateUserCvDto, user: IUser) {
  //   const { url, jobId, description } = createUserCvDto;
  //   const { email, _id } = user;

  //   // Check job exists
  //   const job = await this.jobService.findOne(jobId.toString());
  //   if (!job) {
  //     throw new NotFoundException('Job not found');
  //   }

  //   // Check company exists
  //   const company = await this.companiesService.findOne(
  //     (job.company as any)._id.toString()
  //   );
  //   if (!company) {
  //     throw new NotFoundException('Company not found');
  //   }

  //   // Check if user already has a PENDING or PASSCV resume for this job
  //   const existingResume = await this.resumeModel.findOne({
  //     userId: _id,
  //     jobId: jobId,
  //     status: { $in: ['PENDING', 'PASSCV'] }
  //   });

  //   if (existingResume) {
  //     let errorMessage = '';
  //     if (existingResume.status === 'PENDING') {
  //       errorMessage = 'Bạn đã có một CV đang chờ duyệt cho công việc này';
  //     } else if (existingResume.status === 'PASSCV') {
  //       errorMessage = 'CV của bạn đã được chấp nhận cho công việc này, bạn sẽ chờ HR gọi phỏng vấn';
  //     }
  //     throw new BadRequestException(errorMessage);
  //   }

  //   // Create new resume if validation passes
  //   const newCV = await this.resumeModel.create({
  //     url,
  //     companyId: company._id,
  //     description,
  //     email,
  //     jobId,
  //     userId: _id,
  //     status: 'PENDING',
  //     createdBy: { _id, email },
  //     history: [
  //       {
  //         status: 'PENDING',
  //         updatedAt: new Date(),
  //         updatedBy: {
  //           _id: user._id,
  //           email: user.email,
  //         },
  //       },
  //     ],
  //   });

  //   //list hr of company
  //   const listHr = await this.userModel.find({
  //     'company._id': company._id.toString(),
  //     isDeleted: false,
  //   });


  //   //send mail to hr
  //   await Promise.all(
  //     listHr.map(async (hr) => {
  //       try {
  //         await this.mailService.sendMailToHR(hr._id.toString(), company.name);
  //       } catch (error) {
  //         throw new BadRequestException(error)
  //       }
  //     })
  //   );

  //   // Send emails
  //   await this.mailService.sendRusumeMail(user._id, createUserCvDto.jobId.toString());

  //   return {
  //     _id: newCV?._id,
  //     createdAt: newCV?.createdAt,
  //   };
  // }
  async create(createUserCvDto: CreateUserCvDto, user: IUser) {
    const { url, jobId, description } = createUserCvDto;
    const { email, _id } = user;

    // Thực hiện các operation check song song
    const [job, existingResume] = await Promise.all([
        this.jobService.findOne(jobId.toString()),
        this.resumeModel.findOne({
            userId: _id,
            jobId: jobId,
            status: { $in: ['PENDING', 'PASSCV'] }
        })
    ]);

    if (!job) {
        throw new NotFoundException('Job not found');
    }

    if (existingResume) {
        const errorMessage = existingResume.status === 'PENDING' 
            ? 'Bạn đã có một CV đang chờ duyệt cho công việc này'
            : 'CV của bạn đã được chấp nhận cho công việc này, bạn sẽ chờ HR gọi phỏng vấn';
        throw new BadRequestException(errorMessage);
    }

    const company = await this.companiesService.findOne((job.company as any)._id.toString());
    if (!company) {
        throw new NotFoundException('Company not found');
    }

    // Create new CV và get list HR song song
    const [newCV, listHr] = await Promise.all([
        this.resumeModel.create({
            url,
            companyId: company._id,
            description,
            email,
            jobId,
            userId: _id,
            status: 'PENDING',
            createdBy: { _id, email },
            history: [{
                status: 'PENDING',
                updatedAt: new Date(),
                updatedBy: { _id: user._id, email: user.email },
            }],
        }),
        this.userModel.find({
            'company._id': company._id.toString(),
            isDeleted: false,
        }, { _id: 1 }) // Chỉ lấy _id
    ]);

    // Gửi email bất đồng bộ - không chờ đợi
    setImmediate(() => {
        Promise.all([
            ...listHr.map(hr => this.mailService.sendMailToHR(hr._id.toString(), company.name)
                .catch(err => console.error(`Failed to send email to HR ${hr._id}:`, err))),
            this.mailService.sendRusumeMail(user._id, jobId.toString())
                .catch(err => console.error(`Failed to send resume email to user ${user._id}:`, err))
        ]);
    });

    return {
        _id: newCV?._id,
        createdAt: newCV?.createdAt,
    };
}
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
        email: { $regex: filter.email, $options: 'i' },
      });
    }

    if (filter.status) {
      searchConditions.push({
        status: filter.status,
      });
    }

    if (filter.company) {
      searchConditions.push({
        company: { $regex: filter.company, $options: 'i' },
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
        [searchType === 'and' ? '$and' : '$or']: searchConditions,
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
    return await this.resumeModel
      .find({
        userId: user._id,
      })
      .sort('-createdAt')
      .populate([
        {
          path: 'companyId',
          select: { name: 1 },
        },
        {
          path: 'jobId',
          select: { name: 1 },
        },
      ]);
  }

  async update(_id: string, status: string, user: IUser) {
    // Validate ObjectId and find resume in one step
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException('Invalid resume ID');
    }

    const resume = await this.resumeModel.findById(_id);
    if (!resume) {
      throw new BadRequestException('Resume not found');
    }

    // Create base update object for resume
    const updateData = {
      status,
      updatedBy: {
        _id: user._id,
        email: user.email,
      },
      $push: {
        history: {
          status,
          updatedAt: new Date(),
          updatedBy: {
            _id: user._id,
            email: user.email,
          },
        },
      },
    };

    // Handle APPROVED status
    if (status === 'APPROVED') {
      const job = await this.jobModel.findOneAndUpdate(
        {
          _id: resume.jobId,
          quantity: { $gt: 0 },
        },
        { $inc: { quantity: -1 } },
        { new: true },
      );

      if (!job) {
        throw new BadRequestException('Job not found or positions are full');
      }

      // If job quantity becomes 0, handle pending resumes
      if (job.quantity === 0) {
        await this.jobModel.findOneAndUpdate(
          {
            _id: resume.jobId,
          },
          { isActive: false },
        );
        const pendingResumes = await this.resumeModel.find({
          jobId: resume.jobId,
          status: { $in: ['PENDING', 'PASSCV'] }, // Changed here to include both statuses
        });

        if (pendingResumes.length > 0) {
          const bulkRejectUpdate = this.resumeModel.updateMany(
            {
              jobId: resume.jobId,
              status: { $in: ['PENDING', 'PASSCV'] }, // Changed here to include both statuses
            },
            {
              status: 'REJECTED',
              updatedBy: {
                _id: user._id,
                email: user.email,
              },
              $push: {
                history: {
                  status: 'REJECTED',
                  updatedAt: new Date(),
                  updatedBy: {
                    _id: user._id,
                    email: user.email,
                  },
                },
              },
            },
          );

          const sendRejectionEmails = pendingResumes.map((pendingResume) =>
            this.mailService.sendResultResumeMail({
              userId: pendingResume.userId.toString(),
              resumeId: pendingResume._id.toString(),
              status: 'REJECTED',
            }),
          );

          await Promise.all([bulkRejectUpdate, ...sendRejectionEmails]);
        }
      }
    }

    // Update current resume
    const [updated] = await Promise.all([
      this.resumeModel.updateOne({ _id }, updateData),
      this.mailService.sendResultResumeMail({
        userId: resume.userId.toString(),
        resumeId: _id,
        status,
      }),
    ]);

    return updated;
  }
  async remove(id: string, user: IUser) {
    await this.resumeModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.resumeModel.softDelete({
      _id: id,
    });
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

      const baseConditions = {
        companyId: companyId,
        isDeleted: false,
      };

      const searchType = filter.searchType || 'or';
      delete filter.searchType;

      let searchConditions: any[] = [];

      if (filter.email) {
        searchConditions.push({
          email: { $regex: filter.email, $options: 'i' },
        });
      }

      if (filter.status) {
        searchConditions.push({
          status: filter.status.toUpperCase(),
        });
      }

      delete filter.email;
      delete filter.status;

      let finalFilter: any = {
        ...baseConditions,
        ...filter,
      };

      if (searchConditions.length > 0) {
        if (searchType === 'or') {
          finalFilter = {
            $and: [baseConditions, { $or: searchConditions }],
          };
        } else {
          finalFilter = {
            $and: [baseConditions, ...searchConditions],
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
          .lean(),
      ]);

      const userIds = [...new Set(resumes.map((resume) => resume.userId))];
      const jobIds = [...new Set(resumes.map((resume) => resume.jobId))];

      const [users, jobs] = await Promise.all([
        this.userModel
          .find({
            _id: { $in: userIds },
            isDeleted: false,
          })
          .select('_id name')
          .lean(),

        this.jobModel
          .find({
            _id: { $in: jobIds },
            isDeleted: false,
          })
          .select('_id name')
          .lean(),
      ]);

      const userMap = new Map(users.map((user) => [user._id.toString(), user]));
      const jobMap = new Map(jobs.map((job) => [job._id.toString(), job]));

      const transformedResult = resumes.map((resume) => {
        const user = userMap.get(resume.userId.toString());
        const job = jobMap.get(resume.jobId.toString());

        return {
          ...resume,
          userName: user?.name,
          jobName: job?.name,
        };
      });

      return {
        meta: {
          current: +currentPage,
          pageSize: +limit,
          pages: Math.ceil(totalItems / defaultLimit),
          total: totalItems,
        },
        result: transformedResult,
      };
    } catch (error) {
      console.error('Error in findByCompany:', error);
      throw error;
    }
  }
}
