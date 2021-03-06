# limit-promise-all-in-one

Contains some commonly used functions that limit the concurrency of Promises.

[中文文档](https://github.com/duanzheng/limit-promise-all-in-one/blob/master/README_CN.md)

## Why?

Some asynchronous requests may cause some problems if the concurrency is too large. For example, too frequent network requests may exceed the server's access limit. One solution is to limit the maximum number of pending Promises, and redundant pending requests need to be queued for execution. Based on this idea, this library provides some functions to handle such situations.

## Install

```shell
npm install limit-promise-all-in-one
```

## Usage

First define a function that returns Promise, which will be used in the following examples:

```javascript
const timeout = (time) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(time);
    }, time);
  });
```

**LimitPromisePool**

A concurrent task pool instance used to create a Promise. The instance will provide some functions to limit the number of concurrent Promises passed into it. Its configuration items are as follows:

| Configuration | Type   | Remark                                      |
| ------------- | ------ | ------------------------------------------- |
| max           | number | The number of concurrent executions allowed |

**LimitPromisePool.call**

Execute a function that returns a Promise immediately.

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

Transform a function that returns a Promise so that the execution of this function is limited by the amount of concurrency.

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

The usage of this function is similar to `Promise.all`, except that the Promise function in each array element needs to be wrapped in a function and used as its return value.

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

