import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { positionService } from './position.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { Public, ResponseMessages } from 'src/decorator/customize';

@Controller('position')
export class positionController {
  constructor(private readonly positionService: positionService) { }

  @Public()
  @Post()
  create(@Body() CreatePositionDto: CreatePositionDto) {
    return this.positionService.create(CreatePositionDto);
  }

  @Public()
  @Get()
  @ResponseMessages('Fetch position with pagination')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.positionService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @Get('findSub/:id')
  findSub(@Param('id') id: string) {
    return this.positionService.findSubCategory(id);
  }

  @Public()
  @Get(':id')
  @ResponseMessages('Fetch a position by id')
  findOne(@Param('id') id: string) {
    return this.positionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() UpdatePositionDto: UpdatePositionDto) {
    return this.positionService.update(+id, UpdatePositionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.positionService.remove(+id);
  }
}
