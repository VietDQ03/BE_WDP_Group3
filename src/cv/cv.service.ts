import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cv, CvDocument } from './schemas/cv.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CreateCvDto, UploadFileDto } from './dto/create-cv.dto/create-cv.dto';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { UpdateCvDto } from './dto/create-cv.dto/update-cv.dto';
import { UsersService } from 'src/users/users.service';
import { UserDocument } from 'src/users/schemas/user.schema';
import { SkillsService } from './skills/skills.service';
import { PositionService } from './positions/position.service';
import { SkillDocument } from './skills/schemas/skill.schema';
import { PositionDocument } from './positions/schemas/position.schema';

@Injectable()
export class CvService {
  constructor(
    @InjectModel(Cv.name)
    private cvModel: SoftDeleteModel<CvDocument>,
  ) { }

  // async uploadFile(uploadFileDto: UploadFileDto, user: IUser) {
  //   const url = uploadFileDto.url

  //   let newCv = await this.cvModel.create({
  //     user_id: user._id,
  //     url,
  //     position: null,
  //     skill: null,
  //     experience: null,
  //   });
  //   return newCv;
  // }

  async checkCvByUserId(userId: string) {
    return await this.cvModel.findOne({ user_id: userId });
  }

  async create(createCvDto: CreateCvDto, user: IUser) {
    const existingCv = await this.checkCvByUserId(user._id);

    if (existingCv) {
      throw new BadRequestException('User already has a CV');
    }


    const { url, position, skill, experience, description } = createCvDto;

    let newRegister = await this.cvModel.create({
      user_id: user._id,
      url,
      position,
      skill,
      experience,
      description,
      isActive: true,
    })
    return newRegister;
  }


  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return `not found job`;

