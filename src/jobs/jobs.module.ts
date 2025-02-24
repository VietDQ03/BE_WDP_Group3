import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './shemas/job.schema';
import { User, UserSchema } from '../users/schemas/user.schema';


@Module({
  imports: [MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }, { 
    name: User.name, // Sử dụng User.name thay vì 'User'
    schema: UserSchema 
  }])],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService]
})
export class JobsModule { }
