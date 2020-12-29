import { asyncRoutine } from './asyncRoutine.js'
import { createAsyncCancelable } from './createAsyncCancelable.js'
import { CancelError } from './cancelError.js'

const cancelable = createAsyncCancelable(function * () {
  try {
    const resA = yield asyncRoutine('A')
    console.log(resA)
    const resB = yield asyncRoutine('B')
    console.log(resB)
    const resC = yield asyncRoutine('C')
    console.log(resC)
    yield cancelable2();
  }
  catch(e) {
    console.log('we are good');
  }
})

const cancelable2 = createAsyncCancelable(function * () {
  try {
    const resA = yield asyncRoutine('D')
    console.log(resA)
    const resB = yield asyncRoutine('E')
    console.log(resB)
    const resC = yield asyncRoutine('F')
    console.log(resC)
  }
  catch(e) {
    console.log('we are good');
  }
})

const { promise, cancel } = cancelable()
promise.catch(err => {
  if (err instanceof CancelError) {
    console.log('Function canceled')
  } else {
    console.error(err)
  }
})

setTimeout(() => {
  cancel()
}, 300)
