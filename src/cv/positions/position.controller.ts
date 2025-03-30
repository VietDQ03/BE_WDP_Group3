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
import { PositionService } from './position.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { Public, ResponseMessages } from 'src/decorator/customize';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('position')
@Controller('position')
export class PositionController {
  constructor(private readonly positionService: PositionService) { }

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
  update(
    @Param('id') id: string,
    @Body() UpdatePositionDto: UpdatePositionDto,
  ) {
    return this.positionService.update(+id, UpdatePositionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.positionService.remove(+id);
  }
}
