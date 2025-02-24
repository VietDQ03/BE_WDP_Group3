import { Module } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Resume, ResumeSchema } from './schemas/resume.schema';
import { MailModule } from 'src/mail/mail.module';
import { JobsModule } from 'src/jobs/jobs.module';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Job, JobSchema } from 'src/jobs/shemas/job.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [ResumesController],
  providers: [ResumesService],
  imports: [
    MongooseModule.forFeature([
      { name: Resume.name, schema: ResumeSchema },
      { name: User.name, schema: UserSchema },
      { name: Job.name, schema: JobSchema },
    ]),
    MailModule,
    JobsModule,
  ],
})
export class ResumesModule {}
