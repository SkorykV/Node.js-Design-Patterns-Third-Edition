import { createBrotliCompress, createGzip, createDeflate } from 'zlib';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline, Transform } from 'stream';

function measureCompression(inputStream, compressionStream, algorithmName) {
  let start;
  let totalTime = 0;
  let initalSize = 0;
  let compressedSize = 0;
  pipeline(
    inputStream,
    new Transform({ 
      transform(chunk, encoding, cb){
        start = process.hrtime();
        initalSize += chunk.length;
        this.push(chunk);
        cb();
      }
    }),
    compressionStream,
    new Transform({ 
      transform(chunk, encoding, cb){
        const chunkTime = process.hrtime(start);
        totalTime = chunkTime[0] * 1e3 + chunkTime[1] / 1e6;
        compressedSize += chunk.length;
        cb();
      }
    }),
    err => {
      if(err) {
        return console.error("Error occurred");
      }

      console.log(`${algorithmName} took ${totalTime}ms, relative size - ${compressedSize / initalSize}`);
    }
  )
}

const source = createReadStream(process.argv[2]);
const gzip = createGzip();
const brotli = createBrotliCompress();
const deflate = createDeflate();

measureCompression(source, gzip, 'Gzip');
measureCompression(source, brotli, 'Brotli');
measureCompression(source, deflate, 'Deflate');