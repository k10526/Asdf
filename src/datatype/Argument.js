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
})(Asdf);