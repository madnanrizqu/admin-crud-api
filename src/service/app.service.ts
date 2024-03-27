import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  healthCheck(): { statusCode: number; message: string } {
    return {
      statusCode: 200,
      message: 'Service is healthy!',
    };
  }
}
