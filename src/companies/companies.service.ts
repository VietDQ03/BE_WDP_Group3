import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import { Company, CompanyDocument } from './schemas/company.schemas';
import mongoose from 'mongoose';
import { Job, JobDocument } from 'src/jobs/shemas/job.schema';
import { HRStatus, User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name)
    private companyModel: SoftDeleteModel<CompanyDocument>,
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto, user: IUser) {
     // Create company
     const company = await this.companyModel.create({
      ...createCompanyDto,
      isActive: false,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    // Update user's HR status to ON_LEAVE
    await this.userModel.findByIdAndUpdate(
      user._id,
      {
        hr: HRStatus.ON_LEAVE,
      },
      { new: true }
    ); 

    return company;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    // Tạo searchFilter để áp dụng các điều kiện tìm kiếm
    const searchConditions: any[] = [];

    // Thêm điều kiện tìm kiếm theo name
    if (filter.name) {
      searchConditions.push({
        name: { $regex: filter.name, $options: 'i' },
      });
    }

    // Thêm điều kiện tìm kiếm theo address
    if (filter.address) {
      searchConditions.push({
        address: { $regex: filter.address, $options: 'i' },
      });
    }

    // Thêm điều kiện tìm kiếm theo isActive
    if (filter.isActive !== undefined) {
      searchConditions.push({
        isActive: filter.isActive,
      });
    }

    // Xóa các trường đã xử lý
    delete filter.name;
    delete filter.address;
    delete filter.isActive;

    // Tạo finalFilter
    let finalFilter: any = { ...filter };

    // Kiểm tra nếu có điều kiện tìm kiếm
    if (searchConditions.length > 0) {
      finalFilter = {
        ...filter,
        $and: searchConditions,
      };
    }

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;

    const totalItems = await this.companyModel.countDocuments(finalFilter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.companyModel
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
    // Kiểm tra id có phải ObjectId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid company id format: ${id}`);
    }

    const company = await this.companyModel.findById(id);
    
    // Kiểm tra nếu không tìm thấy company
    if (!company) {
      throw new BadRequestException(`Company not found with id: ${id}`);
    }

    return company;
}
  async update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
    // First, update the company
    await this.companyModel.updateOne(
      { _id: id },
      {
        ...updateCompanyDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  
    // Fetch the updated company to check its status
    const updatedCompany = await this.companyModel.findById(id);
    
    // If company is now inactive, update all related jobs
    if (updatedCompany?.isActive === false) {
      await this.jobModel.updateMany(
        { company: id },
        {
          isActive: false,
          updatedBy: {
            _id: user._id,
            email: user.email,
          },
        }
      );
    }
  
    return updatedCompany;
  }
  async remove(id: string, user: IUser) {
    await this.companyModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.companyModel.softDelete({
      _id: id,
    });
  }
}
