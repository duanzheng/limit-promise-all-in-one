const { LimitPromisePool, LimitPromiseAll } = require('../lib');

const limitPromise = new LimitPromisePool({ max: 2 });

const timeout = (time) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(time);
    }, time);
  });

const limitTimeout = limitPromise.bind(timeout);

limitTimeout(1000).then((r) => console.log(r));
limitTimeout(500).then((r) => console.log(r));
limitTimeout(300).then((r) => console.log(r));
limitTimeout(600).then((r) => console.log(r));

limitPromise.call(() => timeout(1000)).then((r) => console.log(r));
limitPromise.call(() => timeout(500)).then((r) => console.log(r));
limitPromise.call(() => timeout(300)).then((r) => console.log(r));
limitPromise.call(() => timeout(600)).then((r) => console.log(r));

const pList = [
  () => timeout(1000),
  () => timeout(500),
  () => timeout(300),
  () => timeout(600),
];

LimitPromiseAll(pList, 2).then((r) => console.log(r));
