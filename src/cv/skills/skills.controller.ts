import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Public, ResponseMessages } from 'src/decorator/customize';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillService: SkillsService) { }

  @Public()
  @Post()
  create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillService.create(createSkillDto);
  }

  @Public()
  @Get()
  @ResponseMessages('Fetch position with pagination')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.skillService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @Get(':id')
  @ResponseMessages('Fetch a position by id')
  findOne(@Param('id') id: string) {
    return this.skillService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSkillDto: UpdateSkillDto) {
    return this.skillService.update(+id, updateSkillDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.skillService.remove(+id);
  }
}
