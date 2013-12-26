(function($_) {
	$_.Promise = promise = {};
	//state : Uninitialized, unfulfill, fulfilled, rejected
	var toPromise = function(resolver){
		var fire = true;
		function then(done, fail){
			fire = false;
			done = done||function(){};
			fail = fail||function(){};
			if(!done.length)
				done = $_.F.wrap(done, function(fn, d,f){
					try{
						fn();
						d();
					}catch(e){
						f(e.message);
					}
				});
			var fn = $_.F.wrap(resolver, function(fn, d, f){
				d = d||function() {};
				f = f||function() {};
				return fn($_.F.curry(done,d,f), fail);
			});
			return toPromise(fn);
		}
		$_.F.defer(function() {
			if(fire)
				resolver(function(){}, function(){});
		});
		function Promise() {}
		Promise.prototype.then = then;
		return new Promise;
	};
	
	$_.O.extend(promise, {
		toPromise:toPromise
	});
})(Asdf);