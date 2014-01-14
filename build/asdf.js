(function (definition) {
    // RequireJS
    if (typeof define == "function") {
        define(definition);
    } else {
        definition();
    }
})(function() {
	window.Asdf = {};
});(function($_) {
	var core = $_.Core = {};
	var nativeSlice = Array.prototype.slice, hasOwnProperty = Object.prototype.hasOwnProperty;
	var breaker = {};
	function each(object, initialization, termination, increment,statement, context) {
		while(termination(object[initialization], initialization, object)) {
			statement.call(context, object[initialization], initialization, object);
			initialization = increment(initialization);
		}
	}
	var op = {
		"+": function (a, b) {
			return a+b; 
		},"-": function (a, b) {
			return a-b; 
		},"*": function (a, b) {
			return a*b;
		},"/": function (a, b) {
			if(b===0) throw new TypeError();
			return a/b;
		},"%": function (a, b) {
			if(b===0) throw new TypeError();
			return a%b;
		}, "==": function (a, b) {
			return a==b;
		}, "===": function (a, b){
			return a===b;
		}, "equals": function equals(a, b){
			if(a === b) return true;
			if(a == null|| b == null) return false;
			if(!(a.constructor === Object || a.constructor === Array) || a.constructor !== b.constructor) return false;
			function f(a, b) {
				var key;
				for(key in a){
					if(hasOwnProperty.call(a, key))
						res = equals(a[key],b[key]);
					if(!res) return false;
				}
				return true;
			}
			return f(a, b) && f(b, a);
		}, "!": function (a) {
			return !a;
		}, "&&": function (a, b){
			return a && b;
		}, "||": function (a, b){
			return a||b;
		}, "inc": function (a) {
			return ++a;
		}, "desc": function (a) {
			return --a;
		}, "mask": function (a, b) {
			return a|b;
		}
	};
	var behavior = {
		'each': each,
		'memoizer' : function (fn, memo){
			memo = memo||{};
			return function (key, nouse) {
				var res = memo[key];
				if(res == null || nouse){
					res = fn.call(this,key);
					memo[key] = res;
				}
				return res;
			};
		},
		'iterate': function (fn, base) {
			return function (init) {
				init = (init == null)? base: init;
				base = fn.call(this,init);
				return init;
			};
		},
		'take': function take(fn, times, base) {
			if(times <= 1)
				return fn(base);
			return fn(take(fn, times-1));
		},
		'compose': function (f1, f2){
			return function () {
				return f1.call(this, (f2.apply(this, arguments)));
			};
		},
		'sync': function (f1) {
			var l = false;
			return function () {
				if(l){
					throw new Error('this function is Sync');
				}else {
					l = true;
					var res = f1.apply(this, arguments);
					l = false;
					return res;
				}
			};
		}
	};
	var returnType = {
		'is': function (fn){
			var self = this;
			return function (){return !!fn.apply(self,arguments);};
		},
		'a': function (fn) {
			var self = this;
			return function () {
				var res = fn.apply(self, arguments);
				return (res.length!=null)? res[0] : res;
			};
		}
	};
	var combine = {
		'curry': function (fn) {
			var args = nativeSlice.call(arguments, 1);
			return function () {
				return fn.apply(this, args.concat(nativeSlice.call(arguments)));
			};
		},
		'partial': function (fn) {
			var args = nativeSlice.call(arguments, 1);
			return function () {
				var arg = 0;
				var a = args.slice();
				for ( var i = 0; i < args.length && arg < arguments.length; i++ )
					if(args[i] === undefined)
						a[i] = arguments[arg++];
				return fn.apply(this, a);
			};
		},'extract': function (fn, n) {
			n==null && (n=1);
			return function () {
				return fn.apply(this, nativeSlice.call(arguments, n));
			};
		}
	};
/*
	var reg = {
		"number": /^\d+$/,
		"whitespace": /^\s+$/,
		"empty": /^$/,
		"email": /^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
	};
	
	var objectType = {
		FUNCTION_CLASS : '[object Function]', 
		BOOLEAN_CLASS : '[object Boolean]', 
		NUMBER_CLASS : '[object Number]', 
		STRING_CLASS : '[object String]', 
		ARRAY_CLASS : '[object Array]', 
		DATE_CLASS : '[object Date]', 
		REGEXP_CLASS : '[object RegExp]',
		ARGUMENTS_CLASS : '[object Arguments]',
	};
	
	var nodeType = {
		ELEMENT_NODE : 1,
		ATTRIBUTE_NODE : 2,
		TEXT_NODE : 3,
		CDATA_SECTION_NODE : 4,
		ENTITY_REFERENCE_NODE : 5,
		ENTITY_NODE: 6,
		PROCESSING_INSTRUCTION_NODE: 7,
		COMMENT_NODE: 8,
		DOCUMENT_NODE: 9,
		DOCUMENT_TYPE_NODE: 10,
		DOCUMENT_FRAGMENT_NODE: 11,
		NOTATION_NODE: 12
	};
*/
	core.op = op;
	core.behavior = behavior;
	core.returnType = returnType;
	core.combine = combine;
})(Asdf);
/**
 * @project Asdf.js
 * @author N3735
 * @namespace
 * @name O
 */
