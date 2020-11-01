import fs from 'fs';

export function concatFiles(dest, sources, cb) {
  const tasks = sources.map(fileName => {
    return function(done) {
      fs.readFile(fileName, 'utf8', (err, content) => {
        if(err) {
          return done(err);
        }
        fs.appendFile(dest, content, err => {
          if(err) {
            return done(err);
          }
          done();
        })
      })
    }
  })

  iterateTasksCollection(tasks, cb);
}

function iterateTasksCollection(tasks, finish) {
  function iterate(i) {
    if(i === tasks.length) {
      return finish()
    }
    console.log('Start processing task', i+1);
    const task = tasks[i];
    task(err => {
      if(err) {
        return finish(err);
      }
      iterate(i+1);
    })
  }
  iterate(0);
}

concatFiles('result.txt', process.argv.slice(2), err => {
  if(err) {
    console.error(err)
  }
  console.log('Files Concat finished');
})