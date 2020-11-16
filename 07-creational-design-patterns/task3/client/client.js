import superagent from 'superagent';

(async () => {
  await superagent.post('http://localhost:3000').send({ todo: 'buy ingredients'});
  await superagent.post('http://localhost:3000').send({ todo: 'cook borsh'});
  await superagent.post('http://localhost:3000').send({ todo: 'go to sleep'});
})();