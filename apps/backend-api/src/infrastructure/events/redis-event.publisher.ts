import { Injectable, Logger } from '@nestjs/common';
import { IEventPublisher } from '../../domain/ports/event.publisher';

@Injectable()
export class RedisEventPublisher implements IEventPublisher {
  private readonly logger = new Logger(RedisEventPublisher.name);

  async publish(event: string, payload: any): Promise<void> {
    // Mocking redis publish
    this.logger.log(`[Redis Mock] Publishing event ${event} with payload: ${JSON.stringify(payload)}`);
  }
}
