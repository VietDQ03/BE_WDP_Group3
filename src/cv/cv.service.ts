import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cv, CvDocument } from './schemas/cv.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CreateCvDto, UploadFileDto } from './dto/create-cv.dto/create-cv.dto';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { UpdateCvDto } from './dto/create-cv.dto/update-cv.dto';

@Injectable()
export class CvService {
  constructor(
    @InjectModel(Cv.name)
    private cvModel: SoftDeleteModel<CvDocument>
  ) { }

  async uploadFile(uploadFileDto: UploadFileDto, user: IUser) {
    const url = uploadFileDto.url

    let newCv = await this.cvModel.create({
      user_id: user._id,
      url,
      position: null,
      specialPosition: null,
      skill: null,
      experience: null,
      salary: null,
      location: null,
      isJobChangeable: null
    });
    return newCv;
  }

  async create(createCvDto: CreateCvDto, user: IUser) {

    const { url, position, specialPosition, skill, experience, salary, location, isJobChangeable } = createCvDto;

    let newRegister = await this.cvModel.create({
      user_id: user._id,
      url,
      position,
      specialPosition,
      skill,
      experience,
      salary,
      location,
      isJobChangeable
    })
    return newRegister;
  }


  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return `not found job`;

    return await this.cvModel.findById(id);
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.cvModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);


    const result = await this.cvModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
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

  async findAllByUserId(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid userId');
    }

    return await this.cvModel.find({ user_id: userId }).exec();
  }

  async update(updateCvDto: UpdateCvDto, user: IUser) {
    const updated = await this.cvModel.updateOne(
      { _id: updateCvDto._id },
      {
        ...updateCvDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return updated;
  }

  remove(id: number) {
    return `This action removes a #${id} position`;
  }

}