import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User as UserM, UserDocument, HRStatus } from './schemas/user.schema';
import mongoose, { Model, Types } from 'mongoose';
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
  ) { }

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
      hr: HRStatus.INACTIVE
    });
    return newRegister;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    const offset = (currentPage - 1) * limit;
    const defaultLimit = limit || 10;

    try {
      // Sử dụng aggregation để bỏ qua middleware
      const [result] = await this.userModel
        .aggregate([
          // Stage 1: Match với điều kiện search
          {
            $match: {
              ...(filter.email && {
                email: { $regex: filter.email, $options: 'i' },
              }),
              ...(filter.name && {
                name: { $regex: filter.name, $options: 'i' },
              }),
              ...(filter.role && {
                role: new mongoose.Types.ObjectId(filter.role),
              }),
              ...(filter.isActived !== undefined && {
                isActived: filter.isActived,
              }),
            },
          },

          // Stage 2: Facet để lấy cả total và data
          {
            $facet: {
              metadata: [{ $count: 'total' }],
              data: [
                { $skip: offset },
                { $limit: defaultLimit },
                // Populate role
                {
                  $lookup: {
                    from: 'roles',
                    localField: 'role',
                    foreignField: '_id',
                    as: 'roleInfo',
                  },
                },
                {
                  $unwind: {
                    path: '$roleInfo',
                    preserveNullAndEmptyArrays: true,
                  },
                },
                // Remove password
                {
                  $project: {
                    password: 0,
                  },
                },
              ],
            },
          },
        ])
        .exec();

      const totalItems = result.metadata[0]?.total || 0;
      const totalPages = Math.ceil(totalItems / defaultLimit);

      return {
        meta: {
          current: currentPage,
          pageSize: limit,
          pages: totalPages,
          total: totalItems,
        },
        result: result.data,
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
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
      const updated = await this.userModel
        .findByIdAndUpdate(
          _id,
          {
            $set: {
              ...updateUserDto,
              updatedBy: {
                _id: user._id,
                email: user.email,
              },
            },
          },
          {
            new: true,
            runValidators: true,
          },
        )
        .select('-password -email')
        .populate('role', ['_id', 'name']); // Thêm populate cho role

      if (!updated) {
        throw new BadRequestException('Update failed');
      }

      return updated;
    } catch (error) {
      console.error('Update error:', error);
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

  async findByIds(userIds: Types.ObjectId[] | string[]) {
    return this.userModel.find({
      _id: {
        $in: userIds.map(id =>
          typeof id === 'string' ? new Types.ObjectId(id) : id
        )
      }
    }).select('email');
  }
}
