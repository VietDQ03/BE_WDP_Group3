import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import aqp from 'api-query-params';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: SoftDeleteModel<NotificationDocument>,
  ) { }
  async create(createNotificationDto: CreateNotificationDto) {
    let newNotification = await this.notificationModel.create(createNotificationDto);
    return newNotification;
  }

  async findAllByUserId(currentPage: number, pageSize: number, qs: string, userId: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    filter.userId = userId;
    let offset = (+currentPage - 1) * (+pageSize);
    let defaultLimit = +pageSize ? +pageSize : 10;

    const totalItems = (await this.notificationModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    // Using proper SortOrder type
    const defaultSort = { createdAt: 'desc' };
    const finalSort = { ...defaultSort, ...(sort || {}) };

    const result = await this.notificationModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(finalSort as any)
      .populate({
        path: 'jobId',
        model: 'Job',
        select: '_id name'
      })
      .populate({
        path: 'companyId',
        model: 'Company',
        select: '_id name'
      })
      .populate({
        path: 'skillId',
        model: 'Skill',
        select: '_id name'
      })
      .select(projection as any)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: pageSize,
        pages: totalPages,
        total: totalItems
      },
      result
    }
  }


  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  async updateSeenStatus(id: string) {
    return await this.notificationModel.updateOne({ _id: id }, { isSeen: true });
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto) {
    return await this.notificationModel.updateOne({ _id: id }, updateNotificationDto);
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
