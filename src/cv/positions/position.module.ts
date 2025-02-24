import { Module } from '@nestjs/common';
import { positionService } from './position.service';
import { positionController } from './position.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { position, positionSchema } from './schemas/position.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: position.name, schema: positionSchema }])],
  controllers: [positionController],
  providers: [positionService],
  exports: [positionService]
})
export class SpecializationModule { }
