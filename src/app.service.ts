import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    // models
    return 'Hello Dang Viet';
  }
}
