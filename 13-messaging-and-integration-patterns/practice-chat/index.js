import { createServer } from 'http';
import serveStatic from 'serve-static';
import finalhandler from 'finalhandler';
import WebSocket from 'ws';
import zmq from 'zeromq';
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
const argv = yargs(hideBin(process.argv)).argv;

const serveStaticFiles = serveStatic('public');

async function initZeroMqSockets(wss) {
  const pubSocket = new zmq.Publisher;

  await pubSocket.bind(`tcp://*:${argv.pubPort}`);

  const subSocket = new zmq.Subscriber;

  for(const port of JSON.parse(argv.subPorts)) {
    subSocket.connect(`tcp://127.0.0.1:${port}`);
  }

  subSocket.subscribe('chat');

  handleMessagesFromOtherServers(subSocket, wss);

  return pubSocket;
}

async function main() {
  const server = createServer((request, response) => {
    serveStaticFiles(request, response, finalhandler(request, response));
  });

  const wss = new WebSocket.Server({server});

  const publishSocket = await initZeroMqSockets(wss);

  wss.on('connection', client => {
    console.log(argv.serverPort, 'I got a client');
    client.on('message', async (message) => {
      await publishSocket.send(`chat ${message}`);
      broadcast(wss.clients, message);
    })
  });

  server.listen(argv.serverPort, () => {
    console.log('Server is listening on port', argv.serverPort);
  })
}

main().catch(e => console.log(e));


async function handleMessagesFromOtherServers(subSocket, wss) {
  for await (const bufferedMessage of subSocket) {
    const message = bufferedMessage.toString().replace('chat ', '');
    console.log('Message from another server', message);
    broadcast(wss.clients, `* ${message}`);
  }
}

function broadcast(clients, message) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  })
}