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
import { ResumesService } from './resumes.service';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Public, ResponseMessages, UserS } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import mongoose from 'mongoose';
@ApiTags('resumes')
@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  @ResponseMessages('Create a new resume')
  create(@Body() createUserCvDto: CreateUserCvDto, @UserS() user: IUser) {
    return this.resumesService.create(createUserCvDto, user);
  }

  @Post('by-user')
  @ResponseMessages('Get Resumes by User')
  getResumesByUser(@UserS() user: IUser) {
    return this.resumesService.findByUsers(user);
  }
  @Public()
  @Get('by-company/:companyId')
  @ResponseMessages('Get Resumes by Company')
  @ApiParam({ name: 'companyId', required: true, description: 'ID of the company' })
  @ApiQuery({ name: 'current', required: false, type: Number, description: 'Current page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'email', required: false, type: String, description: 'Filter by email' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  async findByCompany(
    @Param('companyId') companyId: string,
    @Query('current') current: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query() qs: string
  ) {
    try {
      // Validate companyId
      if (!mongoose.Types.ObjectId.isValid(companyId)) {
        throw new BadRequestException('Invalid company ID format');
      }

      const data = await this.resumesService.findByCompany(
        companyId,
        Number(current), 
        Number(pageSize),
        qs
      );

      return {
        statusCode: 200,
        message: "Get Resumes by Company successfully",
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

  @Get()
  @ResponseMessages('Fetch all resumes with paginate')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.resumesService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessages('Fetch a resume by id')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessages('Update status resume')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @UserS() user: IUser,
  ) {
    return this.resumesService.update(id, status, user);
  }

  @Delete(':id')
  @ResponseMessages('Delete a resume by id')
  remove(@Param('id') id: string, @UserS() user: IUser) {
    return this.resumesService.remove(id, user);
  }
}
