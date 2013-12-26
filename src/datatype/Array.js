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
})(Asdf);