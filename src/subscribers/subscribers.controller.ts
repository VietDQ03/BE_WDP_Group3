import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import {
  ResponseMessages,
  SkipCheckPermission,
  UserS,
} from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('subscribers')
@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  @Post()
  @ResponseMessages('Create a subscriber')
  create(
    @Body() createSubscriberDto: CreateSubscriberDto,
    @UserS() user: IUser,
  ) {
    return this.subscribersService.create(createSubscriberDto, user);
  }

  @Post('skills')
  @ResponseMessages("Get subscriber's skills")
  @SkipCheckPermission()
  getUserSkills(@UserS() user: IUser) {
    return this.subscribersService.getSkills(user);
  }

  @Get()
  @ResponseMessages('Fetch subscribers with paginate')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.subscribersService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessages('Fetch subscriber by id')
  findOne(@Param('id') id: string) {
    return this.subscribersService.findOne(id);
  }

  @Patch()
  @SkipCheckPermission()
  @ResponseMessages('Update a subscriber')
  update(
    @Body() updateSubscriberDto: UpdateSubscriberDto,
    @UserS() user: IUser,
  ) {
    return this.subscribersService.update(updateSubscriberDto, user);
  }

  @Delete(':id')
  @ResponseMessages('Delete a subscriber')
  remove(@Param('id') id: string, @UserS() user: IUser) {
    return this.subscribersService.remove(id, user);
  }
}
