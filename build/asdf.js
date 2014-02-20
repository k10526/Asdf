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
	 * @desc 해당 메소드를 사용하면 출처 객체에 있는 프로퍼티를 대상 객체로 복사한다.
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
	 * @desc 해당 메소드를 사용하면 출처 객체에 있는 프로퍼티를 대상 객체로 복사한다.
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
	 * @desc 해당 메소드를 사용하면 객체가 순수Object인지 판단한다.
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
	/**
	 * @memberof O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} 순수Object여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 순수Object아닌지 판단한다.
	 */
	var isNotPlainObject = not(isPlainObject);
	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Element여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Element인지 판단한다.
	 */
	function isElement(object) {
		return !!(object && object.nodeType !== 3);
	}
	/**
	 * @memberof O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Element여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Element아닌지 판단한다.
	 */
	var isNotElement = not(isElement);
    function isDocument(object) {
        return !!(object && object.nodeType === 9);
    }
    var isNotDocument = not(isDocument);
	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Node여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Node인지 판단한다.
	 */
	function isNode(object) {
		return !!(object && object.nodeType);
	}
	
	/**
	 * @memberof O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Node여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Node아닌지 판단한다.
	 */
	var isNotNode = not(isNode);
	
	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Window여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 window인지 판단한다.
	 */
	function isWindow (obj) {
		return obj != null && obj == obj.window;
	}
	
	/**
	 * @memberof O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Window여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 window아닌지 판단한다.
	 */
	var isNotWindow = not(isWindow);
	
	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} 빈 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 빈 객체인지 판단한다.
	 */
	function isEmptyObject(obj) {
		var res = true;
		each(obj, function (value, key){
			res = false;
		});
		return res;
	}
	
	/**
	 * @memberof O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} 빈 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 빈 객체가 아닌지 판단한다.
	 */
	var isNotEmptyObject = not(isEmptyObject);
	
	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Array 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Array인지 판단한다.
	 */
	function isArray(object) {
		var hasNativeIsArray = (typeof Array.isArray == 'function') && Array.isArray([]) && !Array.isArray({});
		if (hasNativeIsArray) {
			isArray = Array.isArray;
			return Array.isArray(object);
		}
		return nativeToString.call(object) === objectType.ARRAY_CLASS;
	}
	/**
	 * @memberof O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Array 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Array아닌지 판단한다.
	 */
	var isNotArray = not(isArray);
	
	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Object 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Object인지 판단한다.
	 */
	function isObject(object) {
		return object === Object(object);
	}
	
	/**
	 * @memberof O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Object 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Object아닌지 판단한다.
	 */
	var isNotObject = not(isObject);
	
	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Arguments 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Arguments인지 판단한다.
	 */
	function isArguments(object) {
		return nativeToString.call(object) === objectType.ARGUMENTS_CLASS;
	}
	
	/**
	 * @memberof O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Arguments 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Arguments아닌지 판단한다.
	 */
	var isNotArguments = not(isArguments);
	
	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} function 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 function인지 판단한다.
	 */
	function isFunction(object) {
		return nativeToString.call(object) === objectType.FUNCTION_CLASS;
	}
	
	/**
	 * @memberof O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} function 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 function아닌지 판단한다.
	 */
	var isNotFunction  = not(isFunction);

	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} String 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 String인지 판단한다.
	 */
	function isString(object) {
		return nativeToString.call(object) === objectType.STRING_CLASS;
	}
	
	/**
	 * @memberof O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} String 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 String아닌지 판단한다.
	 */
	var isNotString = not(isString);

	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Number 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Number인지 판단한다.
	 */
	function isNumber(object) {
		return nativeToString.call(object) === objectType.NUMBER_CLASS;
	}
	
	/**
	 * @memberof O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Number 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Number아닌지 판단한다.
	 */
	var isNotNumber = not(isNumber);

	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Date 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Date인지 판단한다.
	 */
	function isDate(object) {
		return nativeToString.call(object) === objectType.DATE_CLASS;
	}
	
	/**
	 * @memberof O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Date 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Date아닌지 판단한다.
	 */
	var isNotDate = not(isDate);
	
	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Regexp 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Regexp인지 판단한다.
	 */
	function isRegexp(object) {
		return nativeToString.call(object) === objectType.REGEXP_CLASS;
	}
	
	/**
	 * @memberof O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Regexp 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Regexp아닌지 판단한다.
	 */
	var isNotRegexp = not(isRegexp);
	
	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} undefined여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 undefined인지 판단한다.
	 */
	function isUndefined(object) {
		return typeof object === "undefined";
	}
	
	/**
	 * @memberof O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} undefined여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 undefined아닌지 판단한다.
	 */
	var isNotUndefined = not(isUndefined);
	
	/**
	 * @memberof O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} null여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 null인지 판단한다.
	 */
	function isNull(object) {
		return object === null;
	}
	
	/**
	 * @memberof O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} null여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 null아닌지 판단한다.
	 */
	var isNotNull = not(isNull);
	
	/**
	 * @memberof O
	 * @func
	 * @param {object} obj 판단 객체
	 * @returns {boolean} collection여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 collection인지 판단한다. <br>
	 * collection 객체란? length프로퍼티가 존재 하며 숫자 이여야 한다.
	 */
	function isCollection(obj) {
		if(isNotObject(obj)||isNotNumber(obj.length))
			return false;
		return true;
	}
	/**
	 * @memberof O
	 * @func
	 * @param {object} obj 판단 객체
	 * @returns {boolean} collection여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 collection아닌지 판단한다.
	 */
	var isNotCollection = not(isCollection);
	
	/**
	 * @memberof O
	 * @func
	 * @param {object} object 대상 객체
	 * @returns {array} object의 key값을 추출하여 Array type으로 반환한다.
	 * @desc 대상 객체에서 key값을 추출한다.
	 * @example
	 * var obj = {a:1, b:2};
	 * Asdf.O.keys(obj) //return ['a','b'];
	 */
	function keys(object) {
		if ((typeof object != "object" && typeof object != "function")
				|| object === null) {
			throw new TypeError("Object.key called on a non-object");
		}
		var keys = [];
		each(object, function (value, key) { keys.push(key); });
		return keys;
	}
	
	/**
	 * @memberof O
	 * @func
	 * @param {object} object 대상 객체
	 * @returns {array} object의 value값을 추출하여 Array type으로 반환한다.
	 * @desc 대상 객체에서 value값을 추출한다.
	 * @example
	 * var obj = {a:1, b:2};
	 * Asdf.O.values(obj) //return [1,2];
	 */
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
	
	/**
	 * @memberof O
	 * @func
	 * @param {object} object 대상 객체
	 * @returns {array} object의 value값이 function인 key값을 추출하여 Array type으로 반환한다.
	 * @desc 대상 객체에서 value가 function인 key값을 추출한다.
	 * @example
	 * var obj = {a:1, b:2, c: function(){}};
	 * Asdf.O.functions(obj) //return ['c'];
	 */
	var functions = partial(getKeysbyType, undefined, isFunction);
	
	/**
	 * @memberof O
	 * @func
	 * @param {object} object 대상 객체
	 * @returns {array} object의 value값이 null인 key값을 추출하여 Array type으로 반환한다.
	 * @desc 대상 객체에서 value가 null인 key값을 추출한다.
	 * @example
	 * var obj = {a:1, b:2, c: function(){}, d: null};
	 * Asdf.O.nulls(obj) //return ['d'];
	 */
	var nulls = partial(getKeysbyType, undefined, isNull);
	
	/**
	 * @memberof O
	 * @func
	 * @param {object} object 대상 객체
	 * @returns {array} object의 value값이 undefined key값을 추출하여 Array type으로 반환한다.
	 * @desc 대상 객체에서 value가 undefined인 key값을 추출한다.
	 * @example
	 * var obj = {a:1, b:2, c: function(){}, d: null, e: undefined};
	 * Asdf.O.undefineds(obj) //return ['e'];
	 */
	var undefineds = partial(getKeysbyType, undefined, isUndefined);
	
	/**
	 * @memberof O
	 * @func
	 * @param {object} object 대상 객체
	 * @returns {array} object의 value값이 plainObject인 key값을 추출하여 Array type으로 반환한다.
	 * @desc 대상 객체에서 value가 plainObject인 key값을 추출한다.
	 * @example
	 * var obj = {a:1, b:2, c: function(){}, d: null, e: undefined, f: {}};
	 * Asdf.O.plainObjects(obj) //return ['f'];
	 */
	var plainObjects = partial(getKeysbyType, undefined, isPlainObject);
	
	/**
	 * @memberof O
	 * @func
	 * @param {object} object 대상 객체
	 * @returns {array} object의 value값이 Array인 key값을 추출하여 Array type으로 반환한다.
	 * @desc 대상 객체에서 value가 Array인 key값을 추출한다.
	 * @example
	 * var obj = {a:1, b:2, c: function(){}, d: null, e: undefined, f: {}, g: []};
	 * Asdf.O.arrays(obj) //return ['f'];
	 */
	var arrays = partial(getKeysbyType, undefined, isArray);
	
	/**
	 * @memberof O
	 * @func
	 * @param {object} obj 대상 객체
	 * @param {...string} key 추출 key값들
	 * @returns {object} obj에서 key 값을 추출하여 객체를 반환한다.
	 * @desc 대상 객체에서 해당하는 key값을 추출하여 반환한다.
	 * @example
	 * var obj = {a:1, b:2, c: function(){}, d: null, e: undefined, f: {}, g: []};
	 * Asdf.O.pick(obj,'a', 'c') //return {a:1, c:function(){}};
	 */
	function pick(obj) {
		var result = {};
		$_.A.each($_.A.flatten(slice.call(arguments,1)), function(key) {
			if (key in obj)
				result[key] = obj[key];
		});
		return result;
	}
	
	/**
	 * @memberof O
	 * @func
	 * @param {object} obj 대상 객체
	 * @returns {object} obj복사하여 반환한다.
	 * @desc array 객체이거나 plainObject인 경우 객체에 clone 메소드가 없어도 복사가 가능하나 그 외인 경우 반드시 clone메소드를 구현해야 한다.
	 */
	function clone(obj) {
		if (!isObject(obj))
			throw new TypeError();
		if(obj.clone)
			return obj.clone();
		if(isArray(obj)||isPlainObject(obj))
			return isArray(obj) ? obj.slice() : extend(true, {}, obj);
		throw new TypeError();
	}
	
	/**
	 * @memberof O
	 * @func
	 * @param {object} obj 대상 객체
	 * @returns {string} obj를 queryString으로 바꾸어 반환한다.
	 * @desc obj는 반드시 plainObject이여야 한다. key1=value1&key2=value2... 로 반환된다.
	 * @example
	 * var obj = {a:1, b:2, c:[1,2,3,4]};
	 * Asdf.O.toQueryString(obj); //return 'a=1&b=2&c=1&c=2&c=3&c=4';
	 */
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
	/**
	 * @memberof O
	 * @func
	 * @param {object} obj 대상 객체
	 * @param {object} type 타입에 대한 정의 객체 
	 * @returns {boolean} obj가 해당 type이면 참을 반환한다.
	 * @desc type객체는 key값과 대응하는 function으로 이루어 진다. type의 key값과 obj의 같은 key값에 대응되는 value값을 function의 인자값으로 넣고 실행할 경우 모두 참이 떨어지면 참을 반환한다.
	 * @example
	 * var obj = {
	 *	a: function(){},
	 *	b: function(){}
	 * };
	 * var type1 = {a: Asdf.O.isFunction,
	 *	b: Asdf.O.isFunction,
	 *	aa: Asdf.O.isUndefined
	 * };
	 * Asdf.O.type(obj, type1); // return true;
	 */
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
        isDocument:isDocument,
        isNotDocument: isNotDocument,
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
/**
 * @project Asdf.js
 * @author N3735
 * @namespace F
 */
