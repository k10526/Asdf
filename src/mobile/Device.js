(function($_) {
	$_.Device = {};
	
	var device = (function() {
		var ua = navigator.userAgent;
		ua = ua.toLowerCase();
		var match = /(android)\s*([\w.]+)/.exec(ua)
			|| /(iphone|ipad)\D*([\w_]+)/.exec(ua)
			|| /(blackberry)/.exec(ua)
			|| /(windows ce)/.exec(ua)
			|| /(nokia)/.exec(ua)
			|| /(webos)/.exec(ua)
			|| /(opera (?:mini|mobi))/.exec(ua)
			|| /(sonyericsson)/.exec(ua)
			|| /(iemobile)/.exec(ua) 
			||[];
		return {
			os: match[1] || '',
			version: (match[2]||'0').replace(/_/g,'.')
		};
	})();
	$_.O.extend($_.Device, {
		os : device.os,
		version: device.version
	});
})(Asdf);