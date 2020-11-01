export class TaskQueuePC {
  constructor(concurency) {
    this.taskQueue = [];
    this.consumersQueue = [];

    for(let i = 0; i < concurency; i++) {
      this.consumer();
    }
  }

  consumer() {
    this.getNextTask().then(task => {
      task().catch(console.log).finally(() => { this.consumer() });
    });
  }

  getNextTask() {
    return new Promise((resolve, reject) => {
      if(this.taskQueue.length) {
        resolve(this.taskQueue.shift())
      }

      this.consumersQueue.push(resolve);
    });
  }

  pushTask(task) {
    return new Promise((resolve, reject) => {
      const taskWrapper = () => {
        return task().then(resolve, reject);
      };

      if(this.consumersQueue.length) {
        const consumer = this.consumersQueue.shift();
        consumer(taskWrapper);
      }
      else {
        this.taskQueue.push(taskWrapper)
      }
    })
  }
}