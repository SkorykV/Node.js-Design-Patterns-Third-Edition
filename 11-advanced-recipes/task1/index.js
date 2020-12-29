import { once } from 'events';
import { db } from './db.js';

function withPreInitializedBehavior(target, readyEventName, augmentedMethodNames) {
  const commandsQueue = [];
  let isTargetInited = false;

  once(target, readyEventName).then(() => {
    isTargetInited = true;

    commandsQueue.forEach(command => command())
  })

  return new Proxy(target, {
    get(target, property) {
      if(!augmentedMethodNames.includes(property)) {
        return target[property];
      }

      return (...args) => {
        if(isTargetInited) {
          console.log('Immediately executed');
          return target[property](...args);
        }

        return new Promise((resolve, reject) => {
          console.log('Pushed to queue');
          const command = () => {
            target[property](...args).then(resolve, reject);
          }

          commandsQueue.push(command);
        })        
      }
    }
  })
}

const dbWithPreInitialized = withPreInitializedBehavior(db, 'connected', ['query']);

dbWithPreInitialized.connect();

dbWithPreInitialized.query('query 1').then(() => { console.log('First query was executed') });
dbWithPreInitialized.query('query 2').then(() => { console.log('Second query was executed') });

setTimeout(() => {
  dbWithPreInitialized.query('query 3').then(() => { console.log('Last query was executed') });
}, 600)