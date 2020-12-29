import { workerData, parentPort } from 'worker_threads';

console.log('worker started');

const result = eval('(' + workerData.func + `)(...${workerData.params})`);

console.log('worker finished');

parentPort.postMessage({event: 'finish', result })