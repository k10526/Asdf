(function($_) {
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
})(Asdf);