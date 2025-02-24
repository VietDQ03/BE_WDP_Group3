import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import { Company, CompanyDocument } from './schemas/company.schemas';
import mongoose from 'mongoose';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name)
    private companyModel: SoftDeleteModel<CompanyDocument>,
  ) { }

  create(createCompanyDto: CreateCompanyDto, user: IUser) {
    return this.companyModel.create({
      ...createCompanyDto,
      isActive: false,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
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
            name: { $regex: filter.name, $options: 'i' }
        });
    }

    // Thêm điều kiện tìm kiếm theo address
    if (filter.address) {
        searchConditions.push({
            address: { $regex: filter.address, $options: 'i' }
        }); 
    }

    // Xóa các trường đã xử lý
    delete filter.name;
    delete filter.address;

    // Tạo finalFilter 
    let finalFilter: any = { ...filter };

    // Kiểm tra nếu có điều kiện tìm kiếm
    if (searchConditions.length > 0) {
        finalFilter = {
            ...filter,
            $and: searchConditions  // Đổi từ $or thành $and
        };
    }

    const offset = (+currentPage - 1) * (+limit);
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`not found company with id=${id}`);
    }

    return await this.companyModel.findById(id);
  }



  async update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
    return await this.companyModel.updateOne(
      { _id: id },
      {
        ...updateCompanyDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
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
