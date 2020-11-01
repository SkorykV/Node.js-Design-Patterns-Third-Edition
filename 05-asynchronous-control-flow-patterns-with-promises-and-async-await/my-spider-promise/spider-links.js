import { getPageLinks } from './utils.js';
import { spiderTask } from './spider.js';

export function spiderLinks(currentUrl, pageContent, remainingDepth, queue) {
  if(remainingDepth === 0) {
    return Promise.resolve();
  }

  const links = getPageLinks(currentUrl, pageContent);
  const tasks = links.map(link => spiderTask(link, remainingDepth-1, queue))
  return Promise.all(tasks);
}