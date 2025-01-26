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
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Public, ResponseMessages, UserS } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { User } from 'src/users/schemas/user.schema';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ResponseMessages('Create a new job')
  create(@Body() createJobDto: CreateJobDto, @UserS() user: IUser) {
    return this.jobsService.create(createJobDto, user);
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
