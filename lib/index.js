"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitPromiseAll = exports.LimitPromisePool = void 0;
var LimitPromisePool = (function () {
    function LimitPromisePool(options) {
        this._taskList = [];
        this._concurrentNum = 0;
        this.max = options.max;
    }
    LimitPromisePool.prototype._createTask = function () {
        var _this = this;
        if (this._taskList.length && this._concurrentNum < this.max) {
            this._concurrentNum++;
            var _a = this._taskList.shift(), p = _a.p, resolve_1 = _a.resolve, reject_1 = _a.reject;
            Promise.resolve(p())
                .then(function (r) {
                resolve_1(r);
            })
                .catch(function (e) {
                reject_1(e);
            })
                .finally(function () {
                _this._concurrentNum--;
                _this._createTask();
            });
        }
    };
    LimitPromisePool.prototype.call = function (promiseCreator) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._taskList.push({
                p: promiseCreator,
                resolve: resolve,
                reject: reject,
            });
            _this._createTask();
        });
    };
    LimitPromisePool.prototype.bind = function (pFunc) {
        var _this = this;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new Promise(function (resolve, reject) {
                _this._taskList.push({
                    p: pFunc.bind.apply(pFunc, __spreadArrays([_this], args)),
                    resolve: resolve,
                    reject: reject,
                });
                _this._createTask();
            });
        };
    };
    return LimitPromisePool;
}());
exports.LimitPromisePool = LimitPromisePool;
function LimitPromiseAll(funcList, max) {
    return new Promise(function (resolve, reject) {
        if (!funcList.length) {
            return resolve([]);
        }
        var result = [];
        var waitList = __spreadArrays(funcList);
        var resolveCount = 0;
        var executingCount = 0;
        function _run() {
            if (waitList.length && executingCount < max) {
                executingCount++;
                var p_1 = waitList.shift();
                Promise.resolve(p_1())
                    .then(function (r) {
                    var dataIndex = funcList.indexOf(p_1);
                    result[dataIndex] = r;
                    resolveCount++;
                    if (resolveCount === funcList.length) {
                        resolve(result);
                    }
                })
                    .catch(reject)
                    .finally(function () {
                    executingCount--;
                    _run();
                });
            }
        }
        waitList.slice(0, max).forEach(function () {
            _run();
        });
    });
}
exports.LimitPromiseAll = LimitPromiseAll;