(function($_) {
	$_.F = {};
	var slice = Array.prototype.slice, fnProto = Function.prototype, nativeBind = fnProto.bind;
	
	/**
	 * @memberof F
	 * @param {*} value value
	 * @returns {*} value를 리턴한다. 
	 * @desc value를 리턴한다.
	 */
	function identity(value) {
		return value;
	}
	
	/**
	 * @memberof F
	 * @param {function} func 실행 함수
	 * @param {object} context 실행 함수 context
	 * @returns {function} context에서 실행할 함수를 반환한다.
	 * @desc 함수의 context를 변경한다.
	 * @example
	 * var obj = {name: 'kim'};
	 * window.name = 'lee';
	 * function getName(){return this.name};
	 * getName(); //return 'lee'
	 * Asdf.F.bind(getName, obj)(); // return 'kim'
	 */
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
		}
	}
		
	/**
	 * @memberof F
	 * @param {function} func 실행 함수
	 * @param {...*=} args 미리 넣을 인자들
	 * @returns {function} func에 미리 인자를 넣은 함수를 반환한다.
	 * @desc 앞부터 인자를 채워 넣는다.
	 * @example
	 * var inc1 = Asdf.F.curry(function(a,b){return a+b;}, 1);
	 * var inc2 = Asdf.F.curry(function(a,b){return a+b;}, 2);
	 * inc1(1); return 2;
	 * inc2(1); return 3; 
	 */
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

	/**
	 * @memberof F
	 * @param {function} func 실행 함수
	 * @param {number} timeout 지연시간(초) 
	 * @returns {*} setTimeoutId를 반환한다.
	 * @desc 실행함수를 지연시간 후에 실행한다. 
	 */
	function delay(func, timeout) {
		if (!$_.O.isFunction(func)) throw new TypeError;
		var __method = func, args = slice.call(arguments, 2);
		timeout = timeout * 1000;
		return window.setTimeout(function() {
			return __method.apply(__method, args);
		}, timeout);
	}
	
	/**
	 * @memberof F
	 * @param {function} func 실행 함수
	 * @returns {*} setTimeoutId를 반환한다.
	 * @desc 실행함수를 0.01초 후에 실행한다. 
	 */
	function defer(func) {
		if (!$_.O.isFunction(func)) throw new TypeError;
		var args = $_.A.merge([ func, 0.01 ], slice.call(arguments, 1));
		return delay.apply(this, args);
	}

	/**
	 * @memberof F
	 * @param {function} func 실행 함수
	 * @param {function} wrapper wrapper 함수 
	 * @returns {function} 실행함수를 wrapper로 감싼 함수를 반환한다.
	 * @desc 실행함수를 wrapper로 감싼 함수를 반환한다. wrapper의 첫번째 인자는 실행 함수 이다.
	 * @example
	 * function fn(a){
	 * 	return -a;
	 * }
	 * Asdf.F.wrap(fn, function(fn, a){ return -fn(a);})(2); //return 2;
	 */
	function wrap(func, wrapper) {
		if (!$_.O.isFunction(func)) throw new TypeError;
		var __method = func;
		return function() {
			var a = $_.A.merge([ bind(__method, this) ], arguments);
			return wrapper.apply(this, a);
		};
	}
	
	/**
	 * @memberof F
	 * @param {function} func 실행 함수
	 * @param {function} pre 이전 실행 함수
	 * @param {boolean} stop 이전 실행 함수의 결과값여부에 따라 실행 함수를 실행여부를 결정 
	 * @returns {function} 이전 실행 함수, 실행 함수를 실행하는 함수를 반환한다.
	 * @desc 이전 실행 함수, 실행 함수를 실행하는 함수를 반환한다.
	 * @example
	 * function b(a){
	 * 	return !a; 
	 * }
	 * function fn(a){
	 * 	return a;
	 * }
	 * Asdf.F.before(fn, b)(true); //return true;
	 */
	function before(func, pre, stop){
		if(!$_.O.isFunction(func)|| !$_.O.isFunction(pre)) throw new TypeError;
		return function () {
			var pres;
			if(!(pres = pre.apply(this,arguments))&&stop) return pres;
			return func.apply(this,arguments);
		};
	}
	
	/**
	 * @memberof F
	 * @param {function} func 실행 함수
	 * @param {function} after 이후 실행 함수
	 * @param {boolean} stop 실행 함수의 결과값여부에 따라 이후 실행 함수를 실행여부를 결정 
	 * @returns {function} 실행 함수, 이후 실행함수를 실행하는 함수를 반환한다.
	 * @desc 실행 함수, 이후 실행함수를 실행하는 함수를 반환한다.
	 * @example
	 * function a(res, a) {
	 * 	return res * 2;
	 * }
	 * function fn(a){
	 * 	return a * a;
	 * }
	 * Asdf.F.after(fn, a)(2); //return 8;
	 */
	function after(func, after, stop){
		if(!$_.O.isFunction(func)||!$_.O.isFunction(after)) throw new TypeError;
		return function() {
			var res = func.apply(this, arguments);
			if(!res && stop) return res;
			return after.apply(this, $_.A.merge([res], arguments));
		};
	}
	
	/**
	 * @memberof F
	 * @param {function} func 실행 함수
	 * @returns {function} 실행 함수 첫번째 인자를 this로 넣은 함수를 반환한다.
	 * @desc 순수 함수를 특정 객체의 매소드로 만들 경우 유용한 함수이다. 이 함수를 실행하면 첫번째 인자에 this를 넣은 함수를 반환한다.
	 * @example
	 * var obj = {name: 'lee'};
	 * function getName(obj){
	 * 	return obj.name;
	 * }
	 * obj.getName = Asdf.F.methodize(getName);
	 * obj.getName(); //return 'lee'
	 */
	function methodize(func) {
		if (func._methodized)
			return func._methodized;
		var __method = func;
		return func._methodized = function() {
			var a = $_.A.merge([ this ], slice.call(arguments,0));
			return __method.apply(null, a);
		}
	}
	
	/**
	 * @memberof F
	 * @param {...function} fns 실행 함수들
	 * @returns {function} 함수들 오른쪽에서 왼쪽으로 실행하는 함수를 반환한다.
	 * @desc 함수들 오른쪽에서 왼쪽으로 실행하는 함수를 반환한다. composeRight(f, g) -> g(f(x))
	 * @example
	 * function fn(a){
	 * 	return a*2;
	 * }
	 * function fn2(a){
	 * 	return a+2;
	 * }
	 * 
	 * Asdf.F.composeRight(fn, fn2)(2); // return 8;
	 */
	function composeRight() {
		var fns = $_.A.filter(slice.call(arguments), $_.O.isFunction);
		var fn = $_.A.reduce(fns, $_.Core.behavior.compose);
		return function () {
			return fn.apply(this, arguments);
		};
	}
	
	/**
	 * @memberof F
	 * @param {...function} fns 실행 함수들
	 * @returns {function} 함수들 오른쪽에서 왼쪽으로 실행하는 함수를 반환한다.
	 * @desc 함수들 오른쪽에서 왼쪽으로 실행하는 함수를 반환한다. compose(f, g) -> f(g(x))
	 * @example
	 * function fn(a){
	 * 	return a*2;
	 * }
	 * function fn2(a){
	 * 	return a+2;
	 * }
	 * 
	 * Asdf.F.compose(fn, fn2)(2); // return 6;
	 */
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
	
	/**
	 * @memberof F
	 * @function
	 * @param {function} func 실행 함수
	 * @param {number} number 제거할 인자 갯수.
	 * @returns {function} 실행 함수에서 number 갯수 인자를 제거한 실행 함수를 반환한다.
	 * @desc 실행 함수에서 number 갯수 인자를 제거한 실행 함수를 반환한다.
	 * @example
	 * function add(a,b){ return a+b; }
	 * var add2 = Asdf.F.extract(fn, 2);
	 * add2(1,2,3,4); // return 7;
	 */
	var extract = before($_.Core.combine.extract, exisFunction);
	
	/**
	 * @memberof F
	 * @function
	 * @param {function} func 실행 함수
	 * @param {...*=} args 미리 넣을 인자들
	 * @returns {function} func에 미리 인자를 넣은 함수를 반환한다.
	 * @desc 특정 위치 부터 미리 인자를 넣은 함수를 반환한다.
	 * @example
	 * var half = Asdf.F.partial(function(a,b){return a/b;}, undefined, 2);
	 * var quater = Asdf.F.partial(function(a,b){return a/b;}, 4);
	 * half(100); // return 50;
	 * quater(100); // return 25;
	 */ 
	var partial = before($_.Core.combine.partial, exisFunction);
	
	/**
	 * @memberof F
	 * @function
	 * @param {...function} fns 실행 함수들
	 * @returns {function} 함수 실행 결과 값 중 하나만 참이면 결과는 참인 함수를 반환한다.
	 * @desc 함수 실행 중에 하나만 참이면 이후 연산은 하지 않고 참인 함수를 반환한다.
	 * @example
	 * Asdf.F.or(Asdf.O.isString, Asdf.O.isFunction, Asdf.O.isArray)('string'); // return true;
	 */
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
	
	/**
	 * @memberof F
	 * @function
	 * @param {...function} fns 실행 함수들
	 * @returns {function} 함수 실행 결과 값 중 하나만 거짓이면 결과는 거짓인 함수를 반환한다.
	 * @desc 함수 실행 중에 하나만 거짓이면 이후 연산은 하지 않고 거짓인 함수를 반환한다.
	 * @example
	 * function fn(a){
	 * 	return a < 10;
	 * }
	 * function fn1(a){
	 * 	return a < 15;
	 * }
	 * function fn2(a){
	 * 	return a < 20;
	 * }
	 * Asdf.F.and(fn, fn1, fn2)(9); // return true;
	 */
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
	var then = partial(after, undefined, undefined, true);
	
	function orElse(func, elseFn, stop){
		if(!$_.O.isFunction(func)||!$_.O.isFunction(elseFn)) throw new TypeError;
		return function() {
			var res = func.apply(this, arguments);
            if(Asdf.O.isNotUndefined(stop)&&stop===res||Asdf.O.isUndefined(stop)&&!res)
                return elseFn.apply(this, arguments);
            return res;


		};
	}
    function guarded(guards){
        if(!Asdf.O.isArray(guards)) throw new TypeError();
        var guardType = {
            test: function(v){return Asdf.O.isFunction(v)},
            fn: function(v){return Asdf.O.isFunction(v)}
        }
        if(!Asdf.A.any(guards, partial(Asdf.O.type, undefined, guardType)))
            throw new TypeError();
        return function(){
            for(var i =0 ; i < guards.length; i++){
                if(guards[i].test.apply(guards[i].context, arguments))
                    return guards[i].fn.apply(guards[i].context, arguments);
            }
            throw new TypeError();
        }
    }
    function sequence() {
        var fns = $_.A.filter(slice.call(arguments), $_.O.isFunction);
        return function(){
            var res = undefined;
            Asdf.A.each(fns, function(f){
                res = f.apply(this, arguments);
            });
            return res;
        }
    }
    function cases(obj, defaults){
        if(!Asdf.O.isPlainObject(obj) || !Asdf.O.isFunction(defaults)) throw new TypeError();
        defaults = defaults || function(){};
        return function(key){
            var arg = slice.call(arguments, 1);
            var fn;
            if(fn = get(obj, key)){
                if(Asdf.O.isFunction(fn)){
                    return fn.apply(this, arg);
                }
                return fn;
            }else {
                return defaults.apply(this, arg);
            }
        }
    }
    var stop = {};
    function overload(fn, typeFn, overloadedFn){
        overloadedFn = overloadedFn||function(){throw new TypeError;};
        var f = function(){
            if(!typeFn.apply(this, arguments)){
                return stop;
            }
            return fn.apply(this, arguments);
        }
        return orElse(f, overloadedFn, stop)
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
		partial: partial,
		or: or,
		and: and,
		then: then,
		orElse: orElse,
        guarded: guarded,
        sequence: sequence,
        cases:cases,
        overload:overload
	}, true);

})(Asdf);/**
 * @project Asdf.js
 * @author N3735
 * @namespace
 * @name A
 */
