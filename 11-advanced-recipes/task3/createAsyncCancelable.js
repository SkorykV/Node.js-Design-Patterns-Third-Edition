import { CancelError } from './cancelError.js'

export function createAsyncCancelable (generatorFunction) {
  return function asyncCancelable (...args) {
    const generatorObject = generatorFunction(...args)
    let cancelRequested = false
    let cancelInnerStep;

    function cancel () {
      console.log('Cancel called');
      cancelRequested = true;
      if(cancelInnerStep) {
        console.log('Gonna cancel inner func')
        cancelInnerStep();
      }
    }

    const promise = new Promise((resolve, reject) => {
      async function nextStep (prevResult) {
        let prevStepFunc;
        if(prevResult.value && prevResult.value.cancel) {
          console.log('This step is cancelable function');
          prevStepFunc = prevResult.value.promise;
          cancelInnerStep = prevResult.value.cancel;
        }
        else {
          prevStepFunc = prevResult.value;
          cancelInnerStep = undefined;
        }

        if (cancelRequested) {
          console.log('Canceled asyncCancelable')
          if(cancelInnerStep) {
            cancelInnerStep();
            prevStepFunc.catch(e => {})
          }
          return reject(new CancelError())
        }

        if (prevResult.done) {
          return resolve(prevResult.value)
        }

        try {
          nextStep(generatorObject.next(await prevStepFunc))
        } catch (err) {
          try {
            if(err instanceof CancelError) {
              console.log('Some inner function was cancelled');
              return reject(err)
            }
            nextStep(generatorObject.throw(err))
          } catch (err2) {
            console.log('secondly got error', err.message)
            reject(err2)
          }
        }
      }

      nextStep({})
    })

    return { promise, cancel }
  }
}
