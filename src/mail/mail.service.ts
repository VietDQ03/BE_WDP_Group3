import { MailerService } from '@nestjs-modules/mailer';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { ObjectId } from 'mongoose';
import { Subscriber } from 'rxjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CompaniesService } from 'src/companies/companies.service';
import { JobsService } from 'src/jobs/jobs.service';
import { Job, JobDocument } from 'src/jobs/shemas/job.schema';
import { SubscriberDocument } from 'src/subscribers/schemas/subscriber.schema';
import { UserDocument } from 'src/users/schemas/user.schema';
import { IUser } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';
import { CreateVerificationDto } from 'src/verification/dto/create-verification.dto';
import { VerificationService } from 'src/verification/verification.service';
import { SendResultDto } from './dto/send-Mail.dto';
import { ResumesService } from 'src/resumes/resumes.service';
import { Resume, ResumeDocument } from 'src/resumes/schemas/resume.schema';
import { CompanyDocument } from 'src/companies/schemas/company.schemas';
@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private userService: UsersService,
    private verificationService: VerificationService,
    @Inject(forwardRef(() => JobsService))
    private jobService: JobsService,
    @Inject(forwardRef(() => ResumesService))
    private resumeService: ResumesService,
    private companiesService: CompaniesService,

    @InjectModel(Subscriber.name)
    private subscriberModel: SoftDeleteModel<SubscriberDocument>,

    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,

    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>,
  ) { }

  async HandleJobMail() {
    const subscribers = await this.subscriberModel.find({});
    for (const subs of subscribers) {
      const subsSkills = subs.skills;
      const jobWithMatchingSkills = await this.jobModel.find({
        skills: { $in: subsSkills },
      });
      if (jobWithMatchingSkills?.length) {
        const jobs = await Promise.all(
          jobWithMatchingSkills.map(async (item) => {
            const company = (await this.companiesService.findOne(item.company.toString())) as CompanyDocument;
            return {
              name: item.name,
              company: company.name,
              salary:
                `${item.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ',
              skills: item.skills,
            };
          }),
        );

        await this.mailerService.sendMail({
          to: 'vietqdhe172084@fpt.edu.vn',
          from: '"Support Team" <support@example.com>', // override default from
          subject: 'Welcome to Nice App! Confirm your Email',
          template: 'new-job',
          context: {
            receiver: subs.name,
            jobs: jobs,
          },
        });
      }
    }
  }
  async sendResultResumeMail(sendResultDto: SendResultDto) {
    const user = (await this.userService.findOne(
      sendResultDto.userId,
    )) as UserDocument;
    const resume = (await this.resumeService.findOne(
      sendResultDto.resumeId,
    )) as ResumeDocument;
    const job = (await this.jobService.findOne(
      resume.jobId.toString(),
    )) as JobDocument;
    const company = (await this.companiesService.findOne(
      resume.companyId.toString(),
    )) as CompanyDocument;
    let result: string;
    if (sendResultDto.status === 'APPROVED') {
      result = "Chúc mừng bạn đã vượt qua vòng ứng tuyển cho công việc, hẹn gặp bạn trong thời gian sớm nhất";
    } else if (sendResultDto.status === 'REJECTED') {
      result = "Sau khi xem xét CV của bạn, chúng tôi nhận thấy rằng hiện tại vị trí ứng tuyển này chưa thật sự phù hợp với thông tin mà bạn đã cung cấp. Cảm ơn bạn đã dành thời gian tham gia ứng tuyển.";
    } else if (sendResultDto.status === 'PASSCV') {
      result = "Sau khi xem xét CV của bạn, chúng tôi nhận thấy rằng hiện tại vị trí ứng tuyển này thật sự phù hợp với thông tin mà bạn đã cung cấp. Kết quả đánh giá CV của bạn là: Bạn đã vượt qua vòng hồ sơ!!!! Vui lòng đợi chúng tôi sắp xếp lịch phỏng vấn cho bạn."
    }
    if (user) {
      await this.mailerService.sendMail({
        to: user.email,
        from: '"Support Team" <support@example.com>', // override default from
        subject: 'Kết quả ứng tuyển của ứng viên ' + user.name,
        template: 'send_result_resume',
        context: {
          receiver: user.name,
          Url: 'https://rabotaworks.com',
          result: result,
          job: job.name,
          company: company.name,

          // Truyền mã OTP vào context để sử dụng trong template
        },
      });
    }
  }

  async sendRusumeMail(userId: string, jobId: string) {
    const user = (await this.userService.findOne(userId)) as UserDocument;
    const job = (await this.jobService.findOne(jobId)) as JobDocument;
    const skillNames = job.skills.map((skill: any) => skill.name).join(', ');
    const company = (await this.companiesService.findOne((job.company as any)._id.toString()))
    if (user) {
      await this.mailerService.sendMail({
        to: user.email,
        from: '"Support Team" <support@example.com>', // override default from
        subject: 'Ứng tuyển thành công',
        template: 'job',
        context: {
          receiver: user.name,
          jobName: job.name,
          companyName: company.name,
          salary: `${job.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ',
          skills: skillNames,
          logoCompany: company.logo,
        },
      });
    } else {
      throw new Error('User not found');
    }
  }

  async sendOtp(email: string) {
    const user = (await this.userService.findOneByUsername(
      email.toString(),
    )) as UserDocument;
    if (user) {
      const createVerificationDto: CreateVerificationDto = {
        email: user.email,
      };
      const otp = await this.verificationService.generateOtp(
        createVerificationDto,
      );
      const verifyUrl = `http://localhost:8000/api/v1/auth/active?email=${user.email}&otp=${otp}`;
      await this.mailerService.sendMail({
        to: user.email,
        from: '"Support Team" <support@example.com>', // override default from
        subject: 'Email xác thực thông tin tài khoản ứng viên ' + user.name,
        template: 'otp',
        context: {
          receiver: user.name,
          verifyUrl: verifyUrl,
          otp: otp, // Truyền mã OTP vào context để sử dụng trong template
        },
      });
    } else {
      throw new Error('User not found');
    }
  }

  async sendVerify(email: string) {
    const user = (await this.userService.findOneByUsername(
      email.toString(),
    )) as UserDocument;
    if (user) {
      const createVerificationDto: CreateVerificationDto = {
        email: user.email,
      };
      const otp = await this.verificationService.generateOtp(
        createVerificationDto,
      );
      const verifyUrl = `http://localhost:8000/api/v1/auth/active?email=${user.email}&otp=${otp}`;
      await this.mailerService.sendMail({
        to: user.email,
        from: '"Support Team" <support@example.com>', // override default from
        subject: 'Email xác thực thông tin tài khoản ứng viên ' + user.name,
        template: 'verify',
        context: {
          receiver: user.name,
          verifyUrl: verifyUrl,
          otp: otp, // Truyền mã OTP vào context để sử dụng trong template
        },
      });
    } else {
      throw new Error('User not found');
    }
  }

  async sendMailToHR(userId: string, companyName: string) {
    const Url = 'https://localhost:3000';
    const user = (await this.userService.findOne(userId)) as UserDocument;
    await this.mailerService.sendMail({
      to: user.email,
      from: '"Support Team" <support@example.com>', // override default from
      subject: 'Xét duyệt ứng viên ',
      template: 'mail_to_HR',
      context: {
        companyName,
        Url,
        userName: user.name,
      },
    });
  }


  async sendInvitation(userId: string, jobId: string) {
    const Url = 'http://localhost:3000/job/' + jobId;

    const user = (await this.userService.findOne(userId)) as UserDocument;
    const job = (await this.jobService.findOne(jobId)) as JobDocument;
    const company = (await this.companiesService.findOne((job.company as any)._id.toString()))
    await this.mailerService.sendMail({
      to: user.email,
      from: '"Support Team" <support@example.com>', // override default from
      subject: 'Thư mời ứng tuyển ',
      template: 'invitation',
      context: {
        userName: user.name,
        jobName: job.name,
        companyName: company.name,
        Url: Url,
      },
    })
  }


  // async sendNotificationEmail(userIds: ObjectId[], job: JobDocument) {
  //   for (const userId of userIds) {
  //     if (!userId || !mongoose.Types.ObjectId.isValid(userId.toString())) {
  //       console.log(`Invalid user ID: ${userId}`);
  //       continue;
  //     }
  //     const user = (await this.userService.findOne(userId.toString())) as UserDocument;
  //     const company = (await this.companiesService.findOne(job.company.toString()) as CompanyDocument)
  //     await this.mailerService.sendMail({
  //       to: user.email,
  //       from: '"Support Team" <support@example.com>', // override default from
  //       subject: 'Xét duyệt ứng viên ',
  //       template: 'mail_to_HR',
  //       context: {
  //         jobName: job.name,
  //         companyName: company.name,
  //         userName: user.name,
  //         salary: job.salary,
  //         description: job.description,
  //       },
  //     })
  //   }
  // }
}
