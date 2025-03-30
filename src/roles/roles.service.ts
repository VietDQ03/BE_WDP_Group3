import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role, RoleDocument } from './schemas/role.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { ADMIN_ROLE } from 'src/databases/sample';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>
  ) { }

  async create(createRoleDto: CreateRoleDto, user: IUser) {
    const { name, description, isActive, permissions } = createRoleDto;

    const isExist = await this.roleModel.findOne({ name });
    if (isExist) {
      throw new BadRequestException(`Role với name="${name}" đã tồn tại!`)
    }

    const newRole = await this.roleModel.create({
      name, description, isActive, permissions,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return {
      _id: newRole?._id,
      createdAt: newRole?.createdAt
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    // Initialize finalFilter
    let finalFilter: any = {};

    // Handle name search with proper type checking
    if (filter.name) {
      if (typeof filter.name === 'string') {
        finalFilter.name = { $regex: filter.name, $options: 'i' };
      } else if (typeof filter.name === 'object') {
        // Handle special MongoDB operators if needed
        if (filter.name.$regex) {
          finalFilter.name = {
            $regex: filter.name.$regex,
            $options: filter.name.$options || 'i'
          };
        }
      }
      delete filter.name;
    }

    // Merge remaining filters
    finalFilter = {
      ...finalFilter,
      ...filter
    };

    // Ensure positive numbers for pagination
    const validCurrentPage = Math.max(1, +currentPage || 1);
    const validLimit = Math.max(1, +limit || 10);
    const offset = (validCurrentPage - 1) * validLimit;

    try {
      // Get total count
      const totalItems = await this.roleModel.countDocuments(finalFilter);
      const totalPages = Math.ceil(totalItems / validLimit);

      // Get paginated results
      const result = await this.roleModel
        .find(finalFilter)
        .skip(offset)
        .limit(validLimit)
        .sort(sort as any)
        .populate(population)
        .select(projection as any)
        .exec();

      return {
        meta: {
          current: validCurrentPage,
          pageSize: validLimit,
          pages: totalPages,
          total: totalItems,
        },
        result,
      };
    } catch (error) {
      // Handle errors appropriately
      throw new Error(`Failed to fetch roles: ${error.message}`);
    }
  }


  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("not found role")
    }

    return (await this.roleModel.findById(id)).populate({
      path: "permissions",
      select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 }
    });
  }

  async update(_id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException("not found role")
    }

    const { name, description, isActive, permissions } = updateRoleDto;

    // const isExist = await this.roleModel.findOne({ name });
    // if (isExist) {
    //   throw new BadRequestException(`Role với name=${name} đã tồn tại!`)
    // }

    const updated = await this.roleModel.updateOne(
      { _id },
      {
        name, description, isActive, permissions,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      });

    return updated;
  }

  async remove(id: string, user: IUser) {
    const foundRole = await this.roleModel.findById(id);
    if (foundRole.name === ADMIN_ROLE) {
      throw new BadRequestException("Không thể xóa role ADMIN");
    }
    await this.roleModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return this.roleModel.softDelete({
      _id: id
    })
  }
}

