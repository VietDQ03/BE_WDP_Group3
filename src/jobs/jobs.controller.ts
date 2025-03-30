import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Public, ResponseMessages, UserS } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { User } from 'src/users/schemas/user.schema';
import { ApiTags } from '@nestjs/swagger';
import mongoose from 'mongoose';
@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }

  @Post()
  @ResponseMessages('Create a new job')
  create(@Body() createJobDto: CreateJobDto, @UserS() user: IUser) {
    return this.jobsService.create(createJobDto, user);
  }
  @Public()
  @Get('by-company/:companyId')
  async findByCompany(
    @Param('companyId') companyId: string,
    @Query('current') current: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query() qs: string
  ) {
    try {
      if (!mongoose.Types.ObjectId.isValid(companyId)) {
        throw new BadRequestException('Invalid company ID format');
      }

      const data = await this.jobsService.findByCompany(
        companyId,
        Number(current),
        Number(pageSize),
        qs
      );

      // Return trực tiếp, không lồng thêm level nào nữa
      return {
        statusCode: 200,
        message: data.result.length ? "Jobs retrieved successfully" : "No jobs found",
        data
      };

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new HttpException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message
        }, HttpStatus.BAD_REQUEST);
      }

      throw new HttpException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal server error'
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Get('/notification/:id')
  @ResponseMessages('notification for user')
  async notiForUser(@Param('id') id: string) {
    const skills = await this.jobsService.NotificationForUser(id);
    return skills;
  }

  @Public()
  @Get()
  @ResponseMessages('Fetch jobs with pagination')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.jobsService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @Get(':id')
  @ResponseMessages('Fetch a job by id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }



  @Patch(':id')
  @ResponseMessages('Update a job')
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @UserS() user: IUser,
  ) {
    return this.jobsService.update(id, updateJobDto, user);
  }

  @Delete(':id')
  @ResponseMessages('Delete a job')
  remove(@Param('id') id: string, @UserS() user: IUser) {
    return this.jobsService.remove(id, user);
  }


}
