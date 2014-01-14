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
