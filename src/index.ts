interface Task<T> {
  p: () => Promise<T>;
  resolve: (r: T) => void;
  reject: (e: any) => void;
}

interface Options {
  max: number;
}

interface PromiseCreator {
  (): Promise<any>;
}

export class LimitPromisePool {
  private _taskList: Array<Task<any>>;

  private _concurrentNum: number;

  private max: number;

  constructor(options: Options) {
    // 等待执行的队列
    this._taskList = [];
    // 正在并发执行的数量
    this._concurrentNum = 0;
    // 最大并发数量
    this.max = options.max;
  }

  private _createTask() {
    if (this._taskList.length && this._concurrentNum < this.max) {
      this._concurrentNum++;
      const { p, resolve, reject } = this._taskList.shift();
      Promise.resolve(p())
        .then((r) => {
          resolve(r);
        })
        .catch((e) => {
          reject(e);
        })
        .finally(() => {
          this._concurrentNum--;
          this._createTask();
        });
    }
  }

  call(promiseCreator: PromiseCreator) {
    return new Promise((resolve, reject) => {
      this._taskList.push({
        p: promiseCreator,
        resolve,
        reject,
      });
      this._createTask();
    });
  }

  bind(pFunc: (...args: any[]) => Promise<any>) {
    return (...args) =>
      new Promise((resolve, reject) => {
        this._taskList.push({
          p: pFunc.bind(this, ...args),
          resolve,
          reject,
        });
        this._createTask();
      });
  }
}

export function LimitPromiseAll(
  funcList: PromiseCreator[],
  max: number
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    if (!funcList.length) {
      return resolve([]);
    }
    const result = [];
    const waitList = [...funcList];
    let resolveCount = 0;
    let executingCount = 0;

    function _run() {
      if (waitList.length && executingCount < max) {
        executingCount++;
        const p = waitList.shift();
        Promise.resolve(p())
          .then((r) => {
            const dataIndex = funcList.indexOf(p);
            result[dataIndex] = r;
            resolveCount++;
            if (resolveCount === funcList.length) {
              resolve(result);
            }
          })
          .catch(reject)
          .finally(() => {
            executingCount--;
            _run();
          });
      }
    }

    waitList.slice(0, max).forEach(() => {
      _run();
    });
  });
}
