import { createServer } from 'http';

export class RemoteQueue {
  constructor(executor) {
    this._queue = [];
    this._workers = [];

    executor(this._enqueue.bind(this));
  }
  dequeue() {
    return new Promise((resolve) => {
      if(this._queue.length && !this._workers.length) {
        return resolve(this._queue.shift());
      }
      this._workers.push(resolve);
    });
  }

  _enqueue(item) {
    if(this._workers.length){
      const worker = this._workers.shift();
      worker(item);
    }
    else {
      this._queue.push(item);
    }
  }
}

const remoteQueue = new RemoteQueue(
  (enqueue) => {
    const server = createServer((req, res) => {
      let data = '';
      req.on('data', chunk => {
        data += chunk;
      })
      req.on('end', () => {
        enqueue(JSON.parse(data).todo)
      })
      res.end();
    })

    server.listen(3000);
  }
);
;

(async () => {
  while(true) {
    const todo = await remoteQueue.dequeue();
    console.log(`I process: ${todo}`);
  }
})()