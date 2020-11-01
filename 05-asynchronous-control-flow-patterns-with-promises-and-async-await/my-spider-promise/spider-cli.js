import { spider } from './spider.js';

const url = process.argv[2];
const depth = +process.argv[3];
const concurency = +process.argv[4];

spider(url, depth, concurency).then(() => {
  console.log('Finished spidering');
}).catch(err => console.error(err));