import mkdirp from 'mkdirp';
import { dirname } from 'path';
import { promises as fsPromises } from 'fs';
import { promisify } from 'util';
import superagent from 'superagent';

import { urlToFilename } from './utils.js';
import { spiderLinks } from './spider-links.js';
import { TaskQueuePC } from './task-queue-pc.js';

const promisifiedMkdirp = promisify(mkdirp);

export function spider(url, depth, concurency) {
  const taskQueue = new TaskQueuePC(concurency);
  return spiderTask(url, depth, taskQueue);
}

const spidering = new Set();

export function spiderTask(url, remainingDepth, queue) {
  if(spidering.has(url)) {
    return Promise.resolve();
  }
  spidering.add(url);

  return queue.pushTask(() => {
    const filename = urlToFilename(url);

    return fsPromises.readFile(filename).catch((err) => {
      if(err.code !== 'ENOENT') {
        throw err;
      }
      return download(url, filename);
    })
  }).then(content => spiderLinks(url, content, remainingDepth, queue))
}

function download(url, filename) {
  console.log('Start downloading', url);
  let content;
  return superagent.get(url).then((res) => {
    content = res.text;

    return saveFile(filename, content)
  }).then(() => {
    console.log('Finished downloading', url);
    return content;
  });
}

function saveFile(filename, content) {
  const dir = dirname(filename);
  return promisifiedMkdirp(dir).then(() => {
    return fsPromises.writeFile(filename, content)
  })
}