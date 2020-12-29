export function asyncRoutine (label) {
  console.log(`Starting async routine ${label}`)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`Async routine ${label} completed`)
      //reject('error');
      resolve(`Async routine ${label} result`)
    }, 100)
  })
}
