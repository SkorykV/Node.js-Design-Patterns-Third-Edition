import { EventEmitter } from 'events';

export class TaskQueue extends EventEmitter {
  constructor(concurency) {
    super();
    this.concurency = concurency;
    this.running = 0;
    this.queue = [];
  }

  pushTask(task) {
    this.queue.push(task)
    process.nextTick(this.next.bind(this))
    return this
  }

  next() {
    if(this.running === 0 && this.queue.length === 0) {
      this.emit('empty');
    }
    while(this.running < this.concurency && this.queue.length) {
      const task = this.queue.shift();
      this.running++;
      task((err) => {
        if(err) {
          this.emit('error', err);
        }
        this.running--;
        process.nextTick(this.next.bind(this));
      });
    }
  }
}