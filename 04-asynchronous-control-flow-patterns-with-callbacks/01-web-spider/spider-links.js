import { getPageLinks } from './utils.js';
import { spider } from './spider.js';

export function spiderLinks(currentUrl, body, nesting, taskQueue, cb) {
  if(nesting === 0) {
    return process.nextTick(cb)
  }
  const links = getPageLinks(currentUrl, body);

  links.forEach((url) => {
    spider(url, nesting-1, taskQueue)
  })
}
