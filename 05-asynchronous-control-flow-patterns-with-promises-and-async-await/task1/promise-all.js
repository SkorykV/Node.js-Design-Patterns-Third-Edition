export function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let done = 0;
    promises.forEach((promise, i) => promise.then(result => {
      results[i] = result;
      done++;
      if(done === promises.length) {
        resolve(results)
      }
    }).catch(reject));
  })
}

export async function promiseALlWrong(promises) {
  try {
    const results = [];
    for (const promise of promises) {
      const result = await promise;
      results.push(result)
    }
    return results;
  }
  catch(e) {
    console.log('I CATCH')
    throw e
  }
}

function delayThatThrows(n, shouldThrow = false) {
  const start = process.hrtime();
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const time = getDiff(start);
      if(shouldThrow) {
        reject(time);
      }
      resolve(time)
    }, n);
  })
}

function getDiff(start) {
  const diff = process.hrtime(start);
  return (diff[0] * 1e9 + diff[1]) / 1e6;
}

const start = process.hrtime();
//promiseAll([delayThatThrows(500), delayThatThrows(100, true), delayThatThrows(1000)]).then(console.log).catch(r => console.log('Correct', getDiff(start), r));

promiseALlWrong([delayThatThrows(100, true), delayThatThrows(500), delayThatThrows(1000)]).then(console.log).catch(r => console.log('Wrong', getDiff(start), r));