# limit-promise-all-in-one

Contains some commonly used methods to limit Promise concurrency.

包含了一些常用的限制 Promise 并发量的方法。

## Install

```shell
npm install limit-promise-all-in-one
```

## Usage

Suppose we have such a Promise, which will be called frequently, and we want to limit its concurrent number:

```javascript
const timeout = (time) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(time);
    }, time);
  });
```

**LimitPromisePool**

Create the constructor of the Promise concurrent task pool. The configuration items supported when creating an instance are as follows:

| Configuration | Type   | Remark                                      |
| ------------- | ------ | ------------------------------------------- |
| max           | number | The number of concurrent executions allowed |

**LimitPromisePool.call**

Execute a function immediately.

```javascript
import { LimitPromisePool } from 'limit-promise-all-in-one';

const limitPromise = new LimitPromisePool({ max: 2 });

limitPromise.call(() => timeout(1000)).then((r) => console.log(r));
limitPromise.call(() => timeout(500)).then((r) => console.log(r));
limitPromise.call(() => timeout(300)).then((r) => console.log(r));
limitPromise.call(() => timeout(600)).then((r) => console.log(r));

// Output: 500 300 1000 600
```

**LimitPromisePool.bind**

Transform the incoming method so that the number of concurrent executions is controlled.

```javascript
import { LimitPromisePool } from 'limit-promise-all-in-one';

const limitPromise = new LimitPromisePool({ max: 2 });

const limitTimeout = limitPromise.bind(timeout);

limitTimeout(1000).then((r) => console.log(r));
limitTimeout(500).then((r) => console.log(r));
limitTimeout(300).then((r) => console.log(r));
limitTimeout(600).then((r) => console.log(r));

// Output: 500 300 1000 600
```

**LimitPromiseAll**

The function is the same as `Promise.all`, but the difference between each array should be noted.

```javascript
import { LimitPromiseAll } from 'limit-promise-all-in-one';

const pList = [
  () => timeout(1000),
  () => timeout(500),
  () => timeout(300),
  () => timeout(600),
];

LimitPromiseAll(pList, 2).then((r) => console.log(r));

// Output: [ 1000, 500, 300, 600 ]
```

