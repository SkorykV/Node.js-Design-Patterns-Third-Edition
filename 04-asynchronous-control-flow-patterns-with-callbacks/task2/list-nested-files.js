import fs from 'fs';
import path from 'path';

export function listNestedFiles(rootDir, cb) {
  fs.readdir(rootDir, (err, filesAndDirs) => {
    if(err) {
      return cb(err);
    }
    const tasks = filesAndDirs.map(name => {
      return function(taskCompletedCb) {
        const fullPath = path.join(rootDir, name);
        fs.stat(fullPath, (err, stats) => {
          if(err) {
            return taskCompletedCb(err)
          }
          if(stats.isDirectory()) {
            listNestedFiles(fullPath, (err, fileNames) => {
              if(err) {
                return taskCompletedCb(err);
              }
              taskCompletedCb(null, fileNames);
            })
          }
          else {
            taskCompletedCb(null, [fullPath]);
          }
        })
      }
    })
    executeInParallel(tasks, 2, cb);
  })
}

listNestedFiles(process.argv[2], (err, fileNames) => {
  if(err) {
    return console.log('Error', err);
  }
  console.log('Result:', fileNames);
});

function executeInParallel(tasks, concurrency, finishCb) {
  let running = 0;
  let i = 0;
  let completed = 0;
  let allResults = [];
  if(tasks.length === 0) {
    return finishCb(null, allResults);
  }
  function runNext() {
    while(running < concurrency && i < tasks.length) {
      const task = tasks[i];
      running++;
      i++;
      task((err, result) => {
        if(err) {
          return finishCb(err);
        }
        running--;
        completed++;
        allResults = allResults.concat(result);
        if(completed === tasks.length) {
          finishCb(null, allResults);
        }
        runNext();
      })
    }
  } 
  runNext();
}