export interface IEventPublisher {
  publish(event: string, payload: any): Promise<void>;
}

export const IEventPublisher = Symbol('IEventPublisher');
