import { createServer } from 'net';
import { createWriteStream } from 'fs';
import { basename, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createDecipheriv, randomBytes } from 'crypto'
import mkdirp from 'mkdirp';

function demultiplexFiles(source) {
  const fileStreams = {};
  let fileNameLength = null;
  let fileName = null;
  let chunkLength = null;
  let chunk;
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const filesDir = join(currentDir, 'files');
  let iv = null;
  let encrSource;

  function readFromEncrSource() {
    while(true) {
      if(fileNameLength === null) {
        chunk = encrSource.read(4);
        fileNameLength = chunk && chunk.readUInt32BE(0);
        if(fileNameLength === null) {
          return;
        }
      }
      if(fileName === null) {
        chunk = encrSource.read(fileNameLength);
        fileName = chunk && chunk.toString('utf8');
        if(fileName === null) {
          return;
        }
      }
      if(chunkLength === null) {
        chunk = encrSource.read(4);
        chunkLength = chunk && chunk.readUInt32BE(0);
        if(chunkLength === null) {
          return;
        }
      }
      chunk = encrSource.read(chunkLength);
      if(chunk === null) {
        return
      }
      if(!fileStreams[fileName]) {
        fileStreams[fileName] = createWriteStream(join(filesDir, basename(fileName)));
      }
      fileStreams[fileName].write(chunk);
      fileNameLength = null;
      fileName = null;
      chunkLength = null;
    }    
  }

  mkdirp(filesDir).then(() => {
    source.once('readable', () => {
    if(iv === null) {
      iv = source.read(16);
      if(iv === null) {
        return;
      }
      console.log(iv.toString('hex'));
      encrSource = source.pipe(createDecipheriv('aes192', secret, iv));

      encrSource.on('readable', readFromEncrSource)
      .on('end', () => {
        for(const fileName in fileStreams) {
          console.log('ended', fileName);
          const stream = fileStreams[fileName];
          stream.end();
        }
      });

      //readFromEncrSource();
    }});
  });
}

const secret = randomBytes(24);

const server = createServer(socket => {
  demultiplexFiles(socket);
})

server.listen(3000, () => {
  console.log('Server runs on', 3000);
  console.log(`Generated secret: ${secret.toString('hex')}`);
});