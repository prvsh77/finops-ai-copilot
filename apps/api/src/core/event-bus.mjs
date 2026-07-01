import { EventEmitter } from "node:events";

class EventBus extends EventEmitter {
  publish(eventName, payload) {
    // Execute handlers asynchronously to decouple publisher from subscribers
    setImmediate(() => {
      this.emit(eventName, payload);
    });
  }

  subscribe(eventName, handler) {
    this.on(eventName, handler);
  }

  unsubscribe(eventName, handler) {
    this.off(eventName, handler);
  }
}

export const eventBus = new EventBus();
export default eventBus;
