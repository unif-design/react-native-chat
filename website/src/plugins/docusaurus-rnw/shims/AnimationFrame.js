/* global globalThis */
'use strict';
// 与 Design 文档站一致：浏览器使用真实动画帧，SSG 提供调度边界。
function requestAnimationFrame(callback) {
  const request = globalThis.requestAnimationFrame;
  return typeof request === 'function' && request !== requestAnimationFrame
    ? request.call(globalThis, callback)
    : setTimeout(() => callback(Date.now()), 16);
}
function cancelAnimationFrame(handle) {
  const cancel = globalThis.cancelAnimationFrame;
  if (typeof cancel === 'function' && cancel !== cancelAnimationFrame)
    cancel.call(globalThis, handle);
  else clearTimeout(handle);
}
module.exports = { requestAnimationFrame, cancelAnimationFrame };
