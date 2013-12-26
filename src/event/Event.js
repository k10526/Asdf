(function($_) {
	$_.Event = {};
	var extend = $_.O.extend, slice = Array.prototype.slice;
	var cach = [];
	function getIndex(element, eventName, handler) {
		var i;
		for(i = 0; i < cach.length; i++){
			if(cach[i].element == element &&
					cach[i].eventName == eventName &&
					cach[i].handler == handler)
				return i;
		}
		return -1;
	}
	function getWrapedhandler(element, eventName, handler) {
		var i;
		for(i = 0; i < cach.length; i++){
			if(cach[i].element == element &&
					cach[i].eventName == eventName &&
					cach[i].handler == handler)
				return cach[i].wrapedhandler.pop();
		}
	}
	function addEventListener(element, eventName, handler, filterFn) {
		var wrapedhandler = $_.F.wrap(handler, 
			function(ofn, e) {
				e = e||window.event;
				e = fix(e);
				if(filterFn && !filterFn(e)) return null;
				return ofn(e);
			}
		);
		if (element.addEventListener) {
			element.addEventListener(eventName, wrapedhandler, false);
			
		}else {
			element.attachEvent("on"+ eventName, wrapedhandler);
		}
		var index = getIndex(element, eventName, handler);
		if(index === -1){
			var obj = {element:element, eventName:eventName, handler:handler, wrapedhandler:[wrapedhandler]};
			cach.push(obj);
		}else{
			cach[index].wrapedhandler.push(wrapedhandler);
		}
		
	}
	function removeEventListener(element, eventName, handler){
		if(element.removeEventListener){
			element.removeEventListener( eventName, handler, false );
		}else {
			var ieeventName = 'on'+eventName;
			if(element[ieeventName] === void 0){
				element[ieeventName] = null;
			}
			element.detachEvent( ieeventName, handler );
		}
		
	}
	function fix(event){
		if(!event.target){
			event.target = event.srcElement || document;
		}
		if(event.target.nodeType === 3) {
			event.target = event.target.parentNode;
		}
		event.metaKey = !!event.metaKey;
		fixEvent(event);
		event.stop = $_.F.methodize(stop);
		return fixHooks(event);
	}
	function fixEvent(event){
		if(!event.stopPropagation){
			event.stopPropagation = function() { event.cancelBubble = true; };
			event.preventDefault = function() { event.returnValue = false; };
		}
	}
	function stop(event){
		if(!event.stopPropagation){
			fixEvent(event);
		}
		event.preventDefault();
	    event.stopPropagation();
	}
	function fixHooks(event){
		function keyHooks(event){
			if(!event.which) {
				event.which = event.charCode? event.charCode : event.keyCode;
			}
			return event;
		}
		function mouseHooks(event){
			var eventDoc, doc, body, button = event.button, fromElement = event.fromElement;
			if( event.pageX == null && event.clientX != null ) {
				eventDoc = event.target.ownderDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;
				event.pageX = event.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = event.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? event.toElement : fromElement;
			}
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}
			return event;
		}
		var rkeyEvent = /^key/, rmouseEvent = /^(?:mouse|contextmenu)|click/ ;
		if ( rkeyEvent.test( event.type ) ) {
			return keyHooks(event);
		}
		if ( rmouseEvent.test( event.type ) ) {
			return mouseHooks(event);
		}
		return event;
	}
	function on(element, eventName, fn, filterFn){
		addEventListener(element, eventName, fn, filterFn);
		return element;
	}
	function once(element, eventName, fn, filterFn){
		var tfn = $_.F.wrap(fn, function(ofn){
			var arg = slice.call(arguments, 1);
			ofn.apply(this,arg);
			remove(element, eventName, tfn);
		});
		addEventListener(element, eventName, tfn, filterFn);
		return element;
	}
	function remove(element, eventName, handler) {
		var wrapedhandler = getWrapedhandler(element, eventName, handler)||handler;
		removeEventListener(element, eventName, wrapedhandler);
		return element;
	}
	function removeAll(element, eventName) {
		var events, i, j;
		events = $_.A.filter(cach, function (val, i) {
			if(element === val.element) {
				if(eventName && eventName !== val.eventName){
					return false;
				}
				return true;
				
			}
		});
		for ( i = 0; events && i < events.length; i++){
			var event = events[i];
			for(j = 0 ; j < event.wrapedhandler.length; j++ )
				removeEventListener(event.element, event.eventName, event.wrapedhandler[j]);
		}
		return element;
	}
	function createEvent(name) {
		var event;
		if(document.createEvent) {
			event = document.createEvent('HTMLEvents');
			event.initEvent(name, true, true);
		}else {
			event = document.createEventObject();
		}
		return event;
		
	}
	function emit(element, name, data){
		if(element == document && document.createEvent && !element.dispatchEvent)
			element = document.documentElement;
		var event;
		
		event = createEvent(name);
		event.data = data;
		event.eventName = name;
		if(document.createEvent) {
			element.dispatchEvent(event);
		}else {
			element.fireEvent("on"+name, event);
		}
		return element;
	}
    extend($_.Event, {
    	fix: fix,
    	stop:stop,
    	on:on,
    	remove:remove,
    	removeAll:removeAll,
    	once: once,
    	emit: emit
    });
})(Asdf);