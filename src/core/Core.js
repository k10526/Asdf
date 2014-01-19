(function($_) {
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
