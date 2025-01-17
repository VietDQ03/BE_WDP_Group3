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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseMessages, UserS } from 'src/decorator/customize';
import { User } from './schemas/user.schema';
import { IUser } from './users.interface';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessages("Create a new User")
  async create(@Body() createUserDto: CreateUserDto, @UserS() user: IUser) {
    let newUser = await this.usersService.create(createUserDto, user);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt
    };
  }


  @Get('')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: any,
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @Get('/:id')
  @ResponseMessages("Fetch user by id")
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ResponseMessages("Update a User")
  @Patch('/:id')
  async update(@Body() updateUserDto: UpdateUserDto, @UserS() user: IUser, @Param('id') id: string) {
    let updatedUser = await this.usersService.update(updateUserDto, user, id);
    return updatedUser;
  }

  @Delete(':id')
  @ResponseMessages("Delete a User")
  remove(@Param('id') id: string, @UserS() user: IUser) {
    return this.usersService.remove(id, user);
  }

}
