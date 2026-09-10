// ==UserScript==
// @name        bilibili不连播推荐
// @namespace   https://github.com/lzghzr/lzghzr/TampermonkeyJS
// @version     0.0.2
// @author      lzghzr
// @description bilibili自动连播：不会自动跳转到其他视频，只在分P间跳转
// @supportURL  https://github.com/lzghzr/TampermonkeyJS/issues
// @match       https://www.bilibili.com/video/*
// @license     MIT
// @grant       none
// @run-at      document-start
// ==/UserScript==
const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
let loaded = false;
Node.prototype.appendChild = new Proxy(Node.prototype.appendChild, {
  apply: function (target, _this, args) {
    if (!loaded && args[0].src !== undefined && args[0].src.match(/npd\.[\.0-9a-z]+\.js/) !== null) {
      loaded = true;
      W.nanoWidgetsJsonp = W.nanoWidgetsJsonp || [];
      W.nanoWidgetsJsonp.push = new Proxy(W.nanoWidgetsJsonp.push, {
        apply: function (target, _this, args) {
          for (const [name, fn] of Object.entries(args[0][1])) {
            let fnStr = fn.toString();
            if (fnStr.includes('.appendRelatedAutoplay')) {
              const regexp = /(?<left>\.appendRelatedAutoplay=function\(.*?\){)/s;
              const match = fnStr.match(regexp);
              if (match !== null)
                fnStr = fnStr.replace(regexp, '$<left>return;');
              else
                console.error(GM_info.script.name, '功能失效');
            }
            if (fn.toString() !== fnStr)
              args[0][1][name] = str2Fn(fnStr);
          }
          return Reflect.apply(target, _this, args);
        }
      });
    }
    return Reflect.apply(target, _this, args);
  }
});
function str2Fn(str) {
  const fnReg = str.match(/([^\{]*)\{(.*)\}$/s);
  if (fnReg !== null) {
    const [, head, body] = fnReg;
    const args = head.replaceAll(/function[^\(]*|[\s()=>]/g, '').split(',');
    return new Function(...args, body);
  }
}