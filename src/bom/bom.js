(function($_) {
	$_.Bom = {};
	var Browser = (function() {
		var ua = navigator.userAgent;
		ua = ua.toLowerCase();
		var match = /(chrome)[ \/]([\w.]+)/.exec(ua)
				|| /(webkit)[ \/]([\w.]+)/.exec(ua)
				|| /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua)
				|| /(msie) ([\w.]+)/.exec(ua) 
				|| /(msie)(?:.*?Trident.*? rv:([\w.]+))/.exec('msie'+ua)
				|| ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];

		return {
			browser : match[1] || "",
			version : match[2] || "0"
		};
	})();
	var features = {
		XPath : !!document.evaluate,

		SelectorsAPI : !!document.querySelector,

		ElementExtensions : (function() {
			var constructor = window.Element || window.HTMLElement;
			return !!(constructor && constructor.prototype);
		})(),
		SpecificElementExtensions : (function() {
			if (typeof window.HTMLDivElement !== 'undefined')
				return true;

			var div = document.createElement('div'), form = document
					.createElement('form'), isSupported = false;

			if (div['__proto__'] && (div['__proto__'] !== form['__proto__'])) {
				isSupported = true;
			}

			div = form = null;

			return isSupported;
		})()
	};
	$_.O.extend($_.Bom, {
		browser : Browser.browser,
		version: Browser.version, 
		features:features
	});
})(Asdf);