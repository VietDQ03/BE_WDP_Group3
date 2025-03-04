import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Job, JobDocument } from './shemas/job.schema';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
    @InjectModel('User') // thêm inject userModel
    private userModel: SoftDeleteModel<UserDocument>,
  ) {}

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
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 7) {
        throw new BadRequestException(
          'Bạn chỉ được đăng tuyển trong vòng 1 tuần kể từ ngày bắt đầu',
        );
      }

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
        isActive,
        location,
        createdBy: {
          _id: user._id,
          email: user.email,
        },
      });

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

    const searchConditions: any[] = [];

    if (filter.name) {
      searchConditions.push({
        name: { $regex: filter.name, $options: 'i' },
      });
    }

    if (filter.company) {
      searchConditions.push({
        company: { $regex: filter.company, $options: 'i' },
      });
    }

    if (filter.location) {
      searchConditions.push({
        location: filter.location.toUpperCase(),
      });
    }

    if (filter.level) {
      searchConditions.push({
        level: filter.level.toUpperCase(),
      });
    }

    if (filter.skills) {
      searchConditions.push({
        skills: {
          $in: Array.isArray(filter.skills)
            ? filter.skills.map((skill) => skill.toUpperCase())
            : [filter.skills.toUpperCase()],
        },
      });
    }

    if (filter.isActive !== undefined) {
      searchConditions.push({
        isActive: filter.isActive === 'true',
      });
    }

    delete filter.name;
    delete filter.company;
    delete filter.location;
    delete filter.level;
    delete filter.skills;
    delete filter.isActive;

    let finalFilter: any = { ...filter };

    if (searchConditions.length > 0) {
      finalFilter = {
        ...filter,
        $and: searchConditions,
      };
    }

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;

    const totalItems = await this.jobModel.countDocuments(finalFilter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel
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
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    return await this.jobModel.findById(id);
  }

  async update(_id: string, updateJobDto: UpdateJobDto, user: IUser) {
    // If dates are being updated, validate them
    if (updateJobDto.startDate || updateJobDto.endDate) {
      // Get current job data to handle partial updates
      const currentJob = await this.jobModel.findById(_id);
      const start = new Date(updateJobDto.startDate || currentJob.startDate);
      const end = new Date(updateJobDto.endDate || currentJob.endDate);

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 7) {
        throw new BadRequestException(
          'Bạn chỉ được đăng tuyển trong vòng 1 tuần kể từ ngày bắt đầu',
        );
      }
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

      const searchConditions: any[] = [{ 'company._id': companyId }];

      if (filter.name) {
        searchConditions.push({
          name: { $regex: filter.name, $options: 'i' },
        });
      }

      if (filter.company) {
        searchConditions.push({
          company: { $regex: filter.company, $options: 'i' },
        });
      }

      if (filter.location) {
        searchConditions.push({
          location: filter.location.toUpperCase(),
        });
      }

      if (filter.level) {
        searchConditions.push({
          level: filter.level.toUpperCase(),
        });
      }

      if (filter.skills) {
        searchConditions.push({
          skills: {
            $in: Array.isArray(filter.skills)
              ? filter.skills.map((skill) => skill.toUpperCase())
              : [filter.skills.toUpperCase()],
          },
        });
      }

      if (filter.isActive !== undefined) {
        const isActiveValue =
          filter.isActive === 'true' || filter.isActive === true;
        searchConditions.push({
          isActive: isActiveValue,
        });
      }

      delete filter.name;
      delete filter.company;
      delete filter.location;
      delete filter.level;
      delete filter.skills;
      delete filter.isActive;

      const finalFilter = {
        ...filter,
        $and: searchConditions,
      };

      const offset = (+currentPage - 1) * +limit;
      const defaultLimit = +limit ? +limit : 10;

      // Thực hiện 2 query song song để tối ưu performance
      const [totalItems, result] = await Promise.all([
        this.jobModel.countDocuments(finalFilter),
        this.jobModel
          .find(finalFilter)
          .skip(offset)
          .limit(defaultLimit)
          .sort(sort as any)
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
      throw error;
    }
  }
}
