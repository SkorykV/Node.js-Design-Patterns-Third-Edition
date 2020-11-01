import { spider } from './spider.js'
import { TaskQueue } from './task-queue.js';

const taskQueue = new TaskQueue(+process.argv[4] || 2);

taskQueue.on('error', console.error);
taskQueue.on('empty', () => {
  console.log('Download finished');
})

spider(process.argv[2], +process.argv[3], taskQueue)