(function($_) {
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
	
	/**
	 * @memberof A
	 * @param {collection} col collection 객체
	 * @param {function} iterator 실행 함수 인자값으로 value, key, col이 들어간다.
	 * @param {object=} context iterator의 context
	 * @desc collection을 순환하면서 iterator를 실행한다.
	 * @example
	 * Asdf.A.each([1,2,3,4,5], function(n, index){ console.log('index : '+ index + ' / value : ' + n)})
	 * index : 0 / value: 1
	 * index : 1 / value: 2
	 * index : 2 / value: 3
	 * index : 3 / value: 4
	 * index : 4 / value: 5
	 */
	function each(col, iterator, context) {
		if (col == null || $_.O.isNotCollection(col)) throw new TypeError();
		if (nativeForEach && col.forEach === nativeForEach) {
			return col.forEach(iterator, context);
		}
		_each(col, iterator, context);
	}
	
	/**
	 * @memberof A
	 * @param {collection} col collection 객체
	 * @param {function} iterator 실행 함수 인자값으로 value, key, col이 들어간다.
	 * @param {object=} context iterator의 context
	 * @returns {array} collection을 순환 하면서 iterator 실행 결과를 array type으로 반환한다.
	 * @desc collection을 순환하면서 iterator를 실행결과를 반환한다.
	 * @example
	 * Asdf.A.map([1,2,3,4,5], function(n, index){ return n+1 }) //return [2,3,4,5,6]
	 */
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
	
	/**
	 * @memberof A
	 * @param {collection} col collection 객체
	 * @param {function} iterator 실행 함수 인자값으로 value, key, col이 들어간다.
	 * @param {*} memo 초기 값
	 * @param {object=} context iterator의 context
	 * @returns {*} 각 식의 반환 값을 누적한 후, 최종 값을 반환한다.
	 * @desc iterator 반환값을 누적한 후 최종 값을 반환한다.
	 * @example
	 * Asdf.A.reduce([1,2,3], function(a,b){ return a+b; }, 0) //return 6
	 */
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
	
	/**
	 * @memberof A
	 * @param {collection} col collection 객체
	 * @param {function} iterator 실행 함수 인자값으로 value, key, col이 들어간다.
	 * @param {*} memo 초기 값
	 * @param {object=} context iterator의 context
	 * @returns {*} 각 식의 반환 값을 누적한 후, 최종 값을 반환한다.
	 * @desc iterator 반환값을 누적을 오른쪽 부터 시작하여 왼쪽으로 진행한 후 최종 값을 반환한다.
	 * @example
	 * Asdf.A.reduceRight([-1,-2,-3], function(a,b){ return a-b; }, 4) //return 10
	 */
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
	
	/**
	 * @memberof A
	 * @param {collection} first 대상 객체
	 * @param {collection} second 추가 객체
	 * @returns {collection} first에 second를 추가한다.  first 객체를 반환한다.
	 * @desc 두개의 객체를 합치는 것에 대해서는 concat과 유사하지만, 새로운 collection 객체를 생성하여 반환하는 것이 아니라, first 객체에 second 객체를 추가하여 반환하는것이다. 
	 * @example
	 * var a1 = [1,2,3];
	 * var a2 = [4,5,6]
	 * Asdf.A.merge(a1, a2) // return [1,2,3,4,5,6];
	 * console.log(a1) //[1,2,3,4,5,6];
	 */
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
	
	/**
	 * @memberof A
	 * @param {collection} col 대상 객체
	 * @param {number} [n=0] index
	 * @returns {*} col[n]값을 반환한다.
	 * @desc col[n]값을 반환한다.
	 */
	function get(col, n){
		n == null && (n = 0);
		return col[n];
	};
	
	/**
	 * @memberof A
	 * @func
	 * @param {collection} col 대상 객체
	 * @returns {*} col[0]값을 반환한다.
	 * @desc col[0]값을 반환한다.
	 */
	var first = partial(get, undefined, 0);
	
	/**
	 * @memberof A
	 * @func
	 * @param {collection} col 대상 객체
	 * @returns {*} col[col.length-1]값을 반환한다.
	 * @desc col[length-1]값을 반환한다.
	 */
	function last(col) {
		return col[col.length-1];
	}
	
	/**
	 * @memberof A
	 * @func
	 * @param {collection} col 대상 객체
	 * @param {function} iterator 실행 함수 인자값으로 value, key, col이 들어간다.
	 * @param {object=} context iterator의 context
	 * @returns {array} iterator실행이 참으로 만족하는 값만 추출하여 반환한다. 
	 * @desc context에서 iterator 실행이 참으로 만족하는 값만 반환한다. iterator에 인자값은 value, index, col가 들어간다.
	 * @example
	 * Asdf.A.filter([1, 2, 3, 4, 5, 6], function(n, index){return n > 3; }) //return [4,5,6];
	 */
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
	/**
	 * @memberof A
	 * @func
	 * @param {collection} col 대상 객체
	 * @param {function} iterator 실행 함수 인자값으로 value, key, col이 들어간다.
	 * @param {object=} context iterator의 context
	 * @returns {array} iterator실행이 거짓으로 만족하는 값만 추출하여 반환한다. 
	 * @desc context에서 iterator 실행이 거짓으로 만족하는 값만 반환한다. iterator에 인자값은 value, index, col가 들어간다.
	 * @example
	 * Asdf.A.reject([1, 2, 3, 4, 5, 6], function(n, index){return n > 3; }) //return [1,2,3];
	 */
	function reject(col, iterator, context) {
		return filter(col, not(iterator), context);
	}
	
	/**
	 * @memberof A
	 * @func
	 * @param {collection} col 대상 객체
	 * @param {function} iterator 실행 함수 인자값으로 value, key, col이 들어간다.
	 * @param {object=} context iterator의 context
	 * @returns {boolean} iterator실행이 결과가 모두 참인 경우 참을 반환한다. 
	 * @desc context에서 iterator 실행이 모두 참인 경우 참으로 반환한다. iterator에 인자값은 value, index, col가 들어간다.
	 * @example
	 * Asdf.A.every([1, 2, 3, 4, 5, 6], function(n, index){return n > 3; }) //return false;
	 */
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
	
	/**
	 * @memberof A
	 * @func
	 * @param {collection} col 대상 객체
	 * @param {function} iterator 실행 함수 인자값으로 value, key, col이 들어간다.
	 * @param {object=} context iterator의 context
	 * @returns {boolean} iterator실행이 결과가 하나 이상 참인 경우 참을 반환한다. 
	 * @desc context에서 iterator 실행이 하나 이상 참인 경우 참으로 반환한다. iterator에 인자값은 value, index, col가 들어간다.
	 * @example
	 * Asdf.A.any([1, 2, 3, 4, 5, 6], function(n, index){return n > 3; }) //return true;
	 */
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
	
	/**
	 * @memberof A
	 * @func
	 * @param {collection} col 대상 객체
	 * @param {*} target 비교 값
	 * @returns {boolean} col 안에 target이 존재 하면 true를 반환한다. 
	 * @desc col안에 target이 존재 하면 true를 반환한다.
	 * @example
	 * Asdf.A.include([1, 2, 3, 4, 5, 6], 1) //return true;
	 */
	function include(col, target) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		if (nativeIndexOf && col.indexOf === nativeIndexOf)
			return col.indexOf(target) != -1;
		return any(col, function(value) {
			return value === target;
		});
	}
	
	/**
	 * @memberof A
	 * @func
	 * @param {collection} col 대상 객체
	 * @param {(string|function)} method 이름 또는 function
	 * @param {...*=} arg method에 들어갈 인자 값
	 * @returns {array} collection 객체에 method를 실행한 결과를 array Type으로 반환한다. 
	 * @desc 각각의 collection객체 안을 순환하면서 method를 실행하고 그 결과를 반환한다.  
	 * @example
	 * Asdf.A.invode([[3,1,2],['c','b','a']], 'sort') //return [[1,2,3],['a','b','c']];
	 */
	function invoke(col, method) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		var args = slice.call(arguments, 2);
		return map(col, function(obj) {
			return ($_.O.isFunction(method) ? method : $_.O.isFunction(obj[method])? obj[method]: function() {return obj[method];}).apply(obj, args);
		});
	}
	
	/**
	 * @memberof A
	 * @func
	 * @param {collection} col 대상 객체
	 * @param {string} key
	 * @returns {array} collection 객체에서 key값을 추출하여 반환한다. 
	 * @desc 각각의 collection객체 안을 순환하면서 각각의 객체의 key값을 추출하여 반환한다.
	 * @example
	 * Asdf.A.pluck([[1, 2, 3, 4, 5, 6], [1,2,3]], 'length') //return [6,3]
	 */
	function pluck(col, key) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		return map(col, function(obj){ return obj[key]; });
	}
	/**
	 * @memberof A
	 * @func
	 * @param {collection} col 대상 객체
	 * @param {function=} iterator
	 * @param {object=} context
	 * @returns {*} collection 에서 가장 큰 값을 반환한다. 
	 * @desc collection에서 가장 큰 값을 반환한다. 단 iterator가 정의 되어 있으면 해당 iterator를 실행하고 그 결과가 가장 큰 값을 반환한다.
	 * @example
	 * Asdf.A.max([1, 2, 3, 4, 5, 6], function(v){ return -v;}) //return 1
	 */
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
	
	/**
	 * @memberof A
	 * @func
	 * @param {collection} col 대상 객체
	 * @param {function=} iterator
	 * @param {object=} context
	 * @returns {*} collection 에서 가장 작은 값을 반환한다. 
	 * @desc collection에서 가장 작은 값을 반환한다. 단 iterator가 정의 되어 있으면 해당 iterator를 실행하고 그 결과가 가장 작은 값을 반환한다.
	 * @example
	 * Asdf.A.min([1, 2, 3, 4, 5, 6], function(v){ return -v;}) //return 6
	 */
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
	
	/**
	 * @memberof A
	 * @func
	 * @param {collection} col 대상 객체
	 * @returns {array} 대상객체를 섞은 후 반환한다. 
	 * @desc 대상 객체를 섞은 후 반환한다.
	 * @example
	 * Asdf.A.shuffle([1, 2, 3, 4, 5, 6]) //return [3, 1, 4, 2, 5, 6]
	 */
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
	
	/**
	 * @memberof A
	 * @func
	 * @param {array} arr 대상 객체
	 * @param {function=} sort 정렬 함수
	 * @returns {array} 대상 객체를 sort함수에 맞춰 정렬 한 후 array 객체를 반환한다. 
	 * @desc 대상 객체를 정렬한다. sort 함수를 생략 시 정렬의 기본 sort를 실행한다.
	 * @example
	 * Asdf.A.sort([2,1,3]) //return [1,2,3]
	 */
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
	
	/**
	 * @memberof A
	 * @func
	 * @param {array} arr 대상 객체
	 * @param {string} key key값
	 * @param {function=} sort 정렬 함수
	 * @returns {array} 특정 key값으로 정렬한 후 결과 값을 반환한다. 
	 * @desc arr안에 객체를 key 값을 기준으로 정렬한다. sort함수가 없는 경우 오름차순으로 정렬한다.
	 * @example
	 * Asdf.A.sortBy([[3,1],[4],[2,6,3]], 'length') //return [[4],[3,1],[2,6,3]]
	 */
	function sortBy(arr, key, order) {
		if($_.O.isNotArray(arr)||$_.O.isNotString(key)) throw new TypeError();
		order = order || asc;
		return sort(arr, function(a, b){return order(a[key], b[key]);});
	}
	
	/**
	 * @memberof A
	 * @func
	 * @param {collection} col 대상 객체
	 * @param {(string|function)} key key값 또는 처리 함수 값
	 * @param {object=} context 함수 시 실행 context
	 * @returns {object} 특정 key값으로 정렬한 후 결과 값을 반환한다. 
	 * @desc arr 객체를 key를 통해 그룹을 만든다.
	 * @example
	 * Asdf.A.groupBy([1.3, 2.1, 2.4], function(num){ return Math.floor(num); }); //return {1:[1.3],2:[2.1,2,4]}
	 */
	function groupBy(col,key) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		if (!($_.O.isString(key)||$_.O.isFunction(key)))
			throw new TypeError();
		var result = {};
		each(col, function(value, index, list) {
			var k = ($_.O.isFunction(key))? key(value):value[key];
			(result[k] || (result[k] = [])).push(value);
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
	
	/**
	 * @memberof A
	 * @func
	 * @param {collection} col 대상 객체
	 * @returns {array} array를 반환한다. 
	 * @desc collection 객체를 받아서 array객체로 변환한다.
	 */
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
	
	/**
	 * @memberof A
	 * @func
	 * @param {collection} col 대상 객체
	 * @returns {number} col.length를 반환한다.
	 * @desc collection 객체를 받아서 length를 변환한다.
	 */
	function size(col) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		return col.length;
	}
	
	/**
	 * @memberof A
	 * @func
	 * @param {array} array 대상 객체
	 * @returns {array} 빈 대상 객체를 반환한다.
	 * @desc array.length가 0인 빈 array를 반환한다.
	 */
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
	
	/**
	 * @memberof A
	 * @func
	 * @param {array} array 대상 객체
	 * @param {number} [n=1] 버릴 갯수
	 * @returns {array} 앞부터 n개를 버린 array를 반환한다.
	 * @desc array에서 n부터 나머지 array를 반환한다.
	 */
	function rest(array, n){
		if($_.O.isNotArray(array)) throw new TypeError();
		n == null && (n=1);
		return slice.call(array, n);
	}
	
	/**
	 * @memberof A
	 * @func
	 * @param {array} array 대상 객체
	 * @returns {array} ==false인 values를 제거하고 나머지 array를 반환한다.
	 * @desc ==false('',0,null,undefined,false..)인 values을 제거한 array를 반환한다.
	 * @example
	 * Asdf.A.compact([1,null,undefined, false, '', 4]); //return [1,4]
	 */
	function compact(array) {
		if($_.O.isNotArray(array)) throw new TypeError();
		return filter(array, function(value){ return !!value; });
	}
	
	/**
	 * @memberof A
	 * @func
	 * @param {array} array 대상 객체
	 * @param {boolean=} shallow deep여부 false면 deep 
	 * @returns {array} array를 평탄하게 하여 반환한다.
	 * @desc ==false('',0,null,undefined,false..)인 values을 제거한 array를 반환한다.
	 * @example
	 * Asdf.A.flatten([1,[2],[3,[4]]]); //return [1,2,3,4]
	 * Asdf.A.flatten([1,[2],[3,[4]]], true); //return [1,2,3,[4]]
	 */
	function flatten(array, shallow) {
		if($_.O.isNotArray(array)) throw new TypeError();
		return reduce(array, function(memo, value) {
		      if ($_.O.isArray(value)) return memo.concat(shallow ? value : flatten(value));
		      memo[memo.length] = value;
		      return memo;
		    }, []);
	}
	
	/**
	 * @memberof A
	 * @func
	 * @param {array} array 대상 객체
	 * @param {...*=} values 대상 객체
	 * @returns {array} array에서 value를 제거한 리스트를 리턴한다.
	 * @desc array에서 values와 ===참인 값을 제거하여 array를 반환한다.
	 * @example
	 * Asdf.A.without([1,2,3],1,2); //return [3]
	 */
	function without(array) {
		if($_.O.isNotArray(array)) throw new TypeError();
		return difference(array, slice.call(arguments, 1));
	}
	
	/**
	 * @memberof A
	 * @func
	 * @param {array} array 대상 객체
	 * @param {boolean=} isSorted 정렬 여부
	 * @param {function=} iterator 변형 함수
	 * @returns {array} array에 있는 값 중 중복된 값을 제거한 후 array를 반환한다.
	 * @desc array에서 iterator변형 함수가 존재하면 값을 변형한 후 중복된 값을 제거한다.
	 * @example
	 * Asdf.A.unique([1,2,1]); //return [1,2]
	 */
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
	
	/**
	 * @memberof A
	 * @func
	 * @param {...array} array 대상 객체
	 * @returns {array} array들의 합집합을 반환한다.
	 * @desc array들의 합집합을 반환한다.
	 * @example
	 * Asdf.A.union([1,2,3],[3,4,5],[1,6]); //return [1,2,3,4,5,6];
	 */
	function union() {
		 return unique(flatten(arguments, true));
	}
	
	/**
	 * @memberof A
	 * @func
	 * @param {...array} array 대상 객체
	 * @returns {array} array들의 교집합을 반환한다.
	 * @desc array들의 교집합을 반환한다.
	 * @example
	 * Asdf.A.intersection([1,2,3],[1,6]); //return [1];
	 */
	function intersection(array) {
		var rest = slice.call(arguments, 1);
		return filter(unique(array), function(item) {
			return every(rest, function(other) {
				return indexOf(other, item) >= 0;
			});
		});
	}
	
	/**
	 * @memberof A
	 * @func
	 * @param {array} array 대상 객체
	 * @param {...array} others array 객체
	 * @returns {array} array에서 others의 차집합을 반환한다.
	 * @desc array에서 others의 차집합을 반환한다.
	 * @example
	 * Asdf.A.difference([1,2,3],[3,4,5],[1,6]); //return [2];
	 */
	function difference(array) {
		var rest = flatten(slice.call(arguments, 1), true);
	    return filter(array, function(value){ return !include(rest, value); });
	}
	
	/**
	 * @memberof A
	 * @func
	 * @param {...array} array 대상 객체들
	 * @returns {array} 대상 객체들이 합쳐친 array 객체를 반환한다.
	 * @desc 같은 position에 있는 값을 합쳐서 array로 반환한다.
	 * @example
	 * Asdf.A.zip([1,2,3],[3,4,5],[1,6]); //return [[1,3,1], [2,4,6], [3,5, undefined]];
	 */
	function zip() {
		var args = slice.call(arguments);
	    var length = max(pluck(args, 'length'));
	    var results = new Array(length);
	    for (var i = 0; i < length; i++) results[i] = pluck(args, "" + i);
	    return results;
	}
	
	/**
	 * @memberof A
	 * @func
	 * @param {array} array 대상 객체
	 * @param {*} item 찾는 값
	 * @param {boolean} isSorted 정렬 여부
	 * @returns {numbers} array에서 item값을 찾아 그 위치를 반환한다.
	 * @desc array에서 item 위치를 앞부터 찾아서 그 위치를 반환한다. 만약 없을 경우 -1을 반환한다.
	 * @example
	 * Asdf.A.indexOf([1,2,3,4,2], 2); //return 1;
	 */
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
	
	/**
	 * @memberof A
	 * @func
	 * @param {array} array 대상 객체
	 * @param {*} item 찾는 값
	 * @param {boolean} isSorted 정렬 여부
	 * @returns {numbers} array에서 item값을 찾아 그 위치를 반환한다.
	 * @desc array에서 item 위치를 뒤부터 찾아서 그 위치를 반환한다. 만약 없을 경우 -1을 반환한다.
	 * @example
	 * Asdf.A.lastIndexOf([1,2,3,4,2], 2); //return 4;
	 */
	function lastIndexOf(array, item) {
		if (array == null) return -1;
	    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
	    var i = array.length;
	    while (i--) if (i in array && array[i] === item) return i;
	    return -1;
	}
	
	/**
	 * @memberof A
	 * @func
	 * @param {array} array 대상 객체
	 * @param {array} fns [function1, functio2..]
	 * @returns {array} [fns[0](array[0]), fns[1](array[1]),...]을 반환한다.
	 * @desc {array} [fns[0](array[0]), fns[1](array[1],...]을 반환한다.
	 * @example
	 * Asdf.A.batch([1,2,3,4], [function(a){return a-1}, function(a){return a*2}]); //return [0,4,3,4];
	 */
	function batch(array, fns){
		if($_.O.isNotArray(array)) throw new TypeError();
		return map(array, function(value, i){
			return ($_.O.isFunction(fns[i]))? fns[i](value): value;
		});
	}
	
	/**
	 * @memberof A
	 * @func
	 * @param {array} array 대상 객체
	 * @param {function} fn 실행 함수
	 * @desc {array} array를 fn의 인자값으로 사용한다.
	 * @example
	 * Asdf.A.batch([1,2,3,4], [function(a){return a-1}, function(a){return a*2}]); //return [0,4,3,4];
	 */
	function toArguments(array, fn, context){
		if($_.O.isNotArray(array)||$_.O.isNotFunction(fn)) throw new TypeError();
		return fn.apply(context, array);
	}

    function contains(array, item){
        return indexOf(array, item) >= 0;
    }

    function concat(array){
        return arrayProto.concat.apply(arrayProto, arguments);
    }

    function count(array, fn, context){
        var res = 0;
        each(array, function(v, i, l){
           if(fn.call(context, v, i, l))
            ++res;
        });
        return res;
    }

    function repeat(value, n, args){
        var arr = [];
        for(var i = 0 ;  i < n ; i++){
            arr[i] = Asdf.O.isFunction(value)? value.apply(this,slice.call(arguments, 2)):value;
        }
        return arr;
    }

    function rotate(array, n){
        if(Asdf.O.isNotArray(array)||Asdf.O.isNotNumber(n)) throw new TypeError();
        n %= array.length;
        if(n>0){
            arrayProto.unshift.apply(array, array.splice(-n, n));
        }else if(n<0){
            arrayProto.push.apply(array, array.splice(0, -n));
        }
        return array;
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
		toArguments:toArguments,
        contains: contains,
        concat: concat,
        count: count,
        repeat:repeat,
        rotate: rotate
	}, true);
})(Asdf);/**
 * @project Asdf.js
 * @author N3735
 * @namespace
 * @name S
 */
