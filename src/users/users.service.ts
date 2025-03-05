import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User as UserM, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import { UserS } from 'src/decorator/customize';
import aqp from 'api-query-params';
import { USER_ROLE } from 'src/databases/sample';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserM.name)
    private userModel: SoftDeleteModel<UserDocument>,

    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  async create(createUserDto: CreateUserDto, @UserS() user: IUser) {
    const { name, email, password, age, gender, address } = createUserDto;
    //add logic check email
    const isExist = await this.userModel.findOne({ email });
    const role = await this.roleModel.findOne({ name: 'NORMAL_USER' });
    if (isExist) {
      throw new BadRequestException(
        `Email: ${email} đã tồn tại trên hệ thống. Vui lòng sử dụng email khác.`,
      );
    }

    const hashPassword = this.getHashPassword(password);

    let newUser = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      age,
      gender,
      address,
      role,
      premium: 2,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return newUser;
  }

  async register(user: RegisterUserDto) {
    const { name, email, password, age, gender, address } = user;
    //add logic check email
    const isExist = await this.userModel.findOne({ email });

    if (isExist) {
      const message = isExist.isActived
        ? `Email: ${email} đã được kích hoạt trên hệ thống. Vui lòng sử dụng email khác.`
        : `Email: ${email} đã đăng ký nhưng chưa kích hoạt. Vui lòng kiểm tra email để kích hoạt.`;

      throw new BadRequestException(message);
    }

    //fetch user role
    const role = await this.roleModel.findOne({ name: 'NORMAL_USER' });

    const hashPassword = this.getHashPassword(password);
    let newRegister = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      age,
      gender,
      address,
      role,
      isActived: false,
    });
    return newRegister;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    
    delete filter.current;
    delete filter.pageSize;

    const searchConditions: any[] = [];

    // Search by email
    if (filter.email) {
        searchConditions.push({
            email: { $regex: filter.email, $options: 'i' }
        });
    }

    // Search by name
    if (filter.name) {
        searchConditions.push({
            name: { $regex: filter.name, $options: 'i' }
        });
    }

    // Search by role (ObjectId)
    if (filter.role) {
        searchConditions.push({
            role: filter.role // Direct match for ObjectId
        });
    }

    // Search by isActived
    if (filter.isActived !== undefined) {
        searchConditions.push({
            isActived: filter.isActived
        });
    }

    // Remove processed fields
    delete filter.email;
    delete filter.name;
    delete filter.role;
    delete filter.isActived;

    // Create final filter
    let finalFilter: any = { ...filter };

    if (searchConditions.length > 0) {
        finalFilter = {
            ...filter,
            $and: searchConditions
        };
    }

    const offset = (+currentPage - 1) * (+limit);
    const defaultLimit = +limit ? +limit : 10;

    const totalItems = await this.userModel.countDocuments(finalFilter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
        .find(finalFilter)
        .skip(offset)
        .limit(defaultLimit)
        .sort(sort as any)
        .select('-password')
        .populate(population)
        .exec();

    return {
        meta: {
            current: currentPage,
            pageSize: limit,
            pages: totalPages,
            total: totalItems
        },
        result
    };
}

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    return await this.userModel
      .findOne({
        _id: id,
      })
      .select('+password')
      .populate({ path: 'role', select: { name: 1, _id: 1 } });

    //exclude >< include
  }

  async findOneByUsername(username: string) {
    return this.userModel
      .findOne({
        email: username,
      })
      .populate({
        path: 'role',
        select: { name: 1 },
      });
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async update(updateUserDto: UpdateUserDto, user: IUser, _id: string) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException('Invalid user ID');
    }


    // Kiểm tra dữ liệu đầu vào
    if (!updateUserDto || Object.keys(updateUserDto).length === 0) {
      throw new BadRequestException('Update data is required');
    }

    const existingUser = await this.userModel.findById(_id);
    if (!existingUser) {
      throw new BadRequestException('User not found');
    }

    try {
      // Bỏ bước lọc dữ liệu, update trực tiếp
      const updated = await this.userModel
        .findByIdAndUpdate(
          _id,
          {
            $set: {
              ...updateUserDto, // sử dụng trực tiếp updateUserDto
              updatedBy: {
                _id: user._id,
                email: user.email,
              },
            }
          },
          {
            new: true,
            runValidators: true,
          },
        )
        .select('-password -email');


      if (!updated) {
        throw new BadRequestException('Update failed');
      }

      return updated;
    } catch (error) {
      console.error("Update error:", error);
      throw new BadRequestException(`Error updating user: ${error.message}`);
    }
}
  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return `not found user`;

    const foundUser = await this.userModel.findById(id);
    if (foundUser && foundUser.email === 'admin@gmail.com') {
      throw new BadRequestException('Không thể xóa tài khoản admin@gmail.com');
    }

    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.userModel.softDelete({
      _id: id,
    });
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne({ _id }, { refreshToken });
  };

  updateUserPassword = async (_id: string, hashedPassword: string) => {
    return await this.userModel.updateOne(
      { _id },
      { password: hashedPassword },
    );
  };

  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken }).populate({
      path: 'role',
      select: { name: 1 },
    });
  };

  activeAccount = async (email: string, status: boolean) => {
    return await this.userModel.updateOne({ email }, { isActived: status });
  };
}
