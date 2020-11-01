import parse from 'csv-parse';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline, PassThrough } from 'stream';
import { CrimesByYear } from './crimes-by-year.js';
import { CrimesByArea } from './crimes-by-area.js';

const csvParser = parse({ columns: true });

const monitor = new PassThrough({ objectMode: true });

let rowsProcessed = 0;
monitor
  .on('data', (chunk) => {
    rowsProcessed += 1;
    if(rowsProcessed % 1e6 === 0 ) {
      console.log(`Started processing of ${rowsProcessed} row`);
    }
  })
.on('end', () => {
  console.log(`Totally processed ${rowsProcessed} rows`);
})

const parsingPipeline = pipeline(
  createReadStream('london_crime_by_lsoa.csv'),
  csvParser,
  monitor,
  err => {
    if(err) {
      console.error('Error occurred with parsing');
    }
  }
)

const outputStream = createWriteStream('results.txt');

//find best and worst years
const yearStream = pipeline(
  parsingPipeline,
  new CrimesByYear(),
  err => {
    if(err) {
      return console.error('Error occurred in CrimesByYear pipeline');
    }
    console.log('Best and Worst years found');
  }
)

//find best and worst borough
const boroughStream = pipeline(
  parsingPipeline,
  new CrimesByArea(),
  err => {
    if(err) {
      return console.error('Error occurred in CrimesByYear pipeline');
    }
    console.log('Best and Worst boroughs found');
  }
)

yearStream.pipe(outputStream, {end: false});

boroughStream.pipe(outputStream, {end: false});

outputStream.on('error', err => {
  console.error('Writting results failed');
})