(function($_) {
	$_.O = {};
	var ObjProto = Object.prototype, ArrayProto = Array.prototype, 
	nativeToString = ObjProto.toString,
	hasOwnProperty = ObjProto.hasOwnProperty, slice = ArrayProto.slice ;
	
	var objectType = {
			FUNCTION_CLASS : '[object Function]', 
			BOOLEAN_CLASS : '[object Boolean]', 
			NUMBER_CLASS : '[object Number]', 
			STRING_CLASS : '[object String]', 
			ARRAY_CLASS : '[object Array]', 
			DATE_CLASS : '[object Date]', 
			REGEXP_CLASS : '[object RegExp]',
			ARGUMENTS_CLASS : '[object Arguments]'
	};
	
	var partial = $_.Core.combine.partial;
	var curry = $_.Core.combine.curry;
	var compose = $_.Core.behavior.compose;
	var not = curry(compose, $_.Core.op["!"]);
	
	function _eachIn(obj, statement, content, termination){
		for( var key in obj){
			if(!termination(obj[key], key, obj))
				break;
			if(hasOwnProperty.call(obj, key))
				statement.call(content,obj[key], key, obj);
		}
	}
	function _mapIn(obj, statement, content, termination, memo){
		memo = memo||{};
		for (var key in obj) {
			if(!termination(obj[key], key, obj))
				break;
			if(hasOwnProperty.call(obj, key))
				memo[key] = statement.call(content,obj[key], key, obj);
		}
		return memo;
	}
	function returnTrue () { return true; }
	var each = partial(_eachIn, undefined, undefined, undefined, returnTrue);
	var map = partial(_mapIn, undefined, undefined, undefined, returnTrue, undefined);
	
	/**
	 * @memberof O
	 * @param {boolean} [deep=false] deepCopy 여부
	 * @param {Object} destination 대상 객체
	 * @param {Object} source 출처 객체
	 * @param {boolean} [default=false] 대상객체 프로퍼티와 출처 객체프로퍼티가 같을 경우 대상객체를 우선한다.
	 * @returns {Object} 대상객체를 반환한다.
	 * @example 해당 메소드를 사용하면 출처 객체에 있는 프로퍼티를 대상 객체로 복사한다.
	 */
	function extend() {
		var destination , source , defaults, deep = false, arg = slice.call(arguments), clone;
		destination = arg.shift();
		if(typeof destination === "boolean"){
			deep = destination;
			destination = arg.shift();
		}
		source = arg.shift();
		defaults = !!arg.shift();
		each(source, function (value, key) {
			if(defaults && destination[key]) return;
			if(deep && (isArray(value)|| isPlainObject(value))){
				clone = isArray(value)? []:{};
				destination[key] = extend(deep, clone, value);
			}else {
				destination[key] = value;
			}
		});
		return destination;
	}
	/**
	 * @memberof O
	 * @param {Object} obj 대상 객체
	 * @param {Object} mixin 출처 객체
	 * @returns {Object} 대상객체를 반환한다.
	 * @example 해당 메소드를 사용하면 출처 객체에 있는 프로퍼티를 대상 객체로 복사한다.
	 */
	function mixin(obj, mixin) {
		if(!isPlainObject(obj) || !isPlainObject(mixin))
			throw new TypeError();
		each(mixin, function (value, key) {
			obj[key] = value;
		});
		return obj;
	}
	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} 순수Object여부를 반환하다.
	 * @example 해당 메소드를 사용하면 객체가 순수Object인지 판단한다.
	 */
	function isPlainObject(object) {
		if(!object || !isObject(object) || object.nodeType || isWindow(object)) {
			return false;
		}
		try{
			if (object.constructor &&
				!hasOwnProperty.call(object, "constructor") &&
				!hasOwnProperty.call(object.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		}catch (e) {
			return false;
		}
		var key;
		for( key in object ){}
		return key === undefined || hasOwnProperty.call(object, key);
	}
	
	var isNotPlainObject = not(isPlainObject);
	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Element여부를 반환하다.
	 * @example 해당 메소드를 사용하면 객체가 Element인지 판단한다.
	 */
	function isElement(object) {
		return !!(object && object.nodeType !== 3);
	}
	
	var isNotElement = not(isElement);
	
	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Node여부를 반환하다.
	 * @example 해당 메소드를 사용하면 객체가 Node인지 판단한다.
	 */
	function isNode(object) {
		return !!(object && object.nodeType);
	}
	
	var isNotNode = not(isNode);
	
	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Window여부를 반환하다.
	 * @example 해당 메소드를 사용하면 객체가 window인지 판단한다.
	 */
	function isWindow (obj) {
		return obj != null && obj == obj.window;
	}
	
	var isNotWindow = not(isWindow);
	
	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} 빈 객체여부를 반환하다.
	 * @example 해당 메소드를 사용하면 객체가 빈 객체인지 판단한다.
	 */
	function isEmptyObject(obj) {
		var res = true;
		each(obj, function (value, key){
			res = false;
		});
		return res;
	}
	
	var isNotEmptyObject = not(isEmptyObject);
	
	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Array 객체여부를 반환하다.
	 * @example 해당 메소드를 사용하면 객체가 Array인지 판단한다.
	 */
	function isArray(object) {
		var hasNativeIsArray = (typeof Array.isArray == 'function') && Array.isArray([]) && !Array.isArray({});
		if (hasNativeIsArray) {
			isArray = Array.isArray;
			return Array.isArray(object);
		}
		return nativeToString.call(object) === objectType.ARRAY_CLASS;
	}
	
	var isNotArray = not(isArray);
	
	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Object 객체여부를 반환하다.
	 * @example 해당 메소드를 사용하면 객체가 Object인지 판단한다.
	 */
	function isObject(object) {
		return object === Object(object);
	}
	
	var isNotObject = not(isObject);
	
	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Arguments 객체여부를 반환하다.
	 * @example 해당 메소드를 사용하면 객체가 Arguments인지 판단한다.
	 */
	function isArguments(object) {
		return nativeToString.call(object) === objectType.ARGUMENTS_CLASS;
	}
	
	var isNotArguments = not(isArguments);
	
	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} function 객체여부를 반환하다.
	 * @example 해당 메소드를 사용하면 객체가 function인지 판단한다.
	 */
	function isFunction(object) {
		return nativeToString.call(object) === objectType.FUNCTION_CLASS;
	}
	
	var isNotFunction  = not(isFunction);

	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} String 객체여부를 반환하다.
	 * @example 해당 메소드를 사용하면 객체가 String인지 판단한다.
	 */
	function isString(object) {
		return nativeToString.call(object) === objectType.STRING_CLASS;
	}
	
	var isNotString = not(isString);

	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Number 객체여부를 반환하다.
	 * @example 해당 메소드를 사용하면 객체가 Number인지 판단한다.
	 */
	function isNumber(object) {
		return nativeToString.call(object) === objectType.NUMBER_CLASS;
	}
	
	var isNotNumber = not(isNumber);

	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Date 객체여부를 반환하다.
	 * @example 해당 메소드를 사용하면 객체가 Date인지 판단한다.
	 */
	function isDate(object) {
		return nativeToString.call(object) === objectType.DATE_CLASS;
	}
	
	var isNotDate = not(isDate);
	
	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Regexp 객체여부를 반환하다.
	 * @example 해당 메소드를 사용하면 객체가 Regexp인지 판단한다.
	 */
	function isRegexp(object) {
		return nativeToString.call(object) === objectType.REGEXP_CLASS;
	}
	
	var isNotRegexp = not(isRegexp);
	
	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} undefined여부를 반환하다.
	 * @example 해당 메소드를 사용하면 객체가 undefined인지 판단한다.
	 */
	function isUndefined(object) {
		return typeof object === "undefined";
	}
	
	var isNotUndefined = not(isUndefined);
	
	
	function isNull(object) {
		return object === null;
	}
	
	var isNotNull = not(isNull);
	
	function isCollection(obj) {
		if(isNotObject(obj)||isNotNumber(obj.length))
			return false;
		for (var i = 0; i < obj.length ; i++)
			if(!(i in obj)) return false;
		return true;
	}
	
	var isNotCollection = not(isCollection);
	
	function keys(object) {
		if ((typeof object != "object" && typeof object != "function")
				|| object === null) {
			throw new TypeError("Object.key called on a non-object");
		}
		var keys = [];
		each(object, function (value, key) { keys.push(key); });
		return keys;
	}
	
	function values(object) {
		if ((typeof object != "object" && typeof object != "function")
				|| object === null) {
			throw new TypeError("Object.values called on a non-object");
		}
		var values = [];
		each(object, function (value, key){ values.push(value); });
		return values;
	}
	
	function getKeysbyType(obj, fn){
		var names = [];
		each(obj, function (value, key){ 
			if(fn(value))
				names.push(key);
		});
		return names.sort();
	}
	
	var functions = partial(getKeysbyType, undefined, isFunction);
	
	var nulls = partial(getKeysbyType, undefined, isNull);
	
	var undefineds = partial(getKeysbyType, undefined, isUndefined);
	
	var plainObjects = partial(getKeysbyType, undefined, isPlainObject);
	
	var arrays = partial(getKeysbyType, undefined, isArray);
	
	function pick(obj) {
		var result = {};
		$_.A.each($_.A.flatten(slice.call(arguments,1)), function(key) {
			if (key in obj)
				result[key] = obj[key];
		});
		return result;
	}
	function clone(obj) {
		if (!isObject(obj))
			throw new TypeError();
		if(obj.clone)
			return obj.clone();
		if(isArray(obj)||isPlainObject(obj))
			return isArray(obj) ? obj.slice() : extend(true, {}, obj);
		throw new TypeError();
	}
	function toQueryString(obj) {
		if(isNotPlainObject(obj)) throw new TypeError();
		function toQueryPair(key, value) {
			key = encodeURIComponent(key);
			if (isUndefined(value))
				return key;
			return key + '=' + encodeURIComponent(value);
		}
		var res = [];
		each(obj, function (value, key) {
			if(isArray(value)){
				res = res.concat($_.A.map(value, function (v, k){ return toQueryPair(key, v);}));
			}else {
				res.push(toQueryPair(key, value));
			}
		});
		return res.join('&');
	}
	function remove(obj, key) {
		if(isNotObject(obj)) throw new TypeError();
		var res;
		if((res = key in obj)){
			delete obj[key];
		}
		return res;
	}
	function getOrElse(obj, key, defult){
		if(isNotObject(obj)) throw new TypeError();
		if(key in obj)
			return obj[key];
		return defult;
	}
	
	var get = partial(getOrElse, undefined, undefined, null);
	
	function has(obj,str){
		return get(obj, str)!== undefined;
	}
	
	function set(obj, key, value){
		if(isNotObject(obj)) throw new TypeError();
		obj[key] = value;
	}
	function type(obj, type){
		if(isNotPlainObject(type)) throw new TypeError();
		var res = true;
		each(type, function(fn, key){
			if(isFunction(fn))
				if(!fn(obj[key]))
					res = false;
		});
		
		return res;
	}
	extend($_.O, {
		each: each,
		map: map,
		extend: extend,
		mixin: mixin,
		keys: keys,
		values : values,
		nulls : nulls,
		undefineds : undefineds,
		plainObjects : plainObjects,
		arrays : arrays,
		functions : functions,
		isElement : isElement,
		isNotElement : isNotElement,
		isNode: isNode,
		isNotNode: isNotNode,
		isWindow: isWindow,
		isNotWindow: isNotWindow,
		isEmptyObject: isEmptyObject,
		isNotEmptyObject: isNotEmptyObject,
		isArray : isArray,
		isNotArray : isNotArray,
		isObject: isObject,
		isNotObject: isNotObject,
		isPlainObject: isPlainObject,
		isNotPlainObject: isNotPlainObject,
		isArguments: isArguments,
		isNotArguments: isNotArguments,
		isFunction : isFunction,
		isNotFunction: isNotFunction,
		isString : isString,
		isNotString: isNotString,
		isNumber : isNumber,
		isNotNumber: isNotNumber,
		isDate : isDate,
		isNotDate: isNotDate,
		isRegexp: isRegexp,
		isNotRegexp: isNotRegexp,
		isUndefined : isUndefined,
		isNotUndefined: isNotUndefined,
		isNull : isNull,
		isNotNull : isNotNull,
		isCollection: isCollection,
		isNotCollection : isNotCollection,
		pick: pick,
		clone: clone,
		toQueryString: toQueryString,
		get: get,
		getOrElse: getOrElse,
		set: set,
		type:type
	});
})(Asdf);
(function($_) {
	$_.F = {};
	var slice = Array.prototype.slice, fnProto = Function.prototype, nativeBind = fnProto.bind;
	
	function identity(value) {
		return value;
	}
	
	function bind(func, context) {
		if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
		if (!$_.O.isFunction(func)) throw new TypeError;
		if (arguments.length < 3 && $_.O.isUndefined(arguments[1])) return func;
		var __method = func, args = slice.call(arguments, 2);
		return function() {
			var a = [];
			$_.A.merge(a, args);
			$_.A.merge(a, arguments);
			return __method.apply(context, a);
		};
	}
	function curry(func) {
		if (!$_.O.isFunction(func)) throw new TypeError;
		if (arguments.length == 1)
			return func;
		var __method = func, args = slice.call(arguments, 1);
		return function() {
			var a = [];
			$_.A.merge(a, args);
			$_.A.merge(a, arguments);
			return __method.apply(this, a);
		};
	}

	function delay(func, timeout) {
		if (!$_.O.isFunction(func)) throw new TypeError;
		var __method = func, args = slice.call(arguments, 2);
		timeout = timeout * 1000;
		return window.setTimeout(function() {
			return __method.apply(__method, args);
		}, timeout);
	}
	function defer(func) {
		if (!$_.O.isFunction(func)) throw new TypeError;
		var args = $_.A.merge([ func, 0.01 ], slice.call(arguments, 1));
		return delay.apply(this, args);
	}

	function wrap(func, wrapper) {
		if (!$_.O.isFunction(func)) throw new TypeError;
		var __method = func;
		return function() {
			var a = $_.A.merge([ bind(__method, this) ], arguments);
			return wrapper.apply(this, a);
		};
	}
	
	function before(func, pre, stop){
		if(!$_.O.isFunction(func)|| !$_.O.isFunction(pre)) throw new TypeError;
		return function () {
			var pres;
			if(!(pres = pre.apply(this,arguments))&&stop) return pres;
			return func.apply(this,arguments);
		};
	};
	
	function after(func, after){
		if(!$_.O.isFunction(func)||!$_.O.isFunction(after)) throw new TypeError;
		return function() {
			var a = $_.A.merge([func.apply(this, arguments)], arguments);
			return after.apply(this, a);
		};
	};
	
	function methodize(func) {
		if (func._methodized)
			return func._methodized;
		var __method = func;
		return func._methodized = function() {
			var a = $_.A.merge([ this ], slice.call(arguments,0));
			return __method.apply(null, a);
		};
	}
	function composeRight() {
		var fns = $_.A.filter(slice.call(arguments), $_.O.isFunction);
		var fn = $_.A.reduce(fns, $_.Core.behavior.compose);
		return function () {
			return fn.apply(this, arguments);
		};
	}
	function compose() {
		var fns = $_.A.filter(slice.call(arguments), $_.O.isFunction);
		var fn = $_.A.reduceRight(fns, $_.Core.behavior.compose);
		return function () {
			return fn.apply(this, arguments);
		};
	}
	var exisFunction = function (fn) {
		if($_.O.isNotFunction(fn)){
			throw new TypeError();
		}
		return true;
	};
	var extract = before($_.Core.combine.extract, exisFunction);
	
	function or(){
		var fns = $_.A.filter(slice.call(arguments), $_.O.isFunction);
		return function(){
			var i;
			for(i =0;i < fns.length; i++){
				if(fns[i].apply(this, arguments))
					return true;
			}
			return false;
		};
	}
	
	function and(){
		var fns = $_.A.filter(slice.call(arguments), $_.O.isFunction);
		return function(){
			var i;
			for(i =0;i < fns.length; i++){
				if(!fns[i].apply(this, arguments))
					return false;
			}
			return true;
		};
	}
	$_.O.extend($_.F, {
		identity: identity,
		bind: bind,
		curry: curry,
		delay: delay,
		defer: defer,
		wrap: wrap,
		before: before,
		after:after,
		methodize: methodize,
		compose:compose,
		composeRight:composeRight,
		extract:extract,
		or: or,
		and: and
	}, true);

})(Asdf);(function($_) {
	$_.A = {};
	var arrayProto = Array.prototype, slice = arrayProto.slice, nativeForEach = arrayProto.forEach, nativeMap = arrayProto.map, nativeReduce = arrayProto.reduce, nativeReduceRight = arrayProto.reduceRight, nativeFilter = arrayProto.filter, nativeEvery = arrayProto.every, nativeSome = arrayProto.some, nativeIndexOf = arrayProto.indexOf, nativeLastIndexOf = arrayProto.lastIndexOf;
	var partial = $_.Core.combine.partial;
	var inc = $_.Core.op.inc;
	var coreEach = $_.Core.behavior.each;
	var compose = $_.Core.behavior.compose;
	var curry = $_.Core.combine.curry;
	var extract = $_.Core.combine.extract;
	var not = curry(compose, $_.Core.op["!"]);
	var isEnd = function (i, col){return i >= col.length; };
	var isNotEnd = not(isEnd);
	var _each = partial(coreEach, undefined, 0, extract(isNotEnd, 1), inc, undefined, undefined);
	var _eachWithTermination = partial(coreEach, undefined, 0, undefined, inc, undefined, undefined);
	
	
	function each(col, iterator, context) {
		if (col == null || $_.O.isNotCollection(col)) throw new TypeError();
		if (nativeForEach && col.forEach === nativeForEach) {
			return col.forEach(iterator, context);
		}
		_each(col, iterator, context);
	}
	function map(col, iterator, context) {
		var results = [];
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		if (nativeMap && col.map === nativeMap)
			return col.map(iterator, context);
		_each(col, function(value, index, list) {
			results[results.length] = iterator.call(context, value, index, list);
		});
		return results;
	}
	function reduce(col, iterator, memo, context) {
		var initial = arguments.length > 2;
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		if (nativeReduce && col.reduce === nativeReduce) {
			if (context)
				iterator = $_.F.bind(iterator, context);
			return initial ? col.reduce(iterator, memo) : col.reduce(iterator);
		}
		each(col, function(value, index, list) {
			if (!initial) {
				memo = value;
				initial = true;
			} else {
				memo = iterator.call(context, memo, value, index, list);
			}
		});
		if (!initial)
			throw new TypeError('Reduce of empty array with no initial value');
		return memo;
	}
	function reduceRight(col, iterator, memo, context) {
		var initial = arguments.length > 2;
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		if (nativeReduceRight && col.reduceRight === nativeReduceRight) {
			if (context)
				iterator = $_.F.bind(iterator, context);
			return initial ? col.reduceRight(iterator, memo) : col.reduceRight(iterator);
		}
		var reversed = toArray(col).reverse();
		if (context && !initial)
			iterator = $_.F.bind(iterator, context);
		return initial ? reduce(reversed, iterator, memo, context): reduce(reversed, iterator);
	}
	function merge( first, second ) {
		if ($_.O.isNotCollection(first)||$_.O.isNotCollection(second))
			throw new TypeError();
		var fl = first.length, l = fl + second.length;
		each(second, function (value, key,list){
			first[fl+key] = value;
		} );
		first.length = l;
		return first;
	}
	function get(col, n){
		n == null && (n = 0);
		return col[n];
	};
	
	var first = partial(get, undefined, 0);
	
	function last(col) {
		return col[col.length];
	}
	
	function filter(col, iterator, context) {
		var results = [];
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		if (nativeFilter && col.filter === nativeFilter)
			return col.filter(iterator, context);
		each(col, function(value, index, list) {
			if (iterator.call(context, value, index, list))
				results[results.length] = value;
		});
		return results;
	}
	function reject(col, iterator, context) {
		return filter(col, not(iterator), context);
	}
	function every(col, iterator, context) {
	    if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		if (nativeEvery && col.every === nativeEvery)
			return col.every(iterator, context);
		 var result = true;
		_eachWithTermination(col, 
				function (value, index, list) { return isNotEnd(index, list) && (result = iterator.call(context, value, index, list));}, 
				function () {});
		return !!result;
	}
	function any(col, iterator, context) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		if (nativeSome && col.some === nativeSome)
			return col.some(iterator, context);
		var result = false;
		_eachWithTermination(col, 
				function (value, index, list) { return isNotEnd(index, list) && !(result = iterator.call(context, value, index, list));}, 
				function () {});
		return !!result;
	}
	function include(col, target) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		if (nativeIndexOf && col.indexOf === nativeIndexOf)
			return col.indexOf(target) != -1;
		return any(col, function(value) {
			return value === target;
		});
	}
	function invoke(col, method) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		var args = slice.call(arguments, 2);
		return map(col, function(obj) {
			return ($_.O.isFunction(method) ? method || obj: obj[method] || function() {}).apply(obj, args);
		});
	}
	function pluck(col, key) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		return map(col, function(obj){ return obj[key]; });
	}
	function max(col, iterator, context) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		iterator = iterator||function (value){return value;};
		var result = reduce(col, function(memo, value, index, list) {
			var computed = iterator.call(context, value, index, list);
			return computed >= memo.computed? {computed: computed, value: value}: memo;
		}, { computed : -Infinity } );
		return result.value;
	}
	function min(col, iterator, context) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		iterator = iterator||function (value){return value;};
		var result = reduce(col, function(memo, value, index, list) {
			var computed = iterator.call(context, value, index, list);
			return computed < memo.computed? {computed: computed, value: value}: memo;
		}, { computed : Infinity } );
		return result.value;
	}
	function shuffle(col) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		var shuffled = [], rand;
		each(col, function(value, index, list) {
			rand = Math.floor(Math.random() * (index + 1));
			shuffled[index] = shuffled[rand];
			shuffled[rand] = value;
		});
		return shuffled;
	}
	function sort(arr, sort){
		if($_.O.isNotArray(arr)) throw new TypeError();
		return arr.sort(sort);
	}
	function desc(a, b) {
		if(a == null)
			return 1;
		if(b == null)
			return -1;
		if(a == b)
			return 0;
		if(a < b)
			return 1;
		if(a > b)
			return -1;
	}
	function asc(a, b) {
		if(a == null)
			return 1;
		if(b == null)
			return -1;
		if(a == b)
			return 0;
		if(a > b)
			return 1;
		if(a < b)
			return -1;
		
	}
	function sortBy(arr, key, order) {
		order = order || asc;
		return sort(arr, function(a, b){return order(a[key], b[key]);});
	}
	
	function groupBy(col,key) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		var result = {};
		each(col, function(value, index, list) {
			(result[value[key]] || (result[value[key]] = [])).push(value);
		});
		return result;
	}
	
	function sortedIndex(array, obj, iterator) {
		iterator || (iterator = $_.F.identity);
		var low = 0, high = array.length;
		while (low < high) {
			var mid = (low + high) >> 1;
			iterator(array[mid]) < iterator(obj) ? low = mid + 1
					: high = mid;
		}
		return low;
	}
	
	function toArray(col) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		if ($_.O.isArray(col))
			return col;
		if ($_.O.isArguments(col))
			return slice.call(col);
		if (col.toArray && $_.O.isFunction(col.toArray))
			return col.toArray();
		var length = col.length || 0, results = new Array(length);
		while (length--) results[length] = col[length];
		return results;
	}
	function size(col) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		return col.length;
	}
	
	function clear(array) {
		if($_.O.isNotArray(array)) throw new TypeError();
		array.length = 0;
		return array;
	}
	
	function initial(array, n) {
		if($_.O.isNotArray(array)) throw new TypeError();
		n == null && (n=1);
		return slice.call(array, 0, array.length - n);
	}
	
	function rest(array, n){
		if($_.O.isNotArray(array)) throw new TypeError();
		n == null && (n=1);
		return slice.call(array, n);
	}
	
	function compact(array) {
		if($_.O.isNotArray(array)) throw new TypeError();
		return filter(array, function(value){ return !!value; });
	}
	
	function flatten(array, shallow) {
		if($_.O.isNotArray(array)) throw new TypeError();
		return reduce(array, function(memo, value) {
		      if ($_.O.isArray(value)) return memo.concat(shallow ? value : flatten(value));
		      memo[memo.length] = value;
		      return memo;
		    }, []);
	}
	function without(array) {
		if($_.O.isNotArray(array)) throw new TypeError();
		return difference(array, slice.call(arguments, 1));
	}
	function unique(array, isSorted, iterator) {
		var initial = iterator ? map(array, iterator) : array;
		var results = [];
		if (array.length < 3)
			isSorted = true;
		reduce(initial, function(memo, value, index) {
			if (isSorted ? last(memo) !== value || !memo.length
					: !include(memo, value)) {
				memo.push(value);
				results.push(array[index]);
			}
			return memo;
		}, []);
		return results;
	}
	function union() {
		 return unique(flatten(arguments, true));
	}
	function intersection(array) {
		var rest = slice.call(arguments, 1);
		return filter(unique(array), function(item) {
			return every(rest, function(other) {
				return indexOf(other, item) >= 0;
			});
		});
	}
	function difference(array) {
		var rest = flatten(slice.call(arguments, 1), true);
	    return filter(array, function(value){ return !include(rest, value); });
	}
	function zip() {
		var args = slice.call(arguments);
	    var length = max(pluck(args, 'length'));
	    var results = new Array(length);
	    for (var i = 0; i < length; i++) results[i] = pluck(args, "" + i);
	    return results;
	}
	function indexOf(array, item, isSorted) {
		if (array == null) return -1;
	    var i, l;
	    if (isSorted) {
	      i = sortedIndex(array, item);
	      return array[i] === item ? i : -1;
	    }
	    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
	    for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
	    return -1;
	}
	function lastIndexOf(array, item) {
		if (array == null) return -1;
	    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
	    var i = array.length;
	    while (i--) if (i in array && array[i] === item) return i;
	    return -1;
	}
	function batch(array, fns){
		if($_.O.isNotArray(array)) throw new TypeError();
		return map(array, function(value, i){
			return ($_.O.isFunction(fns[i]))? fns[i](value): value;
		});
	}
	function toArguments(array, fn, context){
		if($_.O.isNotArray(array)) throw new TypeError();
		return fn.apply(context, array);
	}
	$_.O.extend($_.A, {
		each: each,
		map: map,
		reduce: reduce,
		reduceRight: reduceRight,
		first: first,
		last: last,
		filter: filter,
		reject: reject,
		every: every,
		any: any,
		include: include,
		invoke: invoke,
		pluck: pluck,
		merge:merge,
		max: max,
		min: min,
		shuffle: shuffle,
		sortBy: sortBy,
		sort: sort,
		groupBy: groupBy,
		sortedIndex: sortedIndex,
		toArray: toArray,
		size: size,
		clear: clear,
		initial: initial,
		rest: rest,
		compact: compact,
		flatten: flatten,
		without: without,
		unique: unique,
		union: union,
		intersection: intersection,
		difference: difference,
		zip: zip,
		indexOf: indexOf,
		lastIndexOf: lastIndexOf,
		batch:batch,
		toArguments:toArguments
	}, true);
})(Asdf);(function($_) {
	$_.S = {};
	var ScriptFragment = '<script[^>]*>([\\S\\s]*?)<\/script>';
	function truncate(str, length, truncation) {
		if(!$_.O.isString(str)) throw new TypeError();
		length = length || 30;
		truncation = $_.O.isUndefined(truncation) ? '...' : truncation;
		return str.length > length ?
		str.slice(0, length - (truncation.length+1)) + truncation : String(str);
	}
	function trim(str) {
		if(!$_.O.isString(str)) throw new TypeError();
		return str.replace(/^\s+/, '').replace(/\s+$/, '');
	}
	function stripTags(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
	}
	function stripScripts(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(new RegExp(ScriptFragment, 'img'), '');
	}
	function escapeHTML(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
	}
	function unescapeHTML(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return stripTags(str).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
	}
	function toQueryParams(str,separator, sepKV) {
		if(!$_.O.isString(str)) throw new TypeError();
		var reduce = $_.A.reduce;
		var match = trim(str).match(/([^?#]*)(#.*)?$/);
		if (!match)
			return {};
		return reduce(match[1].split(separator || '&'),	function(hash, pair) {
			if ((pair = pair.split(sepKV || '='))[0]) {
				var key = decodeURIComponent(pair.shift()), value = pair.length > 1 ? pair.join('='): pair[0];
				if (value != undefined)
					value = decodeURIComponent(value);
				if (key in hash) {
					if (!$_.O.isArray(hash[key])){
						hash[key] = [ hash[key] ];
					}
					hash[key].push(value);
				} else
					hash[key] = value;
				}
			return hash;
		}, {});
	}
	function toArray(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.split('');
	}
	function succ(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.slice(0, str.length - 1) +
	      String.fromCharCode(str.charCodeAt(str.length - 1) + 1);
	}
	function times(str, count) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return count < 1 ? '' : new Array(count + 1).join(str);
	}
	function camelize(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(/-+(.)?/g, function(match, chr) {
	      return chr ? chr.toUpperCase() : '';
	    });
	}
	function capitalize(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
	}
	function underscore(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(/::/g, '/')
	               .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
	               .replace(/([a-z\d])([A-Z])/g, '$1_$2')
	               .replace(/-/g, '_')
	               .toLowerCase();
	}
	function dasherize(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(/_/g, '-');
	}
	function include(str, pattern) {
		if(!$_.O.isString(str)||!$_.O.isString(pattern)) throw new TypeError();
	    return str.indexOf(pattern) > -1;
	}
	function startsWith(str, pattern) {
		if(!$_.O.isString(str)||!$_.O.isString(pattern)) throw new TypeError();
	    return str.lastIndexOf(pattern, 0) === 0;
	}
	function endsWith(str, pattern) {
		if(!$_.O.isString(str)||!$_.O.isString(pattern)) throw new TypeError();
	    var d = str.length - pattern.length;
	    return d >= 0 && str.indexOf(pattern, d) === d;
	}
	function isEmpty(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str == '';
	}
	function isBlank(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return /^\s*$/.test(str);
	}
	function toElement(str){
		if(!$_.O.isString(str)) throw new TypeError();
		var el = document.createElement('div');
		el.innerHTML = str;
		return el.firstChild;
	}
	function toDocumentFragment(str) {
		if(!$_.O.isString(str)) throw new TypeError();
		var el = document.createElement('div'), frg = document.createDocumentFragment();
		el.innerHTML = str;
		while(el.childNodes.length) frg.appendChild(el.childNodes[0]);
		return frg;	
	}
	function lpad(str, padStr, length){
		if(!$_.O.isString(str) || !$_.O.isNumber(length)) throw new TypeError();
		return (new Array(length+1).join(padStr)+str).slice(-length);
	}
	function rpad(str, padStr, length){
		if(!$_.O.isString(str) || !$_.O.isNumber(length)) throw new TypeError();
		return (str + new Array(length+1).join(padStr)).slice(0,length);
	}
	function template(str, reg){
		if (!$_.O.isString(str))
			throw new TypeError();
		reg = reg || /\{\{([\s\S]+?)\}\}/g;
		var data = [];
		var parse = function(str) {
			var i =0;
			var pos = 0;
			data[i] = str;
			str.replace(reg, function(m, key, index) {
				if($_.O.isNumber(key)) {
					index = key;
					key = undefined;
				}
				data[i] = str.substring(pos, index);
				data[++i] = {key:key, text:undefined, toString : function(){return this.text;}};
				pos = index + m.length;
				if(pos<str.length)
					data[++i] = str.substring(pos);
			});
		};
		var getIndexs = function(key){
			var res = [];
			$_.A.each($_.A.pluck(data, 'key'), function(value, i){
				if(value === key)
					res.push(i);
			});
			return res;
		};
		var set = function(index, str) {
			if($_.O.isNumber(index)){
				if (index < 1)
					throw new Error("index is great than 0");
				if (data.length <= index * 2 - 1)
					throw new Error("index is less than ?s");
				data[index * 2 - 1].text = str;
			}
			else if($_.O.isString(index)){
				var ins = getIndexs(index);
				if(ins.lenght == 0) throw new Error("index is wrong");
				$_.A.each(ins, function(value) {
					data[value].text = str;
				});
			}else if($_.O.isPlainObject(index)){
				$_.O.each(index, function(value, key) {
					set(key, value);
				});
			}else {
				throw new Error();
			}
		};
		var toString = function() {
			var i;
			for (i = 0; i < data.length; i++) {
				if (data[i].toString() === undefined)
					throw new Error(((i + 1) / 2) + " undefined");
			}
			return data.join('');
		};
		parse(str);
		return {
			set : set,
			toString : toString
		};
	}
	$_.O.extend($_.S, {
		truncate: truncate,
		trim: trim,
		stripTags: stripTags,
		escapeHTML: escapeHTML,
		unescapeHTML: unescapeHTML,
		toQueryParams: toQueryParams,
		toArray: toArray,
		succ: succ,
		times: times,
		camelize: camelize,
		capitalize: capitalize,
		underscore: underscore,
		dasherize: dasherize,
		include: include,
		startsWith: startsWith,
		endsWith: endsWith,
		isEmpty: isEmpty,
		isBlank: isBlank,
		toDocumentFragment:toDocumentFragment,
		toElement: toElement,
		lpad: lpad,
		rpad: rpad,
		template:template
	});
})(Asdf);
(function($_) {
	$_.Arg = {};
	var is =  $_.Core.returnType.is, compose = $_.Core.behavior.compose, iterate = $_.Core.behavior.iterate;
	var curry = $_.Core.combine.curry;
	var partial = $_.Core.combine.partial;
	var not = curry(compose, $_.Core.op["!"]);
	var isNotNaN = not(isNaN);
	function toArray(){
		return $_.A.toArray(arguments);
	}
	
	$_.O.extend($_.Arg, {
		toArray:toArray
	});
})(Asdf);(function($_) {
	$_.N = {};
	var is =  $_.Core.returnType.is, compose = $_.Core.behavior.compose, iterate = $_.Core.behavior.iterate;
	var curry = $_.Core.combine.curry;
	var partial = $_.Core.combine.partial;
	var not = curry(compose, $_.Core.op["!"]);
	var isNotNaN = not(isNaN);
	/*function sum (){
		var arg = $_.A.toArray(arguments);
		arg = $_.A.filter(arg, isNotNaN);
		return $_.A.reduce(arg, $_.Core.op["+"], 0);
	}
	*/
	function multiply() {
		var arg = $_.A.toArray(arguments);
		arg = $_.A.filter(arg, isNotNaN);
		return $_.A.reduce(arg, $_.Core.op["*"], 1);
	}
	var sum = $_.F.compose($_.Arg.toArray, partial($_.A.filter, undefined, isNotNaN), partial($_.A.reduce, undefined, $_.Core.op["+"], 0));
	var isRange = is(function (n,a,b) { return a<=n && n<=b; });
	var isNotRange = not(isRange);
	var isZero = is(function (n) { return n === 0;});
	var isNotZero = not(isZero);
	var isSame = is(function (n, a) { return a === b;});
	var isNotSame = not(isSame);
	var isGreaterThan = is(function (n, a){ return n > a;});
	var isNotGreaterThan = not(isGreaterThan);
	var isLessThan = is(function (n, a){ return n < a;});
	var isNotLessThan = not(isLessThan);
	function range(start, end, fn) {
		if(arguments.length == 1){
			end = arguments[0];
			start = 0;
		}
		if(!($_.O.isNumber(start) && $_.O.isNumber(end))) throw new TypeError("range need two Numbers(start, end)");
		var termin;
		if( isLessThan(start, end)) {
			fn = fn||$_.Core.op.inc;
			termin = isNotGreaterThan;
		} else {
			fn = fn||$_.Core.op.desc;
			termin = isNotLessThan;
		}
		var it = iterate(fn, start);
		var i = start,res = [];
		while(termin(i = it(), end)) {
			res.push(i);
		}
		return res;
	};
	$_.O.extend($_.N, {
		sum: sum,
		isNotNaN: isNotNaN,
		range: range,
		isRange: isRange,
		isNotRange: isNotRange,
		isZero : isZero,
		isNotZero : isNotZero,
		isSame : isSame,
		isNotSame: isNotSame,
		isGreaterThan: isGreaterThan,
		isNotGreaterThan: isNotGreaterThan,
		isLessThan: isLessThan,
		isNotLessThan: isNotLessThan,
		isUntil: isLessThan,
		isNotUntil: isNotLessThan
	});
})(Asdf);(function($_) {
	$_.Bom = {};
	var Browser = (function() {
		var ua = navigator.userAgent;
		ua = ua.toLowerCase();
		var match = /(chrome)[ \/]([\w.]+)/.exec(ua)
				|| /(webkit)[ \/]([\w.]+)/.exec(ua)
				|| /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua)
				|| /(msie) ([\w.]+)/.exec(ua) 
				|| /(msie)(?:.*?Trident.*? rv:([\w.]+))/.exec('msie'+ua)
				|| ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];

		return {
			browser : match[1] || "",
			version : match[2] || "0"
		};
	})();
	var features = {
		XPath : !!document.evaluate,

		SelectorsAPI : !!document.querySelector,

		ElementExtensions : (function() {
			var constructor = window.Element || window.HTMLElement;
			return !!(constructor && constructor.prototype);
		})(),
		SpecificElementExtensions : (function() {
			if (typeof window.HTMLDivElement !== 'undefined')
				return true;

			var div = document.createElement('div'), form = document
					.createElement('form'), isSupported = false;

			if (div['__proto__'] && (div['__proto__'] !== form['__proto__'])) {
				isSupported = true;
			}

			div = form = null;

			return isSupported;
		})()
	};
	$_.O.extend($_.Bom, {
		browser : Browser.browser,
		version: Browser.version, 
		features:features
	});
})(Asdf);(function($_) {
	$_.Event = {};
	var extend = $_.O.extend, slice = Array.prototype.slice;
	var cach = [];
	function getIndex(element, eventName, handler) {
		var i;
		for(i = 0; i < cach.length; i++){
			if(cach[i].element == element &&
					cach[i].eventName == eventName &&
					cach[i].handler == handler)
				return i;
		}
		return -1;
	}
	function getWrapedhandler(element, eventName, handler) {
		var i;
		for(i = 0; i < cach.length; i++){
			if(cach[i].element == element &&
					cach[i].eventName == eventName &&
					cach[i].handler == handler)
				return cach[i].wrapedhandler.pop();
		}
	}
	function addEventListener(element, eventName, handler, filterFn) {
		var wrapedhandler = $_.F.wrap(handler, 
			function(ofn, e) {
				e = e||window.event;
				e = fix(e);
				if(filterFn && !filterFn(e)) return null;
				return ofn(e);
			}
		);
		if (element.addEventListener) {
			element.addEventListener(eventName, wrapedhandler, false);
			
		}else {
			element.attachEvent("on"+ eventName, wrapedhandler);
		}
		var index = getIndex(element, eventName, handler);
		if(index === -1){
			var obj = {element:element, eventName:eventName, handler:handler, wrapedhandler:[wrapedhandler]};
			cach.push(obj);
		}else{
			cach[index].wrapedhandler.push(wrapedhandler);
		}
		
	}
	function removeEventListener(element, eventName, handler){
		if(element.removeEventListener){
			element.removeEventListener( eventName, handler, false );
		}else {
			var ieeventName = 'on'+eventName;
			if(element[ieeventName] === void 0){
				element[ieeventName] = null;
			}
			element.detachEvent( ieeventName, handler );
		}
		
	}
	function fix(event){
		if(!event.target){
			event.target = event.srcElement || document;
		}
		if(event.target.nodeType === 3) {
			event.target = event.target.parentNode;
		}
		event.metaKey = !!event.metaKey;
		fixEvent(event);
		event.stop = $_.F.methodize(stop);
		return fixHooks(event);
	}
	function fixEvent(event){
		if(!event.stopPropagation){
			event.stopPropagation = function() { event.cancelBubble = true; };
			event.preventDefault = function() { event.returnValue = false; };
		}
	}
	function stop(event){
		if(!event.stopPropagation){
			fixEvent(event);
		}
		event.preventDefault();
	    event.stopPropagation();
	}
	function fixHooks(event){
		function keyHooks(event){
			if(!event.which) {
				event.which = event.charCode? event.charCode : event.keyCode;
			}
			return event;
		}
		function mouseHooks(event){
			var eventDoc, doc, body, button = event.button, fromElement = event.fromElement;
			if( event.pageX == null && event.clientX != null ) {
				eventDoc = event.target.ownderDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;
				event.pageX = event.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = event.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? event.toElement : fromElement;
			}
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}
			return event;
		}
		var rkeyEvent = /^key/, rmouseEvent = /^(?:mouse|contextmenu)|click/ ;
		if ( rkeyEvent.test( event.type ) ) {
			return keyHooks(event);
		}
		if ( rmouseEvent.test( event.type ) ) {
			return mouseHooks(event);
		}
		return event;
	}
	function on(element, eventName, fn, filterFn){
		addEventListener(element, eventName, fn, filterFn);
		return element;
	}
	function once(element, eventName, fn, filterFn){
		var tfn = $_.F.wrap(fn, function(ofn){
			var arg = slice.call(arguments, 1);
			ofn.apply(this,arg);
			remove(element, eventName, tfn);
		});
		addEventListener(element, eventName, tfn, filterFn);
		return element;
	}
	function remove(element, eventName, handler) {
		var wrapedhandler = getWrapedhandler(element, eventName, handler)||handler;
		removeEventListener(element, eventName, wrapedhandler);
		return element;
	}
	function removeAll(element, eventName) {
		var events, i, j;
		events = $_.A.filter(cach, function (val, i) {
			if(element === val.element) {
				if(eventName && eventName !== val.eventName){
					return false;
				}
				return true;
				
			}
		});
		for ( i = 0; events && i < events.length; i++){
			var event = events[i];
			for(j = 0 ; j < event.wrapedhandler.length; j++ )
				removeEventListener(event.element, event.eventName, event.wrapedhandler[j]);
		}
		return element;
	}
	function createEvent(name) {
		var event;
		if(document.createEvent) {
			event = document.createEvent('HTMLEvents');
			event.initEvent(name, true, true);
		}else {
			event = document.createEventObject();
		}
		return event;
		
	}
	function emit(element, name, data){
		if(element == document && document.createEvent && !element.dispatchEvent)
			element = document.documentElement;
		var event;
		
		event = createEvent(name);
		event.data = data;
		event.eventName = name;
		if(document.createEvent) {
			element.dispatchEvent(event);
		}else {
			element.fireEvent("on"+name, event);
		}
		return element;
	}
    extend($_.Event, {
    	fix: fix,
    	stop:stop,
    	on:on,
    	remove:remove,
    	removeAll:removeAll,
    	once: once,
    	emit: emit
    });
})(Asdf);(function($_) {
	var nativeSlice = Array.prototype.slice, extend = $_.O.extend,
		isElement = $_.O.isElement, isString = $_.O.isString, trim = $_.S.trim;
	var tempParent = document.createElement('div');
	$_.Element = {};
	function recursivelyCollect(element, property, until) {
		var elements = [];
		while (element = element[property]) {
			if (element.nodeType == 1)
				elements.push(element);
			if (element == until)
				break;
		}
		return elements;
	}
	function recursively( element, property ) {
		do {
			element = element[ property ];
		} while ( element && element.nodeType !== 1 );
		return element;
	}
	function walk(element, fun, context) {
		context = context || this;
		var i, childNodes = $_.A.toArray(element.childNodes);
		fun.call(context, element);
		for (i = 0; i < childNodes.length ; i++) {
			walk(childNodes[i], fun);
		}
		return element;
	}
	function visible(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		return element.style.display !='none';
	}
	function toggle(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
	    visible(element) ? hide(element) : show(element);
	    return element;
	}
	function hide(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		element.style.display = 'none';
	    return element;
	}
	function show(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		 element.style.display = '';
		 return element;
	}
	function text(element, value) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		var ret = '';
		if( value == null ){
			if ( typeof element.textContent === "string" ) {
				return element.textContent;
			} else {
				walk(element, function(e) {
					var nodeType = e.nodeType;
					if( nodeType === 3 || nodeType === 4 ) {
						ret += e.nodeValue;
					}
					return false;
				});
				return ret;
			}
		}else {
			append(empty(element), (element.ownerDocument || document ).createTextNode( value ) );
		}
	}
	function value(element, value) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return (value==null)? element.value : element.value = value;
	}
	function html(element, html) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return (!html)? element.innerHTML: element.innerHTML = html;
	}
	function parent(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursively(element, 'parentNode');
	}
	function parents(element, until) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		 return recursivelyCollect(element, 'parentNode', until);
	}
	function next(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursively(element, 'nextSibling');
	}
	function prev(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursively(element, 'previousSibling');
	}
	function nexts(element, until) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursivelyCollect(element, 'nextSibling', until);
	}
	function prevs(element, until) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursivelyCollect(element, 'previousSibling', until);
	}
	function siblings(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return $_.A.without($_.A.toArray(element.parentNode.childNodes), element);
	}
	function children(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return nexts(element.firstChild, 'nextSibling');
	}
	function contents(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return (element.nodeName === 'IFRAM')?element.contentDocument||element.contentWindow.document : element.childNodes ;
	}
	function wrap(element, newContent) {
		if(!$_.O.isNode(element)||!$_.O.isNode(newContent))
			throw new TypeError();
		element.parentNode.replaceChild(newContent, element);
		newContent.appendChild(element);
		return newContent;
	}
	function unwrap(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		var bin = document.createDocumentFragment();
		var parentNode = element.parentNode;
		bin.appendChild(element);
		parentNode.parentNode.replaceChild(element, parentNode);
		return element;
	}
	function append(element, newContent) {
		if(!$_.O.isNode(element)||!$_.O.isNode(newContent))
			throw new TypeError();
		var nodeType = element.nodeType;
		if ( nodeType === 1 || nodeType === 11 ) {
			element.appendChild( newContent );
		}
		return element;
	}
	function prepend(element, newContent) {
		if(!$_.O.isNode(element)||!$_.O.isNode(newContent))
			throw new TypeError();
		var nodeType = element.nodeType;
		if ( nodeType === 1 || nodeType === 11 ) {
			element.insertBefore( newContent, element.firstChild );
		}
		return element;
	}
	function before(element, newContent) {
		if(!$_.O.isNode(element)||!$_.O.isNode(newContent))
			throw new TypeError();
		element.parentNode.insertBefore(newContent, element);
		return element;
	}
	function after(element, newContent) {
		if(!$_.O.isNode(element)||!$_.O.isNode(newContent))
			throw new TypeError();
		element.parentNode.insertBefore(newContent, element.nextSibling);
		return element;		
	}
	function empty(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		element.innerHTML = '';
		return element;
	}
	function remove(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		element.parentNode.removeChild(element);
	}
	function attr(element, name, value) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		var result, key;
		if(!name || !isString(name)){
			return null;
		}
		if(element.nodeType !== 1){
			return null;
		}
		if(value == null){
			if(name === 'value' && element.nodeName === 'INPUT' ){
				return element.value;
			}
			return (!(result = element.getAttribute(name)) && name in element) ? element[name] : result;
		}else {
			if (typeof name === 'object'){
				for (key in name)
					element.setAttribute(key, name[key]);
			}else {
				element.setAttribute(name, value);
			}
			return element;
		}
	}
	function removeAttr(element, name) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(element.nodeType === 1)
			element.removeAttribute(name);
		return element;
	}
	function prop(element, name, value) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		if( value == null){
			return element[name];
		} else {
			element[name] = value;
			return element;
		}
	}
	function removeProp(element, name){
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(element[name])
			delete element[name];
		return element;
	}
	function relatedOffset(element, target) {
		if(!$_.O.isNode(element)||!$_.O.isNode(target))
			throw new TypeError();
		var offsetEl = offset(element);
		var offsetTar = offset(target);
		return {left: offsetEl.left - offsetTar.left, 
				top: offsetEl.top - offsetTar.top,
				height:offsetEl.height,
				width:offsetEl.width,
				right: offsetEl.right - offsetTar.left,
				bottom: offsetEl.bottom - offsetTar.top
			};
	}
	function offset(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		// IE 경우 document.documentElement.scrollTop 그 외 document.body.scrollTop
		var width = 0,
			height = 0,
			rect = element.getBoundingClientRect(),
			top = rect.top + (document.body.scrollTop || document.documentElement.scrollTop),
			bottom = rect.bottom + (document.body.scrollTop || document.documentElement.scrollTop),
			right = rect.right + (document.body.scrollLeft || document.documentElement.scrollLeft),
			left = rect.left + (document.body.scrollLeft || document.documentElement.scrollLeft);
		if (rect.height) {
			height = rect.height;
			width = rect.width;
		} else {
			height = element.offsetHeight || bottom - top;
			width = element.offsetWidth || right - left;
		}
		return {
			height : height,
			width : width,
			top : top,
			bottom : bottom,
			right : right,
			left : left
		};
	};
	function addClass(element, name){
		if(!$_.O.isNode(element)||!$_.O.isString(name))
			throw new TypeError();
		var nms = name.replace(/\s+/g,' ').split(' ');
		$_.A.each(nms, function(name) {
			if(!hasClass(element, name))		
				element.className += (element.className? ' ':'') + name;
		});
		return element;
	};
	function removeClass(element, name) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(!name)
			element.className = '';
		else {
			var nms = name.replace(/\s+/g,' ').split(' ');
			$_.A.each(nms, function(name) {
				element.className = $_.S.trim(element.className.replace(new RegExp("(^|\\s+)" + name + "(\\s+|$)"), ' '));
			});
		}
		return element;
	}
	function toggleClass(element, name) {
		if(!$_.O.isNode(element)||!$_.O.isString(name))
			throw new TypeError();
		var nms = name.replace(/\s+/g,' ').split(' ');
		$_.A.each(nms, function(name) {
			if(hasClass(element, name)){
				return removeClass(element, name);
			}
			return addClass(element, name);
		});
		return element;
	}
	function hasClass(element, name) {
		if(!$_.O.isNode(element)||!$_.O.isString(name))
			throw new TypeError();
		return element.className && new RegExp("(^|\\s)" + name + "(\\s|$)").test(element.className);
	}
	function find(element, selector, results, seed){
		if(!$_.O.isNode(element))
			throw new TypeError();
		results = results||[];
		return $_.A.toArray(querySelectorAll(element, selector)).concat(results);
	}
	function querySelectorAll(element, selector) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(window.Sizzle){
			return Sizzle(selector, element);
		}
		else if(element.querySelectorAll) {
			return element.querySelectorAll(selector);
		}else {
			var a=element.all, c=[], selector = selector.replace(/\[for\b/gi, '[htmlFor').split(','), i, j,s=document.createStyleSheet();
			for (i=selector.length; i--;) {
				s.addRule(selector[i], 'k:v');
				for (j=a.length; j--;) a[j].currentStyle.k && c.push(a[j]);
				s.removeRule(0);
			}
			return c;
		}
	}
	function closest(element, selector, context){
		if(!$_.O.isNode(element))
			throw new TypeError();
		while (element && !matchesSelector(element, selector))
			element = element !== context && element !== document && element.parentNode;
	    return element;
	}
	function matchesSelector(element, selector){
		if(!$_.O.isNode(element))
			throw new TypeError();
		if (!element || element.nodeType !== 1) return false
	    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
	                          element.oMatchesSelector || element.matchesSelector;
	    if (matchesSelector) return matchesSelector.call(element, selector);
	    var match, parent = element.parentNode, temp = !parent;
	    if (temp) (parent = tempParent).appendChild(element);
	    var match =  $_.A.indexOf( find(parent, selector), element);
	    temp && tempParent.removeChild(element);
	    return match===-1? false: true;
	}
	function css(element, name, value){
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(value!=null){
			var elementStyle = element.style;
			elementStyle[name] =  value;
		}else {
			var cssStyle, res, i;
			// IE
			if (element.currentStyle) {
				cssStyle = element.currentStyle;
			} else if (document.defaultView &&
					document.defaultView.getComputedStyle) {
				cssStyle = document.defaultView.getComputedStyle(element, null);
			} else {
				return TypeError();
			}
			var styleVal = $_.O.extend({},element.style);
			$_.O.each(styleVal, function(value, key, obj) {
				if(!value || value == 'auto')
					obj[key] = cssStyle[key] && cssStyle[key] != 'auto'?  cssStyle[key]: '';
			});
			if(!name) {
				return styleVal;
			}
			else if (isString(name)) {
				res = styleVal[name];
			} else if($_.O.isArray(name)){
				res = {};
				for (i = 0; i < name.length; i++) {
					res[name[i]] = styleVal[name[i]];
				}
			} else 
				throw TypeError();
			return res;
		}
	}
	function toHTML(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(!element) throw new TypeError;
		var d = document.createElement('div');
		if($_.O.isNode(element))
			element = element.cloneNode(true);
		d.appendChild(element);
		return d.innerHTML;
	}
	function isWhitespace(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return $_.S.isBlank(element.innerHTML);
	}
	extend($_.Element,  {
		walk: walk,
		visible: visible,
		toggle: toggle,
		hide: hide,
		show: show,
		remove: remove,
		text: text,
		value: value,
		html: html,
		parent: parent,
		parents: parents,
		next: next,
		prev: prev,
		nexts: nexts,
		prevs: prevs,
		siblings: siblings,
		children: children,
		contents: contents,
		wrap: wrap,
		unwrap: unwrap,
		append: append,
		prepend: prepend,
		before: before,
		after: after,
		empty: empty,
		attr: attr,
		removeAttr: removeAttr,
		prop: prop,
		removeProp: removeProp,
		relatedOffset:relatedOffset,
		offset: offset,
		addClass: addClass,
		removeClass: removeClass,
		toggleClass: toggleClass,
		hasClass: hasClass,
		find: find,
		querySelectorAll: querySelectorAll,
		matchesSelector:matchesSelector,
		is: matchesSelector,
		closest:closest,
		css:css,
		toHTML: toHTML,
		isWhitespace: isWhitespace
	});
})(Asdf);(function ($_) {
	$_.Template = {};
	var attrBind = function(element, attrs) {
		var hasAttribute =  function (node, attr) {
			if (node.hasAttribute)
				return node.hasAttribute(attr);
			else
				return node.getAttribute(attr);
		};
		for(var key in attrs){
			if(key.toLowerCase() === 'html'){
				htmlBind(element,attrs[key]);
			}else if(key.toLowerCase() === 'text'){
				textBind(element,attrs[key]);
			}else if(key.toLowerCase() === 'class'){
				element.className = attrs[key];
			}else if(key.toLowerCase() === 'value'){
				element.value = attrs[key];
			}else if(hasAttribute(element, key)) {
				element.setAttribute(key,attrs[key]);
			}
		}
	}
	,textBind = function(element, text) {
		$_.Element.text(element, text);
	}
	,htmlBind = function(element, html) {
		element.innerHTML = html;
	}
	,findElements = function(root,selector) {
		return $_.Element.find(root, selector);
	}
	,bind = function(element, obj) {
		var key, targets;
		var valiableNodeType = element.nodeType === 1 || element.nodeType === 11;
		// validate
		if (!valiableNodeType) throw new TypeError();
		if (!$_.O.isPlainObject(obj)) throw new TypeError();
		for (key in obj){
			targets = findElements(element, key);
			if(targets.length === 0) continue;
			$_.A.each(targets, function(value) {
				if($_.O.isString(obj[key])||$_.O.isNumber(obj[key])) {
					textBind(value, obj[key]);
				}
				else if($_.O.isPlainObject(obj[key])){
					attrBind(value, obj[key]);
				}
			});
			
		}
		return element;
		
	};
	$_.Template.bind = bind;
})(Asdf);(function($_) {
	$_.Utils = {};
	function randomMax8HexChars() {
		return (((1 + Math.random()) * 0x100000000) | 0).toString(16)
				.substring(1);
	}
	function makeuid() {
		return randomMax8HexChars() + randomMax8HexChars();
	}
	
	var ready = (function() {
		var domReadyfn = [];
		var timer, defer = $_.F.defer;
		function fireContentLoadedEvent() {
			var i;
			if (document.loaded)
				return;
			if (timer)
				window.clearTimeout(timer);
			document.loaded = true;
			for (i = 0; i < domReadyfn.length; i++) {
				domReadyfn[i]($_);
			}
		}
		function checkReadyState() {
			if (document.readyState === 'complete') {
				document.detachEvent('onreadystatechange', checkReadyState);
				fireContentLoadedEvent();
			}
		}
		function pollDoScroll() {
			try {
				document.documentElement.doScroll('left');
			} catch (e) {
				timer = defer(pollDoScroll);
				return;
			}
			fireContentLoadedEvent();
		}
		if (document.addEventListener) {
			document.addEventListener('DOMContentLoaded',
					fireContentLoadedEvent, false);
			window.addEventListener('load', fireContentLoadedEvent);
		} else {
			document.attachEvent('onreadystatechange', checkReadyState);
			if (window == top)
				timer = defer(pollDoScroll);
			window.attachEvent('onload', fireContentLoadedEvent);
		}
		return function(callback) {domReadyfn.push(callback);};
	})();
	function parseJson(jsonString) {
		if (typeof jsonString == "string") {
			if (jsonString) {
				if (window.JSON && window.JSON.parse) {
					return window.JSON.parse(jsonString);
				}
				return (new Function("return " + jsonString))();
			}
		}
		return null;
	}
	function namespace(/*[parent], ns_string*/) {
		var parts, i, parent;
		var args = $_.A.toArray(arguments);
		if ($_.O.isPlainObject(args[0])) {
			parent = args.shift();
		}
		parent = parent || window;
		parts = args[0].split('.');
		for (i = 0; i < parts.length; i++) {
			if (typeof parent[parts[i]] === 'undefined') {
				parent[parts[i]] = {};
			}
			parent = parent[parts[i]];
		}
		return parent;
	}
	function rgbToHsl(r, g, b) {
		r /= 255, g /= 255, b /= 255;
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) / 2;

		if (max == min) {
			h = s = 0; // achromatic
		} else {
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
			}
			h /= 6;
		}

		return { h:h, s:s, l:l };
	}
	function hslToRgb(h, s, l) {
		var r, g, b;

		if (s == 0) {
			r = g = b = l; // achromatic
		} else {
			function hue2rgb(p, q, t) {
				if (t < 0)
					t += 1;
				if (t > 1)
					t -= 1;
				if (t < 1 / 6)
					return p + (q - p) * 6 * t;
				if (t < 1 / 2)
					return q;
				if (t < 2 / 3)
					return p + (q - p) * (2 / 3 - t) * 6;
				return p;
			}

			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}

		return { r:r * 255, g:g * 255, b:b * 255, toString: function () {
			return $_.A.map([r,g,b], function (value) {return $_.S.lpad((value*255|0).toString(16),"0",2);}).join("");
		} };
	}
	function rgbToHsv(r, g, b) {
		r = r / 255, g = g / 255, b = b / 255;
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, v = max;

		var d = max - min;
		s = max == 0 ? 0 : d / max;

		if (max == min) {
			h = 0; // achromatic
		} else {
			switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
			}
			h /= 6;
		}

		return { h:h, s:s, v:v };
	}
	function hsvToRgb(h, s, v) {
		var r, g, b;

		var i = Math.floor(h * 6);
		var f = h * 6 - i;
		var p = v * (1 - s);
		var q = v * (1 - f * s);
		var t = v * (1 - (1 - f) * s);

		switch (i % 6) {
		case 0:
			r = v, g = t, b = p;
			break;
		case 1:
			r = q, g = v, b = p;
			break;
		case 2:
			r = p, g = v, b = t;
			break;
		case 3:
			r = p, g = q, b = v;
			break;
		case 4:
			r = t, g = p, b = v;
			break;
		case 5:
			r = v, g = p, b = q;
			break;
		}

		return { r: r * 255, g: g * 255, b: b * 255, toString: function () {
			return $_.A.map([r,g,b], function (value) {return $_.S.lpad((value*255|0).toString(16),"0",2);}).join("");
		} };
	}

	$_.O.extend($_.Utils, {
		makeuid : makeuid,
		ready : ready,
		parseJson : parseJson,
		namespace : namespace,
		rgbToHsl : rgbToHsl,
		hslToRgb : hslToRgb,
		rgbToHsv : rgbToHsv,
		hsvToRgb : hsvToRgb
	});
})(Asdf);(function ($_) {
	$_.Base = {};
	function subclass() {};
	var Class = function(/*parent, protoProps, staticProps*/) {
		var arg = $_.A.toArray(arguments), parent = null, protoProps, staticProps;
		if($_.O.isFunction(arg[0]))
			parent = arg.shift();
		protoProps = arg[0];
		staticProps = arg[1];
		function child() {
			var self = this, key, arg = $_.A.toArray(arguments);
			for(key in self){
				if(!$_.O.isFunction(self[key]))self[key] = $_.O.clone(self[key]); 
			}
			function initsuper(parent) {
				if(!parent) return;
				if(parent.superclass)
					initsuper(parent.superclass);
				parent.prototype.initialize.apply(self, arg);
			}
			initsuper(parent);
			this.initialize.apply(this, arg);
		}
		child.superclass = parent;
		child.subclasses = [];
		if(parent){	
			subclass.prototype = parent.prototype;
			child.prototype = new subclass();
			parent.subclasses.push(child);
		}
		child.prototype.initialize = function () {};
		if (protoProps)
			$_.O.extend(child.prototype, protoProps);
		if (staticProps)
			$_.O.extend(child, staticProps);
		child.extend = $_.F.wrap($_.O.extend, function (fn, obj){
			var extended = obj.extended;
			fn(child, obj);
			if(extended) extended(child);
		});
		child.include = $_.F.wrap($_.O.extend, function (fn, obj){
			var included = obj.included;
			fn(child.prototype, obj);
			if(included) included(child);
		});
		child.prototype.constructor = child;
		return child;
	};

	$_.O.extend($_.Base, {
		Class: Class
	});
})(Asdf);(function($_) {
	$_.Ajax = {};
	var activeRequestCount = 0, emptyFunction = function () {};
	var Try = {
		these : function() {
			var returnValue;
			for ( var i = 0, length = arguments.length; i < length; i++) {
				var lambda = arguments[i];
				try {
					returnValue = lambda();
					break;
				} catch (e) {
				}
			}

			return returnValue;
		}
	};
	var states = 'Uninitialized Loading Loaded Interactive Complete'.split(' ');
	function onStateChange(transport, fn) {
		var readyState = transport.readyState();
		if (readyState > 1 && !((readyState == 4) && transport._complete))
			fn(readyState);
	}
	function setRequestHeaders (xhr, options) {
		if(!$_.O.isPlainObject(options)) throw new TypeError();
		var headers = {'Accept' : 'text/javascript, text/html, application/xml, text/xml, */*'};
		var contentType;
		if(options.method === 'post') {
			contentType = options.contentType + (options.encoding?';charset'+options.encoding: '');
		}
		$_.O.extend( headers, options.requestHeaders||{});
		headers['Content-type'] = contentType;
		for(var name in headers){
			xhr.setRequestHeader(name, headers[name]);
		}
	}
	function success(status) {
		return !status || (status >=200 && status < 300) || status ==304;
	}
	function getStatus(xhr){
		try{
			if(xhr.status === 1223) return 204;
			return xhr.status ||0;
		} catch (e) { return 0; }
	}
	function respondToReadyState(transport, options, readyState){
		var state = states[readyState];
		var res = getResponse(transport);
		if(state === 'Complete'){
			try {
				transport._complete = true;
				(options['on' + transport.status()]
						|| options['on'+ (success(transport.status()) ? 'Success' : 'Failure')] || emptyFunction)
						(res);
			} catch (e) {
				throw e;
			}
		}
		try{
			(options['on'+state]||emptyFunction)(res);
			responders.fire('on' + state, transport, res);
		}catch(e){
			throw new Error();
		}
		if(state === 'Complete'){
			transport.xhr.onreadystatechange = emptyFunction;
			transport.xhr = undefined;
			transport = undefined;
			
		}
	}
	function isSameOrigin(url) {
		 var m = url.match(/^\s*https?:\/\/[^\/]*/);
		 var protocol = location.protocol;
		 var domain = document.domain;
		 var port = location.port?':'+location.port:'';
		 return !m || (m[0] == prototype+'//'+domain+port);
	}
	
	function getHeader(xhr, name){
		try{
			return xhr.getResponseHeader(name)|| null;
		}catch(e){return null;}
	}
	
	//response
	function getStatusText(xhr){
		try{
			return xhr.statusText||'';
		} catch(e) {return '';}
	}
	
	function getTransport() {
		return Try.these(function() {
			return new XMLHttpRequest();
		}, function() {
			return new ActiveXObject('Msxml2.XMLHTTP');
		}, function() {
			return new ActiveXObject('Microsoft.XMLHTTP');
		}) || false;
	};
	var responders = (function (){
			var list = [];
			function add(responder) {
				if (!$_.A.include(list, responder))
					list.push(responder);
			}
			function remove(responder) {
				list = $_.A.without(list, responder);
			}
			function fire(callback, request, response) {
				$_.A.each(list, function(responder) {
					if ($_.O.isFunction(responder[callback])) {
						try {
							responder[callback].apply(responder, [ request, response]);
						} catch (e) { }
					}
			 	});
			}
			return {
				add: add,
				remove: remove,
				fire: fire
			};
	})();
	responders.add({
		onCreate: function () { activeRequestCount++},
		onComplete: function () {activeRequestCount--}
	});
	
	function request(url, options){
		options = options ||{};
		$_.O.extend(options, 
				{
					method : 'post',
					asynchronous : true,
					contentType : 'application/x-www-form-urlencoded',
					encoding : 'UTF-8',
					parameters : ''
				}, true);
		options.method = options.method.toLowerCase();
		var transport ={xhr:getTransport()}, params;
		fix(transport, options);
		
		params = $_.O.isString(options.parameters) ? options.parameters : $_.O
				.toQueryString(options.parameters);
		url = url||options.url;
		
		if(!$_.A.include(['get', 'post'], options.method)){
			params +=(params? '&':'') + '_method=' + options.method;
			options.method = 'post';
		}
		if(params && options.method ==='get'){
			url += ($_.S.include(url,'?')? '&': '?') + params;
		}
		try {
			var res = getResponse(transport);
			if(options.onCreate) onCreate(res);
			responders.fire('onCreate');
			transport.open(options.method.toUpperCase(), url, options.asynchronous);
			if(options.asynchronous)transport.respondToReadyState(1);

			transport.setRequestHeaders(options);
			var body = options.method === 'post'? params: null;
			transport.send(body);
			if (!options.asynchronous && transport.overrideMimeType)
				transport.onreadystatechange(transport.readyState);
		}catch(e){
			throw e;
		}
		
	}
	function fix(transport, options){
		$_.O.extend(transport, {
			setRequestHeaders: $_.F.curry(setRequestHeaders, transport.xhr),
			getStatus: $_.F.curry(getStatus, transport.xhr),
			getHeader: $_.F.curry(getHeader, transport.xhr),
			getStatusText: $_.F.curry(getStatusText, transport.xhr),
			status: function(){ return transport.xhr.status;},
			readyState: function() {return transport.xhr.readyState;},
			respondToReadyState: $_.F.curry(respondToReadyState, transport, options),
			responseText: function(){ return transport.xhr.responseText},
			responseXML: function(){ return transport.xhr.responseXML},
			send: function(data){transport.xhr.send(data)},
			open: function(method, url, async){transport.xhr.open(method, url, async)},
			getAllResponseHeaders: function(){ return transport.xhr.getAllResponseHeaders()},
			_complete: false
		});
		transport.xhr.onreadystatechange =  $_.F.curry(onStateChange, transport, transport.respondToReadyState);
	}
	function getResponse(transport){
		var res = {};
		var readyState = transport.readyState();
		if ((readyState > 2 && !$_.Bom.browser == 'msie') || readyState == 4) {
			res.status = transport.status();
			res.statusText = transport.getStatusText();
			res.responseText = transport.responseText();
			res.headers = $_.S.toQueryParams(transport.getAllResponseHeaders(), '\n', ':');
		}

		if (readyState == 4) {
			var xml = transport.responseXML();
			res.responseXML = xml == null ? null : xml;
		}
		return res;
		
	}
	$_.O.extend($_.Ajax, {
		getTransport: getTransport,
		request: request,
		responders: responders
	});
})(Asdf);(function($_) {
	var history = $_.History = {};
	var timer = null;
	var iframeWin = null;
	var hasPushState = window.history && window.history.pushState;
	var started = false;
	var currentHash = '';
	var router = null;
	
	function getHash(win){
		var match = win.location.href.match(/#(.*)$/);
		return match? match[1]:'';
	}
	function getPathname(win){
		return win.location.pathname;
	}
	function getUrl(win){
		return getPathname(win) +'#' + getHash(win);
	} 
	function start(options) {
		if(started) throw TypeError("error");
		started = true;
		router = options.router|| function() {};
		var isOldIE = $_.Bom.browser == 'msie' && $_.Bom.version <= 7;
		if(isOldIE){
			var iframe = $_.S.toElement('<iframe src="javascript:0" tabindex="-1" style="display:none">');
			$_.Element.append(document.body, iframe);
			iframeWin = iframe.contentWindow;
		}if(hasPushState) {
			$_.Event.on(window,'popstate', checkHash);
		}else if(!isOldIE){
			$_.Event.on(window,'hashchange', checkHash);
		}else {
			timer = $_.F.delay(checkHash, 0.05);
		}
	}
	function checkHash() {
		var hash = getHash(iframeWin||window);
		if(currentHash != hash){
			currentHash = hash;
			if(iframeWin)updateHash(hash);
			router(hash);
		}
		timer&&(timer = $_.F.delay(checkHash, 0.05));
	}
	function _update(hashValue, isExec){
		if(!started) throw TypeError();
		currentHash = hashValue;
		updateHash(hashValue);
		isExec&&router(hashValue);
	}
	function update(hashValue){
		_update(hashValue, true);
	}
	function push(hashValue){
		_update(hashValue, false);
	}
	function updateHash(hashValue){
		setHash(window, hashValue);
		if(iframeWin && getHash(iframeWin) != hashValue){
			iframeWin.document.open().close();
			setHash(iframeWin, hashValue);
		}
	}
	function setHash(win, hashValue){
		var url = getPathname(win) +'#'+ hashValue;
		if(hasPushState){
			win.history.pushState({}, document.title, url);
		}else{
			win.location.hash = '#' + hashValue;
		}
	}
	$_.O.extend(history, {
		start: start,
		update: update,
		push: push
	});
})(Asdf);
