(function($_) {
	$_.Ajax = {};
	var activeRequestCount = 0, emptyFunction = function () {};
	var Try = {
		these : function() {
			var returnValue;
			for ( var i = 0, length = arguments.length; i < length; i++) {
				var lambda = arguments[i];
				try {
					returnValue = lambda();
					break;
				} catch (e) {
				}
			}

			return returnValue;
		}
	};
	var states = 'Uninitialized Loading Loaded Interactive Complete'.split(' ');
	function onStateChange(transport, fn) {
		var readyState = transport.readyState();
		if (readyState > 1 && !((readyState == 4) && transport._complete))
			fn(readyState);
	}
	function setRequestHeaders (xhr, options) {
		if(!$_.O.isPlainObject(options)) throw new TypeError();
		var headers = {'Accept' : 'text/javascript, text/html, application/xml, text/xml, */*'};
		var contentType;
		if(options.method === 'post') {
			contentType = options.contentType + (options.encoding?';charset'+options.encoding: '');
		}
		$_.O.extend( headers, options.requestHeaders||{});
		headers['Content-type'] = contentType;
		for(var name in headers){
			xhr.setRequestHeader(name, headers[name]);
		}
	}
	function success(status) {
		return !status || (status >=200 && status < 300) || status ==304;
	}
	function getStatus(xhr){
		try{
			if(xhr.status === 1223) return 204;
			return xhr.status ||0;
		} catch (e) { return 0; }
	}
	function respondToReadyState(transport, options, readyState){
		var state = states[readyState];
		var res = getResponse(transport);
		if(state === 'Complete'){
			try {
				transport._complete = true;
				(options['on' + transport.status()]
						|| options['on'+ (success(transport.status()) ? 'Success' : 'Failure')] || emptyFunction)
						(res);
			} catch (e) {
				throw e;
			}
		}
		try{
			(options['on'+state]||emptyFunction)(res);
			responders.fire('on' + state, transport, res);
		}catch(e){
			throw new Error();
		}
		if(state === 'Complete'){
			transport.xhr.onreadystatechange = emptyFunction;
			transport.xhr = undefined;
			transport = undefined;
			
		}
	}
	function isSameOrigin(url) {
		 var m = url.match(/^\s*https?:\/\/[^\/]*/);
		 var protocol = location.protocol;
		 var domain = document.domain;
		 var port = location.port?':'+location.port:'';
		 return !m || (m[0] == prototype+'//'+domain+port);
	}
	
	function getHeader(xhr, name){
		try{
			return xhr.getResponseHeader(name)|| null;
		}catch(e){return null;}
	}
	
	//response
	function getStatusText(xhr){
		try{
			return xhr.statusText||'';
		} catch(e) {return '';}
	}
	
	function getTransport() {
		return Try.these(function() {
			return new XMLHttpRequest();
		}, function() {
			return new ActiveXObject('Msxml2.XMLHTTP');
		}, function() {
			return new ActiveXObject('Microsoft.XMLHTTP');
		}) || false;
	};
	var responders = (function (){
			var list = [];
			function add(responder) {
				if (!$_.A.include(list, responder))
					list.push(responder);
			}
			function remove(responder) {
				list = $_.A.without(list, responder);
			}
			function fire(callback, request, response) {
				$_.A.each(list, function(responder) {
					if ($_.O.isFunction(responder[callback])) {
						try {
							responder[callback].apply(responder, [ request, response]);
						} catch (e) { }
					}
			 	});
			}
			return {
				add: add,
				remove: remove,
				fire: fire
			};
	})();
	responders.add({
		onCreate: function () { activeRequestCount++},
		onComplete: function () {activeRequestCount--}
	});
	
	function request(url, options){
		options = options ||{};
		$_.O.extend(options, 
				{
					method : 'post',
					asynchronous : true,
					contentType : 'application/x-www-form-urlencoded',
					encoding : 'UTF-8',
					parameters : ''
				}, true);
		options.method = options.method.toLowerCase();
		var transport ={xhr:getTransport()}, params;
		fix(transport, options);
		
		params = $_.O.isString(options.parameters) ? options.parameters : $_.O
				.toQueryString(options.parameters);
		url = url||options.url;
		
		if(!$_.A.include(['get', 'post'], options.method)){
			params +=(params? '&':'') + '_method=' + options.method;
			options.method = 'post';
		}
		if(params && options.method ==='get'){
			url += ($_.S.include(url,'?')? '&': '?') + params;
		}
		try {
			var res = getResponse(transport);
			if(options.onCreate) onCreate(res);
			responders.fire('onCreate');
			transport.open(options.method.toUpperCase(), url, options.asynchronous);
			if(options.asynchronous)transport.respondToReadyState(1);

			transport.setRequestHeaders(options);
			var body = options.method === 'post'? params: null;
			transport.send(body);
			if (!options.asynchronous && transport.overrideMimeType)
				transport.onreadystatechange(transport.readyState);
		}catch(e){
			throw e;
		}
		
	}
	function fix(transport, options){
		$_.O.extend(transport, {
			setRequestHeaders: $_.F.curry(setRequestHeaders, transport.xhr),
			getStatus: $_.F.curry(getStatus, transport.xhr),
			getHeader: $_.F.curry(getHeader, transport.xhr),
			getStatusText: $_.F.curry(getStatusText, transport.xhr),
			status: function(){ return transport.xhr.status;},
			readyState: function() {return transport.xhr.readyState;},
			respondToReadyState: $_.F.curry(respondToReadyState, transport, options),
			responseText: function(){ return transport.xhr.responseText},
			responseXML: function(){ return transport.xhr.responseXML},
			send: function(data){transport.xhr.send(data)},
			open: function(method, url, async){transport.xhr.open(method, url, async)},
			getAllResponseHeaders: function(){ return transport.xhr.getAllResponseHeaders()},
			_complete: false
		});
		transport.xhr.onreadystatechange =  $_.F.curry(onStateChange, transport, transport.respondToReadyState);
	}
	function getResponse(transport){
		var res = {};
		var readyState = transport.readyState();
		if ((readyState > 2 && !$_.Bom.browser == 'msie') || readyState == 4) {
			res.status = transport.status();
			res.statusText = transport.getStatusText();
			res.responseText = transport.responseText();
			res.headers = $_.S.toQueryParams(transport.getAllResponseHeaders(), '\n', ':');
		}

		if (readyState == 4) {
			var xml = transport.responseXML();
			res.responseXML = xml == null ? null : xml;
		}
		return res;
		
	}
	$_.O.extend($_.Ajax, {
		getTransport: getTransport,
		request: request,
		responders: responders
	});
})(Asdf);