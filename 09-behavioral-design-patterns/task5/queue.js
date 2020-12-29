class AsyncQueue {
  constructor() {
    this.tasksQueue = [];
    this.workers = [];
    this.isDone = false;
  }

  enqueue(task) {
    if(this.isDone) {
      return;
    }

    if(this.workers.length) {
      const worker = this.workers.shift();
      return worker(task);
    }

    this.tasksQueue.push(task)
  }

  done() {
    this.isDone = true;
  }

  getTask() {
    return new Promise((resolve, reject) => {
      if(this.tasksQueue.length > 0) {
        console.log('I found a task in queue');
        return resolve(this.tasksQueue.shift());
      }

      console.log('I didn`t find a task in queue, so I register as a free worker');

      this.workers.push((task) => {
        console.log('Finally they got a new task for me');
        resolve(task);
      });
    })
  }

  [Symbol.asyncIterator]() {
    const queue = this;
    return {
      async next() {
        if(queue.isDone && queue.tasksQueue.length === 0) {
          console.log('AsyncQueue is done, I go home');
          return {
            done: true,
            value: undefined
          }
        }

        return {
          done: false,
          value: await queue.getTask()
        }
      }
    } 
  }
}

// test
const asyncQueue = new AsyncQueue();
asyncQueue.enqueue(() => console.log('This is task 1'));

const asyncTask = (id, time) => {
  return () => {
      return new Promise(resolve => {
      setTimeout(() => {
        console.log(`This is task ${id}`);
        resolve();
      }, time);
    })
  }
}

asyncQueue.enqueue(asyncTask(2, 1000));

asyncQueue.enqueue(asyncTask(3, 100));

asyncQueue.enqueue(asyncTask(4, 500));

asyncQueue.enqueue(() => console.log('This is task 5'));

setTimeout(() => {
  asyncQueue.enqueue(asyncTask(6, 500))
}, 5000);

setTimeout(() => {
  asyncQueue.done();
}, 4000);

(async () => {
  for await (const task of asyncQueue) {
    await task();
  }
  
})();