    const cv = await this.cvModel.findById(id)
      .populate({
        path: 'user_id',
        model: 'User',
        transform: doc => ({
          name: doc.name,
          email: doc.email,
          role: doc.role,
          address: doc.address,
          age: doc.age,
          gender: doc.gender
        })
      })
      .populate({
        path: 'position',
        model: 'Position',
        select: '_id name'
      })
      .populate({
        path: 'skill',
        model: 'Skill',
        select: '_id name'
      })
      .populate({
        path: 'experience',
        model: 'Experience',
        select: '_id name'
      })
      .exec();

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    return {
      url: cv.url,
      position: cv.position,
      skills: cv.skill,
      experience: cv.experience,
      isDeleted: cv.isDeleted,
      createdAt: cv.createdAt,
      updatedAt: cv.updatedAt,
      ...cv.user_id
    };
  }

  async findByUserId(userId: string) {

    // Tìm CV của người dùng và populate các thông tin liên quan
    const cv = await this.cvModel.findOne({ user_id: new mongoose.Types.ObjectId(userId) })
      .populate({
        path: 'user_id',
        model: 'User',
        transform: doc => ({
          name: doc.name,
          email: doc.email,
          role: doc.role,
          address: doc.address,
          age: doc.age,
          gender: doc.gender
        })
      })
      .populate({
        path: 'position',
        model: 'Position',
        select: '_id name'
      })
      .populate({
        path: 'skill',
        model: 'Skill',
        select: '_id name'
      })
      .populate({
        path: 'experience',
        model: 'Experience',
        select: '_id name'
      })
      .exec();

    return cv;
  }


  async findBySkill(skill: string) {
    if (!mongoose.Types.ObjectId.isValid(skill)) {
      throw new BadRequestException('Invalid skill ID');
    }
    const cvs = await this.cvModel.find({ skill: { $in: [skill] } }).select('user_id').exec();
    return cvs;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * (+limit);
    const defaultLimit = +limit ? +limit : 10;

    const [totalItems, result] = await Promise.all([
      this.cvModel.countDocuments(filter),
      this.cvModel.find(filter)
        .skip(offset)
        .limit(defaultLimit)
        .sort(sort as any)
        .populate({
          path: 'user_id',
          model: 'User',
          transform: doc => ({
            _id: doc._id,
            name: doc.name,
            email: doc.email
          })
        })
        .populate({
          path: 'position',
          model: 'Position',
          select: '_id name'
        })
        .populate({
          path: 'skill',
          model: 'Skill',
          select: '_id name'
        })
        .populate({
          path: 'experience',
          model: 'Experience',
          select: '_id name'
        })
        .select(projection as any)
        .exec()
    ]);

    const totalPages = Math.ceil(totalItems / defaultLimit);

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

  // async findAllByUserId(userId: string, currentPage: number = 1, limit: number = 10) {
  //     if (!mongoose.Types.ObjectId.isValid(userId)) {
  //         throw new BadRequestException('Invalid userId');
  //     }

  //     const filter = { user_id: userId };
  //     const offset = (currentPage - 1) * limit;
  //     const defaultLimit = limit;

  //     const [totalItems, result] = await Promise.all([
  //         this.cvModel.countDocuments(filter),
  //         this.cvModel.find(filter)
  //             .skip(offset)
  //             .limit(defaultLimit)
  //             .populate({
  //                 path: 'user_id',
  //                 model: 'User',
  //                 transform: doc => ({
  //                     _id: doc._id,
  //                     name: doc.name,
  //                     email: doc.email
  //                 })
  //             })
  //             .populate({
  //                 path: 'position',
  //                 model: 'Position',
  //                 select: '_id name'
  //             })
  //             .populate({
  //                 path: 'skill',
  //                 model: 'Skill',
  //                 select: '_id name'
  //             })
  //             .populate({
  //                 path: 'experience',
  //                 model: 'Experience',
  //                 select: '_id name'
  //             })
  //             .exec()
  //     ]);

  //     const totalPages = Math.ceil(totalItems / defaultLimit);

  //     return {
  //         meta: {
  //             current: currentPage,
  //             pageSize: limit,
  //             pages: totalPages,
  //             total: totalItems
  //         },
  //         result
  //     };
  // }

  async findAllIsActive(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    filter.isActive = true;

    let searchFilter: any = {
      isActive: true,
    };

    // Handle position search with array
    if (filter.position) {
      searchFilter.position = {
        $in: Array.isArray(filter.position)
          ? filter.position.map((id) => new mongoose.Types.ObjectId(id))
          : [new mongoose.Types.ObjectId(filter.position)],
      };
    }

    // Handle skill search with array
    if (filter.skill) {
      searchFilter.skill = {
        $in: Array.isArray(filter.skill)
          ? filter.skill.map((id) => new mongoose.Types.ObjectId(id))
          : [new mongoose.Types.ObjectId(filter.skill)],
      };
    }

    // Handle experience search
    if (filter.experience) {
      searchFilter.experience = new mongoose.Types.ObjectId(filter.experience);
    }

    // Remove processed filters
    delete filter.position;
    delete filter.skill;
    delete filter.experience;

    // Combine with remaining filters
    const finalFilter = { ...searchFilter, ...filter };

    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    try {
      const totalItems = await this.cvModel.countDocuments(finalFilter);
      const totalPages = Math.ceil(totalItems / defaultLimit);

      const result = await this.cvModel
        .find(finalFilter)
        .skip(offset)
        .limit(defaultLimit)
        .sort(sort as any)
        .populate({
          path: 'user_id',
          model: 'User',
          transform: (doc) => {
            
            // Check if doc exists before accessing properties
            if (!doc || doc.isDeleted) {
              return {
                _id: doc ? doc._id : null,
                name: 'Deleted User',
                email: 'deleted@user.com'
              };
            }
            return {
              _id: doc._id,
              name: doc.name,
              email: doc.email,
            };
          },
        })
        .populate({
          path: 'position',
          model: 'Position',
          select: '_id name',
        })
        .populate({
          path: 'skill',
          model: 'Skill',
          select: '_id name',
        })
        .populate({
          path: 'experience',
          model: 'Experience',
          select: '_id name',
        })
        .select(projection as any)
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
    } catch (error) {
      throw new Error(`Error finding CVs: ${error.message}`);
    }
  }
  async update(updateCvDto: UpdateCvDto, user: IUser) {
    const updated = await this.cvModel.updateOne(
      { user_id: user._id },
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