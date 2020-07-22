interface Options {
    max: number;
}
interface PromiseCreator {
    (): Promise<any>;
}
export declare class LimitPromisePool {
    private _taskList;
    private _concurrentNum;
    private max;
    constructor(options: Options);
    private _createTask;
    call(promiseCreator: PromiseCreator): Promise<unknown>;
    bind(pFunc: (...args: any[]) => Promise<any>): (...args: any[]) => Promise<unknown>;
}
export declare function LimitPromiseAll(funcList: PromiseCreator[], max: number): Promise<any[]>;
export {};
