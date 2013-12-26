(function($_) {
	$_.P = {};
	function mix(fn, sorce) {
		if(!$_.O.isFunction(fn) || !$_.O.isPlainObject(sorce))
			throw new TypeError();
		$_.O.each(sorce, function(value, key) {
			var pk = fn.prototype[key];
			if(pk == null){
				fn.prototype[key] = value;
			}else if($_.O.isFunction(pk)&&$_.O.isFunction(value)){
				fn.prototype[key] = $_.F.compose(pk, value);
			}else
				new TypeError();
		});
	}
	$_.O.extend($_.P, {
		mix:mix
	});
})(Asdf);