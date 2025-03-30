import { Module } from '@nestjs/common';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Cv, CvSchema } from './schemas/cv.schema';
import { UsersModule } from 'src/users/users.module';
import { SkillModule } from './skills/skills.module';
import { PositionModule } from './positions/position.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cv.name, schema: CvSchema }]),
    UsersModule,
    SkillModule,
    PositionModule,
  ],
  controllers: [CvController],
  providers: [CvService],
  exports: [CvService]
})
export class CvModule { }
