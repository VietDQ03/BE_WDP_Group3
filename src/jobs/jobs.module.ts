import { forwardRef, Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './shemas/job.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { CvModule } from 'src/cv/cv.module';
import { UsersModule } from 'src/users/users.module';
import { MailModule } from 'src/mail/mail.module';
import { NotificationModule } from 'src/notifications/notification.module';
import { CompaniesModule } from 'src/companies/companies.module';
import { SkillModule } from 'src/cv/skills/skills.module';
import { Skill, SkillSchema } from 'src/cv/skills/schemas/skill.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: User.name, schema: UserSchema },
      { name: Skill.name, schema: SkillSchema },
    ]),
    CvModule,
    UsersModule,
    NotificationModule,
    CompaniesModule,
    SkillModule,
    forwardRef(() => MailModule), // Dùng forwardRef ở đây
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService]
})
export class JobsModule { }
