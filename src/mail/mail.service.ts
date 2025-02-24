import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
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
import { SendOtp } from './dto/send-Mail.dto';
@Injectable()
export class MailService {
    constructor(
        private mailerService: MailerService,
        private userService: UsersService,
        private verificationService: VerificationService,
        private jobService: JobsService,

        @InjectModel(Subscriber.name)
        private subscriberModel: SoftDeleteModel<SubscriberDocument>,

        @InjectModel(Job.name)
        private jobModel: SoftDeleteModel<JobDocument>,
    ) { }

    async HandleJobMail() {
        const subscribers = await this.subscriberModel.find({});
        for (const subs of subscribers) {
            const subsSkills = subs.skills;
            const jobWithMatchingSkills = await this.jobModel.find({ skills: { $in: subsSkills } });
            if (jobWithMatchingSkills?.length) {
                const jobs = jobWithMatchingSkills.map(item => {
                    return {
                        name: item.name,
                        company: item.company.name,
                        salary: `${item.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + " đ",
                        skills: item.skills
                    }
                })
                console.log("jobs", jobs);

                await this.mailerService.sendMail({
                    to: "vietqdhe172084@fpt.edu.vn",
                    from: '"Support Team" <support@example.com>', // override default from
                    subject: 'Welcome to Nice App! Confirm your Email',
                    template: "new-job",
                    context: {
                        receiver: subs.name,
                        jobs: jobs
                    }
                });
            }
        }
    }

    async sendRusumeMail(userId: string, jobId: string) {
        const user = await this.userService.findOne(userId) as UserDocument;
        const job = await this.jobService.findOne(jobId) as JobDocument;
        if (user) {
            console.log(job.company.logo)
            await this.mailerService.sendMail({
                to: user.email,
                from: '"Support Team" <support@example.com>', // override default from
                subject: 'Ứng tuyển thành công',
                template: "job",
                context: {
                    receiver: user.name,
                    companyName: job.company.name,
                    salary: `${job.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + " đ",
                    skills: job.skills.join(', '),
                    logoCompany: job.company.logo
                },
            });
        } else {
            throw new Error('User not found');
        }
    }

    async sendOtp(email: string) {
        const user = await this.userService.findOneByUsername(email.toString()) as UserDocument;
        if (user) {
            const createVerificationDto: CreateVerificationDto = { email: user.email };
            const otp = await this.verificationService.generateOtp(createVerificationDto);
            const verifyUrl = `http://localhost:8000/api/v1/auth/active?email=${user.email}&otp=${otp}`;
            await this.mailerService.sendMail({
                to: user.email,
                from: '"Support Team" <support@example.com>', // override default from
                subject: 'Email xác thực thông tin tài khoản ứng viên ' + user.name,
                template: "otp",
                context: {
                    receiver: user.name,
                    verifyUrl: verifyUrl,
                    otp: otp, // Truyền mã OTP vào context để sử dụng trong template
                },
            })
        } else {
            throw new Error('User not found');
        }
    }

    async sendVerify(email: string) {
        const user = await this.userService.findOneByUsername(email.toString()) as UserDocument;
        if (user) {
            const createVerificationDto: CreateVerificationDto = { email: user.email };
            const otp = await this.verificationService.generateOtp(createVerificationDto);
            const verifyUrl = `http://localhost:8000/api/v1/auth/active?email=${user.email}&otp=${otp}`;
            await this.mailerService.sendMail({
                to: user.email,
                from: '"Support Team" <support@example.com>', // override default from
                subject: 'Email xác thực thông tin tài khoản ứng viên ' + user.name,
                template: "verify",
                context: {
                    receiver: user.name,
                    verifyUrl: verifyUrl,
                    otp: otp, // Truyền mã OTP vào context để sử dụng trong template
                },
            })
        } else {
            throw new Error('User not found');
        }
    }
}
