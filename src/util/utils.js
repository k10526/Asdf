(function($_) {
	$_.Utils = {};
	function randomMax8HexChars() {
		return (((1 + Math.random()) * 0x100000000) | 0).toString(16)
				.substring(1);
	}
	function makeuid() {
		return randomMax8HexChars() + randomMax8HexChars();
	}
	
	var ready = (function() {
		var domReadyfn = [];
		var timer, defer = $_.F.defer;
		function fireContentLoadedEvent() {
			var i;
			if (document.loaded)
				return;
			if (timer)
				window.clearTimeout(timer);
			document.loaded = true;
			for (i = 0; i < domReadyfn.length; i++) {
				domReadyfn[i]($_);
			}
		}
		function checkReadyState() {
			if (document.readyState === 'complete') {
				document.detachEvent('onreadystatechange', checkReadyState);
				fireContentLoadedEvent();
			}
		}
		function pollDoScroll() {
			try {
				document.documentElement.doScroll('left');
			} catch (e) {
				timer = defer(pollDoScroll);
				return;
			}
			fireContentLoadedEvent();
		}
		if (document.addEventListener) {
			document.addEventListener('DOMContentLoaded',
					fireContentLoadedEvent, false);
			window.addEventListener('load', fireContentLoadedEvent);
		} else {
			document.attachEvent('onreadystatechange', checkReadyState);
			if (window == top)
				timer = defer(pollDoScroll);
			window.attachEvent('onload', fireContentLoadedEvent);
		}
		return function(callback) {domReadyfn.push(callback);};
	})();
	function parseJson(jsonString) {
		if (typeof jsonString == "string") {
			if (jsonString) {
				if (window.JSON && window.JSON.parse) {
					return window.JSON.parse(jsonString);
				}
				return (new Function("return " + jsonString))();
			}
		}
		return null;
	}
	function namespace(/*[parent], ns_string*/) {
		var parts, i, parent;
		var args = $_.A.toArray(arguments);
		if ($_.O.isPlainObject(args[0])) {
			parent = args.shift();
		}
		parent = parent || window;
		parts = args[0].split('.');
		for (i = 0; i < parts.length; i++) {
			if (typeof parent[parts[i]] === 'undefined') {
				parent[parts[i]] = {};
			}
			parent = parent[parts[i]];
		}
		return parent;
	}
	$_.O.extend($_.Utils, {
		makeuid : makeuid,
		ready : ready,
		parseJson : parseJson,
		namespace : namespace
	});
})(Asdf);