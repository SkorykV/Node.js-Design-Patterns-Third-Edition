import fs from 'fs'
import path from 'path'
import superagent from 'superagent'
import mkdirp from 'mkdirp'
import { urlToFilename } from './utils.js'
import { spiderLinks } from './spider-links.js';

const investigated = new Set();

export function spider (url, nesting, taskQueue) {
  if(investigated.has(url)) {
    return;
  };
  investigated.add(url);

  taskQueue.pushTask((done) => {
    spiderTask(url, nesting, taskQueue, done);
  })
}

function spiderTask(url, nesting, taskQueue, cb) {
  const filename = urlToFilename(url);
  fs.readFile(filename, 'utf8', (err, fileContent) => { 
    if (err) {
      if(err.code !== 'ENOENT') {
        return cb(err);
      }
      return download(url, filename, (err, downloadedContent) => {
        if(err) {
          return cb(err);
        }
        spiderLinks(url, downloadedContent, nesting, taskQueue, cb);
      });
    }
    spiderLinks(url, fileContent, nesting, taskQueue, cb);
  })
}

function saveFile(filename, content, cb) {
  mkdirp(path.dirname(filename), err => {
    if (err) {
      return cb(err)
    }
    fs.writeFile(filename, content, cb);
  })
}

function download(url, filename, cb) {
  console.log(`Downloading ${url} into ${filename}`)
  superagent.get(url).end((err, res) => { 
    if (err) {
      return cb(err)
    }
    saveFile(filename, res.text, (err) => {
      if (err) {
        return cb(err);
      }
      console.log(`Downloaded and save: ${url}`);
      cb(null, res.text);
    })
  })
}