(function($_) {
	$_.Trans = {};
	var cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];
	function vendorPropName( name ) {
		var el = document.createElement('div');
		var style = el.style;
		if ( name in style ) {
			return name;
		}
		var capName = name.charAt(0).toUpperCase() + name.slice(1),
			origName = name,
			i = cssPrefixes.length;

		while ( i-- ) {
			name = cssPrefixes[ i ] + capName;
			if ( name in style ) {
				return name;
			}
		}
		el = null;
		return origName;
	}
	var mobileClass = (function() {
		var os = $_.Device.os;
		var version = parseFloat($_.Device.version,10);
		if(/iphone|ipad/.test(os)){
			if(version >= 3)
				return 2;
			else
				return 3;
		}else if('android' == os){
			if(version >= 3 && version < 4.2)
				return 2;
			else if(version >= 4.2)
				return 3;
		}
		return 1;
	})();
	var transform = vendorPropName('transform');
	function transX(element, pointX) {
		if (pointX == undefined) {
			if ($_.Device.os) {
				return /([0-9.]+)/.exec($_.css(element, transform))[1];
			} else {
				return parsetInt($_.css(element, 'left'),10);
			}
		} else {
			if ($_.Device.os) {
				if (mobileClass === 1) {
					$_.css(element, transform, 'translateX(' + pointX + 'px)');
				} else {
					$_.css(element, transform, 'translate3D(' + pointX + 'px,' + this.y() + 'px,0)');
				}
			} else {
				$_.css(element, 'left', pointX + 'px');
			}
		}
		return element;

	}
	function transY(element, pointY) {
		
	}
	$_.O.extend($_.Trans, {
	});
})(Asdf);