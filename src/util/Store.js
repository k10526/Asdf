(function($_) {
	$_.Store = store = {};
	var cache = {};
	var safeObject = function(obj) {
		return ($_.O.isArray(obj)||$_.O.isPlainObject(obj))? $_.O.clone(obj):obj;
	};
	var getStore = function(options) {
		options = options||{};
		var safe = !!options.safe;
		var get = function(key) {
			var res;
			if (has(key)) {
				res = cache[key];
				return (safe)? safeObject(res):res;
			}
			return;
		};
		var set = function(key, value) {
			cache[key] = (safe)? safeObject(value):value;
		};
		var has = function(key) {
			return !!cache[key];
		};
		var remove = function(key) {
			delete cache[key];
		};
		return {
			get: get,
			set: set,
			has: has,
			remove: remove
		};
	};
	$_.O.extend(store, {
		getStore: getStore
	});
})(Asdf);