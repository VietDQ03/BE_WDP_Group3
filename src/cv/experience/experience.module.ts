import { Module } from '@nestjs/common';
import { ExperienceService } from './experience.service';
import { ExperienceController } from './experience.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Experience, ExperienceSchema } from './schemas/experience.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Experience.name, schema: ExperienceSchema }])],
  controllers: [ExperienceController],
  providers: [ExperienceService],
  exports: [ExperienceService]
})
export class ExperienceModule { }
