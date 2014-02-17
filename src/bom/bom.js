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
        var browser = match[1] || "";
        var version = match[2] || "0";
        var documentMode =  browser != 'msie'? undefined : document.documentMode || (document.compatMode == 'CSS1Compat'? parseInt(this.version,10) : 5);
		return {
			browser : browser,
			version : version,
            documentMode:documentMode
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
		})(),

        CanAddNameOrTypeAttributes : Browser.browser != 'msie' || Browser.documentMode >= 9,

        CanUseChildrenAttribute : Browser.browser != 'msie' && Browser.browser != 'mozilla' ||
            Browser.browser == 'msie' && Browser.documentMode >= 9 ||
            Browser.browser == 'mozilla' && Asdf.S.compareVersion(Browser.version, '1.9.1') >=0,
        CanUseParentElementProperty : Browser.browser == 'msie' || Browser.browser == 'opera' || Browser.browser == 'webkit'
	};
    var browserMap = {
        'firefox' : 'mozilla',
        'ff': 'mozilla',
        'ie': 'msie'
    }
    function isBrowser(browser){
        if(!Asdf.O.isString(browser)) throw new TypeError()
        return (browserMap[browser.toLowerCase()]||browser.toLowerCase()) == Browser.browser
    }
    function compareVersion(version){
        return Asdf.S.compareVersion(Browser.version, version);
    }
	$_.O.extend($_.Bom, {
        isBrowser: isBrowser,
        compareVersion: compareVersion,
		browser : Browser.browser,
		version: Browser.version,
        documentMode: Browser.documentMode,
		features:features
	});
})(Asdf);