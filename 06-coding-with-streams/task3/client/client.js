import { createReadStream } from 'fs';
import { basename } from 'path';
import { connect } from 'net';
import { createCipheriv, randomBytes } from 'crypto'

function sendFiles(files, destination, secret) {
  const iv = randomBytes(16)
  const encrStream = createCipheriv('aes192', secret, iv);
  encrStream.pipe(destination);
  let openFileStreams = files.length;
  destination.write(iv);
  console.log(iv.toString('hex'));
  for(let i = 0; i < files.length; i++) {
    const fileNameBuffer = Buffer.from(files[i], 'utf-8');
    createReadStream(files[i]).on('data', chunk => {
      const packageBuffer = Buffer.alloc(4 + fileNameBuffer.length + 4 + chunk.length);

      packageBuffer.writeUInt32BE(fileNameBuffer.length, 0);
      fileNameBuffer.copy(packageBuffer, 4);

      packageBuffer.writeUInt32BE(chunk.length, 4 + fileNameBuffer.length);
      chunk.copy(packageBuffer, 4 + fileNameBuffer.length + 4);

      encrStream.write(packageBuffer);
    })
    .on('end', () => {
      console.log('sent ', files[i]);
      if(--openFileStreams === 0) {
        console.log('close socket');
        encrStream.end();
      }
    })
  }
}


const socket = connect(3000, () => {
  const fileNames = process.argv.slice(3).map(name => basename(name));
  const secret = Buffer.from(process.argv[2], 'hex')
  sendFiles(fileNames, socket, secret);
})