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
    private roleModel: SoftDeleteModel<RoleDocument>
  ) { }


  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  }

  async create(createUserDto: CreateUserDto, @UserS() user: IUser) {
    const {
      name, email, password, age,
      gender, address
    }
      = createUserDto;
    //add logic check email
    const isExist = await this.userModel.findOne({ email });
    const role = await this.roleModel.findOne({ name: "NORMAL_USER" });
    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã tồn tại trên hệ thống. Vui lòng sử dụng email khác.`)
    }

    const hashPassword = this.getHashPassword(password);

    let newUser = await this.userModel.create({
      name, email,
      password: hashPassword,
      age,
      gender, address, role,
      premium: 2,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return newUser;
  }

  async register(user: RegisterUserDto) {
    const { name, email, password, age, gender, address } = user;
    //add logic check email
    const isExist = await this.userModel.findOne({ email });

    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã tồn tại trên hệ thống. Vui lòng sử dụng email khác.`)
    }

    //fetch user role
    const role = await this.roleModel.findOne({ name: "NORMAL_USER" });

    const hashPassword = this.getHashPassword(password);
    let newRegister = await this.userModel.create({
      name, email,
      password: hashPassword,
      age,
      gender,
      address,
      role,
      isActived: false
    })
    return newRegister;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);


    const result = await this.userModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select('-password')
      .populate(population)
      .exec();


    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages,  //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }

  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return null;

    return await this.userModel.findOne({
      _id: id
    })
      .select("+password")
      .populate({ path: "role", select: { name: 1, _id: 1 } })


    //exclude >< include
  }

  async findOneByUsername(username: string) {
    return this.userModel.findOne({
      email: username
    }).populate({
      path: "role",
      select: { name: 1 }
    });
  }



  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async update(updateUserDto: UpdateUserDto, user: IUser, _id: string) {
    // Validate MongoID
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Check if user exists
    const existingUser = await this.userModel.findById(_id);
    if (!existingUser) {
      throw new BadRequestException('User not found');
    }

    try {
      const updated = await this.userModel.findByIdAndUpdate(
        _id,
        {
          ...updateUserDto,
          updatedBy: {
            _id: user._id,
            email: user.email
          }
        },
        {
          new: true, // return the updated document
          runValidators: true // run mongoose validation
        }
      ).select('-password -email -isActived');

      return updated;

    } catch (error) {
      throw new BadRequestException(`Error updating user: ${error.message}`);
    }
  }

  async remove(id: string, user: IUser) {

    if (!mongoose.Types.ObjectId.isValid(id))
      return `not found user`;

    const foundUser = await this.userModel.findById(id);
    if (foundUser && foundUser.email === "admin@gmail.com") {
      throw new BadRequestException("Không thể xóa tài khoản admin@gmail.com");
    }

    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return this.userModel.softDelete({
      _id: id
    })
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne(
      { _id },
      { refreshToken }
    )
  }

  updateUserPassword = async (_id: string, hashedPassword: string) => {
    return await this.userModel.updateOne(
      { _id },
      { password: hashedPassword }
    )
  }

  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken })
      .populate({
        path: "role",
        select: { name: 1 }
      });
  }

  activeAccount = async (email: string, status: boolean) => {
    return await this.userModel.updateOne(
      { email },
      { isActived: status }
    )
  }

}
