(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.BitlySDK=f()}})(function(){var define,module,exports;return function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}({1:[function(require,module,exports){(function(process,global){(function(global,factory){typeof exports==="object"&&typeof module!=="undefined"?module.exports=factory():typeof define==="function"&&define.amd?define(factory):global.ES6Promise=factory()})(this,function(){"use strict";function objectOrFunction(x){return typeof x==="function"||typeof x==="object"&&x!==null}function isFunction(x){return typeof x==="function"}var _isArray=undefined;if(!Array.isArray){_isArray=function(x){return Object.prototype.toString.call(x)==="[object Array]"}}else{_isArray=Array.isArray}var isArray=_isArray;var len=0;var vertxNext=undefined;var customSchedulerFn=undefined;var asap=function asap(callback,arg){queue[len]=callback;queue[len+1]=arg;len+=2;if(len===2){if(customSchedulerFn){customSchedulerFn(flush)}else{scheduleFlush()}}};function setScheduler(scheduleFn){customSchedulerFn=scheduleFn}function setAsap(asapFn){asap=asapFn}var browserWindow=typeof window!=="undefined"?window:undefined;var browserGlobal=browserWindow||{};var BrowserMutationObserver=browserGlobal.MutationObserver||browserGlobal.WebKitMutationObserver;var isNode=typeof self==="undefined"&&typeof process!=="undefined"&&{}.toString.call(process)==="[object process]";var isWorker=typeof Uint8ClampedArray!=="undefined"&&typeof importScripts!=="undefined"&&typeof MessageChannel!=="undefined";function useNextTick(){return function(){return process.nextTick(flush)}}function useVertxTimer(){if(typeof vertxNext!=="undefined"){return function(){vertxNext(flush)}}return useSetTimeout()}function useMutationObserver(){var iterations=0;var observer=new BrowserMutationObserver(flush);var node=document.createTextNode("");observer.observe(node,{characterData:true});return function(){node.data=iterations=++iterations%2}}function useMessageChannel(){var channel=new MessageChannel;channel.port1.onmessage=flush;return function(){return channel.port2.postMessage(0)}}function useSetTimeout(){var globalSetTimeout=setTimeout;return function(){return globalSetTimeout(flush,1)}}var queue=new Array(1e3);function flush(){for(var i=0;i<len;i+=2){var callback=queue[i];var arg=queue[i+1];callback(arg);queue[i]=undefined;queue[i+1]=undefined}len=0}function attemptVertx(){try{var r=require;var vertx=r("vertx");vertxNext=vertx.runOnLoop||vertx.runOnContext;return useVertxTimer()}catch(e){return useSetTimeout()}}var scheduleFlush=undefined;if(isNode){scheduleFlush=useNextTick()}else if(BrowserMutationObserver){scheduleFlush=useMutationObserver()}else if(isWorker){scheduleFlush=useMessageChannel()}else if(browserWindow===undefined&&typeof require==="function"){scheduleFlush=attemptVertx()}else{scheduleFlush=useSetTimeout()}function then(onFulfillment,onRejection){var _arguments=arguments;var parent=this;var child=new this.constructor(noop);if(child[PROMISE_ID]===undefined){makePromise(child)}var _state=parent._state;if(_state){(function(){var callback=_arguments[_state-1];asap(function(){return invokeCallback(_state,child,callback,parent._result)})})()}else{subscribe(parent,child,onFulfillment,onRejection)}return child}function resolve(object){var Constructor=this;if(object&&typeof object==="object"&&object.constructor===Constructor){return object}var promise=new Constructor(noop);_resolve(promise,object);return promise}var PROMISE_ID=Math.random().toString(36).substring(16);function noop(){}var PENDING=void 0;var FULFILLED=1;var REJECTED=2;var GET_THEN_ERROR=new ErrorObject;function selfFulfillment(){return new TypeError("You cannot resolve a promise with itself")}function cannotReturnOwn(){return new TypeError("A promises callback cannot return that same promise.")}function getThen(promise){try{return promise.then}catch(error){GET_THEN_ERROR.error=error;return GET_THEN_ERROR}}function tryThen(then,value,fulfillmentHandler,rejectionHandler){try{then.call(value,fulfillmentHandler,rejectionHandler)}catch(e){return e}}function handleForeignThenable(promise,thenable,then){asap(function(promise){var sealed=false;var error=tryThen(then,thenable,function(value){if(sealed){return}sealed=true;if(thenable!==value){_resolve(promise,value)}else{fulfill(promise,value)}},function(reason){if(sealed){return}sealed=true;_reject(promise,reason)},"Settle: "+(promise._label||" unknown promise"));if(!sealed&&error){sealed=true;_reject(promise,error)}},promise)}function handleOwnThenable(promise,thenable){if(thenable._state===FULFILLED){fulfill(promise,thenable._result)}else if(thenable._state===REJECTED){_reject(promise,thenable._result)}else{subscribe(thenable,undefined,function(value){return _resolve(promise,value)},function(reason){return _reject(promise,reason)})}}function handleMaybeThenable(promise,maybeThenable,then$$){if(maybeThenable.constructor===promise.constructor&&then$$===then&&maybeThenable.constructor.resolve===resolve){handleOwnThenable(promise,maybeThenable)}else{if(then$$===GET_THEN_ERROR){_reject(promise,GET_THEN_ERROR.error);GET_THEN_ERROR.error=null}else if(then$$===undefined){fulfill(promise,maybeThenable)}else if(isFunction(then$$)){handleForeignThenable(promise,maybeThenable,then$$)}else{fulfill(promise,maybeThenable)}}}function _resolve(promise,value){if(promise===value){_reject(promise,selfFulfillment())}else if(objectOrFunction(value)){handleMaybeThenable(promise,value,getThen(value))}else{fulfill(promise,value)}}function publishRejection(promise){if(promise._onerror){promise._onerror(promise._result)}publish(promise)}function fulfill(promise,value){if(promise._state!==PENDING){return}promise._result=value;promise._state=FULFILLED;if(promise._subscribers.length!==0){asap(publish,promise)}}function _reject(promise,reason){if(promise._state!==PENDING){return}promise._state=REJECTED;promise._result=reason;asap(publishRejection,promise)}function subscribe(parent,child,onFulfillment,onRejection){var _subscribers=parent._subscribers;var length=_subscribers.length;parent._onerror=null;_subscribers[length]=child;_subscribers[length+FULFILLED]=onFulfillment;_subscribers[length+REJECTED]=onRejection;if(length===0&&parent._state){asap(publish,parent)}}function publish(promise){var subscribers=promise._subscribers;var settled=promise._state;if(subscribers.length===0){return}var child=undefined,callback=undefined,detail=promise._result;for(var i=0;i<subscribers.length;i+=3){child=subscribers[i];callback=subscribers[i+settled];if(child){invokeCallback(settled,child,callback,detail)}else{callback(detail)}}promise._subscribers.length=0}function ErrorObject(){this.error=null}var TRY_CATCH_ERROR=new ErrorObject;function tryCatch(callback,detail){try{return callback(detail)}catch(e){TRY_CATCH_ERROR.error=e;return TRY_CATCH_ERROR}}function invokeCallback(settled,promise,callback,detail){var hasCallback=isFunction(callback),value=undefined,error=undefined,succeeded=undefined,failed=undefined;if(hasCallback){value=tryCatch(callback,detail);if(value===TRY_CATCH_ERROR){failed=true;error=value.error;value.error=null}else{succeeded=true}if(promise===value){_reject(promise,cannotReturnOwn());return}}else{value=detail;succeeded=true}if(promise._state!==PENDING){}else if(hasCallback&&succeeded){_resolve(promise,value)}else if(failed){_reject(promise,error)}else if(settled===FULFILLED){fulfill(promise,value)}else if(settled===REJECTED){_reject(promise,value)}}function initializePromise(promise,resolver){try{resolver(function resolvePromise(value){_resolve(promise,value)},function rejectPromise(reason){_reject(promise,reason)})}catch(e){_reject(promise,e)}}var id=0;function nextId(){return id++}function makePromise(promise){promise[PROMISE_ID]=id++;promise._state=undefined;promise._result=undefined;promise._subscribers=[]}function Enumerator(Constructor,input){this._instanceConstructor=Constructor;this.promise=new Constructor(noop);if(!this.promise[PROMISE_ID]){makePromise(this.promise)}if(isArray(input)){this._input=input;this.length=input.length;this._remaining=input.length;this._result=new Array(this.length);if(this.length===0){fulfill(this.promise,this._result)}else{this.length=this.length||0;this._enumerate();if(this._remaining===0){fulfill(this.promise,this._result)}}}else{_reject(this.promise,validationError())}}function validationError(){return new Error("Array Methods must be provided an Array")}Enumerator.prototype._enumerate=function(){var length=this.length;var _input=this._input;for(var i=0;this._state===PENDING&&i<length;i++){this._eachEntry(_input[i],i)}};Enumerator.prototype._eachEntry=function(entry,i){var c=this._instanceConstructor;var resolve$$=c.resolve;if(resolve$$===resolve){var _then=getThen(entry);if(_then===then&&entry._state!==PENDING){this._settledAt(entry._state,i,entry._result)}else if(typeof _then!=="function"){this._remaining--;this._result[i]=entry}else if(c===Promise){var promise=new c(noop);handleMaybeThenable(promise,entry,_then);this._willSettleAt(promise,i)}else{this._willSettleAt(new c(function(resolve$$){return resolve$$(entry)}),i)}}else{this._willSettleAt(resolve$$(entry),i)}};Enumerator.prototype._settledAt=function(state,i,value){var promise=this.promise;if(promise._state===PENDING){this._remaining--;if(state===REJECTED){_reject(promise,value)}else{this._result[i]=value}}if(this._remaining===0){fulfill(promise,this._result)}};Enumerator.prototype._willSettleAt=function(promise,i){var enumerator=this;subscribe(promise,undefined,function(value){return enumerator._settledAt(FULFILLED,i,value)},function(reason){return enumerator._settledAt(REJECTED,i,reason)})};function all(entries){return new Enumerator(this,entries).promise}function race(entries){var Constructor=this;if(!isArray(entries)){return new Constructor(function(_,reject){return reject(new TypeError("You must pass an array to race."))})}else{return new Constructor(function(resolve,reject){var length=entries.length;for(var i=0;i<length;i++){Constructor.resolve(entries[i]).then(resolve,reject)}})}}function reject(reason){var Constructor=this;var promise=new Constructor(noop);_reject(promise,reason);return promise}function needsResolver(){throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")}function needsNew(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")}function Promise(resolver){this[PROMISE_ID]=nextId();this._result=this._state=undefined;this._subscribers=[];if(noop!==resolver){typeof resolver!=="function"&&needsResolver();this instanceof Promise?initializePromise(this,resolver):needsNew()}}Promise.all=all;Promise.race=race;Promise.resolve=resolve;Promise.reject=reject;Promise._setScheduler=setScheduler;Promise._setAsap=setAsap;Promise._asap=asap;Promise.prototype={constructor:Promise,then:then,"catch":function _catch(onRejection){return this.then(null,onRejection)}};function polyfill(){var local=undefined;if(typeof global!=="undefined"){local=global}else if(typeof self!=="undefined"){local=self}else{try{local=Function("return this")()}catch(e){throw new Error("polyfill failed because global object is unavailable in this environment")}}var P=local.Promise;if(P){var promiseToString=null;try{promiseToString=Object.prototype.toString.call(P.resolve())}catch(e){}if(promiseToString==="[object Promise]"&&!P.cast){return}}local.Promise=Promise}Promise.polyfill=polyfill;Promise.Promise=Promise;return Promise})}).call(this,require("_process"),typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{_process:3}],2:[function(require,module,exports){"use strict";var getOwnPropertySymbols=Object.getOwnPropertySymbols;var hasOwnProperty=Object.prototype.hasOwnProperty;var propIsEnumerable=Object.prototype.propertyIsEnumerable;function toObject(val){if(val===null||val===undefined){throw new TypeError("Object.assign cannot be called with null or undefined")}return Object(val)}function shouldUseNative(){try{if(!Object.assign){return false}var test1=new String("abc");test1[5]="de";if(Object.getOwnPropertyNames(test1)[0]==="5"){return false}var test2={};for(var i=0;i<10;i++){test2["_"+String.fromCharCode(i)]=i}var order2=Object.getOwnPropertyNames(test2).map(function(n){return test2[n]});if(order2.join("")!=="0123456789"){return false}var test3={};"abcdefghijklmnopqrst".split("").forEach(function(letter){test3[letter]=letter});if(Object.keys(Object.assign({},test3)).join("")!=="abcdefghijklmnopqrst"){return false}return true}catch(err){return false}}module.exports=shouldUseNative()?Object.assign:function(target,source){var from;var to=toObject(target);var symbols;for(var s=1;s<arguments.length;s++){from=Object(arguments[s]);for(var key in from){if(hasOwnProperty.call(from,key)){to[key]=from[key]}}if(getOwnPropertySymbols){symbols=getOwnPropertySymbols(from);for(var i=0;i<symbols.length;i++){if(propIsEnumerable.call(from,symbols[i])){to[symbols[i]]=from[symbols[i]]}}}}return to}},{}],3:[function(require,module,exports){var process=module.exports={};var cachedSetTimeout;var cachedClearTimeout;function defaultSetTimout(){throw new Error("setTimeout has not been defined")}function defaultClearTimeout(){throw new Error("clearTimeout has not been defined")}(function(){try{if(typeof setTimeout==="function"){cachedSetTimeout=setTimeout}else{cachedSetTimeout=defaultSetTimout}}catch(e){cachedSetTimeout=defaultSetTimout}try{if(typeof clearTimeout==="function"){cachedClearTimeout=clearTimeout}else{cachedClearTimeout=defaultClearTimeout}}catch(e){cachedClearTimeout=defaultClearTimeout}})();function runTimeout(fun){if(cachedSetTimeout===setTimeout){return setTimeout(fun,0)}if((cachedSetTimeout===defaultSetTimout||!cachedSetTimeout)&&setTimeout){cachedSetTimeout=setTimeout;return setTimeout(fun,0)}try{return cachedSetTimeout(fun,0)}catch(e){try{return cachedSetTimeout.call(null,fun,0)}catch(e){return cachedSetTimeout.call(this,fun,0)}}}function runClearTimeout(marker){if(cachedClearTimeout===clearTimeout){return clearTimeout(marker)}if((cachedClearTimeout===defaultClearTimeout||!cachedClearTimeout)&&clearTimeout){cachedClearTimeout=clearTimeout;return clearTimeout(marker)}try{return cachedClearTimeout(marker)}catch(e){try{return cachedClearTimeout.call(null,marker)}catch(e){return cachedClearTimeout.call(this,marker)}}}var queue=[];var draining=false;var currentQueue;var queueIndex=-1;function cleanUpNextTick(){if(!draining||!currentQueue){return}draining=false;if(currentQueue.length){queue=currentQueue.concat(queue)}else{queueIndex=-1}if(queue.length){drainQueue()}}function drainQueue(){if(draining){return}var timeout=runTimeout(cleanUpNextTick);draining=true;var len=queue.length;while(len){currentQueue=queue;queue=[];while(++queueIndex<len){if(currentQueue){currentQueue[queueIndex].run()}}queueIndex=-1;len=queue.length}currentQueue=null;draining=false;runClearTimeout(timeout)}process.nextTick=function(fun){var args=new Array(arguments.length-1);if(arguments.length>1){for(var i=1;i<arguments.length;i++){args[i-1]=arguments[i]}}queue.push(new Item(fun,args));if(queue.length===1&&!draining){runTimeout(drainQueue)}};function Item(fun,array){this.fun=fun;this.array=array}Item.prototype.run=function(){this.fun.apply(null,this.array)};process.title="browser";process.browser=true;process.env={};process.argv=[];process.version="";process.versions={};function noop(){}process.on=noop;process.addListener=noop;process.once=noop;process.off=noop;process.removeListener=noop;process.removeAllListeners=noop;process.emit=noop;process.prependListener=noop;process.prependOnceListener=noop;process.listeners=function(name){return[]};process.binding=function(name){throw new Error("process.binding is not supported")};process.cwd=function(){return"/"};process.chdir=function(dir){throw new Error("process.chdir is not supported")};process.umask=function(){return 0}},{}],4:[function(require,module,exports){"use strict";var strictUriEncode=require("strict-uri-encode");var objectAssign=require("object-assign");function encoderForArrayFormat(opts){switch(opts.arrayFormat){case"index":return function(key,value,index){return value===null?[encode(key,opts),"[",index,"]"].join(""):[encode(key,opts),"[",encode(index,opts),"]=",encode(value,opts)].join("")};case"bracket":return function(key,value){return value===null?encode(key,opts):[encode(key,opts),"[]=",encode(value,opts)].join("")};default:return function(key,value){return value===null?encode(key,opts):[encode(key,opts),"=",encode(value,opts)].join("")}}}function parserForArrayFormat(opts){var result;switch(opts.arrayFormat){case"index":return function(key,value,accumulator){result=/\[(\d*)\]$/.exec(key);key=key.replace(/\[\d*\]$/,"");if(!result){accumulator[key]=value;return}if(accumulator[key]===undefined){accumulator[key]={}}accumulator[key][result[1]]=value};case"bracket":return function(key,value,accumulator){result=/(\[\])$/.exec(key);key=key.replace(/\[\]$/,"");if(!result){accumulator[key]=value;return}else if(accumulator[key]===undefined){accumulator[key]=[value];return}accumulator[key]=[].concat(accumulator[key],value)};default:return function(key,value,accumulator){if(accumulator[key]===undefined){accumulator[key]=value;return}accumulator[key]=[].concat(accumulator[key],value)}}}function encode(value,opts){if(opts.encode){return opts.strict?strictUriEncode(value):encodeURIComponent(value)}return value}function keysSorter(input){if(Array.isArray(input)){return input.sort()}else if(typeof input==="object"){return keysSorter(Object.keys(input)).sort(function(a,b){return Number(a)-Number(b)}).map(function(key){return input[key]})}return input}exports.extract=function(str){return str.split("?")[1]||""};exports.parse=function(str,opts){opts=objectAssign({arrayFormat:"none"},opts);var formatter=parserForArrayFormat(opts);var ret=Object.create(null);if(typeof str!=="string"){return ret}str=str.trim().replace(/^(\?|#|&)/,"");if(!str){return ret}str.split("&").forEach(function(param){var parts=param.replace(/\+/g," ").split("=");var key=parts.shift();var val=parts.length>0?parts.join("="):undefined;val=val===undefined?null:decodeURIComponent(val);formatter(decodeURIComponent(key),val,ret)});return Object.keys(ret).sort().reduce(function(result,key){var val=ret[key];if(Boolean(val)&&typeof val==="object"&&!Array.isArray(val)){result[key]=keysSorter(val)}else{result[key]=val}return result},Object.create(null))};exports.stringify=function(obj,opts){var defaults={encode:true,strict:true,arrayFormat:"none"};opts=objectAssign(defaults,opts);var formatter=encoderForArrayFormat(opts);return obj?Object.keys(obj).sort().map(function(key){var val=obj[key];if(val===undefined){return""}if(val===null){return encode(key,opts)}if(Array.isArray(val)){var result=[];val.slice().forEach(function(val2){if(val2===undefined){return}result.push(formatter(key,val2,result.length))});return result.join("&")}return encode(key,opts)+"="+encode(val,opts)}).filter(function(x){return x.length>0}).join("&"):""}},{"object-assign":2,"strict-uri-encode":5}],5:[function(require,module,exports){"use strict";module.exports=function(str){return encodeURIComponent(str).replace(/[!'()*]/g,function(c){return"%"+c.charCodeAt(0).toString(16).toUpperCase()})}},{}],6:[function(require,module,exports){(function(self){"use strict";if(self.fetch){return}var support={searchParams:"URLSearchParams"in self,iterable:"Symbol"in self&&"iterator"in Symbol,blob:"FileReader"in self&&"Blob"in self&&function(){try{new Blob;return true}catch(e){return false}}(),formData:"FormData"in self,arrayBuffer:"ArrayBuffer"in self};if(support.arrayBuffer){var viewClasses=["[object Int8Array]","[object Uint8Array]","[object Uint8ClampedArray]","[object Int16Array]","[object Uint16Array]","[object Int32Array]","[object Uint32Array]","[object Float32Array]","[object Float64Array]"];var isDataView=function(obj){return obj&&DataView.prototype.isPrototypeOf(obj)};var isArrayBufferView=ArrayBuffer.isView||function(obj){return obj&&viewClasses.indexOf(Object.prototype.toString.call(obj))>-1}}function normalizeName(name){if(typeof name!=="string"){name=String(name)}if(/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)){throw new TypeError("Invalid character in header field name")}return name.toLowerCase()}function normalizeValue(value){if(typeof value!=="string"){value=String(value)}return value}function iteratorFor(items){var iterator={next:function(){var value=items.shift();return{done:value===undefined,value:value}}};if(support.iterable){iterator[Symbol.iterator]=function(){return iterator}}return iterator}function Headers(headers){this.map={};if(headers instanceof Headers){headers.forEach(function(value,name){this.append(name,value)},this)}else if(Array.isArray(headers)){headers.forEach(function(header){this.append(header[0],header[1])},this)}else if(headers){Object.getOwnPropertyNames(headers).forEach(function(name){this.append(name,headers[name])},this)}}Headers.prototype.append=function(name,value){name=normalizeName(name);value=normalizeValue(value);var oldValue=this.map[name];this.map[name]=oldValue?oldValue+","+value:value};Headers.prototype["delete"]=function(name){delete this.map[normalizeName(name)]};Headers.prototype.get=function(name){name=normalizeName(name);return this.has(name)?this.map[name]:null};Headers.prototype.has=function(name){return this.map.hasOwnProperty(normalizeName(name))};Headers.prototype.set=function(name,value){this.map[normalizeName(name)]=normalizeValue(value)};Headers.prototype.forEach=function(callback,thisArg){for(var name in this.map){if(this.map.hasOwnProperty(name)){callback.call(thisArg,this.map[name],name,this)}}};Headers.prototype.keys=function(){var items=[];this.forEach(function(value,name){items.push(name)});return iteratorFor(items)};Headers.prototype.values=function(){var items=[];this.forEach(function(value){items.push(value)});return iteratorFor(items)};Headers.prototype.entries=function(){var items=[];this.forEach(function(value,name){items.push([name,value])});return iteratorFor(items)};if(support.iterable){Headers.prototype[Symbol.iterator]=Headers.prototype.entries}function consumed(body){if(body.bodyUsed){return Promise.reject(new TypeError("Already read"))}body.bodyUsed=true}function fileReaderReady(reader){return new Promise(function(resolve,reject){reader.onload=function(){resolve(reader.result)};reader.onerror=function(){reject(reader.error)}})}function readBlobAsArrayBuffer(blob){var reader=new FileReader;var promise=fileReaderReady(reader);reader.readAsArrayBuffer(blob);return promise}function readBlobAsText(blob){var reader=new FileReader;var promise=fileReaderReady(reader);reader.readAsText(blob);return promise}function readArrayBufferAsText(buf){var view=new Uint8Array(buf);var chars=new Array(view.length);for(var i=0;i<view.length;i++){chars[i]=String.fromCharCode(view[i])}return chars.join("")}function bufferClone(buf){if(buf.slice){return buf.slice(0)}else{var view=new Uint8Array(buf.byteLength);view.set(new Uint8Array(buf));return view.buffer}}function Body(){this.bodyUsed=false;this._initBody=function(body){this._bodyInit=body;if(!body){this._bodyText=""}else if(typeof body==="string"){this._bodyText=body}else if(support.blob&&Blob.prototype.isPrototypeOf(body)){this._bodyBlob=body}else if(support.formData&&FormData.prototype.isPrototypeOf(body)){this._bodyFormData=body}else if(support.searchParams&&URLSearchParams.prototype.isPrototypeOf(body)){this._bodyText=body.toString()}else if(support.arrayBuffer&&support.blob&&isDataView(body)){this._bodyArrayBuffer=bufferClone(body.buffer);this._bodyInit=new Blob([this._bodyArrayBuffer])}else if(support.arrayBuffer&&(ArrayBuffer.prototype.isPrototypeOf(body)||isArrayBufferView(body))){this._bodyArrayBuffer=bufferClone(body)}else{throw new Error("unsupported BodyInit type")}if(!this.headers.get("content-type")){if(typeof body==="string"){this.headers.set("content-type","text/plain;charset=UTF-8")}else if(this._bodyBlob&&this._bodyBlob.type){this.headers.set("content-type",this._bodyBlob.type)}else if(support.searchParams&&URLSearchParams.prototype.isPrototypeOf(body)){this.headers.set("content-type","application/x-www-form-urlencoded;charset=UTF-8")}}};if(support.blob){this.blob=function(){var rejected=consumed(this);if(rejected){return rejected}if(this._bodyBlob){return Promise.resolve(this._bodyBlob)}else if(this._bodyArrayBuffer){return Promise.resolve(new Blob([this._bodyArrayBuffer]))}else if(this._bodyFormData){throw new Error("could not read FormData body as blob")}else{return Promise.resolve(new Blob([this._bodyText]))}};this.arrayBuffer=function(){if(this._bodyArrayBuffer){return consumed(this)||Promise.resolve(this._bodyArrayBuffer)}else{return this.blob().then(readBlobAsArrayBuffer)}}}this.text=function(){var rejected=consumed(this);if(rejected){return rejected}if(this._bodyBlob){return readBlobAsText(this._bodyBlob)}else if(this._bodyArrayBuffer){return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))}else if(this._bodyFormData){throw new Error("could not read FormData body as text")}else{return Promise.resolve(this._bodyText)}};if(support.formData){this.formData=function(){return this.text().then(decode)}}this.json=function(){return this.text().then(JSON.parse)};return this}var methods=["DELETE","GET","HEAD","OPTIONS","POST","PUT"];function normalizeMethod(method){var upcased=method.toUpperCase();return methods.indexOf(upcased)>-1?upcased:method}function Request(input,options){options=options||{};var body=options.body;if(input instanceof Request){if(input.bodyUsed){throw new TypeError("Already read")}this.url=input.url;this.credentials=input.credentials;if(!options.headers){this.headers=new Headers(input.headers)}this.method=input.method;this.mode=input.mode;if(!body&&input._bodyInit!=null){body=input._bodyInit;input.bodyUsed=true}}else{this.url=String(input)}this.credentials=options.credentials||this.credentials||"omit";if(options.headers||!this.headers){this.headers=new Headers(options.headers)}this.method=normalizeMethod(options.method||this.method||"GET");this.mode=options.mode||this.mode||null;this.referrer=null;if((this.method==="GET"||this.method==="HEAD")&&body){throw new TypeError("Body not allowed for GET or HEAD requests")}this._initBody(body)}Request.prototype.clone=function(){return new Request(this,{body:this._bodyInit})};function decode(body){var form=new FormData;body.trim().split("&").forEach(function(bytes){if(bytes){var split=bytes.split("=");var name=split.shift().replace(/\+/g," ");var value=split.join("=").replace(/\+/g," ");form.append(decodeURIComponent(name),decodeURIComponent(value))}});return form}function parseHeaders(rawHeaders){var headers=new Headers;rawHeaders.split(/\r?\n/).forEach(function(line){var parts=line.split(":");var key=parts.shift().trim();if(key){var value=parts.join(":").trim();headers.append(key,value)}});return headers}Body.call(Request.prototype);function Response(bodyInit,options){if(!options){options={}}this.type="default";this.status="status"in options?options.status:200;this.ok=this.status>=200&&this.status<300;this.statusText="statusText"in options?options.statusText:"OK";this.headers=new Headers(options.headers);this.url=options.url||"";this._initBody(bodyInit)}Body.call(Response.prototype);Response.prototype.clone=function(){return new Response(this._bodyInit,{status:this.status,statusText:this.statusText,headers:new Headers(this.headers),url:this.url})};Response.error=function(){var response=new Response(null,{status:0,statusText:""});response.type="error";return response};var redirectStatuses=[301,302,303,307,308];Response.redirect=function(url,status){if(redirectStatuses.indexOf(status)===-1){throw new RangeError("Invalid status code")}return new Response(null,{status:status,headers:{location:url}})};self.Headers=Headers;self.Request=Request;self.Response=Response;self.fetch=function(input,init){return new Promise(function(resolve,reject){var request=new Request(input,init);var xhr=new XMLHttpRequest;xhr.onload=function(){var options={status:xhr.status,statusText:xhr.statusText,headers:parseHeaders(xhr.getAllResponseHeaders()||"")};options.url="responseURL"in xhr?xhr.responseURL:options.headers.get("X-Request-URL");var body="response"in xhr?xhr.response:xhr.responseText;resolve(new Response(body,options))};xhr.onerror=function(){reject(new TypeError("Network request failed"))};xhr.ontimeout=function(){reject(new TypeError("Network request failed"))};xhr.open(request.method,request.url,true);if(request.credentials==="include"){xhr.withCredentials=true}if("responseType"in xhr&&support.blob){xhr.responseType="blob"}request.headers.forEach(function(value,name){xhr.setRequestHeader(name,value)});xhr.send(typeof request._bodyInit==="undefined"?null:request._bodyInit)})};self.fetch.polyfill=true})(typeof self!=="undefined"?self:this)},{}],7:[function(require,module,exports){"use strict";var querystring=require("query-string");require("es6-promise");require("whatwg-fetch");var BitlySDK=function(){function BitlySDK(options){this.login=options.login;this.apiKey=options.apiKey}BitlySDK.prototype.parseResponse=function(key,extractFirst){return function(response){if(!response.ok){throw new Error(response.status+" "+response.statusText)}return response.json().then(function(json){if(json.status_code!==200){throw new Error(json.status_code+" "+json.status_txt)}var data=key?json.data[key]:json.data;if(extractFirst){if(data[0].error){throw new Error(data[0].error)}return data[0]}else{return data}})}};BitlySDK.prototype.fetch=function(path,parameter){var qs=querystring.stringify(parameter);return fetch("https://api-ssl.bitly.com"+path+"?"+qs)};BitlySDK.prototype.shorten=function(longUrl){return this.fetch("/v3/shorten",{longUrl:longUrl,login:this.login,apiKey:this.apiKey}).then(this.parseResponse(null,false))};BitlySDK.prototype.expand=function(shortUrl){return this.fetch("/v3/expand",{shortUrl:shortUrl,login:this.login,apiKey:this.apiKey}).then(this.parseResponse("expand",true))};BitlySDK.prototype.info=function(shortUrl){return this.fetch("/v3/info",{shortUrl:shortUrl,login:this.login,apiKey:this.apiKey}).then(this.parseResponse("info",true))};BitlySDK.prototype.clicks=function(shortUrl){return this.fetch("/v3/clicks",{shortUrl:shortUrl,login:this.login,apiKey:this.apiKey}).then(this.parseResponse("clicks",false)).then(function(data){var result=[];for(var _i=0,data_1=data;_i<data_1.length;_i++){var d=data_1[_i];if(d.error){result.push({short_url:d.short_url,global_clicks:0})}else{result.push(d)}}return result})};return BitlySDK}();module.exports=BitlySDK},{"es6-promise":1,"query-string":4,"whatwg-fetch":6}]},{},[7])(7)});
