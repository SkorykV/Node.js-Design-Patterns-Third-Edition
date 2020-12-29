import { totalSales as totalSalesRaw } from './totalSales.js'

function callbackify(func) {
  return (...args) => {
    const callback = args.pop();
    func(...args)
      .then(res => callback(null, res))
      .catch(e => callback(e));
  }
}

const totalSalesWithCalback = callbackify(totalSalesRaw);

const CACHE_TTL = 30 * 1000 // 30 seconds TTL
const batching = new Map();
const cache = new Map();

export function totalSales(product, callback) {
  if(cache.has(product)) {
    console.log('cache hit');
    return setImmediate(callback.bind(null, null, cache.get(product)));
  }

  if(batching.has(product)) {
    const subscribedCallbacks = batching.get(product);
    console.log('Batched');
    return batching.set(product, [...subscribedCallbacks, callback]);
  }

  batching.set(product, [callback]);

  totalSalesWithCalback(product, (err, result) => {
    if(!err) {
      cache.set(product, result);
      setTimeout(() => {
        cache.delete(product);
      }, CACHE_TTL)
    }

    const subscribedCallbacks = batching.get(product);
    batching.delete(product);

    console.log('I satisfy', subscribedCallbacks.length);

    subscribedCallbacks.forEach(cb => {
      if(err) {
        return cb(err);
      }

      cb(null, result)
    })
  })
}