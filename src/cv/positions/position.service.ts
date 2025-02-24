import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { InjectModel } from '@nestjs/mongoose';
import { position, positionDocument } from './schemas/position.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class positionService {
  constructor(
    @InjectModel(position.name)
    private positionModel: SoftDeleteModel<positionDocument>
  ) { }
  async create(position: CreatePositionDto) {

    const { name, category_id } = position;

    let newRegister = await this.positionModel.create({
      name,
      category_id
    })
    return newRegister;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.positionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);


    const result = await this.positionModel.find(filter)
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

  async findSubCategory(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid parent_id');
    }

    return await this.positionModel.find({ category_id: id }).exec();
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return `not found job`;

    return await this.positionModel.findById(id);
  }

  update(id: number, UpdatePositionDto: UpdatePositionDto) {
    return `This action updates a #${id} position`;
  }

  remove(id: number) {
    return `This action removes a #${id} position`;
  }
}