(function($_) {
	$_.S = {};
	var ScriptFragment = '<script[^>]*>([\\S\\s]*?)<\/script>';
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @param {number} [length=30] 축약할 글자 수
	 * @param {string} [truncation=...] 축약 시 추가될 문자열 
	 * @returns {string} 대상 문자열을 특정 크기로 자른 후 결과를 반환한다.
	 * @desc 문자열을 크기가 length보다 클 경우 문자열을 해당 length 크기로 맞춘다. 
	 * @example
	 * Asdf.S.truncate('abcdefghijkl', 5, '...'); // return 'ab...'
	 * 
	 */
	function truncate(str, length, truncation) {
		if(!$_.O.isString(str)) throw new TypeError();
		length = length || 30;
		truncation = $_.O.isUndefined(truncation) ? '...' : truncation;
		return str.length > length ?
		str.slice(0, length - truncation.length) + truncation : str;
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @returns {string} str 앞뒤 공백 문자를 제거한다.
	 * @desc str 앞 뒤 공백 문자를 제거한다. 
	 * @example
	 * Asdf.S.trim('  ab c   '); // return 'ab c'
	 * 
	 */
	function trim(str) {
		if(!$_.O.isString(str)) throw new TypeError();
		return str.replace(/^\s+/, '').replace(/\s+$/, '');
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @returns {string} str에 태그를 제거한다. 
	 * @desc str에 태그를 제거한다.  
	 * @example
	 * Asdf.S.stripTags('a <a href="#">link</a><script>alert("hello world!");</script>'); // return 'a linkalert("hello world!");'
	 * 
	 */
	function stripTags(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @returns {string} str에 script태그를 제거한다. 
	 * @desc str에 script태그를 제거한다.  
	 * @example
	 * Asdf.S.stripScripts('a <a href="#">link</a><script>alert("hello world!");</script>'); // return 'a <a href="#">link</a>'
	 * 
	 */
	function stripScripts(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(new RegExp(ScriptFragment, 'img'), '');
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @returns {string} html에 출력 가능한 문자로 변경하여 반환한다.
	 * @desc str에 있는 특정 문자를 <, >, &를 화면에 출력 가능하게 변경한다.  
	 * @example
	 * Asdf.S.escapeHTML('a <a href="#">link</a>'); // return 'a &lt;a href="#"&gt;link&lt;/a&gt;'
	 * 
	 */
	function escapeHTML(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @returns {string} str문자를 html 문자로 변경한다.
	 * @desc str에 있는 특정 문자를 <, >, &를 html문자로 변경한다. escapeHTML와 반대.  
	 * @example
	 * Asdf.S.unescapeHTML('a &lt;a href="#"&gt;link&lt;/a&gt;'); // return 'a <a href="#">link</a>'
	 * 
	 */
	function unescapeHTML(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return stripTags(str).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
	}
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @param {string} [separator=&] 값들 간의 구분자
	 * @param {string} [sepKV==] key value 구분자
	 * @returns {object} 대상 문자열을 object로 변환한다.
	 * @desc 대상 문자열을 object로 변환한다.  
	 * @example
	 * Asdf.S.toQueryParams('a=1&a=2&b=3&c=4'); // return {a:[1,2],b:3,c:4};
	 * 
	 */
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
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @returns {array} 대상 문자열을 array로 변환한다.
	 * @desc 대상 문자열을 array로 변환한다.  
	 * @example
	 * Asdf.S.toArray('abc'); // return ['a','b','c'];
	 * 
	 */
	function toArray(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.split('');
	}
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @returns {string} 다음 문자열을 반환한다.
	 * @desc keycode가 다음인 문자열을 반환한다.
	 * @example
	 * Asdf.S.succ('a'); // return 'b';
	 * 
	 */
	function succ(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.slice(0, str.length - 1) +
	      String.fromCharCode(str.charCodeAt(str.length - 1) + 1);
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @param {number} count 대상 문자열 횟수
	 * @returns {string} 대상 문자열을 count 횟수 만큼 반복하여 반환한다.
	 * @desc 대상 문자열을 count 횟수 만큼 반복하여 반환한다.
	 * @example
	 * Asdf.S.times('abc',3); // return 'abcabcabc'
	 * 
	 */
	function times(str, count) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return count < 1 ? '' : new Array(count + 1).join(str);
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @returns {string} background-color -> backgroundColor.
	 * @desc -를 없애고 다음 문자를 대문자로 변경한다.
	 * @example
	 * Asdf.S.camelize('background-color'); // return 'backgroundColor'
	 * 
	 */
	function camelize(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(/-+(.)?/g, function(match, chr) {
	      return chr ? chr.toUpperCase() : '';
	    });
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @returns {string} background -> Background.
	 * @desc 첫문자를 대문자로 이후 문자를 소문자로 바꾼다.
	 * @example
	 * Asdf.S.capitalize('background'); // return 'Background'
	 * 
	 */
	function capitalize(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @returns {string} backgroundColor -> background_color
	 * @desc 대문자 앞에 _변경하고 대문자를 소문자로 바꾸어 반환한다.
	 * @example
	 * Asdf.S.underscore('backgroundColor'); // return 'background_color'
	 * 
	 */
	function underscore(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(/::/g, '/')
	               .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
	               .replace(/([a-z\d])([A-Z])/g, '$1_$2')
	               .replace(/-/g, '_')
	               .toLowerCase();
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @returns {string} background_color -> background-color
	 * @desc _를 -로 변경한다.
	 * @example
	 * Asdf.S.dasherize('background_color'); // return 'background-color'
	 * 
	 */
	function dasherize(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(/_/g, '-');
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @param {string} pattern 찾는 문자열
	 * @returns {boolean} 대상 문자열에 찾는 문자열이 있으면 true를 반환한다.
	 * @desc 대상 문자열에 찾는 문자열이 있으면 true를 반환한다.
	 * @example
	 * Asdf.S.include('background_color', 'or'); // return true;
	 * 
	 */
	function include(str, pattern) {
		if(!$_.O.isString(str)||!$_.O.isString(pattern)) throw new TypeError();
	    return str.indexOf(pattern) > -1;
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @param {string} pattern 찾는 문자열
	 * @returns {boolean} 대상 문자열 앞에 찾는 문자열이 있으면 true를 반환한다.
	 * @desc 대상 문자열 앞에 찾는 문자열이 있으면 true를 반환한다.
	 * @example
	 * Asdf.S.startsWith('background_color', 'back'); // return true;
	 * 
	 */
	function startsWith(str, pattern) {
		if(!$_.O.isString(str)||!$_.O.isString(pattern)) throw new TypeError();
	    return str.lastIndexOf(pattern, 0) === 0;
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @param {string} pattern 찾는 문자열
	 * @returns {boolean} 대상 문자열 마지막에 찾는 문자열이 있으면 true를 반환한다.
	 * @desc 대상 문자열 마지막에 찾는 문자열이 있으면 true를 반환한다.
	 * @example
	 * Asdf.S.endsWith('background_color', 'color'); // return true;
	 * 
	 */
	function endsWith(str, pattern) {
		if(!$_.O.isString(str)||!$_.O.isString(pattern)) throw new TypeError();
	    var d = str.length - pattern.length;
	    return d >= 0 && str.indexOf(pattern, d) === d;
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @returns {boolean} 대상 문자열이 빈값이면 true를 반환한다.
	 * @desc 대상 문자열이 빈값이면 true를 반환한다.
	 * @example
	 * Asdf.S.isEmpty(''); // return true;
	 * 
	 */
	function isEmpty(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str == '';
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @returns {boolean} 대상 문자열이 빈 값 또는 공백 문자일 경우 true를 반환한다.
	 * @desc 대상 문자열이 빈 값 또는 공백 문자일 경우 true를 반환한다.
	 * @example
	 * Asdf.S.isBlank(' '); // return true;
	 * 
	 */
	function isBlank(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return /^\s*$/.test(str);
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @returns {node} 대상 문자열을 node로 변경한다.
	 * @desc 대상 문자열을 node로 변경한다.
	 * @example
	 * Asdf.S.toElement('<div id='abc'>abc</div> '); // return <div id='abc'>abc</div>;
	 * 
	 */
	function toElement(str){
		if(!$_.O.isString(str)) throw new TypeError();
		var el = document.createElement('div');
		el.innerHTML = str;
		return el.firstChild;
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @returns {documentFragment} 대상 문자열을 element로 변경 한 후 그 element를 documentFragment에 넣어서 반환한다.
	 * @desc 대상 문자열을 element로 변경 한 후 그 element를 documentFragment에 넣어서 반환한다.
	 * 
	 */
	function toDocumentFragment(str) {
		if(!$_.O.isString(str)) throw new TypeError();
		var el = document.createElement('div'), frg = document.createDocumentFragment();
		el.innerHTML = str;
		while(el.childNodes.length) frg.appendChild(el.childNodes[0]);
		return frg;	
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @param {string] padStr 추가할 문자열
	 * @param {number} length 만들 문자열 길이
	 * @returns {string} 대상 문자열에 왼쪽에 추가 문자열을 넣어 length만큼 길이를 만들어서 반환한다. 
	 * @desc 대상 문자열에 왼쪽에 추가 문자열을 넣어 length만큼 길이를 만들어서 반환한다. 
	 * @example
	 * Asdf.S.lpad('1', '0', 4); // return '0001';
	 * 
	 */
	function lpad(str, padStr, length){
		if(!$_.O.isString(str) || !$_.O.isNumber(length)) throw new TypeError();
		return (new Array(length+1).join(padStr)+str).slice(-length);
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @param {string] padStr 추가할 문자열
	 * @param {number} length 만들 문자열 길이
	 * @returns {string} 대상 문자열에 오른쪽에 추가 문자열을 넣어 length만큼 길이를 만들어서 반환한다. 
	 * @desc 대상 문자열에 오른쪽쪽에 추가 문자열을 넣어 length만큼 길이를 만들어서 반환한다. 
	 * @example
	 * Asdf.S.rpad('1', '0', 4); // return '1000';
	 * 
	 */
	function rpad(str, padStr, length){
		if(!$_.O.isString(str) || !$_.O.isNumber(length)) throw new TypeError();
		return (str + new Array(length+1).join(padStr)).slice(0,length);
	}
	
	/**
	 * @memberof S
	 * @param {string} str 대상 문자열
	 * @param {regexp} reg 정규 표현식
	 * @returns {template} template
	 * @desc template 객체를 반환한다. template.set(1, 'abc');... template.toString(); 
	 * @example
	 * var t = Asdf.S.template('aa ? bb ? cc ?', /\?/g);
	 * t.set(1, 'bbb');
	 * t.set(2, 'ccc');
	 * t.set(3, 'ddd');
	 * t.toString(); // return 'aa bbb bb ccc cc ddd';
	 * 
	 * var t1 = Asdf.S.template('aa {{AA}} bb {{BB}} cc {{CC}}');
	 * t1.set('AA', 'bbb');
	 * t1.set('BB', 'ccc');
	 * t1.set(3, 'ddd');
	 * t1.toString(); // return 'aa bbb bb ccc cc ddd';
	 * 
	 * var t2 = Asdf.S.template('aa {{AA}} bb {{BB}} cc {{CC}}');
	 * var obj = {AA: 'bbb', BB:'ccc', CC: 'ddd'};
	 * t2.set(obj);
	 * 
	 * var t3 = Asdf.S.template('aa <?AA?> bb <?BB?> cc <?CC?>', /\<\?([\s\S]+?)\?\>/g);
	 * t3.set(1, 'bbb');
	 * t3.set(2, 'ccc');
	 * t3.set(3, 'ddd');
	 * t3.toString(); // return 'aa bbb bb ccc cc ddd'
	 */
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

    function compareVersion(version1, version2, compareFn){
        compareFn = compareFn||compare;
        var order = 0;
        var v1Subs = trim(String(version1)).split('.');
        var v2Subs = trim(String(version2)).split('.');
        var subCount = Math.max(v1Subs.length, v2Subs.length);
        for (var subIdx = 0; order == 0 && subIdx < subCount; subIdx++) {
            var v1Sub = v1Subs[subIdx] || '';
            var v2Sub = v2Subs[subIdx] || '';
            var v1CompParser = new RegExp('(\\d*)(\\D*)', 'g');
            var v2CompParser = new RegExp('(\\d*)(\\D*)', 'g');
            do {
                var v1Comp = v1CompParser.exec(v1Sub) || ['', '', ''];
                var v2Comp = v2CompParser.exec(v2Sub) || ['', '', ''];
                if (v1Comp[0].length == 0 && v2Comp[0].length == 0) {
                    break;
                }
                var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
                var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);
                order = compareFn(v1CompNum, v2CompNum) ||
                    compareFn(v1Comp[2].length == 0, v2Comp[2].length == 0) ||
                    compareFn(v1Comp[2], v2Comp[2]);
            } while (order == 0);
        }

        return order;
    }

    function compare(a,b){
        if(a<b)
            return -1;
        else if(a>b)
            return 1;
        return 0;
    }
	$_.O.extend($_.S, {
		truncate: truncate,
		trim: trim,
		stripTags: stripTags,
		stripScripts: stripScripts,
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
		template:template,
        compareVersion: compareVersion
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
	}
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
        var browser = match[1] || "";
        var version = match[2] || "0";
        var documentMode =  browser != 'msie'? undefined : document.documentMode || (document.compatMode == 'CSS1Compat'? parseInt(this.version,10) : 5);
		return {
			browser : browser,
			version : version,
            documentMode:documentMode
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
		})(),

        CanAddNameOrTypeAttributes : Browser.browser != 'msie' || Browser.documentMode >= 9,

        CanUseChildrenAttribute : Browser.browser != 'msie' && Browser.browser != 'mozilla' ||
            Browser.browser == 'msie' && Browser.documentMode >= 9 ||
            Browser.browser == 'mozilla' && Asdf.S.compareVersion(Browser.version, '1.9.1') >=0,
        CanUseParentElementProperty : Browser.browser == 'msie' || Browser.browser == 'opera' || Browser.browser == 'webkit'
	};
    var browserMap = {
        'firefox' : 'mozilla',
        'ff': 'mozilla',
        'ie': 'msie'
    }
    function isBrowser(browser){
        if(!Asdf.O.isString(browser)) throw new TypeError()
        return (browserMap[browser.toLowerCase()]||browser.toLowerCase()) == Browser.browser
    }
    function compareVersion(version){
        return Asdf.S.compareVersion(Browser.version, version);
    }
	$_.O.extend($_.Bom, {
        isBrowser: isBrowser,
        compareVersion: compareVersion,
		browser : Browser.browser,
		version: Browser.version,
        documentMode: Browser.documentMode,
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
})(Asdf);/**
 * @project Asdf.js
 * @author N3735
 * @namespace Element
 */
(function($_) {
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
    /**
     * @memberof Element
     * @param {element} element 대상element
     * @param {function} fun 실행 함수
     * @param {object=} context 실행 함수 context
     * @returns {element} 대상 element
     * @desc 대상element를 포함하여 자식들을 돌면서 실행 함수를 실행한다. 실행함수의 첫 번째 인자로 element가 들어간다.
     * @example
     * //element = <div>aa<div>bb</div><div>cc</div></div>
     * Asdf.Element.walk(e, Asdf.F.partial(Asdf.Element.addClass, undefined, '11'));
     * //return <div class="11">aa<div class="11">bb</div><div class="11">cc</div></div>
     */
	function walk(element, fun, context) {
		context = context || this;
		var i, childNodes = $_.A.toArray(element.childNodes);
		fun.call(context, element);
		for (i = 0; i < childNodes.length ; i++) {
			walk(childNodes[i], fun, context);
		}
		return element;
	}
    /**
     * @memberof Element
     * @param {element} element 대상element
     * @returns {boolean} boolean
     * @desc element가 display가 none 여부를 반환한다.
     *
     */
	function visible(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		return element.style.display !='none';
	}
    /**
     * @memberof Element
     * @param {element} element 대상element
     * @returns {element} 대상 element
     * @desc visible(element)가 true면 hide를 실행하고 false면 show를 실행한다.
     * @example
     * var div = document.createElement('div');
     * Asdf.Element.toggle(div);
     * Asdf.Element.visible(div); //return false;
     */
	function toggle(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
	    visible(element) ? hide(element) : show(element);
	    return element;
	}
    /**
     * @memberof Element
     * @param {element} element 대상element
     * @returns {element} 대상 element
     * @desc 대상 element를 style.display를 'none'으로 변경 한다.
     * @example
     * var div = document.createElement('div');
     * Asdf.Element.hide(div);
     * Asdf.Element.visible(div); //return false;
     */
	function hide(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		element.style.display = 'none';
	    return element;
	}
    /**
     * @memberof Element
     * @param {element} element 대상element
     * @returns {element} 대상 element
     * @desc 대상 element를 style.display를 ''으로 변경 한다.
     * @example
     * var div = document.createElement('div');
     * Asdf.Element.hide(div);
     * Asdf.Element.visible(div); //return false;
     * Asdf.Element.show(div);
     * Asdf.Element.visible(div); //return true;
     */
	function show(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		 element.style.display = '';
		 return element;
	}
    /**
     * @memberof Element
     * @param {element} element 대상element
     * @param {string=} value element에 넣을 문자열
     * @returns {element|string} value값이 존재하면 element를 반환하고 value값이 존재 하지 않으면 text값을 반환하다.
     * @desc value가 존재 하면 element에 해당 value를 넣고 value가 존재하지 않으면 해당 element의 text값을 반환한다.
     * @example
     * var div = document.createElement('div');
     * Asdf.Element.text(div, 'hi'); //return <div>hi</div>
     * Asdf.Element.text(div); //return "hi";
     */
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
            return element;
		}
	}
    /**
     * @memberof Element
     * @param {element} element 대상element
     * @param {string=} value value값
     * @returns {element|string} value값이 존재하면 element를 반환하고 value값이 존재 하지 않으면 value값을 반환하다.
     * @desc value가 존재 하면 element.value에 해당 value를 넣고 value가 존재하지 않으면 element.valvue 값을 반환한다.
     * @example
     * var input = document.createElement('input');
     * Asdf.Element.value(input, 'hi');
     * Asdf.Element.value(input); //return "hi";
     */
	function value(element, value) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return (value==null)? element.value : (element.value = value, element);
	}
    /**
     * @memberof Element
     * @param {element} element 대상element
     * @param {string=} html html값
     * @returns {element|string} html값이 존재하면 element를 반환하고 html값이 존재 하지 않으면 innerHTML값을 반환하다.
     * @desc html가 존재 하면 element.innerHTML에 해당 html를 넣고 html가 존재하지 않으면 element.innerHTML 값을 반환한다.
     * @example
     * var div = document.createElement('div');
     * Asdf.Element.html(div, 'hi'); //return <div>hi</div>
     * Asdf.Element.html(div); //return "hi";
     */
	function html(element, html) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return (html==null)? element.innerHTML: (element.innerHTML = html, element);
	}
    /**
     * @memberof Element
     * @param {element} element 대상element
     * @returns {element} 대상element parentNode를 반환한다.
     * @desc 대상element parentNode를 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * p.appendChild(c);
     * Asdf.Element.parent(c); //return p;
     */
	function parent(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursively(element, 'parentNode');
	}
    /**
     * @memberof Element
     * @param {element} element 대상element
     * @param {element=} until 최종element
     * @returns {array} 대상element에서 최종element까지 모든 조상을 array로 반환한다.
     * @desc 대상element에서 최종element까지 모든 조상을 array로 반환한다.
     * @example
     * var pp = document.createElement('div');
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * pp.appendChild(p);
     * p.appendChild(c);
     * Asdf.Element.parents(c); //return [p, pp];
     * Asdf.Element.parents(c, p); //return [p];
     */
	function parents(element, until) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		 return recursivelyCollect(element, 'parentNode', until);
	}
    /**
     * @memberof Element
     * @param {element} element 대상element
     * @returns {element} 대상element nextSibling 반환한다.
     * @desc 대상element nextSibling 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var nc = document.createElement('div');
     * p.appendChild(c);
     * p.appendChild(nc);
     * Asdf.Element.next(c); //return nc;
     */
	function next(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursively(element, 'nextSibling');
	}
    /**
     * @memberof Element
     * @param {element} element 대상element
     * @returns {element} 대상element previousSibling 반환한다.
     * @desc 대상element previousSibling 반환한다.
     * @example
     * var p = document.createElement('div');
     * var pc = document.createElement('div');
     * var c = document.createElement('div');
     * p.appendChild(pc);
     * p.appendChild(c);
     * Asdf.Element.prev(c); //return nc;
     */
	function prev(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursively(element, 'previousSibling');
	}
    /**
     * @memberof Element
     * @param {element} element 대상element
     * @param {element=} until 최종element
     * @returns {array} 대상element에서 최종element까지 nextSibling들을 반환한다.
     * @desc 대상element에서 최종element까지 nextSibling들을 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var nc1 = document.createElement('div');
     * var nc2 = document.createElement('div');
     * p.appendChild(c);
     * p.appendChild(nc1);
     * p.appendChild(nc2);
     * Asdf.Element.nexts(c); //return [nc1, nc2];
     */
	function nexts(element, until) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursivelyCollect(element, 'nextSibling', until);
	}
    /**
     * @memberof Element
     * @param {element} element 대상element
     * @param {element=} until 최종element
     * @returns {array} 대상element에서 최종element까지 previousSibling 반환한다.
     * @desc 대상element에서 최종element까지 previousSibling 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var pc1 = document.createElement('div');
     * var pc2 = document.createElement('div');
     * p.appendChild(pc1);
     * p.appendChild(pc2);
     * p.appendChild(c);
     * Asdf.Element.prevs(c); //return [pc2,pc1];
     */
	function prevs(element, until) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursivelyCollect(element, 'previousSibling', until);
	}
    /**
     * @memberof Element
     * @param {element} element 대상element
     * @returns {array} 본인을 제외한 형제 노드들을 반환한다.
     * @desc 본인을 제외한 형제 노드들을 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var nc = document.createElement('div');
     * var pc = document.createElement('div');
     * p.appendChild(pc);
     * p.appendChild(c);
     * p.appendChild(nc);
     * Asdf.Element.siblings(c); //return [pc,nc];
     */
	function siblings(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return $_.A.without($_.A.toArray(element.parentNode.childNodes), element);
	}
    /**
     * @memberof Element
     * @param {element} element 대상element
     * @returns {array} 자식 노드를 반환한다.
     * @desc 자식 노드들을 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var nc = document.createElement('div');
     * var pc = document.createElement('div');
     * var text = document.createTextNode('aa');
     * p.appendChild(text);
     * p.appendChild(pc);
     * p.appendChild(c);
     * p.appendChild(nc);
     * Asdf.Element.children(p); //return [text, pc,c,nc];
     */
	function children(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return Asdf.A.merge([element.firstChild],nexts(element.firstChild, 'nextSibling'));
	}
    /**
     * @memberof Element
     * @param {element} element 대상element
     * @returns {element|elements} contents를 반환한다.
     * @desc contents를 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var nc = document.createElement('div');
     * var pc = document.createElement('div');
     * p.appendChild(text);
     * p.appendChild(pc);
     * p.appendChild(c);
     * p.appendChild(nc);
     * Asdf.Element.contents(p); //return [text, pc,c,nc];
     * var iframe = document.createElement('iframe');
     * var doc = Asdf.Element.contents(iframe);
     */
	function contents(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return (element.nodeName === 'IFRAME')? (element.contentDocument||(element.contentWindow&&element.contentWindow.document)) : element.childNodes ;
	}
    /**
     * @memberof Element
     * @param {element} element 대상element
     * @param {element} element wrapElement
     * @returns {element} wrapElement를 반환한다.
     * @desc 대상element를 wrapElement로 감싼 후 wrapElement를 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var wrap = document.createElement('div');
     * p.appendChild(c);
     * var el = Asdf.Element.wrap(c, wrap); //return wrap;
     * el.innerHTML; //'<div></div>'
     */
	function wrap(element, newContent) {
		if(!$_.O.isNode(element)||!$_.O.isNode(newContent))
			throw new TypeError();
		element.parentNode.replaceChild(newContent, element);
		newContent.appendChild(element);
		return newContent;
	}
    /**
     * @memberof Element
     * @param {element} element 대상element
     * @returns {element} 대상 element를 반환한다.
     * @desc 대상element를 제거하고 대상 하위 element를 대상 부모 element로 이동시킨 후 대상 element를 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var wrap = document.createElement('div');
     * p.appendChild(wrap);
     * wrap.appendChild(c);
     * var el = Asdf.Element.unwrap(wrap); //return wrap;
     * p.innerHTML; //'<div></div>'
     */
	function unwrap(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		var bin = document.createDocumentFragment();
		var parentNode = element.parentNode;
		Asdf.A.each(children(element), function(el){
            bin.appendChild(el);
        });
		parentNode.replaceChild(bin, element);
		return element;
	}

    function createDom(doc, name, attributes, children){
        if(Asdf.O.isNotDocument(doc)||Asdf.O.isNotString(name)) throw new TypeError();
        if(!Asdf.Bom.features.CanAddNameOrTypeAttributes && attributes &&(attributes.name||attributes.type)) {
            var htmlArr = ['<', name];
            attributes = Asdf.O.clone(attributes);
            if(attributes.name){
                htmlArr.push(' name="', Asdf.S.escapeHTML(attributes.name), '"');
                delete attributes['name']
            }
            if(attributes.type){
                htmlArr.push(' type="', Asdf.S.escapeHTML(attributes.type), '"');
                delete attributes['type']
            }
            htmlArr.push('>');
            name = htmlArr.join('');
        }
        var el = doc.createElement(name);
        if(attributes){
            Asdf.O.each(attributes, function(v, k){
                if(k === 'className' &&Asdf.O.isString(v)){
                    addClass(el, v);
                    return;
                }
                else if(k === 'style' && Asdf.O.isPlainObject(v)){
                    Asdf.O.each(v, function(key, value){
                        css(el, key, value);
                    });
                    return;
                }
                else{
                    attr(el, k, v);
                }
            });
        }
        children = nativeSlice.call(arguments, 3);
        Asdf.A.each(children, function(c){
            append(el, c);
        });
        return el;
    }
    function createText(doc, string){
        if(Asdf.O.isNotString(string)) throw new TypeError();
        return doc.createTextNode(string);
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
	}
	function addClass(element, name){
		if(!$_.O.isNode(element)||!$_.O.isString(name))
			throw new TypeError();
		var nms = name.replace(/\s+/g,' ').split(' ');
		$_.A.each(nms, function(name) {
			if(!hasClass(element, name))		
				element.className += (element.className? ' ':'') + name;
		});
		return element;
	}
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
		isWhitespace: isWhitespace,
        createDom: createDom,
        createText: createText
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
    function getTimer(){
        return Asdf.F.bind((performance.now||
            performance.mozNow||
            performance.msNow||
            performance.oNow||
            performance.webkitNow||
            function() { return new Date().getTime(); }), performance||{});
    }
    function time(fn){
        var timer = getTimer();
        var startTime = timer();
        var res = fn(Array.prototype.slice.call(arguments, 1));
        var endTime = timer();
        if(endTime == startTime)
            endTime = timer();
        console.log(endTime - startTime);
        return res;
    }
	$_.O.extend($_.Utils, {
		makeuid : makeuid,
		ready : ready,
		parseJson : parseJson,
		namespace : namespace,
        time:time
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
