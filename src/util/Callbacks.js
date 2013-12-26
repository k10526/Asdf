(function($_) {
	$_.Callbacks = Callbacks = {};
	var getCallbacks = function(options) {
		var list = $_.Store.getStore();
		var on = function(fn) {
			var tmp = list.get('any')||[];
			tmp.push(fn);
			list.set('any', tmp);
		};
		var remove = function(fn){
			var tmp = list.get('any')||[];
			list.set('any', $_.A.without(tmp,fn));
		};
		var has = function(fn){
			var tmp = list.get('any')||[];
			return $_.A.include(tmp, fn);
		};
		var emit = function(context, args){
			var tmp = list.get('any')||[];
			$_.A.each(tmp, function(fn){
				fn.apply(context, args);
			});
			return this;
		};
		return {
			on: on,
			remove: remove,
			has: has,
			emit: emit
		};
	};
	$_.O.extend(Callbacks, {
		getCallbacks: getCallbacks
	});
})(Asdf);