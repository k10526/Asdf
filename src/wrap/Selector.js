(function (definition) {
    // RequireJS
    if (typeof define == "function") {
        define([Asdf], definition);
    } else {
        definition(Asdf);
    }
})
(function($_) {
	var arraySlice = Array.prototype.slice, readyRE = /complete|loaded|interactive/, isString = $_.O.isString ;
	var arrayMap =  $_.A.map, nativeSplice = Array.prototype.splice, extend = $_.O.extend;
	var root = this, compact = $_.A.compact;
	function El(){
		if (this.constructor !== El){
			return new El();
		}
	};
	function map(elements, fn){
		return arrayMap(elements, function(el, i){ return fn.call(el, i, el); });
	}
	function slice(elements){
	    return arraySlice.apply(toArray(elements), arraySlice.call(arguments,1));
	}
	function toArray(elements) {
		var arr = [];
		for (var i = 0, ref = arr.length = elements.length; i < ref; i++) {
		 arr[i] = elements[i];
		}
		return arr;
	}
	function get(elements, idx){
		return idx === undefined ? toArray(elements) : elements[idx];
	}
	var elProto = {};
	$_.O.each($_.Element, function (value, key){
		elProto[key] = $_.F.wrap(value, function (fn) {
			var self = this, args = arraySlice.call(arguments, 1);
			if(/toggle|hide|show|remove|parent|next|prev/.test(key)){
				return $_.Selector($_.A.unique($_.A.filter($_.A.map(self, function(value, i){ return fn.apply(self, [value].concat(args));}), function(value) {return !!value;})));
			}else if(/html|text|value/.test(key)){
				return fn.apply(self, [self[0]].concat(args));;
			}
			return null;
		});
	} );
	
    extend(El.prototype, {
    	constructor: El,
		length: 0,
    	//map: map,
    	//slice: slice,
    	//get: get,
    	//toArray: toArray,
    	splice: nativeSplice
    });
    extend(El.prototype, elProto);
   
	$_.Selector = function(selector, context, root) {
		var element = new El();
		var els = [];
		if (!selector) {
			return element;
		}
		if (selector.nodeType) {
			element.length = 1;
			return element;
		}

		if (isString(selector)) {
			els = $_.Element.find(document, selector, context, root);	
		}
		if ($_.O.isArray(selector)) {
			els = selector;
		}
		return (els.length===0)?null:makeArray(els, element);
		
	};
	function makeArray( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( arr.length == null || $_.O.isString(arr) ||$_.O.isFunction(arr) || $_.O.isRegexp(arr) || arr===root ) {
				Array.prototype.push.call( ret, arr );
			} else {
				merge( ret, arr );
			}
		}
		return ret;
	}
	function merge( first, second ) {
		var l = second.length,
			i = first.length,
			j = 0;

		if ( typeof l === "number" ) {
			for ( ; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}

		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}
		first.length = i;
		return first;
	}

});