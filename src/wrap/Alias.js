(function (definition) {
    // RequireJS
    if (typeof define == "function") {
        define([Asdf], definition);
    } else {
        definition(Asdf);
    }
})
(function($_) {
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var config = [
		{
			name: 'A', 
			include : '*',
			exclude : '',
			target: Array.prototype
		},
		{
			name: 'F',
			include : '*',
			exclude : '',
			target: Function.prototype
		},
		{ 
			name: 'S',
			include : '*',
			exclude : '',
			target: String.prototype
		},
		{
			name: 'O',
			include: '*',
			exclude: '',
			target:Object,
			methodize:false
		}
	];
	function alias(conf) {
		var i, list, methodizeds, prop, methodize ;
		for (i = 0; i < conf.length; i++){
			methodizeds= {};
			list = conf[i];
			methodize = list.methodize === void 0 ? true: list.methodize;
			if(methodize){
				for (prop in $_[list.name]){
					methodizeds[prop] = ($_.F.methodize($_[list.name][prop])); 
				}
			}
			else {
				for (prop in $_[list.name]){
					methodizeds[prop] = $_[list.name][prop]; 
				}
			}
			$_.O.extend(list.target, methodizeds, true);
		}
		
	}
	alias(config);
	
});