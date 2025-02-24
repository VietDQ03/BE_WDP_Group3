import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Public, ResponseMessages } from 'src/decorator/customize';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) { }

  @Public()
  @Post()
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationService.create(createLocationDto);
  }

  @Public()
  @Get()
  @ResponseMessages('Fetch location with pagination')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.locationService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @Get(':id')
  @ResponseMessages('Fetch a experience_level by id')
  findOne(@Param('id') id: string) {
    return this.locationService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
    return this.locationService.update(+id, updateLocationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationService.remove(+id);
  }
}
