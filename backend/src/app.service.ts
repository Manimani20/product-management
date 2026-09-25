import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Product Management API is running. Visit /api/docs for Swagger documentation.';
  }
}
