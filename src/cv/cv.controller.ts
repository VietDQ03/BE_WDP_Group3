import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Public, ResponseMessages, UserS } from 'src/decorator/customize';
import { CreateCvDto, UploadFileDto } from './dto/create-cv.dto/create-cv.dto';
import { CvService } from './cv.service';
import { UpdateCvDto } from './dto/create-cv.dto/update-cv.dto';
import { IUser } from 'src/users/users.interface';

@Controller('cv')
export class CvController {
    constructor(private readonly cvService: CvService) { }

    @Post('/uploadFile')
    uploadFile(@Body() uploadFileDto: UploadFileDto, @UserS() user: IUser) {
        return this.cvService.uploadFile(uploadFileDto, user);
    }

    @Post()
    create(@Body() createCvDto: CreateCvDto, @UserS() user: IUser) {
        return this.cvService.create(createCvDto, user);
    }


    @Get('/findOne/:id')
    @ResponseMessages('Fetch a position by id')
    findOne(@Param('id') id: string) {
        return this.cvService.findOne(id);
    }

    @Get('/findAllByUserId/:id')
    @ResponseMessages('Fetch a position by id')
    findAllByUserId(@Param('id') id: string) {
        return this.cvService.findAllByUserId(id);
    }

    @Public()
    @Get('/findAll')
    @ResponseMessages('Fetch location with pagination')
    findAll(
        @Query('current') currentPage: string,
        @Query('pageSize') limit: string,
        @Query() qs: string,
    ) {
        return this.cvService.findAll(+currentPage, +limit, qs);
    }

    @Patch(':id')
    @ResponseMessages('Update a Cv')
    update(
        @Body() updateCvDto: UpdateCvDto,
        @UserS() user: IUser,
    ) {
        return this.cvService.update(updateCvDto, user);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.cvService.remove(+id);
    }
}