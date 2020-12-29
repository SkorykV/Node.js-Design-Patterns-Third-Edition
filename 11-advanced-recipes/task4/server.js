import { createServer } from 'http';
import { Worker } from 'worker_threads';

const server = createServer((req, res) => {
  if(req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/json')
    res.writeHead(200)
    res.end(JSON.stringify({
      message: 'Pong'
    }))
  }

  const url = new URL(req.url, 'http://localhost');
  const func = url.searchParams.get('func');
  const params = url.searchParams.get('params');


  let worker = new Worker('./worker.js', {workerData: { func, params }});

  worker.once('error', error => {
    console.log('Worker exited with error', error.message);

    res.setHeader('Content-Type', 'application/json')
    res.writeHead(200)
    res.end(JSON.stringify({
      error: error.message
    }))
    
  })

  worker.once('message', msg => {
    if(msg.event === 'finish') {
      console.log('GOT A RESULT FROM WORKER');
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(200)
      res.end(JSON.stringify({
        message: msg.result || 'Success'
      }))
    }
  })
  
})

server.listen(3000, () => {
  console.log('Server is listening on port', 3000)
});