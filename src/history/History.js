(function($_) {
	var history = $_.History = {};
	var timer = null;
	var iframeWin = null;
	var hasPushState = window.history && window.history.pushState;
	var started = false;
	var currentHash = '';
	var router = null;
	
	function getHash(win){
		var match = win.location.href.match(/#(.*)$/);
		return match? match[1]:'';
	}
	function getPathname(win){
		return win.location.pathname;
	}
	function getUrl(win){
		return getPathname(win) +'#' + getHash(win);
	} 
	function start(options) {
		if(started) throw TypeError("error");
		started = true;
		router = options.router|| function() {};
		var isOldIE = $_.Bom.browser == 'msie' && $_.Bom.version <= 7;
		if(isOldIE){
			var iframe = $_.S.toElement('<iframe src="javascript:0" tabindex="-1" style="display:none">');
			$_.Element.append(document.body, iframe);
			iframeWin = iframe.contentWindow;
		}if(hasPushState) {
			$_.Event.on(window,'popstate', checkHash);
		}else if(!isOldIE){
			$_.Event.on(window,'hashchange', checkHash);
		}else {
			timer = $_.F.delay(checkHash, 0.05);
		}
	}
	function checkHash() {
		var hash = getHash(iframeWin||window);
		if(currentHash != hash){
			currentHash = hash;
			if(iframeWin)updateHash(hash);
			router(hash);
		}
		timer&&(timer = $_.F.delay(checkHash, 0.05));
	}
	function _update(hashValue, isExec){
		if(!started) throw TypeError();
		currentHash = hashValue;
		updateHash(hashValue);
		isExec&&router(hashValue);
	}
	function update(hashValue){
		_update(hashValue, true);
	}
	function push(hashValue){
		_update(hashValue, false);
	}
	function updateHash(hashValue){
		setHash(window, hashValue);
		if(iframeWin && getHash(iframeWin) != hashValue){
			iframeWin.document.open().close();
			setHash(iframeWin, hashValue);
		}
	}
	function setHash(win, hashValue){
		var url = getPathname(win) +'#'+ hashValue;
		if(hasPushState){
			win.history.pushState({}, document.title, url);
		}else{
			win.location.hash = '#' + hashValue;
		}
	}
	$_.O.extend(history, {
		start: start,
		update: update,
		push: push
	});
})(Asdf);
