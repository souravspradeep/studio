import { EventEmitter } from 'events';
import { type SecurityRuleContext } from './errors';

type ErrorEvents = {
  'permission-error': (errorContext: SecurityRuleContext) => void;
};

class ErrorEmitter extends EventEmitter {
  emit<T extends keyof ErrorEvents>(event: T, ...args: Parameters<ErrorEvents[T]>) {
    return super.emit(event, ...args);
  }

  on<T extends keyof ErrorEvents>(event: T, listener: ErrorEvents[T]) {
    return super.on(event, listener);
  }
}

export const errorEmitter = new ErrorEmitter();
