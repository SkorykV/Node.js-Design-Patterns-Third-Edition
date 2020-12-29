export function createLazyBuffer(size) {
  let buffer;
  return new Proxy(Buffer.from(''), {
    get: (target, property) => {
      if(property === 'write') {
        return function write(...args) {
          if(!buffer) {
            buffer = Buffer.alloc(size);
          }
          buffer.write(...args)
        }
      }
      if(!buffer) {
        throw new Error('Lazy buffer was not initialized yet');
      }
      const attr = buffer[property];
      if(typeof attr === 'function') {
        return attr.bind(buffer);
      }
      return attr;
    }
  })
}

const lazyBuff = createLazyBuffer(10);

try {
  console.log(lazyBuff instanceof Buffer);
  lazyBuff.length;
}
catch(e) {
  console.log(e);
  console.log('Keep trying')
}

lazyBuff.write('hello!');

console.log(lazyBuff.toString(), lazyBuff.length);