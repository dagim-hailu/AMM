import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Appointment Management Module (AMM) Backend API v1.0';
  }
}
