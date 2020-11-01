export class TaskQueue {
  constructor(concurency) {
    this.concurency = concurency;
    this.running = 0;
    this.queue = [];
  }

  pushTask(task) {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
          return result;
        }
        catch(e) {
          reject(e);
        }
      });
      process.nextTick(this.next.bind(this));
    })
  }

  next() {
    while(this.running < this.concurency && this.queue.length) {
      const task = this.queue.shift();
      this.running++;
      task().finally(() => {
        console.log('Finally');
        this.running--;
        this.next();
      });
    }
  }
}