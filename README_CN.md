# limit-promise-all-in-one

包含了一些常用的限制 Promise 并发量的函数。

## Why？

有些异步请求如果并发量太大可能会导致一些问题，比如过于频繁的网络请求可能会超过服务器的访问限制。其中一种解决方法是限制 pending 状态的 Promise 的最大数量，多余的待处理请求需要排队等待执行。这个库基于这个思路提供了一些函数用于处理此类情况。

## Install

```shell
npm install limit-promise-all-in-one
```

## Usage

首先定义一个返回 Promise 的函数，在后面的示例中都会用到：

```javascript
const timeout = (time) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(time);
    }, time);
  });
```

**LimitPromisePool**

用于创建一个 Promise 的并发任务池实例，该实例会提供一些函数对传入其中的 Promise 并发数量进行限制。它的配置项如下：

| Configuration | Type   | Remark                                      |
| ------------- | ------ | ------------------------------------------- |
| max           | number | The number of concurrent executions allowed |

**LimitPromisePool.call**

立即执行一个返回值为 Promise 的函数。

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

改造一个返回值为 Promise 的函数，使得这个函数的执行受到并发量限制。

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

 这个函数的用法和 `Promise.all` 类似，区别在于每个数组元素中的 Promise 函数需要用一个函数包裹起来，并作为它的返回值。

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

