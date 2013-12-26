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

})(Asdf);