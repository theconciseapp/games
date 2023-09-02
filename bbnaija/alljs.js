'use strict';
//Ver: 1.0
function yall (options) {
  options = options || {};

  // Options
  const lazyClass = options.lazyClass || "lazy";
  const lazyBackgroundClass = options.lazyBackgroundClass || "lazy-bg";
  const idleLoadTimeout = "idleLoadTimeout" in options ? options.idleLoadTimeout : 200;
  const observeChanges = options.observeChanges || false;
  const events = options.events || {};
  const noPolyfill = options.noPolyfill || false;

  // Shorthands (saves more than a few bytes!)
  const win = window;
  const ric = "requestIdleCallback";
  const io = "IntersectionObserver";
  const ioSupport = io in win && `${io}Entry` in win;

  // App stuff
  const crawler = /baidu|(?:google|bing|yandex|duckduck)bot/i.test(navigator.userAgent);
  const dataAttrs = ["srcset", "src", "poster"];
  const arr = [];
  const queryDOM = (selector, root) => arr.slice.call((root || document).querySelectorAll(selector || `img.${lazyClass},video.${lazyClass},iframe.${lazyClass},.${lazyBackgroundClass}`));

  // This function handles lazy loading of elements.
  const yallLoad = element => {
    const parentNode = element.parentNode;

    if (parentNode.nodeName == "PICTURE") {
      yallApplyFn(queryDOM("source", parentNode), yallFlipDataAttrs);
    }

    if (element.nodeName == "VIDEO") {
      yallApplyFn(queryDOM("source", element), yallFlipDataAttrs);
    }

    yallFlipDataAttrs(element);

    const classList = element.classList;

    // Lazy load CSS background images
    if (classList.contains(lazyBackgroundClass)) {
      classList.remove(lazyBackgroundClass);
      classList.add(options.lazyBackgroundLoaded || "lazy-bg-loaded");
    }
  };

  const yallBindEvents = element => {
    for (let eventIndex in events) {
      element.addEventListener(eventIndex, events[eventIndex].listener || events[eventIndex], events[eventIndex].options || undefined);
    }
  };

  // Added because there was a number of patterns like this peppered throughout
  // the code. This flips necessary data- attrs on an element and prompts video
  // elements to begin playback automatically if they have autoplay specified.
  const yallFlipDataAttrs = element => {
    for (let dataAttrIndex in dataAttrs) {
      if (dataAttrs[dataAttrIndex] in element.dataset) {
        element.setAttribute(dataAttrs[dataAttrIndex], element.dataset[dataAttrs[dataAttrIndex]]);
        const parentNode = element.parentNode;

        if (element.nodeName === "SOURCE" && parentNode.autoplay) {
          parentNode.load();

          // For some reason, IE11 needs to have this method invoked in order
          // for autoplay to start. So we do a yucky user agent check.
          if (/Trident/.test(navigator.userAgent)) {
            parentNode.play();
          }

          parentNode.classList.remove(lazyClass);
        }

        element.classList.remove(lazyClass);
      }
    }
  };

  // Noticed lots of loops where a function simply gets executed on every
  // member of an array. This abstraction eliminates that repetitive code.
  const yallApplyFn = (items, fn) => {
    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      win[io] && fn instanceof win[io] ? fn.observe(items[itemIndex]) : fn(items[itemIndex]);
    }
  };

  const yallCreateMutationObserver = entry => {
    new MutationObserver(() => {
      yallApplyFn(queryDOM(), newElement => {
        if (lazyElements.indexOf(newElement) < 0) {
          lazyElements.push(newElement);
          yallBindEvents(newElement);

          if (ioSupport && !crawler) {
            intersectionListener.observe(newElement);
          } else if (noPolyfill || crawler) {
            yallApplyFn(lazyElements, yallLoad);
          }
        }
      });
    }).observe(entry, options.mutationObserverOptions || {
      childList: true,
      subtree: true
    });
  };

  let lazyElements = queryDOM();

  yallApplyFn(lazyElements, yallBindEvents);

  // First we check if IntersectionObserver is supported. If not, we check to
  // see if the `noPolyfill` option is set. If so, we load everything. If the
  // current user agent is a known crawler, again, we load everything.
  if (ioSupport && !crawler) {
    var intersectionListener = new win[io](entries => {
      yallApplyFn(entries, entry => {
        if (entry.isIntersecting || entry.intersectionRatio) {
          const element = entry.target;

          if (ric in win && idleLoadTimeout) {
            win[ric](() => {
              yallLoad(element);
            }, {
              timeout: idleLoadTimeout
            });
          } else {
            yallLoad(element);
          }

          intersectionListener.unobserve(element);
          lazyElements = lazyElements.filter(lazyElement => lazyElement != element);

          // If all the elements that were detected at load time are all loaded
          // and we're not observing for changes, we're all done here.
          if (!lazyElements.length && !observeChanges) {
            intersectionListener.disconnect();
          }
        }
      });
    }, {
      rootMargin: `${"threshold" in options ? options.threshold : 200}px 0%`
    });

    yallApplyFn(lazyElements, intersectionListener);

    if (observeChanges) {
      yallApplyFn(queryDOM(options.observeRootSelector || "body"), yallCreateMutationObserver);
    }
  } else if (noPolyfill || crawler) {
    yallApplyFn(lazyElements, yallLoad);
  }
}

 //module.exports = yall;
/*! legitRipple.js v1.1.0: ripple.min.js by Matthias Vogt (ISC license) */

!function(t){t.fn.ripple=function(e){if(this.length>1)return this.each(function(n,i){t(i).ripple(e)});if(e=e||{},this.off(".ripple").data("unbound",!0),e.unbind)return this;var n=function(){return d&&!d.data("unbound")};this.addClass("legitRipple").removeData("unbound").on("tap.ripple",function(e){n()||(d=t(this),w(e.coords))}).on("dragstart.ripple",function(t){g.allowDragging||t.preventDefault()}),t(document).on("move.ripple",function(t){n()&&b(t.coords)}).on("end.ripple",function(){n()&&y()}),t(window).on("scroll.ripple",function(t){n()&&y()});var i,o,a,r,s=function(t){return!!t.type.match(/^touch/)},l=function(t,e){return s(t)&&(t=c(t.originalEvent.touches,e)),[t.pageX,t.pageY]},c=function(e,n){return t.makeArray(e).filter(function(t,e){return t.identifier==n})[0]},p=0,u=function(t){"touchstart"==t.type&&(p=3),"scroll"==t.type&&(p=0);var e=p&&!s(t);return e&&p--,!e};this.on("mousedown.ripple touchstart.ripple",function(e){u(e)&&(i=s(e)?e.originalEvent.changedTouches[0].identifier:-1,o=t(this),a=t.Event("tap",{coords:l(e,i)}),~i?r=setTimeout(function(){o.trigger(a),r=null},g.touchDelay):o.trigger(a))}),t(document).on("mousemove.ripple touchmove.ripple mouseup.ripple touchend.ripple touchcancel.ripple",function(e){var n=e.type.match(/move/);r&&!n&&(clearTimeout(r),r=null,o.trigger(a)),u(e)&&(s(e)?c(e.originalEvent.changedTouches,i):!~i)&&t(this).trigger(n?t.Event("move",{coords:l(e,i)}):"end")}).on("contextmenu.ripple",function(t){u(t)}).on("touchmove",function(){clearTimeout(r),r=null});var d,f,h,m,g={},v=0,x=function(){var n={fixedPos:null,get dragging(){return!g.fixedPos},get adaptPos(){return g.dragging},get maxDiameter(){return Math.sqrt(Math.pow(h[0],2)+Math.pow(h[1],2))/d.outerWidth()*Math.ceil(g.adaptPos?100:200)+"%"},scaleMode:"fixed",template:null,allowDragging:!1,touchDelay:100,callback:null};t.each(n,function(t,n){g[t]=t in e?e[t]:n})},w=function(e){h=[d.outerWidth(),d.outerHeight()],x(),m=e,f=t("<span/>").addClass("legitRipple-ripple"),g.template&&f.append(("object"==typeof g.template?g.template:d.children(".legitRipple-template").last()).clone().removeClass("legitRipple-template")).addClass("legitRipple-custom"),f.appendTo(d),D(e,!1);var n=f.css("transition-duration").split(","),i=[5.5*parseFloat(n[0])+"s"].concat(n.slice(1)).join(",");f.css("transition-duration",i).css("width",g.maxDiameter),f.on("transitionend webkitTransitionEnd oTransitionEnd",function(){t(this).data("oneEnded")?t(this).off().remove():t(this).data("oneEnded",!0)})},b=function(t){var e;if(v++,"proportional"===g.scaleMode){var n=Math.pow(v,v/100*.6);e=n>40?40:n}else if("fixed"==g.scaleMode&&Math.abs(t[1]-m[1])>6)return void y();D(t,e)},y=function(){f.css("width",f.css("width")).css("transition","none").css("transition","").css("width",f.css("width")).css("width",g.maxDiameter).css("opacity","0"),d=null,v=0},D=function(e,n){var i=[],o=g.fixedPos===!0?[.5,.5]:[(g.fixedPos?g.fixedPos[0]:e[0]-d.offset().left)/h[0],(g.fixedPos?g.fixedPos[1]:e[1]-d.offset().top)/h[1]],a=[.5-o[0],.5-o[1]],r=[100/parseFloat(g.maxDiameter),100/parseFloat(g.maxDiameter)*(h[1]/h[0])],s=[a[0]*r[0],a[1]*r[1]],l=g.dragging||0===v;if(l&&"inline"==d.css("display")){var c=t("<span/>").text("Hi!").css("font-size",0).prependTo(d),p=c.offset().left;c.remove(),i=[e[0]-p+"px",e[1]-d.offset().top+"px"]}l&&f.css("left",i[0]||100*o[0]+"%").css("top",i[1]||100*o[1]+"%"),f.css("transform","translate3d(-50%, -50%, 0)"+(g.adaptPos?"translate3d("+100*s[0]+"%, "+100*s[1]+"%, 0)":"")+(n?"scale("+n+")":"")),g.callback&&g.callback(d,f,o,g.maxDiameter)};return this},t.ripple=function(e){t.each(e,function(e,n){t(e).ripple(n)})},t.ripple.destroy=function(){t(".legitRipple").removeClass("legitRipple").add(window).add(document).off(".ripple"),t(".legitRipple-ripple").remove()}}(jQuery);

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};
/*
 * jquery.finger
 * https://github.com/ngryman/jquery.finger
 *
 * Copyright (c) 2013 ngryman
 * Licensed under the MIT license.
 */

(function($, ua) {

	var isChrome = /chrome/i.exec(ua),
		isAndroid = /android/i.exec(ua),
		hasTouch = 'ontouchstart' in window && !(isChrome && !isAndroid),
		startEvent = hasTouch ? 'touchstart' : 'mousedown',
		stopEvent = hasTouch ? 'touchend touchcancel' : 'mouseup mouseleave',
		moveEvent = hasTouch ? 'touchmove' : 'mousemove',

		namespace = 'finger',
		rootEl = $('html')[0],

		start = {},
		move = {},
		motion,
		cancel,
		safeguard,
		timeout,
		prevEl,
		prevTime,

		Finger = $.Finger = {
			pressDuration: 800,
			doubleTapInterval: 300,
			flickDuration: 150,
			motionThreshold: 5
		};

	function preventDefault(event) {
		event.preventDefault();
		$.event.remove(rootEl, 'click', preventDefault);
	}

	function page(coord, event) {
		return (hasTouch ? event.originalEvent.touches[0] : event)['page' + coord.toUpperCase()];
	}

	function trigger(event, evtName, remove) {
		var fingerEvent = $.Event(evtName, move);
		$.event.trigger(fingerEvent, { originalEvent: event }, event.target);

		if (fingerEvent.isDefaultPrevented()) {
			if (~evtName.indexOf('tap') && !hasTouch)
				$.event.add(rootEl, 'click', preventDefault);
			else
				event.preventDefault();
		}

		if (remove) {
			$.event.remove(rootEl, moveEvent + '.' + namespace, moveHandler);
			$.event.remove(rootEl, stopEvent + '.' + namespace, stopHandler);
		}
	}

	function startHandler(event) {
		var timeStamp = event.timeStamp || +new Date();

		if (safeguard == timeStamp) return;
		safeguard = timeStamp;

		// initializes data
		start.x = move.x = page('x', event);
		start.y = move.y = page('y', event);
		start.time = timeStamp;
		start.target = event.target;
		move.orientation = null;
		move.end = false;
		motion = false;
		cancel = false;
		timeout = setTimeout(function() {
			cancel = true;
			trigger(event, 'press');
		}, $.Finger.pressDuration);

		$.event.add(rootEl, moveEvent + '.' + namespace, moveHandler);
		$.event.add(rootEl, stopEvent + '.' + namespace, stopHandler);

		// global prevent default
		if (Finger.preventDefault) {
			event.preventDefault();
			$.event.add(rootEl, 'click', preventDefault);
		}
	}

	function moveHandler(event) {
		// motion data
		move.x = page('x', event);
		move.y = page('y', event);
		move.dx = move.x - start.x;
		move.dy = move.y - start.y;
		move.adx = Math.abs(move.dx);
		move.ady = Math.abs(move.dy);

		// security
		motion = move.adx > Finger.motionThreshold || move.ady > Finger.motionThreshold;
		if (!motion) return;

		// moves cancel press events
		clearTimeout(timeout);

		// orientation
		if (!move.orientation) {
			if (move.adx > move.ady) {
				move.orientation = 'horizontal';
				move.direction = move.dx > 0 ? +1 : -1;
			}
			else {
				move.orientation = 'vertical';
				move.direction = move.dy > 0 ? +1 : -1;
			}
		}

		// for delegated events, the target may change over time
		// this ensures we notify the right target and simulates the mouseleave behavior
		while (event.target && event.target !== start.target)
			event.target = event.target.parentNode;
		if (event.target !== start.target) {
			event.target = start.target;
			stopHandler.call(this, $.Event(stopEvent + '.' + namespace, event));
			return;
		}

		// fire drag event
		trigger(event, 'drag');
	}

	function stopHandler(event) {
		var timeStamp = event.timeStamp || +new Date(),
			dt = timeStamp - start.time,
			evtName;

		// always clears press timeout
		clearTimeout(timeout);

		// tap-like events
		// triggered only if targets match
		if (!motion && !cancel && event.target === start.target) {
			var doubleTap = prevEl === event.target && timeStamp - prevTime < Finger.doubleTapInterval;
			evtName = doubleTap ? 'doubletap' : 'tap';
			prevEl = doubleTap ? null : start.target;
			prevTime = timeStamp;
		}
		// motion events
		else {
			// ensure last target is set the initial one
			event.target = start.target;
			if (dt < Finger.flickDuration) trigger(event, 'flick');
			move.end = true;
			evtName = 'drag';
		}

		trigger(event, evtName, true);
	}

	// initial binding
	$.event.add(rootEl, startEvent + '.' + namespace, startHandler);

})(jQuery, navigator.userAgent);var myHistory=[{type:"home",url: __SITE_URL__}];

function pageLoad(){
	window.history.pushState(myHistory, "",  location.href);
	}
pageLoad();
	
	
function on_popstate(e){
	if (myHistory.length > 0) {
        var pg = myHistory.pop();      
        var estate=myHistory[myHistory.length-1];
        window.history.pushState(myHistory, "", estate.url );
      go_onBackPressed( estate );
      
    } else {
    	myHistory.push({type:"home", url:__SITE_URL__});
     window.history.pushState(myHistory, "", __SITE_URL__);
    	go_onBackPressed( );
        //No "history" - let them exit or keep them in the app.
    }
}
	
$(window).on("popstate", function(event){
on_popstate(event.originalEvent);
return
var estate=event.originalEvent.state;
  go_onBackPressed(estate);
});

var lastTop;

var osbdb=( function(){
var destroy_=function(start__with="OSB__"){
       for (var i = 0; i < localStorage.length; i++){
       	var key_=localStorage.key(i);
     if(  key_.startsWith(start__with)){
     	localStorage.removeItem( key_);
       }
    }
}

 var storeKey_=function(key, keyType, expiryDate, start__with){
 	try{
 var keys_=getKeys_();
 keys_[key]=[keyType,expiryDate, start__with];
 	localStorage.setItem(SITE_UNIQUE__ + "jdkeys" , JSON.stringify( keys_)  );
   }catch(e){
  alert("OSBjdb: " + e)	
  }
 
 }
 
 var getKeys_=function(){
return JSON.parse( localStorage.getItem(SITE_UNIQUE__ + "jdkeys")||"{}");
 }
 
 
 var deleteKey_=function(key, all){
 var keys_=getKeys_();
	 delete keys_[key];
localStorage.setItem(SITE_UNIQUE__ + "jdkeys" , JSON.stringify( keys_)  ); 
 }
 
 var set_=function(key, data, expiryDate, start__with="OSB__"){
try{
  expiryDate=expiryDate||0;
if( expiryDate ) expiryDate=  moment().add( expiryDate, "minutes").unix();
var keyType=typeof data;
 	 storeKey_(key, keyType, expiryDate, start__with );
 if( keyType==="string"){
	localStorage.setItem(start__with + SITE_UNIQUE__ + key , data );
	}
	else  if( keyType==="object"  ){
	localStorage.setItem(start__with + SITE_UNIQUE__ + key , JSON.stringify( data) );
	}
  }catch(e){
  alert("OSBjdb: " + e)	
  }
 }
 
var get_=function(key){
	var keyType=getKeys_()[key];
if( !keyType||keyType.length<3) return "";
	if( keyType[1] && moment().unix()>keyType[1] ) return "";

var data=localStorage.getItem( (keyType[2]||"") + SITE_UNIQUE__ + key);

if(  keyType[0]==="object")  return JSON.parse( data );
else return data;
}

var delete_=function(key, start__with="OSB__"){

	localStorage.removeItem( start__with + SITE_UNIQUE__ + key );
 deleteKey_(key, "");
}

return {
	set: set_,
	get: get_,
	delete: delete_,
	destroy: destroy_
 }
 
})()


var rights="android.permission.WRITE_EXTERNAL_STORAGE";
var recordPermission="android.permission.RECORD_AUDIO";

function hasPermission(r) {
 r=r?r:rights;
return android.system.checkRuntimePermission(r);
 }

function requestPermission(r){
  r=r?r:rights;
 android.system.requestPermissions(r);
}

function loginRequired(){
  return localStorage.getItem('login_required');
}

function toggleView(view,action){
  action=action?"hide":"";
  android.control.execute("toggleView('" + view + "','" + action + "');");
 }


function startOwnActivity(name) {
  var act = new android.JavaObject("activity");
  var pack = act.getPackageName();
  var intent = {
  action:"android.intent.action.MAIN",
  component:{
   package:pack,
   className: pack + "." + name
  }};
  android.activity.startActivity(intent);
}

function randomString(len,charSet) {
    charSet = charSet || 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    var randomString='';
    for (var i=0; i<len;i++) {
        var randomPoz=Math.floor(Math.random()*charSet.length);
        randomString+=charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

function randomNumber(len,charSet) {
    charSet = charSet || '023456789';
    var randomString='';
    for (var i=0; i<len;i++) {
        var randomPoz=Math.floor(Math.random()*charSet.length);
        randomString+=charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

function randomNumbers(len,charSet) {
    charSet = charSet || '023456789';
    var randomString='';
    for (var i=0; i<len;i++) {
        var randomPoz=Math.floor(Math.random()*charSet.length);
        randomString+=charSet.substring(randomPoz,randomPoz+1);
    }
 return randomString;
}


function imgcache( temp_){ 
  var ic=temp_||localStorage.getItem("img_cache_reset")||randomString(4 );
  return ic;
}


function parseJson( string_){
  try{
    return JSON.parse( string_);
  } catch(e){
   return {};
  }
}

function substring_( text,start_,end_){
return Array.from(text).slice(start_, end_).join('');
}

function logcat(loc, t){
  
}

function imageScale(imgW,imgH,maxW,maxH){
    return(Math.min((maxW/imgW),(maxH/imgH,1)));
}


function save_user_profile( user, fullname, email, phone, country,bio,birth,joined){
  var pfile=new android.File( MAIN_FOLDER, USERNAME + '/USERS-PROFILES/' + user + '.txt');
 try{
   var p=new Object();
   p.fullname=fullname||"";
   p.email=email||"";
   p.phone=phone||"";
   p.country=country||"";
   p.bio=bio||"";
   p.birth=birth||"";
   p.joined=joined||"";
  var save= JSON.stringify( p);
   pfile.write( save);
 }catch(e){
 //alert(e)
 }
  
}


function sanitizeMessage(data, direct){
  if(direct) return data;
  return (data||"")
    .replace(/[\r\n]{2,}/g,'<br><br>')
    .replace(/[\r\n]+/g,'<br>')
    .replace(/\s/g,' ');
}

function sanitizeLocalText( text, direct){
  if( direct) return text;
     return text.replace(/&/g, '&amp;')
     .replace(/</g,'&lt;')
     .replace(/>/g,'&gt;')
     .replace(/[\r\n]{2,}/g,'<br><br>')
     .replace(/[\r\n]+/g,'<br>')
     .replace(/\s/g,' ');
  }


function buttonSpinner(node,done){
  node.find('.button-spinner').remove();
 
if(done ) return;

node.append(' <img class="button-spinner" src="' + __THEME_PATH__ + '/assets/loading-indicator/loading2.png" style="width:16px; height: 16px;">');
}

function ftoUpperCase(str){
 if(str) return str[0].toUpperCase() + str.slice(1);
 else return str;
}

function str_ireplace(str, find_, replaceWith_) {
 if(!str) return "";
  //e.g find_ & replaceWith_ must be array ['a','b']
  //replaceWith_ ['1','2'];
    for (var i = 0; i < find_.length; i++) {
        str = str.replace(new RegExp(find_[i], 'gi'), replaceWith_[i]);
    }
    return str;
}

function startsWith(str, word) {
 // alert('startwith')
    return ("" +str).lastIndexOf(word, 0) === 0;
}


function checkVerified(data, name){
  name=name||"";
 var obj=new Object();
     obj.name=name; //.substring(name.indexOf("_") + 1);
     obj.icon='';

 if( data && userVerified( data) ){
    obj.icon='<img class="pointer-events-none verified-icon" src="' + __VCDN__ + '/' + data + 'icon.png" alt="">';
 }
    
 return obj;
}

function siteAdmin(data){
  var str=strtolower( data ).substring(0,3);
 return str=="av_"?true: false;
}


function userVerified( data ){
return data.indexOf("v_")!== -1;
}

function isPage(gpin ){
 var str=strtolower( gpin ).substring(0, 4);
 return $.inArray( str, ["gu_p","gv_p"] )>-1;
}

function isGroup( gpin){
 var str=strtolower( gpin).substring(0,4);
 return $.inArray( str, ["gu_g","gv_g"] )>-1;
}

function isGroupPage( gpin){
  var str=strtolower( gpin).substring(0,4);
 return $.inArray( str, ["gu_g","gu_p","gv_p","gv_g"] )>-1;
}

function goPage( fuser){
  var str=strtolower( fuser).substring(0,3);
 return $.inArray( str, ["pv_","cv_","sv_","xv_"] )>-1;
}

function advertPage( fuser){
  var str=strtolower( fuser).substring(0,3);
 return str=="xv_"?true:false;
}


function goStaticPage( fuser){
var str=strtolower( fuser).substring(0,3);
 return $.inArray( str, ["cv_","sv_"] )>-1;
}

function goAdmin( fuser){
  var str=strtolower( fuser ).substring(0,3);
 return str=="av_"?true: false;
}


function getParameterByName(  name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function sortListFiles( dir, asc){
var list = dir.listFiles();
  list.sort( function(a,b){
  var ta = a.lastModified();
  var tb = b.lastModified();
 if(!asc){ 
   if( ta<tb ) return 1;
  if(ta>tb ) return -1;
    }
  else{ 
   if(tb<ta ) return 1;
  if(tb>ta ) return -1;
    }    
  return 0;
   
 });
return list;
}


function sortDirFiles( dir, asc){
var list = dir.listFiles();
  if( !list.length) return [];
  list.sort( function(a,b){
   // a=new androidFile(dir,
  var ta = a.lastModified();
  var tb = b.lastModified();
 if(!asc){ 
   if( ta<tb ) return 1;
  if(ta>tb ) return -1;
    }
  else{ 
   if(tb<ta ) return 1;
  if(tb>ta ) return -1;
    }    
  return 0;
   
 });
return list;
}

function sortNumbers( arr,order){
 return arr.sort(function(a, b) {
  if( order ) return b - a;
   return a-b;
  });
}


function file_ext(file) {
    var extension = file.substr( (file.lastIndexOf('.') +1) );
    switch(extension) {
        case 'jpg':
        case 'png':
        case 'gif':
        case 'jpeg':
            return 'jpg';  // There's was a typo in the example where
        break;                         // the alert ended with pdf instead of gif.
        default:
        return extension;
    }
}

function extractDomain( path){
  var url = document.createElement('a');
//  Set href to any path
 url.setAttribute('href', path);
 return url.protocol + '//' + url.hostname + ( url.port?':'+ url.port:'');
}

function uniqueInArray(arr){
var uniq=arr.filter(function(itm, i, a) {
    return i == a.indexOf(itm);
 });
  return uniq;
}

function abbrNum(number, decPlaces) {
    // 2 decimal places => 100, 3 => 1000, etc
    decPlaces = Math.pow(10,decPlaces);

    // Enumerate number abbreviations
    var abbrev = [ "K", "M", "B", "T" ];

    // Go through the array backwards, so we do the largest first
    for (var i=abbrev.length-1; i>=0; i--) {

        // Convert array index to "1000", "1000000", etc
        var size = Math.pow(10,(i+1)*3);

        // If the number is bigger or equal do the abbreviation
        if(size <= number) {
             // Here, we multiply by decPlaces, round, and then divide by decPlaces.
             // This gives us nice rounding to a particular decimal place.
             number = Math.round(number*decPlaces/size)/decPlaces;

             // Handle special case where we round up to the next abbreviation
             if((number == 1000) && (i < abbrev.length - 1)) {
                 number = 1;
                 i++;
             }

             // Add the letter for the abbreviation
             number += abbrev[i];

             // We are done... stop
             break;
        }
    }

    return number;
}



function sortElementsById(el,container,order){

 $(el).sort(function(a, b) {
  if(order){
   var a_=$(a).attr('id').toUpperCase();
   var b_=$(b).attr('id').toUpperCase();
    return (a_ < b_) ? -1 : (a_ > b_) ? 1 : 0;

  }
  else return parseInt(b.id) - parseInt(a.id);
   }).each(function() {
  var elem = $(this);
  elem.remove();
  $(elem).appendTo(container);
 });
 
}

function sortDiv(a, b) {
   return a.className < b.className;
  }

function sortByName(a, b){
  var aName = a.name.toLowerCase();
  var bName = b.name.toLowerCase(); 
  return ( ( aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}

function rtcomma(data){
  //remove trailing comma
  return $.trim(data).replace(/(^[,\s]+)|([,\s]+$)/g,'');
}


function readableFileSize(bytes, si=false, dp=1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes.toFixed(dp) + ' B';
  }

  const units = si 
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return bytes.toFixed(dp) + ' ' + units[u];
}


var escape = function (str) {
  return str
    .replace(/[\\]/g, '\\\\')
    .replace(/[\"]/g, '\\\"')
    .replace(/[\/]/g, '\\/')
    .replace(/[\b]/g, '\\b')
    .replace(/[\f]/g, '\\f')
    .replace(/[\n]/g, '\\n')
    .replace(/[\r]/g, '\\r')
    .replace(/[\t]/g, '\\t');
};


function toDate(UNIX_timestamp,time_){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var year = a.getFullYear();
  var month=a.getMonth();
  var month_ = months[month];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time= formatTime(hour,min);
  var date_= month_ + ' ' + date + ', ' + year;
  var today=moment().format('MMMM D, YYYY');
  var isToday=false;
 if(strtolower(date_)==strtolower(today) ) isToday=true;

  var result="";
 if(time_ && time_=='last_seen'){
   result='Last seen ' + (isToday?'today ':date_) + ' at ' + time;
 }else if(time_=='chat_date') {
    result= (isToday?'TODAY':date_.toUpperCase() ); 
 } else if(time_=='chat_list_date') {
    result= (isToday?time: date + '/' + ( month +1)+ '/' + year ); 
   }
 else if(time_=='comment_date') {
    result= (isToday?time: date_ )
   //date + '/' + ( month +1)+ '/' + year + '&bull; ' + time); 
   }
  else if(time_) { result= time;  }
  else{ result= date_; }
  return result;
}

function formatTime(hours,minutes) {
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+ minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}


function timeSince( date) {
  date=new Date( +date * 1000);
  var seconds = Math.floor( ( new Date() - date) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + "y";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + "mo";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + "d";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + "h";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + "m";
  }
 
 return "Just now";
 // return Math.floor(seconds) + " seconds";
}



function rtchar(data, charToTrim) {
  var regExp = new RegExp(charToTrim + "+$");
  var result = data.replace(regExp, "");
  return result;
}

function strtolower(data){
 return data.toString().toLowerCase();
 
}

function strtoupper(data){
  return data.toString().toUpperCase();
}


function randomNumbers(length) {
 return Math.floor(Math.pow(10, length-1) + Math.random() * 9 * Math.pow(10, length-1));
}


function replaceLast(str,word,replacement){
  var n = str.lastIndexOf(word);
// slice the string in 2, one from the start to the lastIndexOf
// and then replace the word in the rest
return str.slice(0, n) + str.slice(n).replace(word, replacement);
}

function validPassword(password){
  if(!password) return false;
  else if(password.match(/^[a-zA-Z0-9~@#%_+*?-]{6,50}$/) ) return true;
  else return false;
}

function validName(fullname){
 if(!fullname) return false;
else if(fullname.match(/^[a-zàáèöïÿŕëäśĺžźżçćčñńôêėřûîéìíòóùú]([.'-]?[0-9a-z àáèöïÿŕëäśĺžźżçćčñńôêėřûîéìíòóùú]+)*$/i) )return true;
else return false;
}

function validUsername(username){
 if(!username) return false;
else if (username.match(/^([a-z]+)_?[a-z0-9]{3,29}$/i) ) return true;
else return false;
}

function validPhone(phone){
 if(!phone) return false;
else if (phone.match(/^[0-9][0-9.() -]{5,19}$/) ) return true;
else return false;
}


function upgradeRequired( data_, t){
 //t: Trigger also in goSocial
  
 var ldata=$.trim( localStorage.getItem('upgrade_required'));
 var data=[];
  if(ldata){
  try{  
     data=JSON.parse(ldata);
   }catch(e){}
 }

  if(data_ && data_.version_code){    
    data=data_
    localStorage.setItem('upgrade_required', JSON.stringify(data_) );
  }
      
  if(  !data ) return;
  
 var vcode=+data.version_code;
 
  if( !vcode ) return;
 if( vcode<=(+config_.APP_VERSION) ) return;
  var vinfo=data.version_info;
  var vurl=data.version_url;
   
   var data='<div class="text-center" style="white-space: nowrap; overflow-x: hidden; text-overflow: ellipsis; padding: 15px; width: 90%; font-weight: bold; font-size: 15px;">';
        data+='Update required</div>';
      data+'<div class="center_text_div text-left;">';
     data+='<div class="container-fluid text-left" style="padding: 0 15px 15px 15px;">';
    data+='<div>' + vinfo.replace(/:nl::/g,'<br>') +'</div>';
    data+='<div class="mt-2 text-center"><a class="btn btn-sm btn-success" href="' + vurl + '">Update now</a></div>';
   data+='<img class="d-none w-40" src="file:///android_asset/loading-indicator/loading2.png">';
   data+='</div></div>';
     displayData(data,{ no_cancel:true, data_class:'.update-requred'});

  if( t ){
    android.activity.loadUrl("go_social","javascript: upgradeRequired();");
  }
}



function flashe(elements) {
  var opacity = 100;
  var color = "255, 255, 20";
 // has to be in this format since we use rgba
  var interval = setInterval(function() {
    opacity -= 3;
    if (opacity <= 0) clearInterval(interval);
    $(elements).css({background: "rgba("+color+", "+opacity/100+")"});
  }, 500)
};

function ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}


function getAverageRGB(imgEl) {

    var blockSize = 5, // only visit every 5 pixels
        defaultRGB = "rgba(0,0,0);", // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = {r:0,g:0,b:0},
        count = 0;

    if (!context) {
        return defaultRGB;
    }

    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

    context.drawImage(imgEl, 0, 0);

    try {
        data = context.getImageData(0, 0, width, height);
    } catch(e) {
        /* security error, img on diff domain */
        return defaultRGB;
    }

    length = data.data.length;

    while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i+1];
        rgb.b += data.data[i+2];
    }

// ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);

    return "rgba(" + (rgb.r + ',' + rgb.g + ',' + rgb.b) + ");";
}


function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}


function hideOptions(){
  $('.absent_reason,.sT,.esc,.mass_print_info,.original_photo,#datepicker,.multi_options,.individual_options,.select_class,.create_class,.delete_class,.rename_class').hide();
 $('.overshadow').removeAttr('onclick');
  applyScroll();
 }


function isInArray(value, array) {
return array.indexOf(value) > - 1 ;
}

function foundInArray(txt,arr){
  if($.inArray(txt,arr)>-1){ return true; }
  return false;
}
    
function sortSpecial(priorities,liveData){

  /*var priorities=['jim','steve','david'];
    var liveData=['bob','david','steve','darrel','jim'];
  */

var output=[],temp=[];  
for ( i=0; i<liveData.length; i++){
    if( $.inArray( liveData[i], priorities) ==-1){
        output.push( liveData[i]);
    }else{
        temp.push( liveData[i]);
    }
}
var temp2=$.grep( priorities, function(name,i){
        return $.inArray( name, temp) >-1;                             
});
   return $.merge( temp2, output);
}

function sortInputFirst(data, input, input2, input3) {
    var first = [];
    var others = [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].indexOf(input) == 0) {
            first.push(data[i] );
        } 
     else if (input2 && data[i].indexOf(input2) == 0) {
            first.push(data[i] );
        } 
      else if (input3 && data[i].indexOf(input3) == 0) {
            first.push(data[i] );
        } 
      else {
     others.push(data[i]);
     }
  }
    first.sort();
    others.sort();
    return ( first.concat(others));
}

 
function sendSms(phone,message){
  if (phone.length<3) {
  alert('No valid phone number specified. Update ' + member + ' data first');
  return false;
}
 
var intent={ 
  action:"android.intent.action.VIEW",
  data:"sms:" + phone,
  extras:{"sms_body":message}};
 //startActivityFix(intent);
 
android.activity.startActivity(intent);
}


function animateCSS(element, animationName, callback) {
  var node=$(element);
      node.addClass('animated ' + animationName);

    function handleAnimationEnd() {
        
      node.removeClass('animated ' + animationName);
      node.unbind('webkitAnimationEnd oanimationend msAnimationEnd animationend');       
     if (typeof callback==='function') callback();
   
}

   node.one('webkitAnimationEnd oanimationend msAnimationEnd animationend',handleAnimationEnd);
 
 }


/*

And use it like this:

animateCSS('.my-element', 'bounce')

// or
animateCSS('.my-element', 'bounce', function() {
  // Do something after animation
})


*/


function remOsAttr(){
 $('.overshadow').removeAttr('onclick');
 }

function addOsAttr(func){
  if(func) $('.overshadow').attr('onclick',func);
 }

function stopScroll(elem,elem2){
  var v=0;
   if (elem2){
  if( elem2.search('.')!=-1 ) v=$(elem2).visibleHeight()-10;
    else v=+elem2;
 }

  elem=elem||'.main-container';
   lastTop =$(window).scrollTop();
  sessionStorage.setItem('lastTop',lastTop);
   $(elem).addClass('noscroll').css({top:-(lastTop-v)}); //lastTop-118
  }

function continueScroll(elem) {  
  elem=elem||'.main-container';                  
    $(elem).removeClass( 'noscroll' );

  var lastTo=+sessionStorage.getItem('lastTop')||lastTop;
      
      $(window).scrollTop( lastTo );       
 }          

 sessionStorage.setItem('gscid', randomString(4));
 
function getScroll(noScroll,oS,elem,elem2){
   var c=sessionStorage.getItem('gsccc');
  setTimeout(function(){
    sessionStorage.removeItem('gsccc'); },400);
   
 if(!c){
  var gscid=sessionStorage.getItem('gscid');  
  var gsc=+sessionStorage.getItem('gsc' + gscid);
     gsc=gsc<0?0:gsc;
  sessionStorage.setItem('gsc' + gscid, gsc+1); 
    sessionStorage.setItem('gsccc','1');
    }
if (noScroll) { stopScroll(elem,elem2); if (oS) { overshadow(); }  return false; }
   if (oS) overshadow(); 
   lastTop = $(window).scrollTop();
 }


 $(window).scroll(function(){
   lastTop = $(window).scrollTop();
   // sessionStorage.setItem('lastTop',lastTop);
 });



function applyScroll(oS,elem){
  var co=true;
  var cs=true;
   var gscid=sessionStorage.getItem('gscid');
   var gsc=+sessionStorage.getItem('gsc' + gscid);

    remOsAttr();
 if(gsc<2 ){
  if (!oS && co ) close_overshadow();
   if (cs) continueScroll(elem);
   sessionStorage.removeItem('gsc' + gscid);
  }
   sessionStorage.setItem('gsc' + gscid,gsc-1);
 
  }



var toastTimer;
function toast(data,c,callback){
  if(toastTimer) clearTimeout(toastTimer);
  var config=$.extend({
  pos:80,
  custom_class:'',
  hide: 3000,
  type: 'danger',
  align: 'center',
  font_size: '13px',
  width: '100px',
  color:'#ffffff',
  border: '0',
  background:'',
  manual_close: false
},c);
   
   var bg={
           danger: '#d9534f',
           success: 'seagreen',
           info: '#4b6cb7',
           warning:'orange',
           light:'#f5f5f5',
           primary:'#0079c6'
          };

 if(toastTimer) clearTimeout(toastTimer);
   $('.android_toast').hide();
    var mc="";
  if(config.manual_close){
   mc='<img onclick="' + (callback?'callback();':'') + 'clearTimeout(toastTimer);$(\'.android_toast\').fadeOut();" src="file:///android_asset/images/bg/close.png" style="width: 17px; position: absolute; top:-5px; left:-5px;">'; 
  }

  var zi=999900;
 var zindex=+$("#z-index").val()||0;
  if( zindex>zi){
     zi=zindex;
  } 
  
  var div='<div class="android_toast ' + config.custom_class + '" style="background: ' + ( config.background||bg[config.type] ) +
       '; position: fixed;  z-index: ' + zi + '; left: 50%; top: ' + config.pos + '%; opacity:.95; color:#fff; border: ' + config.border + '; border-radius: 20px; padding: 15px 16px; max-width: 600px; ' + 
       ' min-widt: ' + config.width + '; -webkit-transform: translate(-50%,-' + config.pos + '%); text-align: ' + config.align + 
        '; font-size: ' + config.font_size + '; color: ' + config.color + '">' + mc + data + '</div>';
  
  $('body').append(div);
 toastTimer=setTimeout(function(){
    $('.android_toast').fadeOut();
   clearTimeout(toastTimer);
   if(callback) callback();
  },config.hide);
}


function displayData(data,arr){
  var osclass='dd_' + randomString(10);
  var a=$.extend({
    ddclass:'body',
    pos: 50,
    gs:true,
    os:true,
    osc: osclass,
 //    oszindex: 999999,
    bground:'#fff',
    data_class:'.nothing',
    osclose: false,
    on_close: '',
    type:0,
    title:'',
    opacity:'0.5',
    dummy: false,
    append: true,
    max_width: '550px',
    width: '90%',
    hash: true,
    no_cancel: false, //i.e cannot be cancelled by back button
  }, arr);
  
  
/*
  var zindex=+$("#z-index").val()||0;
  if( zindex>a.oszindex ){
     a.oszindex=zindex;
  }
  */
  
  a.oszindex=zindex();

  if($(a.data_class).length) return;

  //osclose if set to true, then user can also close div on overshadow click
  var osclose='';
   if(a.osclose){
 osclose=' onclick="closeDisplayData(\'' + a.data_class + '\',\'' + a.on_close + '\',1);"';
  var no_cancel=a.no_cancel?'no-cancel':'';
  }
  var div='';
  if(a.dummy){
     div+='<div class="display--data d-none ' + no_cancel + ' ' + a.data_class.replace('.','') + '" data-class="' + a.data_class + '"></div>';
  }else if(a.type){
    
    div='<div class="display--data center_div ' + no_cancel + ' center-div ' + a.data_class.replace('.','') + '" data-class="' + a.data_class + '" style="background: ' + a.bground + '; width: ' + a.width + '; max-width: ' + a.max_width + ';">';
   //  div='<i class="text-danger fa fa-lg fa-close" style="position: absolute; top: 5px; right: 2%;">Close</i>';
    div+='<div class="center_header">' + (a.title?a.title:'') + '</div>';
    div+='<div class="center_text_div" style="width:100%; padding: 10px 15px;">';
    div+=data;
    div+='</div></div>';
  }
  else {
    div='<div class="display--data center_div ' + no_cancel + ' center-div ' + a.data_class.replace('.','') + '" data-class="' + a.data_class + '" style="background: ' + a.bground + '; width: ' + a.width + '; max-width: ' + a.max_width + ';">';
    div+= data;
    div+='</div>';
  }
  
  if(a.append){
    $(a.ddclass).append(div);
  }else{
   $(a.ddclass).prepend(div);
  }
  
 var hash_id=randomString(3)
 
if( a.hash )  changeHash("");
  
  var pos_=a.pos + '%';
  var trans='translate(-50%,-' + pos_ + ')';
 
  $(a.data_class).css({'z-index':( a.oszindex + 20), 'top': pos_, '-webkit-transform': trans} ).attr('data-overshadow','.' + a.osc)
.attr("data-hash-id", hash_id)
.after('<div class="DONT_PRINT dont_print ' + a.osc + '" style="background: #000; position: fixed; z-index: ' + a.oszindex + '; top:0; left:0; right:0;  bottom:0; opacity: ' + a.opacity + '; display:none;"' + osclose + '></div>');
  
   if (a.gs) getScroll(true);
   if(a.os) $('.' + a.osc).show();
}

 function closeDisplayData(elem,callback,btn){
 if( btn) {
 return history.go(-1);
}
  var el=$(elem);
   var os=el.data('overshadow');
   var hid=el.data("hash_id");

   if(callback){
  if(typeof callback==='string' ||callback instanceof String){ window[callback](); } 
      else callback();
   }
  
   el.remove();
   $(os).remove();
  applyScroll(1);
 }



function cropImage(url,id,w,h,type){
 var image = new Image();
 // When the image has loaded, draw it to the canvas
    image.onload = function(){
  var canvas=document.getElementById(id);
  if (type) {
   canvas=document.getElementsByClassName(id);
   for(i=0; i<canvas.length; i++){
 var cv=canvas[i];
 var context =cv.getContext("2d");
    context.drawImage(image,0, 0 , w, h);
  } 
 } else{
    var context = canvas.getContext("2d");
    context.drawImage(image,0, 0 , w, h);
  }
 }

  image.src=url;
}


function shareDocument(file,mimeType,callback) {
  android.activity.shareFile(file,mimeType,callback);
    }

 
function shareHtml(html) {
  var intent={
  action:"android.intent.action.SEND",
  type:"text/html",
  extras:{
  "android.intent.extra.TEXT" : html
  }
 };
android.activity.startActivity(intent,true);
}


(function( $ ) {
	
	$.fn.imageResize = function( options ) {

        var settings = {
            width: 150,
            height: 150
        };
        
        options = $.extend( settings, options );
     
        return this.each(function() {
			var $element = $( this );
            var maxWidth = options.width;
            var maxHeight = options.height;
            var ratio = 0;
            var width = $element.width();
            var height = $element.height();

            if ( width > maxWidth ) {
                ratio = maxWidth / width;
                
                $element.css( "width", maxWidth );
                $element.css( "height", height * ratio );

            }

            if ( height > maxHeight ) {
                ratio = maxHeight / height;
                
                $element.css( "height", maxHeight );
                $element.css( "width", width * ratio );

            }

        });

    };
})( jQuery );


var _getAllFilesFromFolder = function(dir,dir2) {
 
      var file_ = new android.File(dir);
     var list = file_.list();
     // var filesystem = require("fs");
    var results = [];

   // filesystem.readdirSync(dir).forEach(function(file) {

     $.each(list,function(i,file){
      //  file = dir+'/'+file;
       file=dir+'/'+file;
      //  var stat = filesystem.statSync(file);
     var stat=new android.File(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file,dir2))
        } else results.push(file.replace(dir2,''));
    });

    return results;
};
    

$.extend({
    distinct : function(anArray) {
       var result = [];
       $.each(anArray, function(i,v){
           if ($.inArray(v, result) == -1) result.push(v);
       });
       return result;
    }
});


$.fn.extend({
  autoHeight: function () {
    function autoHeight_(element) {
      return jQuery(element)
        .css({ "height": "28px", "overflow-y": "hidden" })
        .height(element.scrollHeight).css("overflow-y","auto");
    }
    return this.each(function() {
      autoHeight_(this).on("input", function() {
        autoHeight_(this);
      });
    });
  }
});
  

$.fn.flash = function(duration, iterations) {
    duration = duration || 1000; // Default to 1 second
    iterations = iterations || 1; // Default to 1 iteration
    var iterationDuration = Math.floor(duration / iterations);
  for (var i = 0; i < iterations; i++) {
   this.fadeOut(iterationDuration).fadeIn(iterationDuration);
    }
  return this;
}






function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}



const htmlFormat =[
    { symbol: '*', tag: 'strong',  regex: '(?<=[ >~`\\^_.rbgm-]|^)\\*(?:(?!\\s)).*?[^ ]\\*(?=[\\W_]|$)' },
    { symbol: '_',   tag: 'em',    regex: '(?<=[ >~`\\^\*.rbgm-]|^)_(?:(?!\\s)).*?[^ ]_(?=[\\W_]|$)'},
    { symbol: '~',   tag: 's',     regex: '(?<=[ >`\\^\*_.rbgm-]|^)~(?:(?!\\s)).*?[^ ]~(?=[\\W_]|$)' },
    { symbol: '--',  tag: 'u',     regex: '(?<=[ >~`\\^\*_.rbgm]|^)(?:--)(?:(?!\\s)).*?[^ ](?:--)(?=[\\W_\]|$)' },
    { symbol: '```', tag: 'tt',    regex: '(?<=[\\^> ]|^)(?:```)(?:(?! ))([^]*)[^ ](?:```)(?=[\\W_]|$)' },
    { symbol: '^',   tag: 'code',  regex: '(?<=[`> ]|^)(?:\\^)(?:(?! ))([^]*)[^ ](?:\\^)(?=[\\W_]|$)' },
    { symbol: '?r',  tag: 're',    regex: '(?:\\?r)(?:(?!\\s)).*?[^ ](?:\\?r)' },
    { symbol: '?b',  tag: 'bl',    regex: '(?:\\?b)(?:(?!\\s)).*?[^ ](?:\\?b)' },
    { symbol: '?g',  tag: 'gr',    regex: '(?:\\?g)(?:(?!\\s)).*?[^ ](?:\\?g)' },
    { symbol: '?sm', tag: 'small', regex: '(?:\\?sm)(?:(?!\\s)).*?[^ ](?:\\?sm)' },
    { symbol: '?lg', tag: 'big',   regex: '(?:\\?lg)(?:(?!\\s)).*?[^ ](?:\\?lg)' }
 ]


function parsemd__(string, show_symbol){
  var obj={}
  string=string.replace(/&quot;/g,'"').replace(/<br>/g,"\n");

string=string.replace(/(https?):\/\/[^"\]]*?(?=<|\s|\*|$)(?=<|\s|\*|$)/gi, function(m){
  var v=m.toString();
   var lid=randomString(6) + "??>";
    obj[lid]= v;
    return lid;
 });
// (https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.]*[-A-Z0-9+@#\/%=~_|&;]

 $.each( htmlFormat,function(i,v){  
  var symbol=v.symbol;
  var tag= v.tag;
  var reg= v.regex;
   
  if( show_symbol && tag=="code"){
    tag="plaincode";
  }

   const regex=new RegExp( reg, "gm");
   const match = string.match(regex);
   
   if(!match ) return;
  
 if( tag!="code" && tag!="tt" && tag!="plaincode" && match.toString().match(/\n/) ) return;
  
  match.forEach(m => {
    let formatted = m;
    
 formatted= formatted.replace( new RegExp("(^" + escapeRegExp( symbol) + ")"), function(m,n){
   return `<${tag}>`;
 });    

 formatted= formatted.replace( new RegExp("(" + escapeRegExp( symbol) + "$)"), function(m){
    return `</${tag}>`;
  })
  
   string = string.replace(m, (show_symbol?'<span class="text-format-symbol">' + symbol + '</span>':'') + formatted + ( show_symbol?'<span class="text-format-symbol">' + symbol + '</span>':'') );
    });
 });

 $.each(obj, function( lid, link){
   string=string.replace( lid, '<a href="' + link + '" class="user-post-link">' + link + '</a>');

 })
return string;
}


function bbCode(text, show_symbol){
  var string = parsemd__( text, show_symbol );

 string=string.replace(/(?<=\s|^)@([\w_-]+)(?=\s|$)/gi, '<span class="post-chat-user" data-fuser="$1">$1</span>')
     .replace(/\[\[([\w-]+)\]\]/g,'<span class="join-group-btn-2" data-gpin="$1">+ $1</span>')
  
  return string;
}

function removebbCode(text){
 
return text.replace(/<strong>(.*?)<\/strong>/g,'*$1*')
           .replace(/<em>(.*?)<\/em>/g,'_$1_')
           .replace(/<s>(.*?)<\/s>/g,'~$1~')
           .replace(/<u>(.*?)<\/u>/g,'--$1--')
           .replace(/<tt>([\s\S]*)<\/tt>/g,"```$1```")
       .replace(/<code>([\s\S]*)<\/code>/g,"^$1^")
          .replace(/<div.*?href="(.*?)">(.*?)<\/span><\/div>/g,'[link=$1]$2[/link]')
       .replace(/<a href="(.*?)".*?>(.*?)<\/a>/g,"$1")
  .replace(/<re>(.*?)<\/re>/g,  '?r$1?r')
  .replace(/<bl>(.*?)<\/bl>/g,  '?b$1?b')
  .replace(/<gr>(.*?)<\/gr>/g,  '?g$1?g')
  .replace(/<big>(.*?)<\/big>/g,'?lg$1?lg')
  .replace(/<small>(.*?)<\/small>/g,'?sm$1?sm')
  .replace(/<span class="j([^>]*)>(.*?)<\/span>/g,'$2')
  .replace(/<span class="p([^>]*)>(.*?)<\/span>/g,'@$2')
  .replace(/<i class="fa (.+)"><\/i>/g,'fa $1')

}


function go_textFormatter(text){
  text= parsemd__(text);
  text=text
//.replace(/(?<=\s|^)@([\w_-]+)(?=\s|^)/gi, '<span class="post-chat-user" data-fuser="$1">$1</span>')
     .replace(/\[follow=(.*?)\](.*?)\[\/follow\]/g,'<span class="go-follow-btn go-post-follow-btn" data-fuid="$1">$2</span>')
     .replace(/\[\[([\w_-]+):(.*?)\]\]/gi, '<span class="fa fa-lg fa-$1 ext-social-button" data-site="$1" data-account="$2"> $2</span>')
     .replace(/\[img=(.*?)\](.*?)\[\/img\]/g, '<img class="go-post-image go-post-photo" src="$1" alt="$2" onerror="go_postImgError(this);">')
     .replace(/\[link=(.+)\](.+\S)\[\/link\]/g,'<div class="go-nice-link-container"><span class="go-nice-link" href="$1">$2</span></div>')
    .replace(/(?<=\s|^)@([a-z0-9_]+)(?=<|\s|$)/gi, '<uzer>@$1</uzer>')
   .replace(/(fa fa-(.+) fae)/gi, '<i class="$1"></i>')
   .replace(/\[fullname::\]/g, FULLNAME)
 return text;
}
var exitTime__=false;

function go_onBackPressed(estate){

if( $('.display--data').length ){
   var elem=$('.display--data:last');
  if(!elem.hasClass('no-cancel') ){
   closeDisplayData( elem.data('class'),null);
  closeTopPageList(); //this just cancel ajax
 }
 
}
else if($('.console-log').is(':visible')){
  $('.console-log,#show-console-log' ).css('display','none');
  }
  
 else if( $('#go-full-photo-container').is(':visible')){
  closeFullPhoto();
 }
  else if( $('#go-full-cover-photo-container').is(':visible')){
  closeFullCoverPhoto();
  }
  else if( $("#go-video-element-container").is(":visible") ){
go_exitVideoFullScreen();
 }
  else if( $('#compose-post-container').is(':visible')){
  closeComposePage();  
 }
  else if( $('#go-profile-update-container').is(':visible')){
  closeProfileUpdateForm();
  }  
  else if( $('#go-rcomment-container').is(':visible')){
     goCloseCommentReply();
 }  
  else if( $('#go-comment-container').is(':visible')){
    goCloseComment();
 }
 
 else if( $('#go-single-post-container').is(':visible') ){
  closeSinglePost();
 }
 
  else if( $('#go-profile-container').is(':visible') ){
  goCloseProfile();
  }  
  else if($('#go-followers-container').is(':visible') ){
   closeViewFollowers(); 
  }
  else if($('#go-following-container').is(':visible') ){
closeViewFollowing(); 
  }
 
  else if($('#go-blocked-followers-container').is(':visible') ){
 closeViewBlockedFollowers(); 
  }
  else if( $('#go-follow-container').is(':visible') ){
    clearTimeout(fsuggestionsTimeout);
    if( fsuggestionsAjax) fsuggestionsAjax.abort()
  closeFollowForm(); 
  }
  else if($('#go-settings-container').is(':visible') ){
   closeSettingsPage(); 
  }
 else if( $("#go-saved-posts-container").is(":visible") ){
   closeSavedPosts(); 
  }
 else if( $(".reactions-box").length){
   closeReactionsBox();
 }
 else if($('#go-notifications-container').is(':visible') ){
 closeNotifications(); 
  }
   
 else if($('#go-search-container').is(':visible')){
    closeSearch(); 
 }  
  else if( $('#go-request-app-container').is(':visible')){
   closeRequestApp();
 
 }
  else if( $('#go-create-page-form-container').is(':visible') ){
    closeCreatePageForm(); 
  } 
  else if( $('#go-downloads-container').is(':visible') ){
  closeDownloadsPage(); 
  } 
  
  else if ( !$('.right-side-bar-container').hasClass("hide-right-sidebar")
        && $("#IS-MOBILE").is(":visible") ){
  closeRightMenus();
}
  
else if ( !$('.side-bar-container').hasClass("hide-left-sidebar") 
        && $("#IS-MOBILE").is(":visible") ){
 
   closeMenus();
  
 } 
 else{
   
if( exitTime__ ){
    closeGoSocial();
   }
   else{
  //toast('Press again to exit.');

    exitTime__=true;
  setTimeout( function(){
    exitTime__=false; },1500);
 }
 }
 
 if( estate && estate.type){
  var type=estate.type;
  
  if( type=="single-post"){
        
 var elem=$("<div/>").addClass("go-open-single-post")
  .attr("data-pid", estate.pid)
  .attr("data-cpid", estate.cpid)
  .attr("data-cpid", estate.puid)
  .attr("data-no-push",1)
  elem.appendTo('body').click();   
  }
  else if( type=="profile" ){

	var elem=$("<div/>").addClass("go-open-profile")
  .attr("data-uid", estate.user_id)
  .attr("data-unicename", estate.unicename)   .attr("data-no-push",1)
  elem.appendTo('body').click();
	}
	else if( type=="comment"){
		var elem=$("<div/>").addClass("go-open-comments-box")
  .attr("data-uid", estate.uid)
  .attr("data-pid", estate.pid)
.attr("data-no-push",1)
  elem.appendTo('body').click();
 }
	else if( type=="comment-reply"){

	var elem=$("<div/>")
  .attr("data-uid", estate.uid)
  .attr("data-unicename", estate.unicename)    .attr("data-parent-id", estate.parent_id)
  .attr("data-fullname", estate.fullname)
  .attr("data-tag", estate.tag)
  .attr("data-pid", estate.pid)
  .attr("data-is-notification", estate.is_notification)
 .attr("data-no-push",1);
 
  elem.appendTo('body').click(function(){
  	replyComment(this, estate.parent_cauthor_id);
  } ).click()
	}else if(  type=="full-avatar"){
	
 var elem=$("<div/>")
       .addClass("go-post-author-icon no-push")
       .html('<img src="' + estate.src + '" />')
       elem.appendTo("body").click();
     }
   }      
}


var GO_UPLOAD_FILE_PATHS=[]; 
var GO_UPLOADED_FILE_PATHS=[];
var POST_FILES_EDIT={};
var ADS___;
var SERVER_SETTINGS=[];
var __IMG_PLACEHOLDER__="https://placehold.co/100/9cb0e6/9cb0e6?text=o";

function img_placeholder( size,text){
	size=size||100;
	text=text||"o";
	return "https://placehold.co/" + size + "/9cb0e6/9cb0e6?text=" + text;
	}
	
//var loaded_ad=[];
var adPosMin=0;

var commentAjax,fsuggestionsAjax=false,fsuggestionsTimeout=false;
var commentTimeout,lspTimeout,lspLoading,lspAjax;
var loadingPosts,loadingGoPages,tloadingGoPages,searchingPosts,loadingProfilePosts,loadingNotificationAjax,loadingNotificationsPosts;
var loadingFullPost=false;
var connCounts=0;
var WAIT_FOR_ME=false;
var composingTimeout=false;
var imgcache_=imgcache();
var postEditMeta;

var GO_FOLDER="";

localStorage.setItem(SITE_UNIQUE__ + 'go_social_opened','true');
//This lStorage is removed at app launch. Check control menu.js

function loginRequired(){
  return localStorage.getItem(SITE_UNIQUE__ + "login_required");
  }
  
function loggedIn(){
  if( !localStorage.getItem(SITE_UNIQUE__ + "logged_in")
 ||!localStorage.getItem(SITE_UNIQUE__ + "ID") )
{
  return false;
  }
  else return true;
  }  
 
function storedPostLikes_(){
	var sl=localStorage.getItem(SITE_UNIQUE__ + "POSTS_SAVED_LIKES")||"";
var len=sl.length;
if( len> 3000){
	localStorage.removeItem(SITE_UNIQUE__ + "POSTS_SAVED_LIKES");
	sl=null;
}
 return sl?JSON.parse(sl):{}
}

var POSTS_SAVED_LIKES= storedPostLikes_();

function postLiked(pid){
return POSTS_SAVED_LIKES[pid];
}
	
function storePostLike(lid, reaction){
 POSTS_SAVED_LIKES[lid]=reaction;
 localStorage.setItem(SITE_UNIQUE__ + "POSTS_SAVED_LIKES", JSON.stringify( POSTS_SAVED_LIKES));
}

function removePostLike( lid){
  delete POSTS_SAVED_LIKES[lid]; localStorage.setItem(SITE_UNIQUE__ + "POSTS_SAVED_LIKES", JSON.stringify( POSTS_SAVED_LIKES) );
	}

function stackOrder(value_){
 var stacksDiv=$('#go-stack-order');
  if( value_){
   return stacksDiv.prepend( value_ + ',');
  }                          
  var stacks= stacksDiv.text()||"";
  var next="";
  if( stacks) {
    next=stacks.split(',')[0]||"";
    stacksDiv.text( stacks.replace(next + ",","") );
   return next;
  }
  else return "";
 }

function AE(time_){
  if( !go_config_.aet) return;
  time_=time_||moment().unix();
 var it=+localStorage.getItem(SITE_UNIQUE__ + 'Aet');
  if(!it ){
   it= time_;
   localStorage.setItem(SITE_UNIQUE__ + 'Aet', it ); 
  }
 var mejila= time_- 43200;
  if( it< mejila){
    // android.control.execute("AE(1);");
  }
}

function openMessage(){
  downloadApp();
  
  $('#total-new-messages').attr('data-total',0).text(0).css('display','none');
  localStorage.removeItem( SITE_UNIQUE__ + "xxxx_total_new_messages");
}

if( MS__=='m'){
  openMessage();
  quitLoading(); //Non existent function
}


function zindex(){
  var zindex=$("#z-index");
  var zi=+zindex.val()||40;
  zindex.val( zi+20);
   return zi;
 }

function osb_permalink(id, slug){
   var burl=$("#base-url").attr("href");
   return burl + "post/" +  (slug?slug:id );
}

function showSiteTagline(){
	$("#OSB-SITE-TAGLINE").fadeIn().fadeOut(10000);
}
	
function toggleLeftSidebar(){
	var sbar=$(".side-bar-container");
    var mcont=$(".main-content-container");

  if(  mcont.hasClass("main-content-marginised") ){
  return history.go(-1);
  }
  
  var oWidth_=+sbar.attr("data-width");
  var oWidth=oWidth_||sbar.width();
  
  if( !oWidth_) {
   sbar.attr("data-width", oWidth);
 }
  
  if( !sbar.hasClass("hide-left-sidebar") ){
	//Close
 sbar.animate({
            width: 0
        }, 100,function(){
        mcont.removeClass("main-content-marginised-left");   	
   sbar.css({"width": oWidth,"display":"none"});
   sbar.addClass("hide-left-sidebar");
   sbar.css("display","");
   mcont.css("margin-left", 0)
});
 $(".main-content-shadow").fadeOut(100);
  }else{
  	//open
	changeHash("");
    sbar.removeClass("hide-left-sidebar").css({"width":0, "display":"inline-block"});
       sbar.animate({
        width: oWidth
     }, 100, function(){
  mcont.css("margin-left", oWidth)
  .addClass("main-content-marginised-left")
});

     $(".main-content-shadow").fadeIn(200);
   }
}

function toggleRightSidebar(){

  var mcont=$('.main-content-container');
  var sbar=$('.right-side-bar-container');

 if( !$(".side-bar-container").hasClass("hide-left-sidebar") ){
 	history.go(-1);
  return;
 }
  
 var oWidth_=+sbar.attr("data-width")||0;
 var oWidth=oWidth_||sbar.width();
 
  if( !oWidth_) {
   sbar.attr("data-width", oWidth);
 }  
 if( !sbar.hasClass("hide-right-sidebar") ){
	//Close
      mcont.animate({
           marginLeft: 0
        }, 100, function(){
   mcont.removeClass("main-content-marginised");
sbar.addClass("hide-right-sidebar");
  mcont.css("margin-left", 0);
});
      
 $(".main-content-shadow").fadeOut(100);
 }else{
   //Open
   changeHash("");
   sbar.removeClass("hide-right-sidebar");   
    mcont.animate({
       marginLeft: -oWidth
   },100, function(){
   
   mcont.css("margin-left", -oWidth).addClass("main-content-marginised"); 
    });
 $(".main-content-shadow").fadeIn(200);
  }
}

function  go_user_icon(avatar, type){
	type=type||"small";
avatar=( avatar||__SITE_URL__ + "/xxx/no-photo.png") + "?s=" + type + "&c=" + imgcache_;
return '<img class="lazy" alt="" onerror="go_imgIconError(this);" src="' + img_placeholder( 100 )    + '" data-src="' + avatar + '">';
}

function go_user_photo( user, class_){
  class_=class_||'friend-picture';
  
var real_path=__SITE_URL__ + "/" + user + "/photo.jpg?i="+ imgcache_;

  var avatar=__THEME_PATH__ + '/assets/go-icons/avatar-grey.png';
  return '<img class="lazy ' + class_ + '" alt="" onerror="go_imgIconError(this,\'' + user + '\');" src="' + __IMG_PLACEHOLDER__ + '" data-src="' + real_path + '" data-id="' + strtolower(user ) + '">';
}

function go_imgIconError(image) {
  image.src = img_placeholder( 400 )  
  image.onerror=null;
}


function go_postImgError(image, bg,cnt_) {

  bg=bg||'transparent2';
  cnt_=cnt_||2;
 if ( !image.hasOwnProperty('retryCount')){
      image.retryCount = 0;
  }
 var cnt=image.retryCount;
  if ( cnt < cnt_){ 
  image.src = image.src + '?' + +new Date;
  image.retryCount += 1;
  }else{
   image.onerror=null;
   return image.src =__THEME_PATH__ +  '/assets/go-icons/bg/' + bg + '.png';
  }
}


function go_imgError(image,bg) {
    image.onerror = null;
  setTimeout( function (){
     image.src += '?' + +new Date;
   }, 1000);
}


function goFetchPhoto(path, callback){
  var img = document.createElement('img');
     img.onload = function(){     
       var canvas = document.createElement('canvas');
       var ctx = canvas.getContext('2d');

       var width=img.width;
       var height=img.height;
       
       canvas.width=width;
       canvas.height=height;
 
     ctx.drawImage(this,0,0,width, height);
     callback( canvas.toDataURL('image/jpeg', 0.8) );
  };
      img.src = path;
     img.addEventListener('error', function(e){
      callback('','error'); 
      });
}
  
function go_videoPlayerLayout( data, fdload, poster, reposted, from_comm){
  
 var sourceUrl= data.path;
 var fsize= data.size;
 var width=  data.width;
 var height= data.height;

  var vid =randomString(10 );
 
  var dsourceUrl=sourceUrl; //Download source url
  
 //sourceUrl="http://www.jplayer.org/video/m4v/Big_Buck_Bunny_Trailer.m4v";  

/*
  if( sourceUrl.match(/localhost:8080/) ){
sourceUrl=sourceUrl.replace("http://localhost:8080", "storage/emulated/0/Icode-Go/data_files/www");
}*/


  if(!width){
  var dim_=getParameterByName("ocwh", sourceUrl)||"";
  var dim=dim_.split("_");
  var width=+dim[0]||500;
  var height=+dim[1]||0;
  }
  
  var dW=$(window).width();
  var maxW=dW<500?dW:500;
  
 if( from_comm) maxW=200;
 
  if( height){
 var size=imageScale( width , height, maxW, 700);
  
  var imgheight= Math.ceil(size*height) + "px";
  var imgwidth= Math.ceil( size*width ) + "px";
  
}else{
  
    imgwidth= maxW + "px";
    imgheight="auto";

}
   var data='<div class="go-video-poster-container go-post-photo-container ripple-effect">';
     data+='<img class="go-video-poster go-post-photo lazy" style="height:' + imgheight + '; width: ' + imgwidth + ';" src="' + __THEME_PATH__ + '/assets/go-icons/white-bg.png" data-src="' + poster + '" onerror="go_postImgError(this,\'black\');">';
 data+='<i class="go-video-play-icon fa fa-play-circle fa-4x text-info"></i>';

     data+='<div onclick="goOpenVideo(this);" data-fdload="' + fdload + '" class="' + ( reposted? 'reposted':'go-open-video') + '" data-vid="' + vid + '" data-durl="' + dsourceUrl + '" data-fsize="' + fsize + '" data-source-url="' + sourceUrl + '" data-poster="' + poster + '"></div>';
     data+='</div>';
   
  return data;    
}

 

function go_photoLayout(data, fdload, reposted, from_comm){
 var file_path=data.path;
 var fsize=  data.size;
 var width=  data.width;
 var height= data.height;
 
if(!width){
  var dim=getParameterByName("ocwh", file_path)||"";
      dim=dim.split("_");
  var width=+dim[0]||500;
  var height=+dim[1]||0;
}
  
  var dW=$(window).width();
  var maxW=dW<500?dW:500;
  var maxH=700;
 if( from_comm ){
   maxW=200; 
   maxH=300;
 }
  
 if(height){
  var size=imageScale( width, height, maxW, maxH);
  var imgheight= Math.ceil(size*height) + "px";
  var imgwidth= Math.ceil( size*width ) + "px";
 }
  else{
    
    imgwidth= maxW + "px";
    imgheight="auto";
  }
  
  var data='<img class="lazy go-post-image go-post-photo ' + (reposted?'reposted':'') + '" style="height: ' + imgheight + '; width: ' + imgwidth + '" data-original-height="' + height + '" data-original-width="' + width + '" alt="" data-fsize="' + fsize + '" data-fdload="' + fdload + '"  src="' + __THEME_PATH__ + '/assets/go-icons/bg/post-white-bg.png" data-src="' + file_path + '" onerror="go_postImgError(this);">';  
  
  return '<div class="go-post-image-container go-post-photo-container ripple-effect">' + data + '</div>'; 

}


function go_formatFiles(data, fdload, reposted, full, from_comment ) {
 if(!data  ) return "";
  
  try{
data=JSON.parse( data);
}catch(e){
return "";
}

  var total=data.length;
  var file_result="";
  var cnt=0;
  
 $.each( data, function(i,data_){
     cnt++;
   var ext   = data_.ext;
   
 if ( !full && cnt > 4) {
   file_result+='<span class="go-more-photos">+ More</span>';
  return false;
 } 
   
   if( ext=='jpg'){
  file_result+= go_photoLayout( data_, fdload, reposted,from_comment);
 }else if ( ext=='mp4') {
  var poster=data_.poster||"data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
  file_result+= go_videoPlayerLayout( data_, fdload, poster,reposted, from_comment );
    }
  });

  return file_result; 
 }


function goOpenGallery(event,type){
	if( !loggedIn() ) return;
  //Type: image, video
  var allow_video_=false;   
  var allow_image_=false;
  
var allow_upload=SERVER_SETTINGS.file_upload||"NO";
var allow_video=SERVER_SETTINGS.post_video||"NO";
var allow_image=SERVER_SETTINGS.post_image||"NO";
var max_files=SERVER_SETTINGS.max_total_upload||1;
var max_size=SERVER_SETTINGS.max_upload_size||1; //MB

if(  siteAdmin( USERNAME) ){
   allow_image_=true;
   allow_video_ =true;
  }
  else if( allow_upload=="YES" ){

   if( allow_video=="YES" ){
   	allow_video_=true;
    }    
  if(  allow_image =="YES" ||userVerified( VERIFIED) ){
   allow_image_=true; 
   }
 } 
 
    $('#go-upload-preview-container').empty();
   GO_UPLOAD_FILE_PATHS=[]; //Empty paths
   GO_UPLOADED_FILE_PATHS=[]; //Empty uploaded paths
  var this_=$(event);
      this_.prop('disabled',true);  
    
    setTimeout(function(){
    this_.prop('disabled', false);
  }, 1500);

 var pformat= $('#selected-photo-format').val();
 
 var isVerified= userVerified( VERIFIED);

var cont=$('#go-upload-preview-container');

// alert( JSON.stringify( event))
try{
	
	var imageTypes = ["jpg", "jpeg", "gif","png"];
   var videoTypes=["mp4"]; 
   
 var total_files=event.files.length;
 
 if( !siteAdmin( USERNAME) && total_files>max_files){
 	total_files=max_files;
 }
 
for(let i=0;i<total_files;++i){
	var ext= event.files[i].name.split('.').pop().toLowerCase();  //file extension from input file
	var fsize=event.files[i].size;

 if(!fsize)  continue;
   fsize= (fsize/(1024*1024)).toFixed(2);
	if( !siteAdmin( USERNAME) && fsize>max_size) continue;
	
    var reader = new FileReader();
    reader.onload = function(e){
    var data=	this.result; 
    var type=data.match(/(video|image)/);
 
  if( !type ) return toast("One or more file unsupported");
  
   type=type.toString();
   
 if(   type.match(/image/) ){
    if( allow_image_ ) image_( i, data); 
    else toast("Images upload disabled");
 }
   else{
    if( allow_video_) video_( i, data); 
    else toast("Video upload disabled");
 }
    };
    reader.readAsDataURL(event.files[i]);
  }
}catch(e){ toast(e); }
    
  if(!$("#compose-post-container").is(":visible")) {
$('#open-compose-page-btn').click(); 
}

 }

function image_( i, image_data){
	resizeImage( image_data, {quality: 0.8, width: 1000, height: 600 }, function( v, error){
 if( error) return toast( error);
 
 var cid=randomString(10);
	var filename=cid;
	var fpath=filename + ".jpg"; 
	
	GO_UPLOAD_FILE_PATHS.push( fpath );

	var cont=$('#go-upload-preview-container');
  
     var data='<div id="uppc-' + cid + '" data-swid="' + i + '" onclick="swapIt(this)" data-fpath="' + fpath + '" class="go-upload-photo-preview-container">';
         data+='<img class="go-upload-photo-preview" src="' + v + '">';
         data+='<span data-findex="' + i + '" data-fpath="' + fpath + '" data-cid="uppc-' + cid + '" class="go-remove-upload-preview" id="close-upbtn-' + cid + '">x</span>';
         data+='<span id="go-up-progress-container-' + filename + '" class="go-up-progress-container">';
         data+='<span id="go-up-progress-' + filename + '" class="go-up-progress"></span>';
         data+='</span>';
         data+='<textarea class="d-none image-data" id="base64-data-' + filename + '">' + v + '</textarea>';
         data+='</div>';
     cont.append( data);     
   });
}

function video_(i, v) {
	var cid=randomString(10);
	var filename=cid;
	var fpath=filename + ".mp4"; 

    GO_UPLOAD_FILE_PATHS.push( fpath );
   
  var cont=$('#go-upload-preview-container');
  
   var data='<div id="uppc-' + cid + '" data-swid="' + i + '" data-fpath="' + fpath + '" class="go-upload-video-preview-container">';
         data+='<div id="uppc-cover-' + cid + '" class="go-video-preview-cover"><i class="fa fa-spin fa-spinner fa-lg text-primary"></i></div>';
         
         data+='<div class="go-video-preview-child-cont" id="vid-child-cont-' + cid + '">';
         data+='<i class="ms-2 fa fa-video-camera fa-2x text-white" style="position: absolute; bottom: 0; left: 0; z-index: 10;"></i>';
         data+='<video id="vid-' + cid + '" data-cid="' + cid + '" data-src="' + v + '" class="go-upload-video-preview" preload="auto"';
         data+=' src="' + v + '" oncanplay="goVideoPreviewLoaded(this);" onerror="goVideoPreviewError(this);" autoplay muted>';
         data+='</video>';
         data+='</div>';
         data+='<span data-findex="' + i + '" data-fpath="' + fpath+ '" data-cid="uppc-' + cid + '" class="go-remove-upload-preview" id="close-upbtn-' + cid + '">x</span>';
         data+='<span id="go-up-progress-container-' + filename + '" class="go-up-progress-container">';
         data+='<span id="go-up-progress-' + filename + '" class="go-up-progress"></span>';
         data+='</span>';
         data+='<textarea class="d-none video-data" id="base64-data-'+ filename + '">' + v + '</textarea>';
         data+='<input type="hidden" id="vid-poster-' + cid + '" />';
         data+='</div>';
         
         cont.append( data);
      var vid= document.getElementById("vid-"  + cid );
      
 }
	
	
function display_post( post, full, single_post, sponsored_post ){
	//alert( JSON.stringify(post))
    var result_="";
    var logged=loggedIn();
   var adm=goAdmin( USERNAME );
    
  $.each( post, function(i,v){ 
 	var was_shared=v.was_shared;
  
  if( v.blocked) {
if( was_shared) {
result_+=go_textFormatter('<div class="post-unavailable" style="padding: 16px;">*_post is not available_*</div>'); 
}
else{
	
	}
return;
}

var reposted=Number( v.repost);

    var me=false;
    var uv=v.verified||"";
  
   var unice=v.nicename;
   var post_id=v.id;
   var user_id=v.uid;
   var user_name=v.username;
   var avatar=v.avatar||"";
   var shared_post=v.shared_post;
    var post_status=v.post_status||0;
   var post_title=v.post_title||"";
   var post_by=user_name;
   var email=v.email;
   var country=v.country;
   var bio=v.bio;
   var birth=v.birth;
   var joined=v.joined_on;
   var fullname=v.real_name;
   var phone=v.phone;
   var fstatus=v.fstatus||"";
  
   var post_files=   v.post_files||"";
   var post_name= v.post_name;
         
    var post_link=osb_permalink( post_id, post_name );
   
   var post_type=v.post_type;
   var ppic =v.poster_pic||"";
    
     var post_preview= ( v.post_excerpt||"");     
     var time_= timeSince( +v.post_date);
     var time= time_;
      
    var sponsored=false;
   
    if ( sponsored_post ){
    sponsored=true;
    time='Sponsored';
 if( adm ) time+=' &bull; ' + time_;
   
  }
     var meta= v.post_meta||'{""}';
     var total_comments= +(v.total_comments||0);
     var total_shares= +( v.total_shares||0);
     var reactions=v.reactions||"{}";
     var reactions_={};
      try{
      reactions_= JSON.parse( reactions);
      }catch(e){}; 
      
  var veri=checkVerified( uv,  fullname);
  var verified=veri.icon;  
 
 var fullname_= veri.name;
        fullname=fullname_ + ' ' + verified;

  var data=parseJson( meta ); 
 
  var true_author=Number(data.true_author||0);
 
  var post_length=+data.plen;
  var can_comment=data.can_comment;
  var shareable        = data.shareable;
  var hidden_post= data.hidden;
  var commentable = data.commentable;
  var has_more=data["hmore"];
 
 if( hidden_post && user_id!=ID && true_author!=ID ){
     return "";
 }
 
  var op_by="";
  var op_name_="";
  var otrue_author="";
  var op_uid="";
  var oshareable="";
  var ohidden="";
  
   if(  ID==user_id ||   ( goPage( user_name) && siteAdmin( USERNAME) ) ){
    me=true;
  }

  var version= data.ver;
  var hasFile=data.has_files;
  var bsize=data.size||0;
  var size= hasFile?readableFileSize( +bsize, true, 0):"";
  var meta_="";
 // var post_files=data.post_files||"";     
  var plink=data.link;
  var plinkText=data.link_title;
  var fdload=data.fdload||"";
      
  var total_files=+( data.total_files||0)
  var post_bg_=data.post_bg||"";

   var post_bg="";
 
  if( post_bg_){
      post_bg=post_bg_ + " go-pbg " + ( post_length>10 && post_length<40?" go-pbg-font":"") + " go-pbg-font-" + post_length;
    }

if( has_more){  
  var  highlight='<div data-pid="' + post_id + '" class="go-load-full-post">' + post_preview + ' <span class="go-post-more-link">...See more</span></div>';
  }else{
  var highlight=post_preview;    	
  }

  if(!full){
       highlight= '<div class="go-post-preview go-post-preview-' + post_id + ' ' + ( highlight?post_bg:'') + '">' + go_textFormatter( highlight) + '</div>';
   }
    else{
    	
     highlight= '<div class="go-post-preview go-post-preview-' + post_id + ' ' + post_bg + '">' + go_textFormatter( v.post||post_preview) + '</div>';
 
   }
  
var open_file=false;
   
 if( reposted||
      ( total_files > 4 && !full ) ){ 
     open_file=true;
 }

 var format="";
 var format_= go_formatFiles(post_files , fdload, open_file, full );
   	
 format='<div class="go-post-files-container ' + ( total_files >1?'go-post-files-container-m go-multiple-images go-multiple-images-' + total_files:'') + '">' + format_ + '</div>';
 
   var hide_author=SERVER_SETTINGS.go_hide_author_name;
     
 var  p='<div class="go-post-container go-post-container-' + post_id  + ( !was_shared?' post-parent':' pointer-events-none') + '">';
 
       p+='<div class="container-fluid go-post-header ps-0">';
       p+='<div class="row">';
      
  if( sponsored || hide_author==="NO"){
       p+='<div class="col go-post-by-icon-col">';
       p+='<div class="go-post-by-icon-container ripple-effect go-post-author-icon go-post-author-icon-' + user_id  + '">' + go_user_icon( avatar, "small") + '</div>';
       p+='</div>';
   }
      
       p+='<div class="col go-post-fullname-' + user_id + ( sponsored && user_id!=ID && !adm?' go-sponsored-profile': ' go-open-profile') + '" data-uverified="' + uv + '" data-hide-author="' + hide_author + '" data-uid="' + user_id + '" data-user="' + post_by + '" data-user-fullname="' + fullname_ + '" data-unicename="' + unice + '">';
   
   if( sponsored || hide_author==="NO" ){
      
  p+='<div><span class="go-post-fullname go-puser-fullname-' + user_id + ' ripple-effect">' + fullname + '</span></div>';
  
    }
        
  if( sponsored ||  SERVER_SETTINGS.go_hide_post_time==="NO"){
  	
       p+='<div class="go-post-date">' + time  + ' &bull; <i class="fa fa-globe"></i></div>';    
   } 
      p+='</div>';
       p+='<div class="col-2 ps-0 pe-2 pt-3 text-end">';
       p+='<div class="go-post-options-btn" data-hide-author="' + hide_author + '" data-pid="' + post_id + '" data-puid="' + user_id + '" data-true-author="' + true_author + '" data-post-type="' + post_type + '" data-pbf="' + fullname_ + '" data-post-link="' + post_link + '">';
      
    if( hidden_post) 
    p+='<i class="text-primary fa fa-eye-slash me-1" style="font-size: 13px;"></i>';
   if( me && !was_shared ){
    
       p+='<i class="text-success fa fa-ellipsis-h fa-lg"></i>';
       
      }else if(!was_shared){
      
       p+='<i class="fa fa-ellipsis-h fa-lg"></i>'; 
      }
       p+='</div>';
       p+='</div></div></div>';
   
      p+='<div class="' + ( total_files > 4 && !reposted && !full?' go-open-single-post':'') + '" data-puid="' + user_id + '" data-pid="' + post_id + '">';     
               
 if(  post_title && SERVER_SETTINGS.enable_post_title=="YES" ){
 p+='<a class="d-block go-post-title" href="' + post_link + '">' + post_title + '</a>';
 }

      p+='<div class="go-post-highlight go-post-highlight-' + post_id + '">' + highlight + '</div>';

p+='<div class="go-post go-post-' + post_id + '">' + ( format||"") + '</div>';

   if (reposted){
   	
     p+='<div class="container go-opost-container"  style="padding: 0;">';

   var spresult=shared_post?shared_post.result:null;
   
if(  spresult){ 
	var sp_=spresult[0];
	var odata=parseJson( sp_.post_meta||"{}" );
    op_uid=sp_.uid;
    otrue_author=odata.true_author;
	op_by=sp_.username;
    var op_name_= sp_.real_name;
    oshareable=odata.shareable;
    ohidden=odata.hidden;
    if( !oshareable)  shareable=0;
   
 p+='<div class="go-open-single-post"  data-puid="' + op_uid + '" data-cpid="' + post_id + '" data-pid="' + reposted + '" style="padding: 0;">';

  if(  !ohidden || op_uid==ID|| otrue_author==ID){
   p+=display_post( spresult);
   }else{
  	p+=go_textFormatter('<div class="post-unavailable">*_Privacy changed for this post_*</div>'); 
 	}
   p+='</div>';
   
  }
  else{
    shareable=0;
  	p+=go_textFormatter('<div class="post-deleted">*This post is not available right now.*<div>_Might have been deleted by the owner._</div></div>');  
    }   
  
  p+='</div>';
  
 }
       
  p+='<div class="post-link-container" id="post-link-container-'+ post_id + '">';

	if( plink){
	plinkText=plinkText.split("...");

	  p+='<div class="container-fluid go-nice-link-container">';
        p+='<div class="row"><div class="col"><a href="' + plink + '" class="go-nice-link" data-repost="' + reposted + '" target="_blank">' +  plinkText[0] + '<div class="form-text">' + ( plinkText[1]||"") + '</div></a></div><div class="col-2 text-center go-nice-link-info mt-1" data-link="' + plink + '"><i class="fa fa-info-circle fa-lg text-danger"></i></div></div></div>'; 
       }
       
   p+='</div>';
   p+='</div>';

if( was_shared){
   p+='</div>';

  result_+=p;
  data=""; odata="";
  return result_;
}      
            
 var total_r=0;
    var remoji='';
   
  $.each( reactions_, function(i, rcount){
       var rv=+rcount;
        total_r=total_r+ ( +rv);
     if( rv){
       remoji+='<img class="go-like-post-iconx-' + post_id + ' icon-normal w-18 h-18" src="' + __RCDN__ + '/' + i + '.png">';
     }
      });
      
  var reacted=false;
  var liked="like-empty";

var plike=postLiked( post_id);

if( plike ){
     var reacted=true;
     liked=plike;
 }
 
  var allow_reactions=SERVER_SETTINGS.go_allow_reactions;
   
 var force_login=SERVER_SETTINGS.force_user_login;
  
  var licon=__RCDN__ + '/' + liked + '.png';
     
     var total_reactions= abbrNum(total_r, 1);
     var total_likes=+reactions_["like"]||0;
     
      p+='<div class="go-post-footer">';
      if( post_status=="0"){
      p+='<div class="text-success text-center p-2"><strong><i>Awaiting approval...</i></strong></div>';	
      }
      p+='<div class="reactions-box-container reactions-box-container-' + post_id + '"></div>';
  
  if(allow_reactions==="YES"){
     p+='<div style="padding: 5px 5px 10px 20px;" class="reacted-icons-container reacted-icons-container-' + post_id + '" data-reactions=\'' + reactions + '\'> ' + remoji + ' <span class="total-likes-' + post_id + '" data-total-reactions="' + total_r + '">' + (total_reactions ||"") + '</span></div>';
   }
      p+='<div class="row">';
      
    if( allow_reactions==="YES" && post_by!='cv_drafts'){
        p+='<div class="col text-center"><button data-reactions=\'' + reactions + '\' data-uid="' + user_id + '" data-post-by="' + post_by + '" data-pid="' + post_id + '" class="ripple-effect go-like-post-btn-' + post_id + ' go-like-post-btn' + ( reacted?' go-post-liked':'') + '"><img src="' + licon + '" class="osb-post-footer-icon go-like-post-icon-' + post_id + '"> <span class="total-likes-' + post_id + '" data-total-reactions="' + total_r + '">' + total_reactions + '</span></button></div>';
    }
      
   if( SERVER_SETTINGS.go_allow_comment=="YES" && post_by!='cv_drafts' && commentable){
      p+='<div class="col text-center"><button data-pid="' + post_id + '" data-post-by="' + post_by + '" data-uid="' + user_id + '" class="go-open-comments-box ripple-effect"><img class="icon-normal" src="' + __RCDN__ + '/comment.png"> <span id="total-comments-' + post_id + '">' + abbrNum(total_comments,1) + '</span></button></div>';
   }
 
   var can_post=SERVER_SETTINGS.go_can_post||1;
   var can_share=SERVER_SETTINGS.go_allow_share;
  
  var can_post_=false;
  
 if(  can_share=="YES" && logged){
     if( can_post=="2" && userVerified( VERIFIED ) ){
   can_post_=true;	 
  }
  else if( can_post=="3" ){
  can_post_=true;
  }
}

 if( ( siteAdmin(USERNAME)||  can_post_ ) && shareable ){
   
      p+='<div class="col text-center"><button  data-uid="' + user_id + '" data-pid="' + post_id + '"  data-share-pid="' +( reposted?reposted:post_id) + '" data-notify="' + ( reposted?op_uid:user_id ) + '" data-cpid="' + post_id + '" data-pbn="' + fullname_ + '" data-spbn="' + op_name_ + '" data-unicename="' + unice + '" class="go-share-post-btn ripple-effect" onclick="sharePost(this);">';
      p+='<img class="icon-normal" src="' + __RCDN__ + '/share.png"> <span id="total-shares-' + post_id + '">' + abbrNum( total_shares, 1) + '</span></button>';
      p+='</div>';  
   
   }
   

   p+='</div>';
       p+='</div>';
       p+='</div>';
       
    result_+=p; 
    }); 
    
   return result_;
  }
  

function no_post(can_post){
  $('#gnp').remove();
var data='<div id="gnp" class="go-no-post text-center">';
  
  var can_post_=false;
  
  if( loggedIn() ){
   if( siteAdmin( USERNAME ) ){
   	can_post_=true;
   }
     else if( can_post=="2" && userVerified( VERIFIED) ){
     	can_post_=true;
     }
     else if( can_post=="3") {
     	can_post_=true;
     }
   }
   
   if( can_post_ ){
   	
    data+='<Label for="goUploadFirstPhoto"><img src="' + __THEME_PATH__ + '/assets/go-icons/camera.png"></label><form class="d-none"><input type="file" id="goUploadFirstPhoto" name="file[]" accept="image/*" onchange="goOpenGallery(this, \'image\');" multiple /></form> ';
  }
    data+='<div>No posts yet!</div>';
   data+='<div class="mt-2"><small>You may follow one or more suggested pages and refresh</small></div>';
   data+='<div class="text-center mt-2 text-primary" onclick="home();">Refresh</div>';
    data+='</div>';
 return data;
}

var toast_once=false, lpFails=0;
var loadCount=0;
var lpostAjax,lpostTimeout;


function __( result, singlePostId, loadCount, refresh){
	//alert( JSON.stringify( result))
	var loader=$('#post-loading-indicator');
	var pnElem=$('#go-next-page-number');
	
   lpFails=0;
   
   loadingPosts=false;  
   localStorage.removeItem(SITE_UNIQUE__ + "go-social-posts-loading");
 
  if( result.ecode ){
localStorage.setItem( SITE_UNIQUE__ + "login_required","YES");
localStorage.removeItem( SITE_UNIQUE__ + "logged_in");
location.href=config_.domain + "/oc-login.php";
  return;
}
 else if( result.error ){
 return toast( result.error );
}else if( result.pymk ){
   pymk_( result.pymk.data);
}
 
 SERVER_SETTINGS=result.settings;
  
if( result.sidebar_pages){
	 sidebarPages( result.sidebar_pages);
	}
	
 localStorage.setItem(SITE_UNIQUE__ + "server_settings", JSON.stringify( SERVER_SETTINGS) );
 
 var force_login=SERVER_SETTINGS.force_user_login;
 var adm= siteAdmin( USERNAME);
 var logged_in=loggedIn();
   
 var cache_reset=( SERVER_SETTINGS.cache_reset||"0|0").split("|");
 
var  img_chr= +cache_reset[0]||rand_;
var  file_chr=  +cache_reset[1]||rand_;

   localStorage.setItem(SITE_UNIQUE__ + "img_cache_reset",  img_chr );
   localStorage.setItem(SITE_UNIQUE__ + "file_cache_reset", file_chr);
   
   if( SERVER_SETTINGS.enable_login!=="YES" ){
   	$("#OSB-SIGNIN-BTN").remove();
   }
   
   if( !logged_in){
   
   localStorage.removeItem(SITE_UNIQUE__ + "USERNAME");
   
     	$("#settings-btn").remove();
   }

  if( !logged_in|| SERVER_SETTINGS.go_enable_follow_btn!="YES" ){
    $(".follow-feature").remove();
  }

  if(!logged_in ||  ( !adm && SERVER_SETTINGS.file_upload!="YES") ){
    $(".file-upload-feature").remove();
  }
 var ept=SERVER_SETTINGS.enable_post_title||"";
  if( ept=="YES"  ){
  	$("#go-create-post-title").removeClass("d-none");
  }
   loader.css('visibility','hidden');
     
   if(!logged_in) {
$(".go-open-my-profile,.go-change-account,#admin-panel-btn").remove();
$(".go-signin-btn").removeClass("d-none");
}

  var can_post=SERVER_SETTINGS.go_can_post||1;
 
 if( logged_in ){

if ( siteAdmin(USERNAME)|| ( can_post=="2" && userVerified(VERIFIED) ) || can_post=="3") {
    $('#go-express-your-mind').css('display','block'); 
      }
}
 
    if( refresh ){
     closeDisplayData('.home_refresh'); 
    } 

 if( result.no_post){
   $('#go-the-posts').append( no_post(can_post) );
    pnElem.val("0");
 } 
   else if( result.status=='success' ){
    
    var posts= result.result;
 var   shared_posts=result.shared_posts;
    var nextPage=result.next_page;
    pnElem.val( nextPage );

 if( refresh ){
   $('#go-the-posts').html( display_post(  posts,  false, singlePostId) );      
     
 }else{

   $('#go-the-posts').append( display_post( posts,  false, singlePostId ) ); 
   
 }

  $(".go-post-container .ripple-effect").ripple();

}
   else if(result.error){
      toast(result.error );
  }
  else toast('No more post to load.',{type:'info'});
  
   setTimeout( function(){
   	
   if( $("#bootstrap-loaded").is(":visible")||
 $("#main-css-loaded").is(":visible") ){
 
  setTimeout( function(){
  	location.reload();
	}, 10000);
	
 return  toast("Please be patient. You have a slow network");
 
   }else{

 var is_profile=$("#direct-request").attr("data-profile-unicename");
    
   if( is_profile){ 
   var elem=$("<div/>").addClass("go-open-profile")
   .addClass("direct-request")
  .attr("data-unicename", is_profile);
     elem.appendTo('body').click(); 
   }
  
    $('#go-initializing-container').css('display','none');
    
    }
  },1000);

 if( loadCount===1 && result.sponsored_posts){
 	ADS___=result.sponsored_posts;
	}
	
	showAds( loadCount);
}

function loadPosts(refresh ){
 if( loggedIn() ){
 	$(".if-logged-in").show();
 }
 else $(".if-logged-in").hide();
 
   clearTimeout( lpostTimeout);

  var pnElem=$('#go-next-page-number');
  var pageNum=pnElem.val();
    
 if( refresh ){
    toast_once=false;
    pageNum="";
    
   var ttag=$("title");
   var tdata=ttag.data("title");
   ttag.html( tdata);
  
  $("#direct-request")
  .attr("data-profile-unicename","")
  .attr("data-single-post-id","")
  .attr("data-comment-post-id","")
  .attr("data-comment-reply-id","")
  .attr("data-comment-reply-post-id","")
    
    displayData('<div class="bg-white text-center" style="padding: 30px; border:0; border-radius: 5px;"><i class="fa fa-spin fa-spinner fa-3x text-info"></i></div>',
      { bground: 'rgba(0,0,0,0);', data_class:'.home_refresh', no_cancel: true, hash: false});
      window.history.replaceState("data",  null,  __SITE_URL__ );
  }
   
  if( !refresh && pageNum=="0"){
   if( !toast_once ){
     toast_once=true;
     toast('That is all for now', {type: 'info'});
   }
    return;
   }
  loadingPosts=true;
     
  localStorage.setItem(SITE_UNIQUE__ + 'go-social-posts-loading','1');
 
  var loader=$('#post-loading-indicator');
  loader.css('visibility','visible');
  
   WAIT_FOR_ME='load-posts';
  var singlePostId= $("#direct-request").attr("data-single-post-id");
  
 var POST_DATA=$("#OSB-POST-DATA").val(); 
 
 if( POST_DATA.length>10 ){
 	loadCount++;
 	  $("#OSB-POST-DATA").val("");
 
    if( singlePostId){
   var result=JSON.parse( POST_DATA);
     __( result, singlePostId, loadCount, refresh);
     return;
    }
    else {
   var result=JSON.parse( POST_DATA);

  __( result, "", loadCount,refresh);
    
     var commentPostId= $("#direct-request").attr("data-comment-post-id");
  
  if( commentPostId) {  	
 
 setTimeout(function(){
 var elem=	$("<div/>")
 .addClass("go-open-comments-box")
 .addClass("direct-request")
.attr("data-pid", commentPostId);
 elem.prependTo("body").click();
    }, 100);
    
  return;
  }
  
 var crElem= $("#direct-request");
 var crid=crElem.attr("data-comment-reply-id");
 var crpid=crElem.attr("data-comment-reply-post-id");
 
  if( crid && crpid) {
  	
  setTimeout(function(){
var elem=$("<div/>")
  .attr("data-parent-id", crid)
  .attr("data-pid", crpid)
  .addClass("direct-request")
  elem.appendTo('body').click(function(){
  	replyComment(this);
  } ).click();
  },100);
  
  }
   
    }
    return;
 }
  
 lpostTimeout=setTimeout(  function(){
   clearTimeout( lspTimeout); //Load Sponsored posts timeout

connCounts++;
   var get_user_info=  osbdb.get("user_info")?0:1;
      
  lpostAjax=$.ajax({
    url: config_.domain + '/oc-ajax/go-social/posts.php',
    type: 'POST',
   //timeout: 15000,
     dataType: "json",
    data: {
      "page": pageNum,
      "post_id": singlePostId,
      "get_user_info": get_user_info,
      "load_count": loadCount,
      "version": config_.APP_VERSION,
    }
  }).done(function(result){
// alert( JSON.stringify(result));
    WAIT_FOR_ME=false;
    loadCount++;
    connCounts--;
     __( result, singlePostId, loadCount,refresh);
  
}).fail( function(e,txt,xhr){
   WAIT_FOR_ME=false;
  //  alert( JSON.stringify(e));
   loadingPosts=false;
    connCounts--;
   localStorage.removeItem(SITE_UNIQUE__ + 'go-social-posts-loading');
  //loader.css('display','none');
  if(!lpFails && xhr!='timeout') toast('Check your connection. ' + xhr);
 lpFails=1;
 if( refresh ){
  closeDisplayData('.home_refresh');
  return;
    }
       setTimeout(function(){
       loadPosts(); }, 10000);
  });
    
  },1000);
}
  
//SEARCH POSTS

var toast_s_once=false,spTimeout,spAjax;

function goOpenSearchBox(){
  $('#go-search-container').css('display','block');
  changeHash("");
 }
  
function searchPosts( fresh){
 
  var pnElem=$('#go-search-next-page-number');
  var searchDiv=$('#go-searched-posts');
  
  clearTimeout( spTimeout);
  
  if( spAjax){
    spAjax.abort();
  }
 
  
 if( fresh){
    toast_s_once=false;
    pnElem.val("");
    searchDiv.empty();
  }
  
  var pageNum=pnElem.val();
 
 // if( searchingPosts ) return;
  
  if( !fresh && pageNum=="0"){
  	
   if( !toast_s_once){
     toast_s_once=true;
     toast('That is all for now.',{type: 'info'});
   } 
    return;
  }
    
  var s=$('#go-search-box');
  var text=$.trim( s.val());
  
  if ( !text ||text.length<3){
  return  toast('Search term too small.',{ type:'info'});
  }
    
  searchingPosts=true
var loader=$('#search-loading-indicator');
      loader.css('display','inline-block');
     
 localStorage.setItem(SITE_UNIQUE__ + 'go-social-posts-loading','1');
  WAIT_FOR_ME='search-post';
  
  connCounts++;
  
 spTimeout=setTimeout( function(){  
    spAjax=$.ajax({
    url: config_.domain + '/oc-ajax/go-social/search-post.php',
    type:'POST',
 //  timeout: 10000,
    dataType: "json",
    data: {
      "s": text,
      "page": pageNum,
      "version": config_.APP_VERSION,
    }
  }).done(function(result){
   //alert(JSON.stringify(result))
      localStorage.removeItem(SITE_UNIQUE__ + 'go-social-posts-loading');
     WAIT_FOR_ME=false;
      connCounts--;
      
      searchingPosts=false;
      loader.css('display','none');
  
  if( result.no_post ){
   return toast( result.no_post,{type:'info'});
  }
 else if( result.status=='success' ){
  // var settings=result.settings;   
   var nextPage=result.next_page;
   pnElem.val( nextPage);
 
     var posts= result.result;
    searchDiv.append( display_post(  posts) );            
  }
   else if(result.error){
      toast(result.error );
  }
   else toast('No more post.',{type:'info'});
      
 
 }).fail(function(e,txt,xhr){
     localStorage.removeItem(SITE_UNIQUE__ + 'go-social-posts-loading');
     WAIT_FOR_ME=false;
     
     connCounts--;
     searchingPosts=false;
      
     loader.css('display','none');
  //toast('Connection error. ' + xhr, {type:'light',color:'#333'});
    if( $("#go-search-container").is(":visible")){
      spTimeout=setTimeout( function(){
     searchPosts(); },8000);
    }
  });
  },1000); 
  
  
}
 
 function sanitizeLink(link, link_title){
 	var link_=new Object();
   link_.link="";
   link_.link_title="";
   
if( link &&  link.indexOf("https://")==0)  {
    link=link.replace(/\s+/g,' ').substr(0,200) .replace(/</g,'&lt;').replace(/"/g,'&quot;');
    link_title=( link_title||link).substr(0,100).replace(/</g,'&lt;').replace(/"/g,'&quot;');
    link_.link=link;
    link_.link_title=link_title;
    return link_;
  }
  else{
     return link_;
  }
 }
 
 
function sendPost( post_title, post, puid, unicename, post_by, fullname, post_bg){
	try{
		
  var is_sending=localStorage.getItem(SITE_UNIQUE__ + 'go_is_sending_post');
  
 if( is_sending  ) return;

  var commentable=""; 
  var shareable="";
  var fdload="";
 if( $('#go-post-commentable').is(':checked')){
    commentable="1";
 }  
  if( $('#go-post-shareable').is(':checked')){
    shareable="1";
 }
  if( $('#go-file-downloadable').is(':checked')){
    fdload="1";
 }
  
 var rd= $('#go-repost-data').val();
  
  if( rd.length ){
    return go_repost( post, puid,  post_by, fullname, commentable, shareable, post_bg);
  }
    
  var fpaths=GO_UPLOADED_FILE_PATHS;
   var fpaths_="";
   var post_files="";
   var total_files=fpaths.length;
   var hasFiles=0;
  
  if( total_files){
   post_files= JSON.stringify( fpaths)
   hasFiles=1;
  }
  
 var link=$.trim( $('#go-link-input').val() );
 var linkTitle=$.trim($('#go-link-title-input').val());
  
 var link_=sanitizeLink(link, linkTitle);
  
  link=link_.link;
  linkTitle=link_.link_title;
  
  var post_preview=(post + "").substr(0, 250);
  var post_length=post.length;
  
 var meta=new Object();
      meta.true_author=ID;
      meta.plen=post_length;
      meta.shareable=shareable;
      meta.commentable=commentable;
      meta.total_files=total_files;
      meta.has_files=hasFiles;
      meta.post_bg=post_bg;
      meta.link=link;
      meta.link_title=linkTitle;
      meta.fdload=fdload;
  
 var meta_string=JSON.stringify( meta);
 var tbox=$("#post-title-box");
 
      connCounts++;
      localStorage.setItem(SITE_UNIQUE__ + 'go_is_sending_post','TRUE')
  
  if( !userVerified(USERNAME)){
 post=post.replace(/\[\/?(?:code|img|link)*?.*?\]/img,"");
 }
   
  
 setTimeout( function(){
    
  $.ajax({
    url: __SITE_URL__  + '/oc-ajax/go-social/insert-post.php',

  type:'POST',
  // timeout: 45000,
    // dataType: "json",
    data: {
      "puid":puid,
      "post_by": post_by,
      "post_title": post_title,
      "post": post,
      "post_meta": meta_string,
      "post_files": post_files,
      "has_files": hasFiles,
      "version": config_.APP_VERSION,
    }
  }).done(function(result){
   //alert(JSON.stringify(result))
   connCounts--;
  localStorage.removeItem(SITE_UNIQUE__ + 'go_is_sending_post');
   $('#go-send-post-btn').prop('disabled',false);
   
  if( result.status=='success'){

  osbdb.delete("draft");
   
 $('#go-link-input,#go-link-text-input,#post-title-box').val("");
 
   var pid=result.id;
 //  var settings=result.settings;

 var data=build_post( pid, post_title, result.post_excerpt, post_files,  result.post_meta ,result.post_status);

    $('.go-no-post').remove();
 var ddata=  display_post( data) 
    
    
 $("#go-the-posts").prepend( ddata);
 $("#go-profile-page-" + unicename).find(".go-profile-posts").prepend(ddata);
   
     setTimeout(function(){
closeComposePage(true, true);
},100);
       
  toast( result.result,{type:'success'});
 }
  else if(result.error){
    toast( result.error );
  }
   else toast('Unknown error');
  
closeDisplayData('.dummy-dummy',0, true);
  
  $('#post-progress').empty();
      
 }).fail(function(e, txt, xhr){
 	connCounts--;
  closeDisplayData('.dummy-dummy',0,true);
  $('#post-progress').empty()
   localStorage.removeItem(SITE_UNIQUE__ + 'go_is_sending_post');
 $('#go-send-post-btn').prop('disabled',false);
  toast("Something went wrong");
  report__('Error "sendPost() in go-social.js"', JSON.stringify(e),true );

  });
  },1000);
  }catch(e){
  	toast(e)
  }
}


//REPOST

function go_repost( post, puid,  post_by, fullname, commentable, shareable, post_bg){
	
  var rd= $('#go-repost-data');
  
var pid=+rd.attr("data-pid");
var spid=+rd.attr("data-spid");
var notify=rd.attr("data-notify");
  
  if(!pid||!spid){
    closeComposePage(true, true);
   return toast("Id not found");
  }
 
 var adm=siteAdmin( USERNAME);
 
var tbox=$("#post-title-box");
 
var post_title=$.trim( tbox.val() );

  if( SERVER_SETTINGS.enable_post_title=="YES"  ){
   
 if(!adm && !post_title ){
   	return toast("Input post title");
    }
   else if( post_title.length>150){
 return toast("Post title exceeded 150 characters");
    }
  }
  
var meta=new Object();
      meta.true_author=ID;
      meta.plen=post.length;
      meta.shareable=shareable;
      meta.commentable=commentable;
      meta.post_bg=post_bg;  
  
   connCounts++;
   
 setTimeout(function(){
    $.ajax({
    url: config_.domain + '/oc-ajax/go-social/repost.php',
    type:'POST',
  // timeout: 20000,
     dataType: "json",
    data: {
      "puid": puid,
      "post_by": post_by,
      "fullname": fullname,
      "post_title": post_title,
      "post": post,
      "post_id": pid,
      "share_pid": spid,
      "notify": notify,
      "post_bg": post_bg,
      "post_meta": JSON.stringify(meta),
      "version": config_.APP_VERSION,
    }
  }).done(function(result){
 //  alert( JSON.stringify( result ) );
 connCounts--;
 
  $('#go-send-post-btn').prop('disabled',false);
  closeDisplayData('.dummy-dummy',0,  true);
  $('#post-progress').empty();
 localStorage.removeItem(SITE_UNIQUE__ + 'go_is_sending_post');
      
 if( result.status=='success' ){
   tbox.val("");
   osbdb.delete("draft");
 
 setTimeout(function(){   closeComposePage(true, true);
 }, 100);
 if( result.approval){
   return toast(result.approval, {type:"info"})
 }
  return toast( result.result, {type:"success"});   
   
 }
    else if( result.error){
    toast( result.error);
  }else{
     toast('Unknown error occured.'); 
 }
  }).
    fail(function(e,txt,xhr){
    //alert(	JSON.stringify(e))
    connCounts--;
   closeDisplayData('.dummy-dummy');
  $('#post-progress').empty()
   localStorage.removeItem(SITE_UNIQUE__ + 'go_is_sending_post');
 $('#go-send-post-btn').prop('disabled',false);
  toast("Something went wrong");     
  report__('Error "go_repost() in go-social.js"', JSON.stringify(e),true );
 
    
    });
    },1000);
      
 }
  


 var ajaxSinglePost,spTimeout;

function fetchSinglePost( pid, callback){

  if( ajaxSinglePost) ajaxSinglePost.abort();
   if( spTimeout) clearTimeout( spTimeout);
 
 connCounts++;
 
 spTimeout=setTimeout( function(){
   
   ajaxSinglePost=$.ajax({
    url: config_.domain + '/oc-ajax/go-social/single-post.php',
    type:'POST',
  // timeout: 30000,
     dataType: "json",
    data: {
      "post_id": pid,
      "version": config_.APP_VERSION,
    }
  }).done(function(result){
  	connCounts--;
   return callback( result);
  
 }).fail(function(e,txt,xhr){
 	connCounts--;
   callback(null, e , xhr);
   });
 }, 1000); 
}

var deleting_post=false;

function deletePost(pid, post_by){
 
 if(!pid||!post_by){
   return  toast('Missing parameters');
  }
 else if( deleting_post){
   return toast("Please wait",{type:"info"});
 }

     deleting_post=true;
          
     connCounts++;
  delpTimeout=setTimeout( function(){
   
    delpAjax=$.ajax({
    url: config_.domain + '/oc-ajax/go-social/delete-post.php',
    type:'POST',
     dataType: "json",
    data: {
      "post_by": post_by,
      "post_id": pid,
      "version": config_.APP_VERSION,
    }
  }).done(function(result){
  // alert(JSON.stringify(result));
   connCounts--;
   
      deleting_post=false;
  if( result.status=='success'){
   $('.go-post-container-' + pid).remove();
 }
  else if(result.error){
      toast( result.error );
  }
   else toast('Unknown error'); 
 }).fail(function(e,txt,xhr){
 	connCounts--;
      deleting_post=false;
 $('#go-send-post-btn').prop('disabled',false);
 toast("Something went wrong");     
  report__('Error "deletePost()" in go-social.js', JSON.stringify(e),true );
 
    
    });
  },1000); 
}


function build_post(pid, post_title, post_excerpt,  post_files, meta, post_status){
	var elem=$("#go-compose-post-data");
	var avatar=$("#composer-icon-container").find("img").attr("src");

  var arr=[];
  var obj=new Object();
   obj.id=pid;
   obj.uid= elem.attr("data-uid")||"";
   obj.avatar=avatar;
   obj.verified=elem.attr("data-uverified")||""
   obj.post="";
   obj.reactions='{"like":0,"love":0,"laugh":0,"wow":0, "sad":0,"angry":0}';
   obj.post_title=post_title||"";
   obj.post_excerpt=post_excerpt||"";
   obj.username=elem.attr("data-user")||"";
   obj.nicename=elem.attr("data-unicename")||"";
   obj.real_name= elem.attr("data-fullname")||"";
   obj.post_date=moment().unix();
   obj.post_files=post_files;
   obj.post_meta=meta||"";
   obj.post_status=post_status||0;
  arr.push(obj );
   return arr;
 }

function buildPostOptions( options){
 var data="";
  $.each(options, function(i,v){
 if( !v.display){ }
    else{
    	
  data+='<div id="' + v.id + '" data-pid="' + v.pid + '" data-puid="' + v.uid + '" data-true-author="' + v.true_author + '" data-post-by="' + v.post_by+ '" data-pbf="' + v.pbf + '" class="container-fluid" style="font-weight: normal; padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.16);overflow: hidden!important;">';
  data+='<div class="row">';
  data+='<div class="col h-50" style="max-width: 50px; text-align: center;">';
  data+='<i class="fa '+ v.icon + ' fa-lg text-secondary"></i>';
  data+='</div>';
  data+='<div class="col h-50">' + v.info + '</div>';
  data+='</div></div>';
 }
    });
return data;    
}


function home(){
    loadPosts(true);
}


function closeTopPageList(){
  clearTimeout( tloadingGoPages);
  if( loadingGoPages){
    loadingGoPages.abort();
  }
}


function openPages( reload){
 
function openPages_( result){
  var div='';
 
  $.each( result,  function(i, v){   
    var u=v.username;
    var n=v.fullname;
    var user_id=v.id;
  
    var uv=v.verified;
    var unice=v.nicename;
    var avatar=v.avatar||"";
   var cv=checkVerified(uv , n);
   var n_= cv.name + " " +  cv.icon;
 
  div+='<div class="container-fluid mt-1 ripple-effect">';
  div+='<div class="row">';
  div+='<div class="col" style="padding-left:0; max-width: 60px;">';
 div+='<div class="go-followers-user-icon">';
    div+= go_user_icon( avatar, "small");     
  div+='</div></div>';
  div+='<div class="col" style="padding-left: 0;">';
  div+='<div class="go-pages-lists-item go-open-profile" data-uverified="' + uv + '" data-user="' + u + '" data-uid="' + user_id + '" data-user-fullname="' + n + '" data-unicename="' + unice + '">';
  div+= n_ ;
  div+='</div>';
  div+='</div>';
  div+='</div>';
  div+='</div>';
 
 });
  
return div;
   } 
  
  var data='<div class="center-header">';
      data+='<div class="container-fluid">';
      data+='<div class="row">';
      data+='<div class="col">';
    
  if( goAdmin( USERNAME) ){
      data+='<div class="mt-2" style="font-weight: normal; padding-left: 16px; font-family: gidole;"> Pages <button id="go-create-page" class="btn btn-sm btn-success" onclick="goOpenCreatePageForm();">+</button></div>';
    }else{
     data+='<div class="mt-2 pl-3">Pages</div>';
    }
  data+='</div>';
  
  data+='<div class="col pe-3 text-end">';
  data+='<i id="fetching-page-indicator" class="mt-2 mr-3 text-primary fa fa-spin fa-spinner fa-lg"></i>';
  data+='</div>' 
  data+='</div>';
  data+='</div>';
  data+='</div>';
  
      data+='<div class="center_text_div text-left bg-white text-dark" style="border-radius: 5px; width: 100%; font-size: 14px; font-weight: bold; padding: 0 15px 0 15px;">';
      data+='<div id="go-top-pages-lists" class="text-left" style="padding-bottom: 50px;">';
      data+='</div>';
      data+='</div>';
  
 if( !reload) {
   displayData( data,
      { osclose: true, oszindex: 20, data_class:'.top-pages-lists', on_close:'closeTopPageList'});
    //  changeHash("");
      
 }
   
 var elem=$('#go-top-pages-lists');
  
    var ind=$("#fetching-page-indicator");
  
 fetchPages( function(res,error){
   // alert( JSON.stringify(res))
   ind.remove();
  if( error){
    if ( res=='timeout' && $('.top-pages-lists').length){
       openPages( true);
  }else{
     if( res!='abort') toast('Check your network. ' + res);
    closeDisplayData('.top-pages-lists');
 }
  }else{   
  if( res.no_pages ){
    elem.html('<div class="text-center">No pages yet</div>');
    
 }else if( res.status=='success'){
   var result_=res.result;
   var settings=res.settings;

  var div=openPages_(result_)
      elem.html(div);
     elem.find(".ripple-effect").ripple();
    } else if( result.error){
  toast( result.error );
 } 
  else{
   toast('Unknown error')       
    } 
    
   }    
  }, "ignore_static_page");
}


function goOpenCreatePageForm(){
  closeDisplayData('.top-pages-lists',0,true);
 
setTimeout(function(){
 $('#go-create-page-form-container').css('display','block');
  changeHash("");
  },500);
}


function fetchPages( callback, ignore_static){
  ignore_static=ignore_static||"";
  tloadingGoPages=setTimeout(function(){    
  loadingGoPages = $.ajax({
    url: config_.domain + '/oc-ajax/go-social/load-pages.php',   
   type:'POST',
  // timeout: 30000,
    dataType: "json",
    data: {
      "ignore_static_page": ignore_static,
    //  "username": username,
    // "uid":uid,
      "version": config_.APP_VERSION,
      "token": __TOKEN__,
    }
  }).done(function( result){
   if( typeof callback=='function') {
     callback( result);
   }
  }).fail(function(e,txt,xhr){
 
 if( typeof callback=='function') {
   callback( xhr, e);
 }
 
 // android.toast.show("Something went wrong");     
  report__('Error "fetchPages()" in go-social.js', JSON.stringify(e),true );
   
    
});
 
  },1000);
}
  
  

function loadMenus(){
//  $('.app-label').html(APPLABEL);
  loadOthers();

if( goAdmin(USERNAME) ){
   $('#admin-panel-btn,#go-open-drafts-btn,#selected-photo-format').css('display','block');
 }
}


function loadOthers(){
	var first_launch=localStorage.getItem(SITE_UNIQUE__ + "first_site_launch");
	
  if(!first_launch){
	localStorage.setItem(SITE_UNIQUE__ + "xxxx_total_new_messages","1/1");
	localStorage.setItem(SITE_UNIQUE__ + "first_site_launch",1);
	}
	
  var fullname=FULLNAME; //userData("fullname");
  
  var v=checkVerified( VERIFIED, FULLNAME );
  var verified=v.icon;
  var fullname_= v.name + " " + verified;  
  var Veri= verified;
 
  $('.go-user-fullname').html( fullname_ );  
 
  $(".go-user-icon-container").html( go_user_icon( AVATAR, "small") ); 
  $('.go-user-open-profile').attr('data-user', USERNAME)
  .attr("data-unicename", NICENAME)
  .attr("data-uid", ID)

  var tnn= localStorage.getItem(SITE_UNIQUE__ + USERNAME + '_total_new_notifications');
  if( tnn){
    tnn=tnn.split('/');
  $('#total-new-notifications').attr('data-total', tnn[0]).text( tnn[1] ).css('display','inline-block');
  }
 var tnm= localStorage.getItem(SITE_UNIQUE__ + "xxxx_total_new_messages");
  if( tnm){
    tnm=tnm.split('/');
  $('#total-new-messages').attr('data-total', tnm[0]).text( tnm[1] ).css('display','inline-block');
  }

 setTimeout(  function(){
  fetchNotifications();
 } , 20000);
  
 //  custom_pymk(); //DEFAULT PEOPLE YOU MAY KNOW
  
}

  function format_pymk(data, custom){
    custom=custom||"";
    
   var result='<div class="go-people-you-may-know">';
        result+='<div class="go-pymk-title follow-featur">Suggested for you</div>';
    result+='<div class="go-pymk-container">';
  var pymk_cnt=0;
    
    $.each( data, function(i,v){
 	var uv=v.verified||"";
    var user=v.username;
    var user_id=v.id;
    var avatar=v.avatar||"";
    var unice=v.nicename;
    var fullname=v.fullname;
 
if( user!=USERNAME ){
    pymk_cnt++;
   var v=checkVerified( uv, fullname);
   result+='<div class="go-pymk go-pymk-' + user_id + ' ripple-effect">';
   result+='<div class="go-pymk-name-container">';
   result+= fullname;
   result+='</div><div class="go-pymk-vicon-container">' + v.icon + '</div>';
   result+='<div class="go-pymk-photo-container go-open-profile" data-uverified="' + uv + '" data-uid="' + user_id + '" data-user="' + user + '" data-unicename="' + unice + '">';

   result+=go_user_icon( avatar,  "medium");
   
   result+='</div>';
   result+='<div class="go-pymk-follow-btn-container follow-feature">';
 
   if( loggedIn()){
   result+='<button class="ripple-effect go-follow-btn go-sugg-follow-btn ' + custom + '" data-fuid="' + user_id + '" data-unicename="' + unice + '" data-uverified="' + uv + '" data-fuser="' + user +'">Follow</button>';
   }
   result+='</div>';
   result+='</div>';
 }
  });
  
  result+='</div>';
  result+='</div>';
    if( pymk_cnt<1 ){
   return "";
    }else
 return result;
  }


function custom_pymk(){
  var x= localStorage.getItem(SITE_UNIQUE__ + USERNAME + '_custom_pymk');
  if( x) return;
  var data=[
    {"username":"pv_gosports","fullname":"Go Sports"},
    {"username":"pv_golaughs","fullname":"Go Laughs"},
    {"username":"pv_golove","fullname":"Go Love"},
    {"username":"pv_goentertain","fullname":"Go Entertainment"}
    ]
  var result=format_pymk( data, 'custom');
  $('#go-pymk-container').html( result);
}
  
function pymk_( data){
  if( !data ) return;

 var result=format_pymk( data);
var cont=$('#go-pymk-container');
cont.html( result);
cont.find(".ripple-effect").ripple();  
}



function openRightMenu(){
  $('#go-rmenus-container').removeClass('hide-rmenus');
}

function appendComposerInfo(user, name ){
var avatar= __SITE_URL__ + "/" + user + "/photo.jpg";

$("#composer-icon-container").html( go_user_icon( avatar,  "small") ); 
 $("#composer-name").html( name);
 }
 

$(function(){
 /*LOAD MENUS*/

  loadMenus()
  loadPosts();
  
  $('body').on('click','.go-show-follow-form-btn',function(){
  $('#go-follow-container').fadeIn();
       changeHash("");
   });
   
 $("#go-the-posts").on("click",".go-post-title", function(){
 	return false;
 });
 
  $("body").on("click",".ext-social-button", function(){
  	var this_=$(this);
   var site=this_.data("site");
   var account=this_.data("account");
 
if( site.match(/whatsapp/i)){
  var href="https://wa.me/" + account;
  }
  else  if( site.match(/telegram/i)){
  var href="https://t.me/" + account;
  }
  else  if( site.match(/tiktok/i)){
  var href="https://tiktok.com/@" + account;
  }
  else  if( site.match(/youtube/i)){
  var href="https://youtube.com/@" + account;
  }
  
  else{
 var href="https://" + site + ".com/" + account;
 }
   var data='<div class="center-header pt-2 ps-3"><small><i class="fa fa-info-circle text-warning fa-lg"></i> Social link</small></div><div class="pt-1 pb-3 ps-3 pe-3 center-text-div">';
  data+='<i class="fa fa-2x text-secondary fa-'+ site + '"></i> <a href="' + href + '" style="font-size: 13px; font-weight: bold;" target="_blank">  ' + href + '</a>';
  data+='</div>';
  
   displayData(data, { width: '80%', max_width:'500px',data_class: '.preview-link-div', osclose:true});
 
  });
 
$("body").on("click",".menuItemTitle", function(e){
	e.preventDefault();
});
   
 $('#go-posts-column').on('touchstart scroll mouseover', function() {
   var scr=$(this).scrollTop() + $(this).innerHeight();
   
  if( !loadingPosts && scr >=  $(this)[0].scrollHeight-500) { 
    loadingPosts=true;
    loadPosts();
    }
 });
  
  //SCROLL SEARCH PAGE
  $('#go-search-content').on('touchstart scroll mouseover', function() {
   var scr=$(this).scrollTop() + $(this).innerHeight();
   if( !searchingPosts && scr >=  $(this)[0].scrollHeight - 500) {
   searchingPosts=true;
     searchPosts();
   }
  });
  
 //SCROLL FOLLOWERS PAGE
 $('#go-followers-container .u-content').on('touchstart scroll mouseover', function() {
   var scr=$(this).scrollTop() +
 $(this).innerHeight();
   if( !loadingFollowers && scr >=  $(this)[0].scrollHeight-500) {
     loadingFollowers=true;
     loadFollowers();
    }
  }); 
  
   //SCROLL FOLLOWING PAGE
$('#go-following-container .u-content').on('touchstart scroll mouseover', function() {
   var scr=$(this).scrollTop() + $(this).innerHeight();
   if( !loadingFollowing && scr >=  $(this)[0].scrollHeight-500) {
     loadingFollowing=true;
     loadFollowing();
    }
  }); 
  
   //SCROLL BLOCKED FOLLOWERS PAGE
 $('#go-blocked-followers-container .u-content').on('touchstart scroll mouseover', function() {
   var scr=$(this).scrollTop() +
 $(this).innerHeight();
   if(!loadingBFollowers && scr >=  $(this)[0].scrollHeight-500) {
    loadingBFollowers=true;
     loadBlockedFollowers();
    }
  });
  
  
  //SCROLL NOTIFICATION PAGE
 $('#go-notifications-container .u-content').on('touchstart scroll mouseover', function() {
   var scr=$(this).scrollTop() +
 $(this).innerHeight();
   if(!loadingNotificationsPosts && scr >=  $(this)[0].scrollHeight-500) {
    loadingNotificationsPosts=true;
     openNotifications();
    }
  });
  
  
  
  //GO NICE LINK
  
$('body').on('click','.go-nice-link',function(e){ 
	e.preventDefault();
 var this_=$(this);  
 var link=this_.attr('href');
 var repost=this_.data("repost");
  if(!link){
    toast("Invalid link");
    return false;
  }
  else if( repost || ( link.indexOf("https://")<0 && !link.match(new RegExp("\\b" + __SITE_URL__) ) ) ){
 	return false;
 }

checkUrl( link); 
//window.open(link, '_blank');
  
  
});
  
  
$('body').on('click press', '.go-nice-link-info', function(e) {
    var href=$(this).attr("data-link");
   var reg=new RegExp(DOMAIN_,"i");
  var  etype=e.type;
  if( etype=="press"){
 copyToClipboard(href.replace(/"/g,"") );
   }else{
   var data='<div class="center-header pt-2 ps-3"><small>' + ( href.match(reg)?'':'<i class="fa fa-info-circle fa-lg text-warning"></i> External link') + '</small></div><div class="pt-1 pb-3 ps-3 pe-3 center-text-div">';
  data+='<div style="font-size: 19px; font-weight: bold;">' + href + '</div>';
  data+='</div>';
  
   displayData(data, { width: '80%', max_width:'500px',data_class: '.preview-link-div', osclose:true});
   }
   return false;
});  
  
 //COPY POST CODES 
   
$('body').on('click','code',function(e){
 var this_=$(this);
  var target_=$(e.target);
  if(  target_.is("span")
     ||target_.is("a") ) {
    return;
  }
  
  var text_=( this_.html()||"").replace(/<br>/g,"\n");
  var code_=$("<div></div>").html(text_).text()||"";

    if(!code_) {
      return toast('Nothing to copy');
    }
    
    copyToClipboard(code_);
  /*  toast("Copied",{type:"success"});*/
   
   
  });
  
 $('body').on('input','#compose-post-box',function(){ 
  clearTimeout(composingTimeout);
   var this_=$(this);
   var text_=this_.val()||"";
   var txt=$.trim( text_);
   var total_lines=text_.split("\n").length;
   var plen=text_.length;
 
 if( total_lines>5 || plen>124) {
   this_.removeClass('go-pbg-1 go-pbg-2 go-pbg-3 go-pbg-4 go-pbg-5 go-pbg-6 go-pbg-7 go-pbg-8 go-pbg-9 go-pbg-10 go-pbg-11 go-pbg-12 go-pbg-13 go-pbg-14 go-pbg-15 go-pbg-16');
   this_.attr("data-bg","");
  $('#go-post-bg-container').css('visibility','hidden');
  }
 else{
   $('#go-post-bg-container').css('visibility','visible');
    } 
   
composingTimeout= setTimeout( function(){
   osbdb.set("draft", txt);
     },1500);
 }); 
  
  
  //SEND POSTS

$('body').on('click','#go-send-post-btn',function(){
  var box=$('#compose-post-box');
  var post=$.trim( box.val()||"");
  var plen=( post.length+1)/1024;
  var mpl=go_config_.mpl;
  if( plen> mpl){
   return toast('Maximum post length exceeded (' + mpl + 'Kb)'); 
  }
  var post_bg=box.attr('data-bg'); //Post background
  var this_=  $(this);

  var el=$("#go-compose-post-data");
  var post_by=el.attr("data-user");
  var puid=el.attr("data-uid");
  var type=el.attr("data-type");
  var fullname=el.attr("data-fullname");
  var unicename=el.attr("data-unicename");

 if(!post_by ){      
  return toast('Select page');
  } 
  else if( !unicename){
  	return toast("Name not found");
  }
  
 var adm= siteAdmin( USERNAME);
 
var post_title=$.trim( $("#post-title-box").val());
  if( SERVER_SETTINGS.enable_post_title=="YES"  ){
   	if(!adm && !post_title ){
   	return toast("Input post title");
    }
   else if( post_title.length>150){
 return toast("Post title exceeded 150 characters");
    }
 }
   
function progress(){
  if( !$('.dummy-dummy').length){
  setTimeout(function(){
  displayData("",{ dummy: true, data_class:'.dummy-dummy',osclose: false,no_cancel:true});
  $('#post-progress').html('<div id="post-progress-slider"></div>');
   },500);
  } 
 }
  
  try{
 if( GO_UPLOAD_FILE_PATHS.length>0 ){
   progress();
  
    this_.prop('disabled',true);  
  return goUploadFiles();
  }
  }catch(e){
  	alert(e)
  }
  
  
  var rp=$('#go-repost-data').val();
   
 if( GO_UPLOADED_FILE_PATHS.length<1 && !post && !rp.length){
     closeDisplayData('.dummy-dummy');
   return toast('Nothing to send');
 }
   this_.prop('disabled',true);  
  progress();
    sendPost( post_title, post, puid,  unicename, post_by, fullname, post_bg);
 });
   
  
  
  //OPEN SINGLE POST

$('body').on('click','.go-open-single-post',function(){
 var this_= $(this);
  
  if( this_.find(".post-unavailable").length) return;
  var cpid=this_.data("cpid")||"" //Current post id,
  //- if the post is shared post, pid is id of the shared post while,
  //cpid is the id of the  post  that shared

  var pid= this_.data("pid")||"";
  var puid= this_.data('puid')||"";
  
  var zi=zindex();
  $('#go-single-post-container').css({'display':'block', 'z-index': (zi + "!important") });
 
 var plink= osb_permalink(pid);
  
   if(!this_.attr("data-no-push")){ 
 
 var data={
  	"type": "single-post",
      "pid": pid,
      "cpid": cpid,
      "puid": puid,
      }
    pushState_(data,  plink);
}
    
  var ctempCont=$("#single-post-container-" + pid);
  
  $(".single-post-page").css("display","none");
 
 goCloseProfile();
 goCloseComment();
 goCloseCommentReply();
 
 var reloading=false;
 if( this_.data("reload")) {
 	reloading=true;
 ctempCont.css("display","block");	
 }else  if( ctempCont.length ){
     ctempCont.css("display","block");	
     return;
  }
  
  if(!reloading){
  	 var stemplate=$("#single-post-template").html();
 
   var sdata=$('<div class="single-post-page" id="single-post-container-'+ pid + '"></div>')
   .append(stemplate);
  
   $("#single-post-template-container").append( sdata);  
}
this_.prop('disabled', true);
  
  var loader=$('#single-post-loading-indicator');
  loader.css('display','inline-block');

var cont=$("#single-post-container-" + pid).find(".go-single-post");

var reloadBtn='<div class="text-center"><button class="btn btn-small btn-secondary go-open-single-post" data-pid="' + pid + '" data-no-push="1" data-cpid="' + cpid + '" data-reload="1" data-puid="' + puid + '">Reload</button></div>';

if( ajaxSinglePost) ajaxSinglePost.abort();
   if( spTimeout) clearTimeout( spTimeout);
 
 connCounts++;
 
 spTimeout=setTimeout( function(){
   
   ajaxSinglePost=$.ajax({
    url: config_.domain + '/oc-ajax/go-social/single-post.php',
    type:'POST',
  // timeout: 30000,
     dataType: "json",
    data: {
      "post_id": pid,
      "cpost_id": (cpid||""),
      "puid": puid,
      "version": config_.APP_VERSION,
    }
  }).done(function(result){
  	this_.prop("disabled", false );
   loader.css("display","none"); 
  	connCounts--;
  if( result.status=="success"){
    var mf=result.fstatus;
  
if( mf=="0"){     
 return  cont.html('<div class="text-center">Post is unavailable</div>');
   }
  return cont.html( display_post( result.result, 'full') );
 }else  if(  result.error ){
   var err_msg= result.error_message;   
  
 if( err_msg ){
   return  cont.html('<div class="container"><div class="alert alert-warning text-center">' + go_textFormatter( err_msg ) + '</div></div>' );
    }else {
toast( result.error );
  }
  
}
return cont.html( reloadBtn);

 }).fail(function(e,txt,xhr){
 	this_.prop("disabled", false );
   loader.css("display","none"); 
 
 	connCounts--;
toast('Check your connection. ' + xhr);
  cont.html(reloadBtn);
   });
 }, 1000); 
  
});
  
   //POST PHOTO FULL
  
  
  $('body').on('click','.go-post-image',function(){
 var this_=$(this);
   if( this_.hasClass('reposted') ) {
   //This let original post to load first before any image is viewable
     return;
   }
   //   var height=this_.attr("height");
//   var width=this_.attr("width");
   var fsize= this_.data("fsize");
   var height=this_.data("original-height");
   var width=this_.data("original-width");

var maxW=$(window).width();
var maxH=$(window).height();

     var size=imageScale( width, height, maxW , maxH);
     var height= Math.ceil(size*height);
     
  var allow_download=false;
 
 if( siteAdmin( USERNAME) || SERVER_SETTINGS.go_enable_download=="YES"){
      allow_download=true;
  }
   var parent=this_.parents(':eq(1)');
  
 var photos=parent.find(".go-post-image");
  var total= photos.length;
   
 // var sicont=$('#go-save-img-btn-cont');
 //  sicont.empty();
   var saveable= this_.attr("data-fdload");
  
  function savePhotoBtn(saveable, src, fsize, allow_dl){    
    if( saveable!="1" || !allow_dl) return "";
    
  return '<div class="mt-2 mb-2 text-center save-image-container"><a href="' + src + '" class="save-media-btn save-image-btn" target="_blank" download>'  + readableFileSize( +fsize, true, 0) +  ' <i class="fa fa-download fa-lg"></i></a></div>';
  }
   
  var img= this_.attr("src");
 
var photo='<div id="fpc-0" class="full-photo-container'+ (!allow_download?" pointer-events-none":"") + '"><div class="absolute-center" style="width: 100%;"><img onerror="go_postImgError(this);" alt="" heigh="' + height + '" class="lazy go-full-photo" src="' + __THEME_PATH__ + '/assets/go-icons/bg/transparent.png" data-src="' + img + '"></div><br>' + savePhotoBtn( saveable, img, fsize, allow_download ) + '</div>';

var i=0;
  if(  total>1 ){
    photos.each( function(){
          var img_=this.src;
      if( img_==img ){
        	}
      else{
 i++;
   var height=this.getAttribute("data-original-height");
   var width= this.getAttribute("data-original-width");
   var fsize=this.getAttribute("data-fsize");
var size=imageScale( width, height, maxW , maxH);
  var height= Math.ceil(size*height);
   
photo+='<div id="fpc-' + i + '" class="full-photo-container d-none' + (!allow_download?" pointer-events-none":"") + '"><div class="absolute-center" style="width: 100%;"><img onerror="go_postImgError(this);" alt="" heigh="' + height + '" class="lazy go-full-photo" src="' + __THEME_PATH__ + '/assets/go-icons/bg/transparent.png" data-src="' + img_ + '"></div><br>' + savePhotoBtn(saveable,img_, fsize, allow_download)  + '</div>';
      } 
 });
 }

if( total>1 ){
 photo+='<div id="photo-nav-container" class="text-center"><div class="container"><div class="row"><div class="col text-right"><button class="btn btn-sm btn-light d-none" id="prev-pp" data-next="1" data-total="' + total + '" onclick="prevPostPhoto(this)"><i class="fa fa-arrow-left fa-2x"></i></button></div><div class="col text-left"><button class="btn btn-sm btn-light" id="next-pp" data-total="' + total + '" data-prev="0" onclick="nextPostPhoto(this)"><i class="fa fa-arrow-right fa-2x"></i></button></div></div></div></div>';
  }
  
$('#go-full-photo-div').html(photo);
/*
if( !this_.hasClass("no-push")){
  var data={
  	"type": "full-avatar",
     "photos": photo,
      }
   pushState_(data,  location.href); 
 }
 */

   var zi=zindex();
   $("#go-full-photo-container").css({"display":"block","z-index": zi});
   changeHash("");
 });
  
   

  //POST AUTHOR ICON FULL
  
$("body").on("click",".go-post-author-icon", function(){
   var this_=$(this);
   if( this_.hasClass("reposted") ) {
   //This let original post to load first before any image is viewable
     return;
   }
  var src= this_.find("img").attr("src");
   if(!src) return;
   var img   = replaceLast( src, "small","full");
   $('#go-full-photo-div').html('<div class="absolute-center" style="min-width: 100%;"><i id="imgloader" class="fa fa-spin fa-spinner fa-3x text-white"></i><img style="display: none;" onerror="go_postImgError(this);" alt="" class="lazy go-full-photo" src="" data-src="' + img + '" onload="authorIconLoaded(this);"></div>');
  $("#go-full-photo-container").css("display","block");
  
if( !this_.hasClass("no-push")){
  var data={
  	"type": "full-avatar",
      "src": src,
      }
   pushState_(data,  location.href); 
 } 
});
  
       
 $('body').on('click','.go-post-bg',function(){
 var this_=$(this);
  var bg=this_.data('bg');
  var box=$('#compose-post-box');
   box.removeClass('go-pbg-1 go-pbg-2 go-pbg-3 go-pbg-4 go-pbg-5 go-pbg-6 go-pbg-7 go-pbg-8 go-pbg-9 go-pbg-10 go-pbg-11 go-pbg-12 go-pbg-13 go-pbg-14 go-pbg-15 go-pbg-16');
  if( bg=='go-pbg-1') {
   return box.attr("data-bg","");
  }
   box.addClass(bg).attr('data-bg', bg);
 
 });
 
  
/*
  $("body").on("pointerdown","img",function(e){
 return false;
  });
  */
  
  /*POST OPTIONS*/
  
$('body').on('click','.go-post-options-btn', function(){
 var this_=$(this);
 var pid= this_.data('pid');
 var puid=$.trim( this_.data('puid'));
 var true_author=$.trim( this_.data('true-author') );
 var post_link=$.trim( this_.data("post-link") );

 var ptype=this_.data('post-type');
 var pbf=this_.data('pbf');
 var hide_author=this_.data('hide-author');
  
   var show=false;
   var fshow=true;
   var ashow=true; //Always show

  if( siteAdmin( USERNAME) || puid==ID){
    show=true; //Show if it's my post
    fshow=false; //Dont show if it's my post
  }
  
/*  if(ptype=="sponsored"){
    ashow=false;
    show=false;
  }
  */
  var options=[
{ id:"go-show-edit-post-form-btn",icon:"fa-edit",pid:pid,info:"Edit post", true_author: true_author, post_by: puid, pbf: pbf, display: show }
    ,{id:"go-delete-post-btn",icon:"fa-trash",pid:pid, info:"Delete post", post_by: puid, true_author: true_author,  pbf: pbf, display: show }
    ,{id:"osb-copy-post-link", icon:"fa-link",pid:pid, info: "Copy link", post_by: puid, true_author: true_author,  pbf: pbf, display: ashow }
    ,{id:"go-report-post", icon:"fa-clock-o",pid:pid, info: "Report post", post_by: puid, true_author: true_author,  pbf: pbf, display: fshow }
    //,{id:"go-copy-post-btn", icon:"copy-b.png",pid:pid, info:"Copy post", post_by: puid, true_author: true_author, pbf: pbf, display: ashow }
   ];
  
 if( hide_author=="NO"){
 
/*  options.unshift({ id:"go-save-post-btn",icon:"save.png",pid:pid,info:"Save post", post_by: puid, true_author: true_author, pbf:pbf, display: ashow });
*/

  }

  var data='<div id="osb-post-option-data" data-post-link="' + post_link + '" class="center_text_div" style="width:100%; margin-top: 0; padding: 10px;">';
      data+=buildPostOptions( options);  
      data+='</div>';
  
  displayData(data, { width: '100%', max_width:'500px', oszinde:200,pos:'100',data_class: '.post-options-div', osclose:true});
  
 });
  
  $('body').on('click','#osb-copy-post-link', function(){
 var elem= $("#osb-post-option-data");
 var post_link=elem.data("post-link");
 
 var this_=  $(this);
 var pid= this_.data('pid');
 var post_by= this_.data('post-by');
 var true_author= this_.data('true-author');
 closeDisplayData(".post-options-div", 0,  true);

 setTimeout(function(){
  copyToClipboard( post_link );
  },500);
   
  });
  
  
  //OPEN EDIT POST FORM
  
$('body').on('click','#go-show-edit-post-form-btn', function(){
 var this_=  $(this);
 var pid= this_.data('pid');
 var puid= this_.data('post-by');
 var true_author= this_.data('true-author');
  
  var admin=siteAdmin( USERNAME);
  
 closeDisplayData(".post-options-div",false, true); 
  
  var data='<div class="center-header">';
      data+='<div class="container-fluid"><div class="row">';
      data+='<div class="col p-0">';
      
      data+='<div style="width: 100%; white-space: nowrap; overflow-x: auto;">';

 data+='<button class="btn btn-sm btn-primary ebtn-layer"  onclick="switchPostEditLayer(this);" data-layer="edit-post-text-div">Post</button> ';

if( admin){
data+='<button class="btn btn-sm btn-warning ebtn-layer"  onclick="switchPostEditLayer(this);" data-layer="edit-post-excerpt-text-div">Excerpt</button> ';

}

if( SERVER_SETTINGS.enable_post_title=="YES" ){
data+='<button class="btn btn-sm btn-warning"  onclick="switchPostEditLayer(this);" data-layer="edit-post-title-div">Title</button>  ';
 }
     
      data+='<button class="btn btn-sm btn-warning ebtn-layer" onclick="switchPostEditLayer(this);" data-layer="edit-post-files-div">Media</button> ';
    
 data+='<button class="btn btn-sm btn-warning ebtn-layer" onclick="switchPostEditLayer(this);" data-layer="edit-post-links-div">Link</button>'; 
      data+='</div></div>';
      
data+='<div class="col p-0 text-end" style="max-width: 140px;"><i class="fa fa-lg fa-spin fa-spinner" id="go-edit-post-loader" style="margin-right: 8px;"></i> <button id="go-edit-post-btn" class="btn btn-sm btn-info" data-pid="' + pid + '" data-puid="' + puid + '" data-true-author="' + true_author + '" style="border-radius: 0; width: 60px;" disabled="disabled">Save</button> ';

data+=' <button class="btn btn-sm btn-danger" onclick="closeDisplayData(\'.post-edit-div\',0,1);" style="border-radius: 0; width: 40px;"><i class="fa fa-lg fa-times text-white"></i></button> ';

data+='</div>';

data+='</div></div></div>';
  
      data+='<div id="edit-post-container" class="center-text-div bg-white" style="height: 58vh; width:100%; margin-top: 0;">';
   data+='<div class="container-fluid">'; <!--start-->
   data+='<div class="row">';
  data+='<div class="col w-50 p-0">';

  data+='<div id="post-edit-settings" style="width: 100%; height: 55vh;"></div>';
  
 data+='</div>';
 data+='<div class="col p-0">';  
  data+='<div class="post-edit-layer" style="position: relative;" id="edit-post-text-div"><textarea id="go-post-edit-box" style="height: 55vh; padding-bottom: 70px;" class="form-control" disabled="disabled"></textarea></div>';

    data+='<div class="post-edit-layer" style="position: relative; display: none;" id="edit-post-excerpt-text-div"><textarea class="form-control"  id="go-post-excerpt-edit-box" style="border-bottom: 0; border-radius: 4px 4px 0 0; height: calc(55vh - 60px); padding-bottom: 70px;" disabled="disabled"></textarea>';
data+='<div class="form-control" style="border-radius: 0 0 4px; height: 60px;">';
data+='<div class="custom-control custom-checkbox" style=""><input type="checkbox" class="custom-control-input" id="eauto-generate-excerpt"' + (!admin?' checked="checked"':'') + '><label class="custom-control-label" for="eauto-generate-excerpt"><span style="display: inline-block; font-weight: bold; font-size: 13px;"> Auto generate new excerpt</span></label></div>';

data+='</div>';
data+='</div>';
      
     data+='<div class="post-edit-layer"  style="height: 55vh; overflow: auto; display: none; position: relative;" id="edit-post-files-div"></div>';

     data+='<div class="post-edit-layer" style="height: 55vh; overflow-x: auto; display: none; position:  relative;" id="edit-post-links-div">'
     
  data+='<div class="input-group mb-2"> <div class="input-group-prepend">  <span class="input-group-text bg-light text-center">Link</span></div> <input class="form-control" type="text" id="edit-post-link-box"> </div>';
  
  data+='<div class="input-group mb-2"> <div class="input-group-prepend">  <span class="input-group-text bg-light text-center">Title</span></div>';
 
 data+='<input class="form-control" type="text" id="edit-post-link-title-box">';
 data+='</div>';
  
data+='</div>';
 
 data+='<div class="post-edit-layer" style="height: 55vh; overflow-x: auto; display: none; position:  relative;" id="edit-post-title-div">'
     
  data+='<div class="input-group mb-2"> <div class="input-group-prepend">  <span class="input-group-text bg-light text-center">Title</span></div> <input class="form-control" type="text" id="go-post-title-edit-box"> </div>';
    
data+='</div>';
 data+='</div>';
 
  data+='</div>'; <!--End col-->
data+='</div>';
 data+='</div>';
 
 setTimeout(function(){
 displayData(data,{ width: '100%', max_width: '500px', oszinde:200, pos: '100', data_class:'.post-edit-div', osclose: false});
  
  var loader=$('#go-edit-post-loader');
  loader.css('display','inline-block');
    
  fetchFullPost( pid, function(s,e,xhr){
     loader.css('display','none');
 if (e){
   closeDisplayData('.post-edit-div');
  toast('Check your connection. ' + xhr);
 }else if( s && s.status=='success'){
  
  var has_repost=s.has_repost||"";
  
   var box=$('#go-post-edit-box');
   var ebox=$("#go-post-excerpt-edit-box");
   var title_box=$('#go-post-title-edit-box');
 
   box.prop('disabled', false);
   ebox.prop('disabled', false);
  
 $("#go-edit-post-btn").prop("disabled", false)
 .attr("data-has-repost", has_repost);
 
  var post= $('<div/>').html( s.post.replace("<!--hm-->", "&lt;!--hm--&gt;")).text();
      box.val( post); 
  var excerpt= $('<div/>').html( s.post_excerpt).text();
      ebox.val( excerpt); 
      
     title_box.val( s.post_title.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&amp;/g,"&")    );
     
 POST_FILES_EDIT=new Object();
    
  var post_files=s.post_files||"[]";
  var meta_= s.post_meta;
post_files= JSON.parse(  post_files);
var files="";

if(post_files.length){
  
 $.each( post_files,function(i,v){
 var ext=v.ext;
var path=v.path;
var poster=v.poster;

var fid=randomString(7);
if( ext=="jpg"){

	POST_FILES_EDIT[fid]=v;
	files+='<div class="epost-file-container deep-edit-post-file d-inline-block mt-1" style="position: relative; margin-right: 5px; height: 100px; width: 100px;" data-fid="' + fid + '" onclick="goEditPostFile(this);">';
	files+='<div style="border: 0; border-radius: 5px; background: yellow;background-image:url(' + path + '); background-size: cover;  background-position: center; width: 100%; height: 100%;"></div></div>';
	
} else if( ext=="mp4" && poster){
	POST_FILES_EDIT[fid]=v;
	
    files+='<div class="epost-file-container deep-edit-post-file d-inline-block mt-1" style="position: relative; margin-right: 5px; height: 100px; width: 100px;" data-fid="' + fid + '" onclick="goEditPostFile(this);">';files+='<div style="border: 0; border-radius: 5px; background: yellow;background-image:url(' + poster + '); background-size: cover;  background-position: center; width: 100%; height: 100%;"></div><i class="fa fa-video-camera fa-lg text-white" style="position: absolute; bottom: 0; left: 0; z-index: 10;"></i></div>';
  }
	
  });  
} else
{
	files+='<div class="ps-2">No media files</div>';
	}
$("#edit-post-files-div").html( files );
 
var meta= JSON.parse( meta_);
  var smeta=JSON.stringify( meta);
  if( meta.repost ){
 $("#edit-post-files-div,#edit-post-links-div").addClass("d-none");
 }

  $("#edit-post-link-box").val( meta.link||"");
  $("#edit-post-link-title-box").val( meta.link_title||"");
  
var mdiv='<div style="width: 100%; border: 1px solid #f2f2f2; padding-top: 16px; height: 100%; overflow-y : auto;">';
    
   mdiv+='<textarea class="d-none" id="edit-post-meta-datas">' + smeta + '</textarea>';
   
   postEditMeta=smeta.replace(/&amp;/g, "&");
   
   var meta_editable={
     "commentable":"fa-comment",
     "shareable":"fa-share",
     "fdload":"fa-download",
     "hidden": "fa-eye-slash"
   };
   
  
 $.each(meta_editable,function(i,v){
var metaLabel= meta_editable[i];
   if(i in meta){

    mdiv+='<div class="h-50">';
     
     mdiv+='<div onclick="toggleEditPostMeta(this);" style="text-align: center;"><i class="fa fa-lg ' + metaLabel + ' '+ ( meta[i]?'text-primary active ':'text-secondary ') + ' go-edit-post-meta" data-key="' + i + '"></i></div>';
     
  mdiv+='</div>';
  
       }else{
  mdiv+='<div class="h-50">';
  
  mdiv+='<div onclick="toggleEditPostMeta(this);" style="text-align: center;"><i class="fa fa-lg ' + metaLabel + ' go-edit-post-meta text-secondary" data-key="' + i + '"></i></div>';
  
  mdiv+='</div>';	       
       } 
 
  });
    
 mdiv+='</div>';

  $("#post-edit-settings").html( mdiv);
   
 }
  else if( s.error){
     toast(s.error);
    closeDisplayData('.post-edit-div');
 }else {
   closeDisplayData('.post-edit-div');
   toast('Unknown error occured.');
 }
    
  });
  },300);
});
  

 //EDIT POST
  
$('body').on('click','#go-edit-post-btn',function(){
	
 var this_=  $(this);
 var pid= this_.data('pid');
 var puid=this_.data('puid');
 var true_author=this_.data('true-author');
 var has_repost=this_.attr("data-has-repost");
 
  if( !pid ||!puid){
    return toast('Missing parameters');
  }
  
 var box= $('#go-post-edit-box');
 var ebox= $('#go-post-excerpt-edit-box');
  var post_title=$.trim( $("#go-post-title-edit-box").val()||"");
  
 var adm=siteAdmin( USERNAME);
 
if( SERVER_SETTINGS.enable_post_title=="YES"){ 

   if(!adm && !post_title){
	return toast("Input post title");
}
else if(  post_title.length>150){
 return toast("Post title exceed 150 characters");
}
  
  }
  
  var text_=box.val()||"";
  var text=$.trim( text_);
  var plen=text.length;
  var total_lines=text_.split("\n").length;

var excerpt="";

if(!$("#eauto-generate-excerpt").is(":checked") ){
	excerpt=$.trim( ebox.val());
}

 var  meta=( postEditMeta||"{}");
  
  try{
    meta= JSON.parse(meta);
    var pbg=meta.pbg||""; //Post background before edit
    var post_bg=meta.post_bg;
    
  if( !pbg && post_bg){
    	meta["pbg"]=post_bg;
        pbg=post_bg;
    }
var has_files=meta.has_files;

if( !$(".epost-file-container").length){
	has_files="";
	meta["has_files"]="";
	}
var melem= $("#edit-post-container .go-edit-post-meta"); 
   
    melem.each( function(){
     var this_=$(this);
     var key=this_.data("key");
     meta[key]=this_.hasClass("active")?1:0;
   });
    
  if( !("commentable" in meta)){
  	return toast("Something went wrong");
  }
   var link=$.trim( $("#edit-post-link-box").val()||"");
  var link_title=$.trim( $("#edit-post-link-title-box").val()||link );
  
  var link_=sanitizeLink(link, link_title);
  link=link_.link;
  link_title=link_.link_title;
 
   meta["link"]= link
   meta["link_title"]=link_title;
   meta["plen"]=plen ;
 
 if( total_lines>5||plen>124){
 	meta["post_bg"]="";
 }
 else{
 	meta["post_bg"]=pbg;
 }
 
  }catch(e){
    return toast("Could not edit");
  }
  
  if( !plen && !has_files && !has_repost){
    return toast('Enter text')
  }
  
  var loader=$('#go-edit-post-loader');
  loader.css('display','inline-block');
  
  this_.prop('disabled',true);
  var fullname=userData('fullname');
  box.prop('disabled', true);
  
var post_files=[];
 var total_files=0;
 
if( !POST_FILES_EDIT.length ){
    
  $.each( POST_FILES_EDIT, function(key,value_){
	post_files.push( value_);
  });
  total_files=post_files.length;
  post_files=JSON.stringify( post_files);
  
}else{
   post_files="";
}
 
meta["total_files"]=total_files;
   var meta_string= JSON.stringify(meta);
 
  connCounts++;
   
  setTimeout(function(){
    $.ajax({
    url: config_.domain + '/oc-ajax/go-social/edit-post.php',
    type:'POST',
  // timeout: 10000,
   dataType: "json",
   data: {
      "puid": puid,
      "post_id": pid,
      "post_title": post_title,
      "post": text,
      "excerpt": excerpt,
      "post_files": post_files,
      "post_meta": meta_string,
      "fullname": fullname,
      "version": config_.APP_VERSION,
    }
  }).done(function(result){
  //  alert(JSON.stringify(result))
  connCounts--;
  
 loader.css('display','none')
 this_.prop('disabled', false);
   box.prop('disabled', false);
  if( result.status=='success' ){

 var settings=result.settings;
 var post_preview=result.excerpt

 closeDisplayData(".post-edit-div", false, true);

 var fullname=meta.pbf;
 
//var data=build_post( pid,  post_title, result.post_excerpt,  post_files, result.post_meta);

  toast("Updating",{type:"info"});

fetchSinglePost( pid, function(result_){

 if( result_.status && result.status=="success"){ 
var cont=$(".go-post-container-" + pid + ".post-parent");

cont.hide().after( display_post( result_.result )  ).remove();   

 }
	});
 }
   else if(result.error){
      toast(result.error );
  }
   else{
    toast('Unknown error occured.', {type:'info'});
  }
 }).fail(function(e,txt,xhr){
 	connCounts--;
   loader.css('display','none');
  this_.prop('disabled', false);
   box.prop('disabled', false);
  toast("Something went wrong");     
  report__('Error "go-edit-post-btn" in go-social.js', JSON.stringify(e),true );
 
    });
    
  },1000);
  
 });
  
 $("body").on("press",".deep-edit-post-file",function(){
 
    if(!siteAdmin(USERNAME)) return;
   
   var this_=$(this);
   var fid=this_.data("fid");
 
 if(!fid) return;
   
  var file_data=POST_FILES_EDIT[fid];
   
 var data='<div class="center-text-div bg-white" style="width:100%; margin-top: 0; padding: 10px;">';
 
  $.each( file_data, function(key,v){
    data+='<div class="mb-2">' + key + '<textarea class="deep-edit-post-file-input form-control" data-key="' + key + '">' + v + '</textarea></div>';
   });
   
   data+='</div><div class="center-footer"><div class="mt-2" style="padding-left: 20px;"> <button data-fid="' + fid + '" id="save-deep-edit-post-file" class="btn btn-sm btn-primary">Done</button></div></div>';
  
 displayData(data,{ width: '100%', max_width: '500px', oszindex:250, pos: '100', data_class:'.deep-post-edit-div', osclose: true});
   //changeHash("deep-edit");
});
  
  
$('body').on('click','#save-deep-edit-post-file', function(){
  var this_=$(this);
  var fid=this_.data("fid");
 var obj=new Object(); 
 
  $(".deep-edit-post-file-input").each(function(){
   var v=$.trim( $(this).val()||"").replace(/"/g,"");
   var key=$(this).data("key");
   obj[key]=v;
 });
  
  POST_FILES_EDIT[fid]=obj
 
 toast("Done", {type:"success"});
 closeDisplayData(".deep-post-edit-div");
});

  //DELETE POST
  
$('body').on('click','#go-delete-post-btn',function(){
 var this_=  $(this);
 var pid= this_.data('pid');
 var post_by=this_.data('post-by');
 var true_author=this_.data('true-author');
  
  if( !confirm('Delete now') ) return;
  closeDisplayData('.post-options-div', 0, true);
   deletePost(pid ,post_by);  
 });
  
    
$('body').on('click','.go-remove-upload-preview',function(){
   var this_=$(this);
   var fpath= this_.data('fpath');
   var contId=this_.data('cid');
   var findex= +this_.data('findex');
  
 GO_UPLOAD_FILE_PATHS =$.grep( GO_UPLOAD_FILE_PATHS, function(value) {
   return value != fpath;
 });
   
   $('#' + contId).remove();
   
  });
  
 
  //LOAD FULL POST
  
  $('body').on('click','.go-load-full-post', function(e){
  var this_=$(this);
  var pid=this_.data("pid");
  var puid=this_.data("puid");
  var true_author=this_.data("true_author");
    
    if( loadingFullPost) {
      return toast('Please wait.');
    }
 
   var target_=$(e.target);
    
   if(  target_.is("code")
      || target_.is("span")
      || target_.is("a")
 || target_.is("img")
 || target_.is("video")
  || target_.is("audio")  ){
     return; 
   }
 
  if( this_.hasClass("full-loaded") ) {   
  
  var hdata=this_.attr("data-excerpt");
  this_.html( go_textFormatter( hdata ) ) 
    this_.removeClass("full-loaded");
    return;
  }
    this_.prop('disabled',true);
  
    loadingFullPost=true;
   this_.addClass('go-load-full-post-loading');
    
 setTimeout( function(){
   
    fetchFullPost( pid, function(s,e,xhr){
    this_.prop('disabled', false);
      loadingFullPost=false;
      this_.removeClass('go-load-full-post-loading')
 if (e){
  if(xhr!='timeout'){
    toast('Check your connection');
  }
toast("Something went wrong");     
  report__('Error ".go_load-full_post" in go-social.js', JSON.stringify(e),true );
   
   
 }else if( s && s.status=='success' ){
 	
 var hdata= removebbCode( this_.html() );
 this_.attr("data-excerpt", hdata);
 
    this_.html( go_textFormatter(s.post) );
    this_.addClass('full-loaded');
  }
   else if(s.error){
      toast(result.error );
  }
   else toast('Unknown error occured.');
   });
},1000);
 
  });
  
  
  //LIKE POST
  
$('body').on('click','.go-like-post-btn',function(){
  var isRunning=$("#is-running");
  
 if( isRunning.hasClass("liking-post") ){
   return toast('Please wait');
 } 	
   
  var this_=$(this);
  var pid=+this_.data('pid');
  var user_id=+this_.data('uid');
  var post_by=this_.data('post-by');
  var reacted_icons= $(".reacted-icons-container-" + pid);
  var rbc=$(".reactions-box-container-" + pid);
  
 if( rbc.html())  closeReactionsBox(true);
  
  if( this_.hasClass("close")){
    return;
  }
               
  var reaction=this_.data("reaction")||"like";
  this_.prop('disabled',true);

  likePost(pid, user_id, post_by, reaction, function(result,error){
    this_.prop('disabled', false);
    
 if( error){
   return toast( error );
 }else if (result.status && result.status=='success'){
    reacted_icons.attr('data-reactions', JSON.stringify( result.result ) );
  }
  });
});
  
$("body").on("click",".reacted-icons-container", function(){
  var data=$(this).attr("data-reactions");
  try{
 var json= JSON.parse( data);
  }catch(e){
   return toast("Not available");  
  }
  
    var div="";
 $.each( json, function(i,count_){
  if(count_){
    div+='<div class="container-fluid mt-2 ml-2 mr-2 mb-2">';
    div+='<div class="row">';
    div+='<div class="col-3"><strong>' + i.toUpperCase() + '</strong></div>';
    div+='<div class="col-5 text-center">';
    div+='<img class="w-18" src="' + __RCDN__ + '/' + i + '.png">';
    div+='<img class="w-18" src="' + __RCDN__ + '/' + i + '.png">';
    div+='<img class="w-18" src="' + __RCDN__ + '/' + i + '.png">';
    div+='</div>';
    div+='<div class="col-4 text-center"><strong>' + abbrNum( (+count_), 1) + '</strong></div>';
    div+='</div>';
    div+='</div>';
  }
});
  
  
  displayData( div,{ max_width:'300', data_class:'.view-reactions-div', osclose: true});
  
});
  
  $("body").on('press', '.go-like-post-btn', function(e) {
    //finger.js
    var this_=$(this);
  var pid=+this_.data('pid');
  var user_id=this_.data("uid");
  var post_by=this_.data('post-by');
  var btn=$(".go-like-post-btn-" + pid);
 
if(   $(".reactions-box").length){
	closeReactionsBox(true);
	}
  
setTimeout(
function(){  $(".reactions-box-container-" + pid).html( reactionsBox( pid, user_id, post_by) );
  changeHash("");
  },500);
  });
      
//PROFILE
  
$('body').on('click','.go-profile-cover-photo',function(){
 //View full cover photo
    var this_=$(this);
  if( !this_.hasClass('img-loaded')) return;

  var img= this_.attr('src');
  var cont=$('#go-full-cover-photo-container');
 var elem=$("#go-full-cover-photo");
  
  var bg=this_.attr('data-bg')||"rgba(0,0,0);";
 cont.attr("style","background-color:" + bg); 

  var rid=randomString(3);
 elem.html('<div class="absolute-center"><i id="' + rid + '" class="fa fa-spin fa-spinner fa-3x text-white"></i></div>')
  
cont.css("display","block");
changeHash("");

  goFetchPhoto(img, function(idata,error){
    $("#" + rid).remove();
    
    if( idata) elem.html('<div style="min-width: 100%;" class="absolute-center"><img alt="" class="go-full-photo" src="' + idata + '"></div>');
 });
 
});
  
  $("body").on("click","uzer",function(){
  	var unicename=$(this).text();
  if(!unicename) return;
  unicename=strtolower( unicename).replace("@","");
  	var elem=$("<div/>").addClass("go-open-profile")
  .attr("data-unicename", unicename);
     elem.appendTo('body').click();	
  });
  
$('body').on('click','.go-open-profile, .go-user-open-profile', function(){
 var this_=$(this );
  var user=this_.attr("data-user")||""
  var user_id=this_.attr("data-uid"); //No longer necessary
var unicename=this_.attr("data-unicename");
  if(   !unicename ) {
  	return toast("Profile not found");
  }
 
 var cElem= $("#go-current-opened-profile")
  if( cElem.attr("data-unicename")==unicename  && $("#go-profile-page-" + unicename).is(":visible") )  return;
  
  var zi=zindex();
  $("#go-profile-container").css({"display":"block","z-index": zi});

var path=__SITE_URL__ + "/" + unicename;
var data={
  	"type": "profile",
      "user_id": (unicename||user_id),
      "unicename": unicename
   }
  
 
 if( this_.hasClass("direct-request")){
 //	pushState_(data,  path);
  //window.history.replaceState(null,  null,  __SITE_URL__ );
 } 
   if(!this_.attr("data-no-push") ){   
   pushState_(data,  path);
}
    cElem.val(user)
.attr("data-uid", user_id)
.attr("data-unicename", unicename);

 closeDisplayData(".top-pages-lists");
  
  if( $("#go-profile-page-" + unicename).length ){
  
 var ucont= $("#go-profile-page-" + unicename);
    go_profile(ucont, user_id, unicename, 'no-load');   
      return;
  }

   this_.prop('disabled',true);
 
 var result=$("#profile-template").html();

   var ppage=$('<div class="go-profile-page" id="go-profile-page-' + unicename + '" data-t-once="0"></div>')
           .append( result);
           
   $('#go-profile-container') 
.append('<div class="u-shadow" onclick="goCloseProfile(1);"></div>')
     .append( ppage);     
   var ucont= $('#go-profile-page-' + unicename );
      go_profile( ucont, user_id, unicename,  'load-once');

      this_.addClass('loaded');
      this_.prop('disabled', false);
    var sa=siteAdmin( USERNAME)
  
 if(  !sa && SERVER_SETTINGS.go_enable_follow_btn=="NO"){
      ucont.find(".follow-feature").remove();
    }
 if( !sa && SERVER_SETTINGS.enable_chat=="NO"){
    ucont.find(".messenger-feature").remove();
  }
if( !sa && SERVER_SETTINGS.enable_send_chat=="NO" && !siteAdmin( post_by ) ){
   ucont.find(".messenger-feature").remove();  
  }
 
  }); 
  

$('body').on('click','.post-chat-user,.group-chat-from', function(){
  //Check bbcode.js, displayMessage(group chat_from)
  var this_=$(this);
  var fuser= this_.data('fuser');
 if(!fuser) return;
      fuser=strtolower(fuser.replace('~','') );
  var fullname=fuser;

var pc= go_config_.page_contact;
  if( goPage( fuser) && pc){
    fuser= pc;
    fullname='Official';
  }
  
 
  if( fuser==strtolower( USERNAME) ){
     return toast("This is your account");
  }
  this_.prop("disabled", true);

   setTimeout( function(){
    openMessage();
   this_.prop('disabled', false);
 },500);
  
});
  

$('body').on('click','.go-profile-message-btn',function(){
 var this_=$(this);
  var elem=$('#go-current-opened-profile');
  var user_id=elem.attr("data-uid")
  var fullname=elem.attr('data-fullname');
 
  if(!user_id) {
     return toast('Account not found');
   }
  
 var fuser= strtolower( curr_user);
  
  var pc= go_config_.page_contact;
  if( goPage( fuser) && pc){
    fuser= pc;
    fullname='Official';
  }  
  
  if( user_id==uid){
     return toast("This is your account");
  }
  this_.prop('disabled', true);
 
   setTimeout( function(){
    openMessage();
   this_.prop('disabled', false);
 },500);
  
  });
  
  
  
//REPORT POST
  
  $('body').on('click','#go-report-post',function(){
 var this_=  $(this);
 var pid= this_.data('pid');
   
  var data='<div class="center-header ps-2 pt-2">Why are you reporting this?</div>';
      data+='<div class="center_text_div bg-white" style="width:100%; padding: 0px 10px 10px">';
      data+='<div class="form-text">E.g Fraud, Terrorism, False infomation, Spam, Impersonation, Nudity, Violence, Harassment, Hate speech e.t.c. (Max: 30 words and not more than 150 characters)</div>';
      data+='<div><textarea id="go-report-post-box" style="height: 100px;" class="form-control" placeholder="Tell us why it\'s inappropriate..."></textarea></div>';
      data+='<div class="mt-3 text-right">';
    
      data+='<button id="go-report-post-btn" class="btn btn-sm btn-info" data-rid="' + pid + '" data-section="post">Report</button></div>';
      data+='</div>';
  closeDisplayData('.post-options-div',0, true);
setTimeout( function(){
  displayData(data,{ width: '95%', max_width:'500px', oszindex:200, data_class:'.report-post-div', osclose: false});  
  },500);
});
   
  
  //SEND REPORT
  
$('body').on('click','#go-report-post-btn',function(){
 var this_=$(this);
  
  var fullname=FULLNAME;
  var box=$('#go-report-post-box');
  var rid=this_.data('rid');
  var section=this_.data('section');
  var report=$.trim(box.val())
  if( report.length<2){
   return toast('Report not concise enough');
  }
  report=report.replace(/[\r\n]{2,}/g," ");
 var total_words= report.split(' ');
  
  if( total_words.length > 30||report.length>150){
   return toast('Report too long. At most 30 words or 150 characters.');
  }
    
  this_.prop('disabled', true);
  box.prop('disabled', true);
  
  buttonSpinner(this_);
  connCounts++;
  
  setTimeout(function(){
    $.ajax({
    url: config_.domain + '/oc-ajax/report.php',
    type:'POST',
   timeout: 40000,
     dataType: "json",
    data: {
      "message": report,
      "report_id": rid,
      "section": section,
      "version": config_.APP_VERSION,
    }
  }).done(function(result){
  //  alert(JSON.stringify(result))
  connCounts--;
 buttonSpinner(this_, true);
 this_.prop('disabled',false);
 box.prop('disabled', false);
  if( result.status=='success' ){
  toast( result.result,{type:"success"});
 closeDisplayData('.report-post-div');
 }
   else if(result.error){
      toast(result.error );
  }
   else{
    toast('Unknown error occured.', {type:'info'});
  }
 }).fail(function(e,txt,xhr){
 	connCounts--;
   buttonSpinner(this_, true);
  this_.prop('disabled', false);
   box.prop('disabled', false);
 toast("Something went wrong");     
  report__('Error "go_report_post_btn" in go-social.js', JSON.stringify(e),true );
 
    
  });
    
  },1000);
  
 }); 
  
  
  //FOLLOW
  
  $('body').on('click','.go-follow-btn',function(){
 var this_=$(this);
 
// var fuser=$.trim( this_.attr("data-fuser"));
 var fuid= $.trim( this_.attr("data-fuid"));
 var uv=$.trim( this_.attr("data-uverified"));
 var unice=$.trim( this_.attr("data-unicename"));

  if(!fuid){
    return toast("User id not found");
  }
 
    buttonSpinner(this_);
 this_.prop('disabled', true);
    
     connCounts++;
    
    setTimeout(function(){
    $.ajax({
    url: config_.domain + '/oc-ajax/go-social/follow.php',
    type:'POST',
     dataType: "json",
    data: {
      "fullname": FULLNAME,
      "fuid":fuid,
      "unicename": NICENAME,
      "version": config_.APP_VERSION,
    }
  }).done(function(result){
    //alert(JSON.stringify(result))
    connCounts--
 buttonSpinner(this_, true);
 this_.prop('disabled',false);

  if( result.status=='success' ){
  toast( result.result,{type:"success"});
$('.go-follow-btn-' + fuid )
   .removeClass('go-follow-btn')
   .addClass('go-unfollow-btn')
   .text('Following');
  $(".go-pymk-" + fuid).remove();
  if( this_.hasClass('custom')){
    localStorage.setItem(SITE_UNIQUE__ +  USERNAME + "_custom_pymk","true")
  }
 }
   else if(result.error){
      toast(result.error );
  }
   else{
    toast('Unknown error occured.', {type:'info'});
  }
 }).fail(function(e,txt,xhr){
 	connCounts--;
   buttonSpinner(this_, true);
  this_.prop('disabled', false);
 // android.toast.show('Check your connection. ' + xhr);
  toast("Something went wrong");     
  report__('Error ".go-follow-btn" in go-social.js', JSON.stringify(e),true );
 
    });
      
    },1500);
    
  });
  
  //UNFOLLOW
  
$('body').on('click','.go-unfollow-btn',function(){
  var this_=$(this);
  var fuser= $.trim( this_.attr("data-fuser"));
  var fuid=$.trim(this_.attr("data-fuid"));
  
 if(!fuid){
    return toast('User id not found.');
  }
    
    buttonSpinner(this_);
 this_.prop('disabled', true);
 
    connCounts++;
    
    setTimeout(function(){
    $.ajax({
    url: config_.domain + '/oc-ajax/go-social/unfollow.php',
    type:'POST',
   timeout: 40000,
     dataType: "json",
    data: {
      "fuid": fuid,
      "fuser": fuser,
      "version": config_.APP_VERSION,
    }
  }).done(function(result){
  //  alert(JSON.stringify(result))
  
  
  connCounts--;
 buttonSpinner(this_, true);
 this_.prop('disabled',false);

  if( result.status=='success' ){
  toast( result.result,{type:"success"});
 this_
   .removeClass('go-unfollow-btn')
   .addClass('go-follow-btn')
   .text('Follow');
 }
   else if(result.error){
      toast(result.error );
  }
   else{
   toast('Unknown error occured.');
  }
 }).fail(function(e,txt,xhr){
 	connCounts--;
   buttonSpinner(this_, true);
  this_.prop('disabled', false);
  toast("Something went wrong");     
  report__('Error ".go-unfollow-btn" in go-social.js', JSON.stringify(e),true );
 
    });
      
    },1500);
   });
 
 $('body').on('change','.profile-post-order', function(){
 	 var this_=$(this);
 
  var uElem= $('#go-current-opened-profile');
   var user=uElem.val();
   var user_id=uElem.attr("data-uid");
   var unicename=uElem.attr("data-unicename");
  
  var ucont= $("#go-profile-page-" + unicename);
   var pnElem=ucont.find(".go-profile-next-page-number");
  var pageNum=pnElem.val("");
      ucont.find('.go-profile-posts').empty();
   
  go_profile( ucont, user_id, unicename, "load");
  });
  
   //FOLLOW BOX - SUGGESTION
$('body').on('input','#go-follow-box',function(){
    clearTimeout( fsuggestionsTimeout);
    var loader=$("#follow-suggestion-loader");
    
  var text=$.trim( $(this).val());
  if(!text||text.length<2) {
  $('#go-follow-suggestions').empty();
  loader.addClass("d-none");
    return;
  }
  
  if( fsuggestionsAjax) fsuggestionsAjax.abort();
  
   
   loader.removeClass("d-none");
   
   
   connCounts++;
   
  fsuggestionsTimeout=setTimeout( function(){
  
  fsuggestionsAjax=$.ajax({
    url: config_.domain + '/oc-ajax/go-social/follow-suggestions.php',   
   type:'POST',
   timeout: 15000,
    dataType: "json",
    data: {
      "pin": text,
      "version": config_.APP_VERSION,
    }
  }).done(function(result){
  // alert( JSON.stringify(result) );
  connCounts--;
     var scont= $('#go-follow-suggestions');
  loader.addClass("d-none");
  if( result.error){
     toast( result.error);
   }
    else if( result.no_record){
     scont.html('<span class="d-block" style="margin-left: 16px;">"' +  result.no_record + '"</span>'); 
    }
    else if( result.status=='success'){
     
      var data='<div class="go-suggestions-container">';
           data+='<ul>';
      $.each(result.suggestions, function(i,v){
        var uv=v.verified;
       var fuser=v.username;
        var fuid=v.id;
        var unice=v.nicename;
        var fullname=v.fullname;
        var avatar=v.avatar||"";
        var veri=checkVerified( uv, fullname);
      var verified=veri.icon;
  //   fullname= veri.name;
  var fullname_=$.trim( fullname + " " + verified);
        
         data+='<li>';
         data+='<div class="container-fluid"><div class="row go-open-profile" data-uverified="' + uv + '" data-uid="' + fuid + '" data-user="' + fuser + '" data-user-fullname="' + fullname + '" data-unicename="' + unice + '">';
         data+='<div class="col p-0" style="max-width: 50px;">';
         data+='<div class="go-follow-sugg-icon-container middle">' + go_user_icon( avatar , "small") + '</div>';
         data+='</div>';
         data+='<div class="col">';
         data+='<div class="go-follow-suggested-name">' + fullname_ + '</div>';
         data+='<div class="go-follow-suggested-pin"><span>' + fuser + '</span></div>';
         data+='</div>';
         data+='</div></div>';
          data+='</li>';
        });
        data+='</ul>';
        data+='</div>';
   scont.html(data);
      
 }else{
   scont.empty();
 }
      
  }).fail( function(e,txt,xhr){
  	connCounts--;
  	loader.addClass("d-none");
  toast("Something went wrong");     
  report__('Error "#go-follow-box" in go-social.js', JSON.stringify(e),true );
 
  });
    
  },1500);
});

//Save Post
  
  $("body").on("click","#go-save-post-btn", function(){
       goSavePost(this); 
    
  });  
  
$("body").on('click', '#go-settings-container .dropdown-menu', function (e) {
	  e.stopPropagation();
});
  
$('body').on('click','#show-console-log',function(){
   var opacity=+$(this).css("opacity");
   if(opacity<1) return;
   var cl=$('.console-log');
  
    if(cl.is(':visible') ) {
      cl.hide();
      $(this).css("opacity",0);
    }
    else{
 cl.fadeIn();
  changeHash("console");
 }
  });
     
 $('#show-console-log').on('press', function(e) { 
      $(this).css("opacity",1);
});
  
});

function authorIconLoaded(t){
var this_=$(t);
$("#imgloader").css("display","none");
 this_.css({"visibility":"hidden","display":"block"});
 setTimeout(function(){
 this_.css({"visibility":"visible"});
  },500);
}
	
function prevPostPhoto(t){
	var $this=$(t);
	var total=+$this.attr("data-total");
	var nElem=$("#next-pp");
   var prev=+nElem.attr("data-prev");
	
$(".full-photo-container").addClass("d-none");
$("#fpc-" + prev).removeClass("d-none");
 $this.attr("data-next", prev+1);
nElem.attr("data-prev", prev-1);

if( (prev-1)<0){
	 $this.addClass("d-none");
	}
	$("#next-pp").removeClass("d-none");
	}
	
function nextPostPhoto(t){
	var $this=$(t);
	var total=+$this.attr("data-total");
	var pElem=$("#prev-pp");
	var next=+pElem.attr("data-next");

$(".full-photo-container").addClass("d-none");
$("#fpc-" + next).removeClass("d-none");
   $this.attr("data-prev", next-1);
   pElem.attr("data-next", next+1);
   
   if( total==(next+1)){
	 $this.addClass("d-none");
	}

$("#prev-pp").removeClass("d-none");
}

function toggleEditPostMeta(t){
	var this_=$(t);
	if( this_.find("i").hasClass("active") ){
		this_.find("i").removeClass("text-primary active").addClass("text-secondary");
		}
		else{
			this_.find("i").addClass("text-primary active").removeClass("text-secondary");
 }
}


//Open composebox

function openComposeBox(){
	 var zi=zindex(); 
$("#compose-post-box").focus();
 $("#compose-post-container").css({'display':'block','z-index': zi}); 
  changeHash("")
 }
	
	
//OPEN COMPOSE POST PAGE
  
function openComposePage(t){
 var zi=zindex();
  var this_=$(t);
  
  var el=$("#go-compose-post-data");

  el.attr("data-uid", ID)
  .attr("data-unicename", NICENAME)
 .attr("data-uverified", VERIFIED)
 .attr("data-user", USERNAME)
 .attr("data-fullname",  FULLNAME)
 .attr("data-type","regular");
 
  
  var veri=checkVerified( VERIFIED, FULLNAME);
var  fname=FULLNAME + " " + veri.icon;
appendComposerInfo(USERNAME, FULLNAME);

  
 var draft=osbdb.get("draft");
  $("#compose-post-box").val( draft); 
 
 $('#compose-post-container')
 .find(".go-repost-hide").css("display","block");
 openComposeBox();
 
  }


function openPageComposePage(t){
	//Profile
  var this_=$(t);
  var zi=zindex();
   var el=$("#go-compose-post-data");
   
  var user_id=this_.attr("data-uid")
  var uv=this_.attr("data-uverified")
  var user=this_.attr("data-user");
  var fn=this_.attr("data-fullname");
  var unicename=this_.attr("data-unicename");
//  var owner=this_.attt("data-owner");
  
 if(!unicename||!user_id||!user||!fn){ 	
  return toast("Missing parameters");
 }
 
 el.attr("data-uid", user_id)
 .attr("data-uverified", uv)
 .attr("data-user", user)
 .attr("data-fullname", fn)
 .attr("data-type","page")
 .attr("data-unicename", unicename)
 
 var veri=checkVerified( uv, fn);
var fname=fn + " " + veri.icon;
appendComposerInfo(user, fname)

var draft=osbdb.get("draft");
  $("#compose-post-box").val( draft); 
 

 $('#compose-post-container')
 .find(".go-repost-hide").css('display','block');
  openComposeBox();
  
 if( siteAdmin(  USERNAME) ){
  var gpElem=$('#compose-post-container .go-pages');
 
if( !$('#compose-post-container #go-post-by-pages').length){
 
  }
 }
}
  
 
//SHARE POST or REPOST
  
function sharePost(t){
  var this_=$(t);
    var zi=zindex();
    
  var el=$("#go-compose-post-data");
  
  var user_id=Number( this_.data("uid") );
  var pid=Number( this_.data("pid") );
  var spid=+this_.data("share-pid")||0;
  var notify=this_.data("notify");
  var pbn=this_.data("pbn")||"";
  var spbn=this_.data("spbn")||"";
  var unicename=this_.data("unicename");

 if(  !pid ) return toast("Not an id");
 else if( !unicename) return toast("Missing parameter");
 
    var share_icon='<i class="fa fa-share fa-lg me-3"></i>';
   
   var hl=share_icon;
   
 var gpElem=$('#compose-post-container .go-pages');
    
if( siteAdmin(  USERNAME) ){
	
var data='<div class="center-header" style="padding-left: 20px;">' + share_icon + ' Repost to';
data+='<div style="font-weight: normal;">Select a page</div>';
data+='</div>';

data+='<div class="center-text-div" style="padding: 30px 16px 30px 16px;">';

   data+='<div style="position: relative;">';
   data+='<div class="form-control p-0" id="repost-pages"></div>';
   data+='</div>';
    
 data+='<i id="go-cpage-loader" class="fa fa-spin fa-spinner fa-lg text-primary" style="position: absolute; top: 35px; left: 45%;"></i>';
 data+='</div></div>';

displayData(data, { oszindex:260, data_class: ".com-pages-div", osclose:true});

	var loader=$("#go-cpage-loader");
var elem=$("#go-compose-pages");

var pages=elem.html();

if( pages) {
	 $("#repost-pages").html( pages);
	loader.hide();
	return;
	}

fetchPages( function( result, error){
  //alert( JSON.stringify( result) )
     if( error ){
  setTimeout( function(){  
 if( $(".com-pages-div").length){   closeDisplayData(".com-pages-div"); 
      this_.click();
      }
 },5000);  
 }
     else{
  loader.hide();
       
 var o="";  
  if( result.no_pages ){
    $("#repost-pages").html("No pages yet");
    loader.hide();
   }
    else if( result.status=="success"){
loader.hide();
     
      var static_page='<div class="ms-1"><strong>Static Pages</strong></div>';
      
 $.each( result.result,  function(i, v){  
 	var puser=v.username;
     var puid=v.id;
     var uv=v.verified;
   var fname=v.fullname
   var veri=checkVerified(uv, fname);
   var fname_=fname + " " + veri.icon;
   var unice= v.nicename;
   
if( goStaticPage( puser) ){
	static_page+='<div class="p-3" style="border-bottom: 1px solid #999;" data-sharer="' + user_id + '" data-uverified="' + uv + '" data-uid="' + puid + '" data-user="' + puser + '" data-fullname="' + fname + '" data-pbn="' + pbn + '" data-spbn="' + spbn + '" data-unicename="' + unice + '" data-pid="' + pid + '" data-spid="' + spid + '" data-notify="' + notify + '" onclick="openSharePostComposePage(this);">' + fname_ + ' *</div>';
	}else{
		
   o+='<div class="p-3" style="border-bottom: 1px solid #999;" data-sharer="' + user_id + '" data-uverified="' + uv + '"  data-uid="' + puid + '"  data-user="' + puser + '" data-fullname="' + fname + '" data-pbn="' + pbn + '" data-spbn="' + spbn + '" data-unicename="' + unice + '" data-pid="' + pid + '" data-spid="' + spid + '" data-notify="' + notify + '" onclick="openSharePostComposePage(this);">' + fname_ + ' </div>';
   }
  });
 
  o+=static_page;
elem.addClass("go-pages-loaded").html( o);
$("#repost-pages").html(o);

  } else if( result.error){
  toast( result.error );
 } 
  else{
   toast('Unknown error')       
    }
  }
   }); 
     
 }
else{
var fname=userData("fullname");

  $('#go-repost-data').attr('data-pid', pid)
   .attr('data-spid', spid).
   attr('data-notify', notify)
   .val('1');
    

el.attr("data-uid", ID)
 .attr("data-uverified", VERIFIED)
 .attr("data-user", USERNAME)
 .attr("data-fullname", FULLNAME)
 .attr("data-type","share")
 .attr("data-unicename", NICENAME);

appendComposerInfo(USERNAME, FULLNAME)
  
if( spbn ){
     hl+="Repost " + pbn.toUpperCase() + "'s shared post";
   }
    else{
    hl+="Repost " + pbn.toUpperCase() + "'s post"; 
    }
    
$('#go-repost-highlight').html('<strong>' + hl + '</strong>');

    $('#grh-container').css('display','block');
 
 
 var draft=osbdb.get("draft");
  $("#compose-post-box").val( draft); 
 
  $("#compose-post-container")
.find(".go-repost-hide").css("display","none");
  openComposeBox();
  
  $("#open-compose-page-btn").click();
  }

}

 
function openSharePostComposePage(t){
	//This function is called if it's an admin
var this_=$(t);

var user_id= this_.attr("data-uid");
var uv= this_.attr("data-uverified");
var user=this_.attr("data-user");
var fn= this_.attr("data-fullname");
var pbn= this_.attr("data-pbn");
var spbn= this_.attr("data-spbn");
var unicename=this_.attr("data-unicename");
var pid=this_.attr("data-pid");
var spid=this_.attr("data-spid");
var notify=this_.attr("data-notify");

var sharer=this_.attr("data-sharer");

 if(!user_id||!user||!fn){ 	
  return toast("Missing parameters");
 }

  $('#go-repost-data').attr('data-pid', pid)
   .attr('data-spid', spid).
   attr('data-notify', notify)
   .val('1');
    
  var el=$("#go-compose-post-data");
  
  el.attr("data-uid", user_id )
 .attr("data-uverified", uv )
 .attr("data-user", user )
 .attr("data-fullname", fn )
 .attr("data-type","admin-share")
 .attr("data-unicename", unicename)
 
	var veri=checkVerified(uv,fn);
	var fname=fn + " " + veri.icon;

appendComposerInfo(user, fname);

  var hl='<i class="fa fa-share fa-lg"></i>';

 if( spbn ){
     hl+="Repost " + pbn.toUpperCase() + "'s shared post";
   }
    else{
    hl+="Repost " + pbn.toUpperCase() + "'s post"; 
    }
    
$('#go-repost-highlight').html('<strong>' + hl + '</strong>');
    $('#grh-container').css('display','block');

closeDisplayData(".com-pages-div", false, true); 

if( sharer=="3"){ //cv_drafts
   $("#compose-area-container").css("display","none");
 }
 
var draft=osbdb.get("draft");
  $("#compose-post-box").val( draft); 
 
setTimeout( function(){
   
  $("#compose-post-container")
.find(".go-repost-hide").css('display','none');
  openComposeBox();
  },300);
 }


function switchPostEditLayer(t){
	var this_=$(t);
	var layer=this_.data("layer");
	$("#edit-post-container .post-edit-layer").css("display","none");
 $("#" + layer).css("display","block");
 $(".ebtn-layer").addClass("btn-warning").removeClass("btn-primary");
 this_.addClass("btn-primary").removeClass("btn-warning");
 
}

function goEditPostFile(t){
	var this_=$(t);
	var fid=this_.data("fid");
	if(!fid)  return toast("File id not found");
	if(!confirm("Remove file?")) return;
	
 delete POST_FILES_EDIT[fid];
	this_.remove();
}
	
function likePost(pid, user_id, post_by, reaction, callback){
 
  if(!pid ) {
    return callback("", "Not an id.");
  }
  
  var isRunning=$("#is-running");
  
 if( isRunning.hasClass("liking-post") ){
   return toast('Please wait.');
 }

 var likes=$('.total-likes-' + pid);
 var likes2=$('.top-total-likes-' + pid);
  
 var curr_likes=+likes.attr('data-total-reactions');
 var curr_icon_= $('.go-like-post-icon-' + pid);
 
var curr_icon=curr_icon_.attr('src');
      
  var type=1;
  var clikes=curr_likes+1;
  var reaction_="";
 
 var pliked=postLiked( pid);

 if(  pliked){
   //If file exists, then post is previously liked 
    type=2;
    reaction_=pliked;
 
 if( reaction_ ==reaction){ 
  var clikes=curr_likes-1;
  curr_icon_.attr("src", __RCDN__ + "/like-empty.png");
   //curr_icon.replace('liked.png','like.png'));
 }else{
   type=1;
   clikes=curr_likes;
   curr_icon_.attr('src', __RCDN__ + '/' + reaction + '.png');
  } 
}
else{
   curr_icon_.attr('src', __RCDN__ + '/' + reaction + '.png');
}

   likes.text( abbrNum(clikes, 1) );
  likes.attr("data-total-reactions", clikes);
    
  var fullname=userData("fullname");
  isRunning.addClass("liking-post");

    connCounts++;
  
  setTimeout(function(){
    $.ajax({
    url: config_.domain + '/oc-ajax/go-social/like-post.php',
    type:'POST',
  // timeout: 40000,
     dataType: "json",
    data: {
      "fullname": FULLNAME,
      "post_id": pid,
      "fuid": user_id,
      "preaction": reaction_,
      "reaction": reaction,
      "type": type,
      "version": config_.APP_VERSION,
    }
  }).done(function(result){
  // alert(JSON.stringify(result))
 connCounts--;
      isRunning.removeClass("liking-post");
     
     callback( result, result.error);     
 
 if( result.status=='success' ){
 	
 if( type==2){
      removePostLike(pid);
   $(".go-like-post-btn-" + pid).removeClass("go-post-liked");
   }else{
  storePostLike(pid, reaction); 
  $(".go-like-post-btn-" + pid).addClass("go-post-liked");
      }
 }
   else if(result.error){
  
  likes.text( abbrNum( curr_likes, 1) );
  likes.attr("data-total-reactions", curr_likes)
  curr_icon_.attr("src", curr_icon);
      
  }
   else{
    curr_icon_.attr('src', curr_icon);
     toast('Unknown error occured.',{type:'info'});
   }
 }).fail(function(e,txt,xhr){
 	connCounts--;
   isRunning.removeClass("liking-post");

  callback("", "Something went wrong");
  // clikes=clikes-1;
  likes.text( abbrNum(curr_likes, 1) );
  likes.attr('data-total-reactions', curr_likes);
  curr_icon_.attr('src', curr_icon);
             
  report__('Error "likePost()" in go-social.js', JSON.stringify(e),true );
 
  });
    
  },1000);
  
  
}



function reactionsBox(pid, user_id, post_by){
  var reactions=["like","love","wow","laugh","sad","angry"];

 var data='<div class="container reactions-box">';
  data+='<div class="row">';
  data+='<div class="col go-like-post-btn close" data-pid="' + pid + '"><img class="h-20 w-20" src="' + __RCDN__ + '/hide.png"></div>';
  $.each( reactions, function(i,v){
  	
  data+='<div class="col go-like-post-btn" data-reaction="' + v + '" data-pid="' + pid + '" data-post-by="' + post_by + '" data-uid="' + user_id + '">';
  data+='<img class="w-20 h-20" src="' + __RCDN__ + '/' + v +  '.png">';
  data+='</div>';
  });
  data+='</div>';
  data+='</div>';
  
  return data;
  }    
  
  
  function fetchFullPost( pid, callback){
  
  connCounts++;
    $.ajax({
    url: config_.domain + '/oc-ajax/go-social/open-full-post.php',
    type:'POST',
  // timeout: 40000,
     dataType: "json",
    data: {   
      "post_id": pid,
      "version": config_.APP_VERSION
    }
  }).done(function(result){
 // alert(JSON.stringify(result))
      connCounts--;
   if(callback) callback( result);  
     
 }).fail(function(e,txt,xhr){
 	connCounts-
    callback(false,true,xhr);
//  android.toast.show("Something went wrong");     
  report__('Error "fetchFullPost()" in go-social.js', JSON.stringify(e),true );
 
  });
}    
  
function viewOriginalPost(t){
  var this_=$(t);
var pid=this_.attr("data-pid");

 if( !pid){ 
    return toast('Post id not found');
 }
  var elem=$('<div/>').addClass('go-open-single-post')
      .attr('data-pid', pid);
    elem.appendTo('body').click();
   goCloseCommentReply();
}



function goChangePageType(t){
	var this_=$(t);
	var selected=this_.val();
$("#create-page-selected-type").text( selected);
$(".page-type-info").css("display","none");
$("#" + selected + "info").css("display","block");
}


//Create page

function goCreatePage(t){   
    var this_=$(t);
      
 try{
  var type= $('#go-create-page-type').val();
if( type.length<3) {
	return toast('Select page type');
	}
   
   var cppin= $.trim($('#cp-pin').val()||"" );
  var cpemail= randomString( 15) + '@gmail.com';

 var cpfullname= $.trim( $('#cp-fullname').val());
var cpbio= $.trim($('#cp-bio').val() );

var cpphone=$.trim( $('#cp-phone').val() );
var cppassword=$.trim($('#cp-password').val() );
var cppassword2=$.trim($('#cp-password2').val() );
     
  if( !cppin || cppin.length<4 || cppin.length>20) {
    return toast('Page pin too long or short. Max: 20');

   }else if( !validUsername(cppin) ) {
   return toast('Invalid pin. Alphanumerics, an underscore supported and must start with a letter.');
   }

else if(!cpfullname || cpfullname.length<2 || cpfullname.length>60) {
     return toast('Enter a valid display name or title.');
   }
else if( !validName(cpfullname) ){
     return toast('Enter a good display name or title. Must start and end with a letter.');    
    }
else if( !cpbio ){
     return toast('About page should not be empty.');    
    }

  else if( !cpemail || cpemail.length<5 ) {
     return toast('Enter a valid email address.');    
   }
   
else if( cpphone && !cpphone.match(/^[0-9+() -]{4,50}$/) ) {
     return toast('Enter a valid phone number.');    
  }
  else if(!cppassword ||cppassword.length<6) {
   return toast('Password should contain at least 6 characters.');    

  }
    else if(cppassword.length>50) {
    return toast('Password too long. Max: 50.');    
    }    
    else if( !validPassword(cppassword) ){
     return toast('Passwords can only contain the following characters: a-z 0-9 ~@#%_+*?-');
    }
    else if( cppassword!=cppassword2){
    	return toast("Password not equal");
    }
    $('input,button').prop('disabled',true);
   buttonSpinner(this_);
 var elem=$('#go-create-page-form input,#cp-bio');

  connCounts++;

    $.ajax({
      'url': config_.domain + '/oc-ajax/go-social/add-new-page.php',
    type:'POST',
   dataType: 'json',
      'data':
      {
       "type": type,
       "pin": cppin,
       "email": cpemail,
       "fullname": cpfullname,
       "bio": cpbio,
       "phone": cpphone,
       "password": cppassword,
       "token": __TOKEN__,
      },
      type:'POST'
    }).done(function(result){
 // alert(result)
 connCounts--;
   buttonSpinner( this_, true);
   $('input,button').prop('disabled', false);
      
  if(result.error){

 toast(result.error);
}
 else if( result.status ){
  elem.val('');
 $('#go-post-by-pages').removeClass('go-pages-loaded');
 $('#compose-post-container .go-pages').empty();
   
   toast( result.result , {type:'success'});
 
   } else{
    toast('Unknown error occured.');
      }
            
    }).fail(function(e, txt, xhr){
    connCounts--;	
      $('input,button').prop('disabled',false);
      buttonSpinner(this_,true);   
   toast("Something went wrong");     
  report__('Error "goCreatePage()" in go-social.js', JSON.stringify(e),true );
 
    });
}catch(e){ toast(e); }
  
}

function goLoadProfilePhoto(unicename, avatar, user , user_id){
	var ucont= $("#go-profile-page-" + unicename);

	var ptoken=randomString(4);
var pimg_path=( avatar||__SITE_URL__ + "/no-photo.png") + "?s=full&i=" + ptoken;

var pimg_icon_path= pimg_path.replace("full","small");

  var coverImg= ucont.find('.go-profile-cover-photo');
  var coverImgCont=ucont.find('.go-profile-cover-photo-container');
  var img=ucont.find('.go-profile-photo');
 
 if(!img.hasClass("img-loading") && !img.hasClass("loaded") ){ 
 	
  var imgCont=ucont.find(".go-profile-photo-container");
    
 imgCont
     .attr("data-user", user)
      .attr("data-uid", user_id)
      .attr("data-unicename", unicename)
   
 img.on('load', function(){
   var rgb=getAverageRGB( this);
   $(this).addClass('img-loaded').removeClass('img-loading');  
   coverImg.attr('data-bg', rgb);
   coverImgCont.attr('style','background-color: ' + rgb);
 }).on('error', function(){
   $(this).removeClass('img-loading');
 });

 img.addClass('img-loading');
 img.attr('src', pimg_icon_path )
}
    
 if( !coverImg.hasClass('img-loading') && !coverImg.hasClass('img-loaded')){
   var rid=randomString(3);
 
  coverImgCont.append('<span id="' + rid + '" class="absolute-center w-50 h-50"><i class="text-white fa fa-3x fa-spin fa-spinner"></i></span>');
 
coverImg.addClass('img-loading');
 connCounts++;

 setTimeout(function(){
  
 goFetchPhoto( pimg_path, function(idata,e){
 	connCounts--;
    $('#' + rid).remove();
    coverImg.removeClass('img-loading');
  
 if( idata){
     coverImg.attr('src', idata)
  .addClass('img-loaded')
  .removeClass("d-none")
     
  return;
   }
   
var reloadBtn=$('<button id="go-pphoto-reload-btn-' + unicename + '" class="btn btn-sm  absolute-center bg-none"><i class="fa fa-refresh fa-2x text-white"></i></button>')
   .on('click', function(){
   localStorage.setItem(SITE_UNIQUE__ + 'go_photo_token', rid);
  
     goLoadProfilePhoto(unicename, avatar, user, user_id);
     $(this).remove();
   });
    
 coverImgCont.append(reloadBtn);
       });
  }, 500);
 
 }
	
}

function pushState_( data, path) {
   data["url"]=path;
myHistory.push(data);
    window.history.replaceState(myHistory, "<name>", path);
}

var gpAjax,gpTimeout;

function go_profile(ucont,  user_id, unicename, type){
	
  clearTimeout( gpTimeout);
 var adm=siteAdmin(USERNAME);
 
  $(".go-profile-page").css("display","none");
  var toast_p_once= +ucont.attr("data-t-once");
  
  var nameCont=ucont.find(".go-profile-fullname");
  
 if( type=="load-once" ){
 	nameCont.css("visibility","hidden");
 }
 
 var fbtn= ucont.find('.go-profile-follow-btn');
 
 ucont.find(".go-profile-user-pin").text( unicename );

  var me=false;
  
 if( unicename==NICENAME){
    me=true;
  }
 
  var uformBtn=ucont.find('.go-profile-update-form-btn');
  var fmCont=ucont.find('.go-profile-message-follow-btn-container');
  
  var emailElem=ucont.find('.go-profile-email');
  var countryElem=ucont.find('.go-profile-country');
  var bioElem= ucont.find('.go-profile-bio');
  var joinedElem=ucont.find('.go-profile-joined' );
  var phoneElem=ucont.find('.go-profile-phone');
  var birthElem=ucont.find('.go-profile-birth');  
 
  var totalFgElem=ucont.find('.go-total-following');  
  var totalFwElem=ucont.find('.go-total-followers');  
 
   ucont.css('display','block');
  
  var pnElem=ucont.find('.go-profile-next-page-number');
  var pageNum=pnElem.val();

  if( pageNum=="0"){
     if(!toast_p_once){
  ucont.attr('data-t-once','1');
  toast('No more posts!',{type: 'info'});
 }
   return;
  }
 
 
 if ( type=='load'||
     type=='load-once'||
    type=='load-failed-reload'||
    pageNum==""){

var pdElem=$("#OSB-PROFILE-DATA");

var profile_data=pdElem.val();

if( profile_data.length>10){
	pdElem.val("");
return __PROFILE_RESULT( JSON.parse( profile_data) );
}


function __PROFILE_RESULT( result){  
 if( result.not_found ){
      pnElem.val("0");
   return toast( result.not_found, {type:'info'});
  }
    else if(   result.no_post ){
   pnElem.val("0");
    return toast( result.no_post, {type:'info'}); 
}
 else if( result.status=="success"){
 	
   var settings=result.settings;
   var user_id=result.user_id;
   var avatar= result.avatar||"";
   var user=result.username;
  var unicename=result.nicename
   var uv=result.verified||"";
   var real_name=result.real_name||"";
   
  var veri=checkVerified(uv, real_name);
  var verified=veri.icon;
  var real_name_=$.trim( real_name + " " + verified);

 $('#go-current-opened-profile')
 .attr("data-unicename", unicename)
 .attr("data-uid",user_id); //
 
goLoadProfilePhoto(unicename , avatar, user, user_id);
 
  if( static_page){
  	ucont.find(".followership-info").remove();
  }

if( me || (adm && goPage( user) ) ){
    uformBtn.css("display","inline-block");
 }

 if( SERVER_SETTINGS.go_can_post!="3" && !goPage( user)  ){
   fbtn.remove();
  } 
     
   ucont.find("#open-page-compose-page-btn")
   .attr("data-uid", user_id)
   .attr("data-uverified", uv)
   .attr("data-user", user)
   .attr("data-fullname", real_name)
  .attr("data-unicename", unicename);
     
   nameCont.html( real_name_)
 .attr("data-name", real_name)
 .attr("data-uid", user_id)
 .attr("data-uverified", uv)
  .attr("data-unicename", unicename)
 .css("visibility","visible");

var static_page=goStaticPage( user);
  
fbtn. addClass("go-follow-btn-" + user)
.addClass("go-follow-btn-" + user_id)
.attr("data-fuser", user)
 .attr("data-fuid", user_id)
 .attr("data-unicename", unicename)
 .attr("data-uverified", uv);
 
   var country=result.country||"";
   var birth= result.birth||"";
   var bio=result.bio||"";
   var email=result.email||"";
   var phone=result.phone||"";
   var joined=result.joined_on||"";
   
  if( country){
    countryElem.text( country ).css('display','block');
  }
 
if( email){
   emailElem.text( email );
  }  
   
 if( bio){
   bioElem.html( bio ).css('display','block');
 }
   
 if( joined){
   var date=new Date( joined);
  joinedElem.attr('data-joined', joined).text( date.format("mmmm yyyy") );
   if(!goPage(user) ){
     joinedElem.css('display','block');
   }
 }
 
  if( phone) {
    phoneElem.text(  phone).css('display','block');
  }
   
   if( birth){
    var birth_=new Date( birth);
   birthElem.attr('data-birth', birth).text(  birth_.format("mmmm dd") ).css('display','block');
   }
     
 totalFgElem.html('<strong>' + abbrNum( +result.total_following,1) + '</strong><small> following</small>');
 totalFwElem.html('<strong>' + abbrNum( +result.total_followers,1) + '</strong><small> followers</small>');
  
   var fstatus=result.fstatus;
   var can_post=SERVER_SETTINGS.go_can_post;

 if( me ){
	
	if( adm|| (can_post=="2" && verified)|| can_post=="3") ucont.find("#open-page-compose-page-btn").css("display","block");
	
  ucont.find(".go-profile-camera-icon").css("display","block");
   uformBtn.prop('disabled', false);
}
 else
 {
  
  if( adm && goPage(user ) ) {
  ucont.find("#open-page-compose-page-btn,.go-profile-camera-icon").css("display","block");
 }
    
  if( fstatus=="1"){ 
   
  fbtn.removeClass('go-follow-btn').addClass('go-unfollow-btn').text('Following').prop('disabled',false);
 
 }else if(  fstatus==null ){
  fbtn.removeClass('go-unfollow-btn').addClass('go-follow-btn').text('Follow').prop('disabled',false);
 
  if( goAdmin( user) ||goStaticPage( user) ) {
    fbtn.css('display','none');
  }
  
   }
 
 if( fstatus!="0"){
     //If not blocked
   fmCont.css('display','block');
  }
 
 if( adm && goPage(user)){
   uformBtn.prop('disabled', false);
  }  
 }
   var posts_stadium=ucont.find('.go-profile-posts');
   
 if( fstatus=="0"){
    posts_stadium.html('<div class="text-center">No post to display</div>');
  ucont.find('.go-profile-message-btn').css('display','none');
     return pnElem.val("0");
 }
 
  var has_post=result.has_post;
  
if( has_post && has_post >0 ){
  
  var nextPage=result.next_page;
   pnElem.val( nextPage);
   var posts= result.result;
   
 try{    posts_stadium.append( display_post(  posts) ); 
 posts_stadium.find(".ripple-effect").ripple()
     }catch(e){
     	alert(e)
     }
     
   }else{   
   pnElem.val("0");
   return toast('No post yet', {type:'info'});
  }
      
if(type=='load-once' ){

  $('#go-profile-page-' + unicename).on('touchstart scroll mouseover', function() {
   var scr=$(this).scrollTop() + $(this).innerHeight();
   if(!loadingProfilePosts &&scr >=  $(this)[0].scrollHeight-500) {
      loadingProfilePosts=true;
    go_profile( ucont, user_id, unicename,  'load' );
    }
  });
}
 
 }
   else if(result.error){
     toast(result.error );
  }
   else{
     toast('No more post.');
   }
      
 }

   loadingProfilePosts=true;
 
    WAIT_FOR_ME='profile';
   
 var loader=ucont.find('.profile-posts-loading-indicator');
  loader.css('display','block');
   
   if( gpAjax){
     gpAjax.abort();
   }
  
  var post_order=ucont.find(".profile-post-order").val();
   
    connCounts++;
   
   gpTimeout=setTimeout( function(){  
  gpAjax= $.ajax({
    url: config_.domain + '/oc-ajax/go-social/profile.php',
    type:'POST',
     dataType: "json",
    data: {
      "user_id": ( unicename||user_id ),
      "page": pageNum,
      "post_order": post_order,
      "version": config_.APP_VERSION,
    }
  }).done(function(result){
 // alert(JSON.stringify(result)) 
  connCounts--;
 loadingProfilePosts= false;
 WAIT_FOR_ME=false;
   loader.css('display','none');
   
 __PROFILE_RESULT( result);
 
 }).fail(function(e,txt,xhr){
 	connCounts--;
      loadingProfilePosts =false;
    WAIT_FOR_ME=false;
      loader.css('display','none')
  //toast('Connection error. ' + xhr, {type:'light',color:'#333'});
  if( txt!='abort'){
    gpTimeout=setTimeout(function(){
       go_profile( ucont, user_id, unicename ,'load-failed-reload' );
     }, 4000);
  }
  });
  
 }, 100);
  }
  
  
 }

function viewProfileUpdateForm(){ 
  var zi=zindex();
 $('#go-profile-update-container').css({'display':'block','z-index': zi}); 
 changeHash("");
 
  var elem=$('#go-current-opened-profile');
var user_id=elem.attr("data-uid");
var unicename=elem.attr("data-unicename");

  if(!user_id||!unicename){
    return toast('Profile not found');
  }
 var cont=$('#go-profile-page-' + unicename);
  var bio=$.trim(cont.find('.go-profile-bio').text());
  var location=$.trim( cont.find('.go-profile-country').text());
  var phone=$.trim( cont.find('.go-profile-phone').html() );
  var birthElem= cont.find('.go-profile-birth');
  var birth=birthElem.attr('data-birth');
  var name= $.trim( cont.find(".go-profile-fullname").attr("data-name")  );

 var uv= $.trim( cont.find(".go-profile-fullname").attr("data-uverified")  ); 
  
  if( birth){
    birth=birth.split(" ")[0];
  }
  
  $('#go-update-name-box').val( name ).attr("data-uverified", uv)
  .attr("data-unicename", unicename)
  .attr("data-uid", user_id);
  $('#go-update-bio-box').val(bio);
  $('#go-update-location-box').val(location);
  $('#go-update-phone-box').val(phone);
  $('#go-update-birth-box').val( birth||"");
}

var upAjax;

function goProfileUpdate(t){

 var this_=$(t);
 var elem=$('#go-update-name-box');
 
  var name=$.trim( elem.val());
  var uv=elem.attr("data-uverified");
  var user_id=elem.attr("data-uid");
  var unicename=elem.attr("data-unicename");
  
    if(!unicename||!user_id){
    return toast('Profile not found');
  }
  
   
  var bio=$.trim( $('#go-update-bio-box').val());
  var location=$.trim( $('#go-update-location-box').val());
  var phone=$.trim( $('#go-update-phone-box').val());
  var birth=$.trim( $('#go-update-birth-box').val() );
  
 bio= bio.replace(/\s+/g," "); 
    
  if( !validName( name)){
  return toast('Enter a good name.');
  }
  else if( bio.length>200){
    return toast('Bio too long. Max 200 characters.')
  }
  else if(phone.length>0 && !phone.match(/^[\+\d]?(?:[\d-.\s()]*)$/) ){
    return toast('Invalid phone number.');
 }
  else if( location.length> 100){
  return toast('Location too long.');  
  }
  else if ( birth.length && !birth.match(/^[0-9\/_-]+$/)){
  return toast('Invalid date of birth.');                                     
  }
 
 var cont=$('#go-profile-page-' + unicename);
  this_.prop("disabled", true);
  
  buttonSpinner( this_);
  
  connCounts++;
  setTimeout( function(){
  	
  upAjax= $.ajax({
    url: config_.domain + '/oc-ajax/go-social/update-profile.php',
    type:'POST',
   //timeout: 40000,
    dataType: "json",
    data: {
      "user_id": user_id,
      "name": name,
      "bio": bio,
      "location": location,
      "phone": phone,
      "birth": birth,
      "version": config_.APP_VERSION,
    }
  }).done(function(result){
 //   alert(JSON.stringify(result))
  connCounts--;
  this_.prop("disabled", false);
    buttonSpinner( this_, true);
 
  if( result.status=="success"){
 
 var veri=checkVerified( uv, name);
  var verified=veri.icon;
  
  var fullname= veri.name;   
  var fullname_=fullname + " " + verified;
    
  cont.find(".go-profile-fullname").attr('data-name', name)
.html( fullname_ );

  cont.find('.go-profile-bio').text(bio).css('display','block');
  cont.find('.go-profile-country').text(location);
  cont.find('.go-profile-phone').html( phone);
 
 var email=$.trim( cont.find('.go-profile-email').text() );
 var joined=$.trim( cont.find('.go-profile-joined').attr('data-joined') );

 if( birth){
   var birth_= ( new Date(birth) ).format("mmmm dd")
   cont.find('.go-profile-birth').attr('data-birth', birth).text( birth_).css('display','block');
 }
    else{
      cont.find('.go-profile-birth').css('display','none');
    }

 $('.go-post-fullname-' + user_id).
attr('data-user-fullname', name);
 $('.go-puser-fullname-' + user_id).html( fullname_);
 
 if( user_id==ID){
	FULLNAME=name;
    PHONE=phone;
    LOCATION=location;
    
    $('.go-user-open-profile').attr('data-user-fullname', fullname);
   $(".go-user-fullname").html( fullname_);
  }
  
   $('#go-post-by-pages').removeClass('go-pages-loaded');
   $('#compose-post-container .go-pages').empty();
     
 if( result.arow){
  toast('Updated',{type:'success'});
  }else{
  	  toast('No changes made',{type:'info'});
  }
    
 }else if( result.error){
     toast( result.error); 
    }
    else{
     toast('could not save')
    }
   }).fail(function(e,txt,xhr){
    //alert(JSON.stringify(e))
    connCounts--;
    this_.prop("disabled", false);
    buttonSpinner( this_, true);
    toast("Something went wrong");     
  report__('Error "goProfileUpdate()" in go-social.js', JSON.stringify(e),true );
 
  });
  }, 2000);
  
}


function goUploadProfilePicture(event,type){
  //Type: image
    //var user_id=$("#go-current-opened-profile").attr("data-uid"); 
    
 var this_=$(event);
  var user= this_.data("user");
 var user_id=this_.data("uid");
 
 if( !user_id) return toast("Id not found");
else if( !user) return toast("User not found");
 
  closeDisplayData(".go-profile-camera-option-div", 0, true); 

try{
	
	var imageTypes = ["jpg", "jpeg", "gif","png"];
	var file=event.files[0];
	
	var ext= file.name.split('.').pop().toLowerCase();  //file extension from input file
 var file_type=file.type
    var reader = new FileReader();

   reader.onload = function(e){
     var data=	this.result; 
      var type=data.match(/(image)/);
 
  if( !type ) return toast("File unsupported");
 
 resizeImage( e.target.result, { quality: 0.8, width: 1000, height: 600 },function(base64, error){
 
 
//resizeImage2({ file:event.files[0], maxSize: 1000, backgroundColor: "#fff" }, function(base64,error){
 
   if(error){
  return toast("Could not upload");
}
  upload_profile_picture_(  base64, user, user_id); 
});

};
 
 reader.readAsDataURL(event.files[0]);
    
}catch(e){
 toast(e);
 }
 }
 
 
 function resizeImage( image, options, callback){
 	var quality=options.quality||0.8;
  var img=document.createElement("img");
  
   $(img).attr('src', image);
      
   img.onload=function(){
   	
   var MAX_WIDTH = options.width||700;
   var MAX_HEIGHT = options.height||400;
       
        var width = img.width;
        var height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
   var newCanvas=canvas.cloneNode(true);
   var ctx=   newCanvas.getContext("2d");
  //change transparent background to white
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);  
   ctx.drawImage(this, 0, 0, width, height);
var result=newCanvas.toDataURL('image/jpeg', quality );

if(callback) {
  if( result)  callback(  result    , null);
  else callback(  null  , "Could not generate image");
}

 }

}
 

function resizeImage2({ file, maxSize, backgroundColor }, callback) {
    const fr = new FileReader();
    const img = new Image();

    const dataURItoBlob = (dataURI) => {
        const bytes = (dataURI.split(',')[0].indexOf('base64') >= 0)
            ? window.atob(dataURI.split(',')[1])
            : window.unescape(dataURI.split(',')[1]);
        const mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const max = bytes.length;
        const ia = new Uint8Array(max);
        for (let i = 0; i < max; i += 1) {
            ia[i] = bytes.charCodeAt(i);
        }
        return new Blob([ia], { type: mime });
    };

    const resize = () => {
        // create a canvas element to manipulate
        const canvas = document.createElement('canvas');
        canvas.setAttribute('id', 'canvas');
        const context = canvas.getContext('2d');

        // setup some resizing definitions
        let { width, height } = img;
        const isTooWide = ((width > height) && (width > maxSize));
        const isTooTall = (height > maxSize);

        // resize according to `maxSize`
        if (isTooWide) {
            height *= maxSize / width;
            width = maxSize;
        } else if (isTooTall) {
            width *= maxSize / height;
            height = maxSize;
        }

        // resize the canvas
        canvas.width = width;
        canvas.height = height;

        // place the image on the canvas
        context.drawImage(img, 0, 0, width, height);

        // get the current ImageData for the canvas
        const data = context.getImageData(0, 0, width, height);

        // store the current globalCompositeOperation
        const compositeOperation = context.globalCompositeOperation;

        // set to draw behind current content
        context.globalCompositeOperation = 'destination-over';

        // set background color
        context.fillStyle = backgroundColor;

        // draw background / rect on entire canvas
        context.fillRect(0, 0, width, height);

        // get the image data from the canvas
        const imageData = canvas.toDataURL('image/jpeg');

        // clear the canvas
        context.clearRect(0, 0, width, height);

        // restore it with original / cached ImageData
        context.putImageData(data, 0, 0);

        // reset the globalCompositeOperation to what it was
        context.globalCompositeOperation = compositeOperation;

        // return the base64-encoded data url string
 //    return   imageData;
        
 if(callback) {
  if( imageData)  callback(  imageData    , null);
  else callback(  null  , "Could not generate image");
}    
        
      // return dataURItoBlob(imageData);
    };

    return new Promise((resolve, reject) => {
 if (!file.type.match(/image.*/)) {
            reject(new Error('VImageInput# Problem resizing image: file must be an image.'));
        }
 
        fr.onload = (readerEvent) => {
     img.onload = () => resolve(resize());
     img.src = readerEvent.target.result;
   
        };

        fr.readAsDataURL(file);
    });
}

function upload_profile_picture_( base64, user, user_id){

   if(!user) return toast("User not found");
  //Pin is set if upload is from go-social.js
   toast("Uploading",{  type:"info", hide:10000});
  
      sessionStorage.setItem(SITE_UNIQUE__ + 'DELAY','1');
    $('#profile-picture-loading').css('display','block');    
    
     connCounts++;
   if(!siteAdmin( USERNAME) ) user="";  
    $.ajax({
         'url': config_.domain + '/oc-upload/upload-profile-picture.php',
         'type': 'POST',
        'dataType':'json',
         'data':{
          'user': user,
          'base64': base64,
          'version': config_.APP_VERSION,
      }
  }).done(function(result){
  //	alert( JSON.stringify( result))
  	connCounts--;
        sessionStorage.removeItem(SITE_UNIQUE__ + 'DELAY');
   
  $('#profile-picture-loading').css('display','none');   
   
  if( result.status ){
  	
   goProfilePhotoUploaded( result );
        toast( result.result,{type:'success'});

   return report__('Profile picture updated successfully.');
 
  }else if( result.error){
    toast('Couldn\'t update profile picture.');
   report__('Profile picture update failed-2.', result.error);    
  }
   else toast("Unknown error");
   
 }).fail(function(e, txt,xhr){
 	connCounts--;
    sessionStorage.removeItem(SITE_UNIQUE__ + 'DELAY');
      $('#profile-picture-loading').css('display','none');
      toast('Something went wrong' + xhr);
     report__('Error: "processProfilePicture_()"', JSON.stringify(e));    
       });
	
	}

function goUploadFiles(){
  var fpaths=GO_UPLOAD_FILE_PATHS;
 
 if( fpaths.length<1) return; 
   var v=fpaths[0];
   var v_=v.split(".")
var ext=v_[1];
var filename=v_[0];

  var pElem=$('#vid-poster-' + filename);
  var base64=$("#base64-data-" + filename).val();
  
 var file_size= base64.length;
 
  var pCont=$('#go-up-progress-container-' + filename);
  $('#go-up-progress-' + filename).css({ width: "0%"});
  
  setTimeout(function(){
    
  var poster=pElem.val()||"";
  var pDim=  pElem.data("dim");
    
  $.ajax({
   xhr: function() {
      var xhr = new window.XMLHttpRequest();
    // Upload progress     
    xhr.upload.addEventListener("progress", function(evt){
        if (evt.lengthComputable) {
     var percent= (evt.loaded / evt.total)*100;
  
   $('#go-up-progress-' + filename).css({ width: "" + percent + "%"});
    pCont.css('display','block');
   
  if( percent==100){
    $('#go-up-progress-' + filename).css({width:'100%'});
   }
  }
 }, false); 
       return xhr;
    },
    
    "url": config_.domain + '/oc-ajax/go-social/upload-post-file.php',
    "dataType":"json",
    "data":{
     "version": config_.APP_VERSION,
     "base64": base64,
     "video_poster": poster,
     "video_dimension": pDim,
     "file_ext": ext,
 },
 
 type:'POST'
}).done( function(result){
 //alert( JSON.stringify( resp) )
    $('#go-send-post-btn').prop('disabled',false);
  if( result.status=='success'){
    
  var file_obj=new Object();
    file_obj["path"]=result.file_path;
    file_obj["ext"]=result.ext;
    file_obj["width"]=result.width||500;
    file_obj["height"]=result.height||150;
    file_obj["poster"]=result.poster||"";
    file_obj["size"]=result.file_size||file_size;
    
   GO_UPLOADED_FILE_PATHS.push( file_obj)
   GO_UPLOAD_FILE_PATHS =$.grep( GO_UPLOAD_FILE_PATHS, function(value) {
   return value != v;
 });
   
  $('#go-send-post-btn').click();
    
  }else if( result.error){
   var ecode=result.ecode;
  
 //if( ecode==="3" || ecode==="2"||ecode==="0"){
   $("#close-upbtn-" + filename).click();
 // }
    toast( result.error);
    closeDisplayData(".dummy-dummy");
    $("#post-progress").empty();
  }
  else{
     toast("Unknown error occured");
    $("#post-progress").empty();
  }
    
  }).fail(function(e,txt,xhr){
     //alert( JSON.stringify(e));
    $("#go-send-post-btn").prop("disabled", false);
     closeDisplayData(".dummy-dummy");
    $("#post-progress").empty();
   toast("Something went wrong");     
  report__('Error "goUploadFiles()" in go-social.js', JSON.stringify(e),true );
 
  });
  },2000); 
  
}

function togglePostLinkForm(){
 $('#go-post-link-form').toggle();
}


function goOpenVideo(t){
  var this_= $(t);
  if( this_.hasClass("cannot-play")){
  	return toast("Can't play this video");
  }
   var vid=this_.data('vid');
   var fdload=this_.data('fdload');
  var sourceUrl=$.trim(this_.data('source-url') );
  var dUrl=$.trim(this_.data("durl") );
  var fsize=$.trim( this_.data("fsize"));
  
  var poster=this_.data("poster");
 
 var data='<figure style="display: none;" id="' + vid + '-video-container" class="go-video-container" data-chatid="' + vid + '">';
     data+='<video id="' + vid + '-video" class="video-tag" data-chatid="' + vid + '" poster="' + poster + '" controls preload="true" data-fsize="' + fsize + '" data-durl="' + dUrl + '" src="' + sourceUrl + '#t=0.1">';
     data+='</video>';
     data+='</figure>';

 $(".go-video-container").css("display","none");
  
 if( !$("#" + vid + "-video-container").length) {
    $("#go-video-element-container").append(data);
    go_mediaplayer_( $("#" + vid + "-video"), fdload ,this_ );
  }
    
  var vElem=$("#" + vid + "-video");
         vElem.trigger("play");
 
setTimeout( function(){
 if(this_.hasClass("cannot-play")) return;
$("#go-video-element-container, #" + vid + "-video-container").css("display","block");
}, 800);
  changeHash("");
}

function go_mediaplayer_($elem, fdload, playBtn ){
  $elem.mediaelementplayer({
  defaultVideoWidth: "100%",
  defaultVideoHeight: "100%",
   videoWidth: 250, /*250,*/
  videoHeight: 230, /*230*/
  hideVideoControlsOnLoad: true,
  clickToPlayPause: true,
  controlsTimeoutDefault: 2000,
  features: ["playpause","current", "progress", "duration"],
  enableKeyboard: false,
  stretching: "none",
  pauseOtherPlayers: true,
  ignorePauseOtherPlayersOption: false,
  hideVolumeOnTouchDevices:true,
  
  success: function(media, originalNode, instance) {
   var node=$(originalNode);
   var chatid=node.data("chatid");
    go_enableVideoFullScreen( node, chatid, fdload);
    
 media.addEventListener('loadedmetadata',function(){
  //go_enableVideoFullScreen( node);
 });
    
media.addEventListener("play",function(e){
 go_enableVideoFullScreen( node, chatid, fdload);
  });  
   
 },
  error: function(){
  	playBtn.addClass("cannot-play");
 setTimeout(function(){
   go_exitVideoFullScreen(true, true);
},100);
    toast("Unable to load");
  }
});
}


function go_enableVideoFullScreen(node_,chatid, fdload){ 

  var allow_download=false;

  if( siteAdmin( USERNAME) || SERVER_SETTINGS.go_enable_download=="YES"){
      allow_download=true;
  }
  
  if( node_.hasClass("video-tag") ){
    
    var vsrc=node_.attr("src");
    var durl=node_.attr("data-durl");
    var fsize=node_.attr("data-fsize");
    
    var cont=node_.parent().closest('.mejs__container');
    cont.addClass('mejs__custom-fullscreen go-watching-video watching-video-' + chatid)
 //   readableFileSize( +bsize, true, 0):'
    
  cont.append('<a href="' + vsrc + '" class="save-media-btn save-video-btn" target="blank_" download>' + readableFileSize(  fsize, true, 0) + ' <i class="fa fa-download fa-lg"></i></a><button class="save-media-btn" style="position: fixed; left:5%; top: 16px;" onclick="go_exitVideoFullScreen(true, true);"><i class="fa fa-arrow-left fa-lg text-danger"></i></button>');
  
      cont.removeAttr('style');
      cont.attr('data-wvchatid',chatid);
      cont.find('.mejs__overlay,.mejs__layer').css({width:'100%',height:'100%'});
  }  
}


function go_exitVideoFullScreen(remove_, btn){
	if( btn) return history.go(-1);

  $("video").trigger("pause");
 
  $("#go-video-element-container,.go-video-container").css("display","none");
 
 var fs=$(".mejs__custom-fullscreen");
 var vid=fs.attr("data-wvchatid");  
  /*
  fs.find('.mejs__overlay,.mejs__layer').css({width:340,height:160});
   fs.css({height:160}).removeClass('mejs__custom-fullscreen go-watching-video watching-video-' + vid);
  */
if( remove_){
   $("#" + vid + "-video-container").remove();
 }
  
}


function notifications_(results_) {  
   var total_results= results_.length;
     if( !total_results  ) return;
   
    $.each( results_,function(i,v){
     var nid=v.id;
   localStorage.setItem( SITE_UNIQUE__ + "_" + USERNAME + '_last_notification_check_id',  nid);
   
  });
  
  var elem=$('#total-new-notifications');
  var curr=+elem.attr('data-total');

   var total= total_results+curr;
   var tt=total;
    if( tt>99){
      tt='99+'; }
  localStorage.setItem(SITE_UNIQUE__ +  USERNAME + '_total_new_notifications', total + '/' + tt);
  elem.attr('data-total', total).text( tt ).css('display','inline-block');
}


function fetchNotifications(){  
  var check_freq= 180000;
//go_config_.notif_check_freq;
       
  var last_check=localStorage.getItem( SITE_UNIQUE__ + "_" +USERNAME + "_last_notification_check_id")||"fresh";
   loadingNotificationsPosts=true;
  
  connCounts++;
  
  loadingNotificationAjax = $.ajax({
    url: config_.domain + '/oc-ajax/go-social/notifications.php',
    type:'POST',
   timeout: 15000,
    dataType: "json",
    data: {
     //"uid":uid,
  //    "username": username,
      "last_check_nid": last_check,
      "version": config_.APP_VERSION,
      "token": __TOKEN__
    }
  }).done(function(result){
  // alert(JSON.stringify(result))  
  connCounts--;
    loadingNotificationsPosts= false;
   var st= result.server_time||moment().unix();
  
  
  if( result.last_nid  ){

  localStorage.setItem( SITE_UNIQUE__ + "_" + USERNAME + "_last_notification_check_id",  result.last_nid );
   }
  else  if( result.status=='success' && result.result ){
   notifications_( result.result);
   }
  
 setTimeout(function(){
     fetchNotifications();
  }, check_freq );
    
  }).fail(function(e,txt,xhr){
   // alert( JSON.stringify(e));
   connCounts--;
    loadingNotificationsPosts= false;
   setTimeout(function(){
     fetchNotifications()
   }, 20000);
   
  });
  
}
  
function openNotifications(refresh){
  goCloseComment();
  $('#total-new-notifications').attr('data-total',0).text(0).css('display','none');
  localStorage.removeItem(SITE_UNIQUE__ + USERNAME + '_total_new_notifications');
  
 var mCont=$('#go-notifications-container');
 
  if( !mCont.is(":visible") ) changeHash("");
  
  mCont.fadeIn();  
  var cont=$('#go-notifications');
 
 var pnumElem=$("#go-notifications-next-page-number");
 
if( refresh) {
cont.empty();
pnumElem.text("");
}
 
   var pnum=pnumElem.text();
   
 if( pnum=="0") return;
 
 loadingNotificationsPosts=true;
 var loader=$("#notifications-loader");
 loader.removeClass("d-none");

   connCounts++;
   
  loadingNotificationAjax = $.ajax({
    url: config_.domain + '/oc-ajax/go-social/notifications-mobi.php',
    type:'POST',
   timeout: 20000,
    dataType: "json",
    data: {
//     "uid":uid,
//      "username": username,
      "page": pnum,
      "version": config_.APP_VERSION,
      "token": __TOKEN__
    }
  }).done(function(result){
  // alert(JSON.stringify(result)  )  
  connCounts--;
    loadingNotificationsPosts= false;
    loader.addClass("d-none");
 if( result.no_noti ){
   return cont.html('<div class="text-center" id="no-notification">No notification</div>');
   pnumElem.text(0);
 
}else if ( result.error){

	return cont.html('<div class="text-center">' + result.error + '</div>');
	
	}
else if( result.status=="success"){
pnumElem.text(result.next_page);
  var r='<div class="container-flui">';
 var d="";
var res=result.result;

  $.each( res,function(i,data){
  var nid=data.id;
  var to_uid=data.to_uid||"";

   var meta= JSON.parse( data.meta);
   var unice=meta.nicename||"";
   var uname=meta.username||"";
   
   var ufname=meta.fullname||"";
   var icon=meta.icon||"";
   var action= meta.action;
   var type= meta.action_type;
   var aid= meta.action_id;
   var tagUser=meta.tag_user||"";
   var tagUid=meta.tag_uid||"";
   var tagName=meta.tag_name||"";
   var user_id=meta.uid||"";
   var fuid= meta.fuid||"";
   var aid2=meta.action_id_2||"";
   var post_by=meta.post_by||"";
   var tologged=meta.to_logged_users||"";
   var status=meta.status;
 
if( tologged && !loggedIn() ){
}   
 else{
   
    d+='<div id="' + nid + '-notification-container" class="container-fluid ripple-effect go-un-' + nid + ' ' + (status?'go-unread-notification':'') + '" style="border-bottom: 1px solid rgba(0,0,255,0.15);">';
   d+='<div class="row">';
     d+='<div class="col" style="max-width: 60px;"><div class="notification-icon-container">';
    if( icon) {
     d+=go_user_icon( icon , "small");
}
else{
  d+=go_user_icon(__SITE_URL__ + "/oc-image.jpg");
}
     d+='</div></div>';
     d+='<div class="col go-open-notification" onclick="openNotification_(this);" data-post-by="' + post_by + '" data-fullname="' + ufname + '" data-uid="' +user_id + '" data-user="' + uname + '" data-unicename="' + unice + '" data-file="' + nid + '" data-action="' + action + '" data-action-type="' + type + '" data-action-id="' + aid + '" data-action-id-2="' + aid2 + '" data-tag="' + tagUser + '" data-tag-name="' + tagName + '" data-tag-uid="' + tagUid + '">';
     
     d+='<div><span class="d-inline-block notification-message" style="max-height: 108px; font-size: 14px; white-space: normal; line-height: 26px; overflow-y: hidden;">' + ( data.message||"").replace(/\B@([\w- ]+)@/gi,'<span class="go-notification-names">$1</span>') + '</span>...</div>';
     
     d+='<div class="go-notifications-time">' + timeSince( data.message_time) + '</div>';
     d+='</div>';
 if(loggedIn() &&  to_uid==ID){
    d+='<div class="col go-delete-notification text-center" data-file="' + nid + '" style="max-width: 60px;" onclick="delNotification(this);">';
     d+='<i class="fa fa-trash fa-lg text-danger"></i>';
     d+='</div>';
     }
     
     d+='</div>';
     d+='</div>';
     }
   });
     
 r+=d; 
  r+='</div>';
  
  $("#no-notification").remove();
  cont.append(r);
  
  cont.find(".ripple-effect").ripple();
  }
  else {
  	return cont.html('<div class="text-center">Unknown error occured</div>');
  }
 
 
 }).fail(function(e,txt,xhr){
  // alert( JSON.stringify(e));
  connCounts--;
  loader.addClass("d-none");
  toast("Something went wrong " + xhr);
    loadingNotificationsPosts= false;
  });
   
 }


function openNotification_(t){
  var this_=$(t);
  
  var unicename=this_.data("unicename")||"";
  
   var user_id=this_.data("uid")||"";
   var name=this_.data("name")||"";
  var action = this_.data('action');  
  var type = this_.data('action-type'); 
  var aid = this_.data('action-id');
  var aid2 = this_.data('action-id-2'); //comment reply
  var post_by = this_.data("post-by"); // Post owner id

  var file = this_.data("file");   
  
if( action=="open" ){     
 if( type =="post" ){
  var elem=$("<div/>").addClass("go-open-single-post")
      .attr("data-pid", aid);
    elem.appendTo("body").click();
    
  }else if( type=="follow"){
  var elem=$("<div/>").addClass("go-open-profile")
  .attr("data-uid", user_id)
  .attr("data-unicename", unicename);
     elem.appendTo('body').click();
  }
  else if( type=="comment"){
  	var elem=$("<div/>")
  .addClass("go-open-comments-box")
  .attr("data-pid", aid);
   elem.appendTo("body").click();
  }
   else if( type=="comment-reply" && aid2){
    $('#current-post-id').val(aid);
   $("#go-view-orig-post")
  .attr("data-pid", aid)
  .css("display","block");
  
  var elem=$('<div/>').attr('data-parent-id', aid2)
  .attr("data-tag", ( this_.attr("data-tag-uid")||"") )
  .attr("data-fullname", ( this_.attr("data-tag-name")||"" ) )
 .attr("data-uid", ( this_.attr("data-tag-uid")||"") )
 .attr("data-is-notification","true")
 .attr("data-pid", aid)
  .on('click',function(){
    replyComment(this);
  });
   elem.appendTo('body').click();   
  } else 
  if( type=="message"){
 	var msg=this_.find(".notification-message").html();
 
 if( !msg)  return;
 
 var data='<div class="center-header" style="padding-left: 16px;">';
data+='Message';
data+='</div>';
data+='<div class="center-text-div" style="padding: 10px 16px; white-spac: pre-wrap;">';
data+=msg.replace(/\n/g,"<br>");
 data+='</div></div>';

displayData(data, { oszindex:300, data_class: ".private-message-div", osclose:true});
 
 }
 
 
 }
   
 var elem=$(".go-un-" + file);
   if( elem.hasClass('go-unread-notification')){
  
     elem.removeClass('go-unread-notification'); 
  }
}
 
 function delNotification(t){
   var this_=$(t);
  var nid=this_.data("file");
  
  if(!nid) return toast("Id not found");
 
 if(!confirm("Are you sure")) return;
  
  buttonSpinner(this_);
  $.ajax({
    url: config_.domain + '/oc-ajax/go-social/delete-notification.php',
    type:'POST',
   timeout: 20000,
    dataType: "json",
    data: {
      "nid": nid,
      "version": config_.APP_VERSION,
      "token": __TOKEN__
    }
  }).done(function(result){
   //alert(JSON.stringify(result)  )  
  connCounts--;
    buttonSpinner(this_, true);

  if ( result.error){
	return toast( result.error );
  }
    else if( result.status=="success"){
	$("#" + nid + "-notification-container").remove();
	}
	
}).fail(function(e,xhr,txt){
	 connCounts--;
buttonSpinner(this_, true);
toast("Something went wrong");
});
  
  
 }
  


//VIEW FOLLOWERS
var lfAjax,lfTimeout,loadingFollowers,toast_f_once;
  
function viewFollowers( refresh){
  $('#go-followers-container').fadeIn();
  changeHash("");
  loadFollowers();
  }

function loadFollowers_( data){
   var d='<div class="container-fluid">';
  
  $.each(data,function(i,v){
     var uv=v.verified||"";
     var fuid=Number( v.follower||0);
     var user=v.username;
     var unice=v.nicename;
     var fullname=v.real_name||user;
     var avatar=v.avatar||"";
  
  var veri=checkVerified(uv, fullname);
  var verified=veri.icon;
      fullname= veri.name;
  var fullname_=fullname + " " + verified;
    
     var status=v.status;
     var bio=v.bio||"";
    if( bio.length>60 ){
      bio=bio.substr(0,80) + '...';
    }
    var type='block';
    var btext='Block';
    if( status=='0'){
      type='unblock';
      btext='Unblock';
    }
    
     d+='<div class="row">';
     d+='<div class="col" style="max-width: 60px;">';
   d+='<div class="go-followers-user-icon">';
     d+= go_user_icon( avatar, "small" );
     d+='</div></div>';
     d+='<div class="col go-open-profile" data-uverified="' + uv + '" data-uid="' + fuid + '" data-user="' + user+ '" data-user-fullname="' + fullname + '" data-unicename="' + unice + '">';
     d+='<div class="go-followers-name">' +  fullname_ + '</div>';
     d+='<div class="go-followers-bio">' +  bio + '</div>';
     d+='</div>';
     d+='<div class="col" style="max-width: 120px; text-align: center;">';
     d+='<button onclick="blockUnblockFollower(this);" class="go-followers-block-btn go-bf-btn-' + fuid + '" data-type="' + type + '" data-uid="' + fuid + '">' + btext + '</button>';
     d+='</div>';
     d+='</div>';
  });
    d+='</div>';
  
 $('#go-followers').append( d);
}


function loadFollowers( refresh){
	
  goCloseComment();

  var pnElem=$('#go-followers-next-page-number');
  var pageNum=pnElem.val();
   
/*
if( loadingFollowers ){
    return;
  } else  
*/
    if( refresh ){
    toast_f_once=false;
    pageNum="";
    displayData('<div class="text-center" style="padding-top: 30px;"><i class="fa fa-spin fa-spinner fa-lg text-primary"></i></div>',{ data_class:'.home_refresh', no_cancel: true});
  }
  
  
  if( !refresh && pageNum=="0"){
   if( !toast_f_once ){
     toast_f_once=true;
   //  toast('That is all for now.',{type: 'info'});
   }
    return;
   }
    
  loadingFollowers=true;
 
  var loader=$('#go-followers-loading-indicator');
  loader.css('visibility','visible');
  
  connCounts++;
  
 lfTimeout=setTimeout(  function(){
  lfAjax=$.ajax({
    url: config_.domain + '/oc-ajax/go-social/view-followers.php',
    type:'POST',
  // timeout: 30000,
     dataType: "json",
    data: {
  //    "uid": uid,
//      "username": username,
      "page": pageNum,
      "version": config_.APP_VERSION,
      "token": __TOKEN__,
    }
  }).done(function(result){
   //alert(JSON.stringify(result));
   connCounts--;
      loadingFollowers=false;  
      loader.css('visibility','hidden');
    if( refresh ){
     closeDisplayData('.home_refresh'); 
    }
    $('#nfw__').remove();
 if( result.no_follower){
   $('#go-followers').html('<div id="nfw__" class="text-center">' + result.no_follower +'</div>' );
  // return toast( result.no_follower,{type:'info'});
  } 
    else  
  if( result.status=='success' ){
    var posts= result.result;
    var nextPage=result.next_page;
    pnElem.val( nextPage );
  loadFollowers_( result.result);
 
 }
   else if(result.error){
toast(result.error );
  }
   else toast('No more followers.',{type:'info'});
 
 }).fail(function(e,txt,xhr){
 	connCounts--;
   loadingFollowers=false;
  //  loader.css('display','none');
  //toast('Connection error. ' + xhr, {type:'light',color:'#333'});
  if( refresh ){
     closeDisplayData('.home_refresh');
    return;
    }
    
    lfTimeout=setTimeout(function(){
       loadFollowers( refresh); },4000);
  });
    
  },1000);
}


//FOLLOWING
var lfgAjax,lfgTimeout,loadingFollowing,toast_fg_once;
  
function viewFollowing(refresh){
  $('#go-following-container').fadeIn();
  changeHash("");
  loadFollowing(refresh);
  
  }


function loadFollowing_( data){
   var d='<div class="container-fluid">';

  $.each(data,function(i,v){
   var uv=v.verified||"";
    var fuid=v.following;
    var unice=v.nicename;
    var user=v.username;
    var avatar=v.avatar||"";
    var fullname=v.real_name;
     var bio=v.bio||"";
 if( bio.length>60 ){
      bio=bio.substr(0,80) + '...';
    }
   
  var veri=checkVerified(uv, fullname);
  var verified=veri.icon;
      fullname= veri.name;
  var fullname_=fullname + verified;
    
    d+='<div class="row">';
     d+='<div class="col" style="max-width: 60px;">';
     d+='<div class="go-followers-user-icon">';
    
     d+= go_user_icon( avatar,"small" );
     d+='</div></div>';
     d+='<div class="col go-open-profile" data-uverified="' + uv + '" data-uid="' + fuid + '" data-user="' + user + '" data-user-fullname="' + fullname + '" data-unicename="' + unice + '">';
     d+='<div class="go-followers-name">' +  fullname_ + '</div>';
     d+='<div class="go-followers-bio">' +  bio + '</div>';
     d+='</div>';
        
     d+='<div class="col" style="max-width: 120px; text-align: center;">';
     d+='<button class="go-unfollow-btn go-follow-btn-' + fuid + '" data-unicename="' + unice + '" data-uverified="' + uv + '" data-fuser="' + user + '" data-fuid="' + fuid + '">Following</button>';
     d+='</div>';
     d+='</div>';
  });
    d+='</div>';
  
 $('#go-following').append( d);
}

function loadFollowing( refresh){
  //People you follow
  goCloseComment();

  var pnElem=$('#go-following-next-page-number');
  var pageNum=pnElem.val();
   
/*
if( loadingFollowing ){
    return;
  } else  
  */
  if( refresh ){
    toast_fg_once=false;
    pageNum="";
    displayData('<div class="text-center" style="padding-top: 30px;"><i class="fa fa-spin fa-spinner fa-lg text-primary"></i></div>',{ data_class:'.home_refresh', no_cancel: true});
  }
  
  
  if( !refresh && pageNum=="0"){
   if( !toast_fg_once ){
     toast_fg_once=true;
   //  toast('That is all!.',{type: 'info'});
   }
    return;
   }
	
  loadingFollowing=true;
 
  var loader=$('#go-following-loading-indicator');
  loader.css('visibility','visible');
 
   connCounts++;
   
lfgTimeout=setTimeout(  function(){
  lfgAjax=$.ajax({
    url: config_.domain + '/oc-ajax/go-social/view-following.php',
    type:'POST',
 //  timeout: 30000,
     dataType: "json",
    data: {
//    "uid":uid,
//      "username": username,
      "page": pageNum,
      "version": config_.APP_VERSION,
      "token": __TOKEN__,
    }
  }).done(function(result){
   //alert(JSON.stringify(result));
   connCounts--;
      loadingFollowing=false;  
      loader.css('visibility','hidden');
   $('#nf__').remove();
 if( result.no_following){
   $('#go-following').html( '<div id="nf__" class="text-center">' + result.no_following +'</div>' );
  // return toast( result.no_follower,{type:'info'});
  } 
    else  
  if( result.status=='success' ){
    var posts= result.result;
    var nextPage=result.next_page;
    pnElem.val( nextPage );
  loadFollowing_( result.result);
 
 }
   else if(result.error){
toast(result.error );
  }
   else toast('That is all!',{type:'info'});
 
 }).fail(function(e,txt,xhr){
 	connCounts--;
   loadingFollowing=false;
  //  loader.css('display','none');
 // android.toast.show('Something happened! Please try again. ' + xhr );
  
  lfgTimeout=setTimeout(function(){
       loadFollowing(refresh); },6000);
  });
    
  },1000);
}


//BLOCKED FOLLOWERS
var lbfAjax,lbfTimeout,loadingBFollowers,toast_bf_once;
  
function viewBlockedFollowers(refresh){
  $('#go-blocked-followers-container').fadeIn();
  changeHash("");
  loadBlockedFollowers(refresh);
}


function loadBlockedFollowers_( data){
   var d='<div class="container-fluid">';
 
  $.each(data,function(i,v){
  	var uv=v.verified||"";
     var fuid=v.follower||"";
     var unice=v.nicename;
    var user=v.username;
    var avatar=v.avatar||"";
   
    var fullname=v.real_name||user;
     var bio=v.bio||"";
    if( bio.length>60 ){
      bio=bio.substr(0,80) + '...';
    }
 var veri=checkVerified(uv , fullname);
  var verified=veri.icon;
      fullname= veri.name;
  var fullname_=fullname + verified;
    
    d+='<div class="row">';
     d+='<div class="col" style="max-width: 60px;">';
     d+='<div class="go-followers-user-icon">';
     d+= go_user_icon( avatar, "small");
     d+='</div></div>';
     d+='<div class="col go-open-profile" datat-uverified="' + uv + '" data-uid="' + fuid + '" data-user="' + user + '" data-user-fullname="' + fullname + '" data-unicename="' + unice + '">';
     d+='<div class="go-followers-name">' +  fullname_ + '</div>';
     d+='<div class="go-followers-bio">' +  bio + '</div>';
     d+='</div>';
     d+='<div class="col" style="max-width: 120px; text-align: center;">';
     d+='<button onclick="blockUnblockFollower(this);" class="go-followers-block-btn go-bf-btn-' + fuid + '" data-uid="' + fuid + '" data-type="unblock">Unblock</button>';    
     d+='</div>';
     d+='</div>';
  });
    d+='</div>';
  
 $('#go-blocked-followers').append( d);
 
}


function loadBlockedFollowers( refresh){
  goCloseComment();

  var pnElem=$('#go-blocked-followers-next-page-number');
  var pageNum=pnElem.val();
   
/*
if( loadingBFollowers ){
    return;
  } else  
  */
  
    if( refresh ){
    toast_bf_once=false;
    pageNum="";
    displayData('<div class="text-center" style="padding-top: 30px;"><i class="fa fa-spin fa-spinner fa-lg text-primary"></i></div>',{ data_class:'.home_refresh', no_cancel: true});
  }
  
  if( !refresh && pageNum=="0"){
   if( !toast_bf_once ){
     toast_bf_once=true;
   //  toast('That is all!.',{type: 'info'});
   }
    return;
   }
   
  loadingBFollowers=true;
 
  var loader=$('#go-blocked-followers-loading-indicator');
  loader.css('visibility','visible');

 connCounts++;
 
lbfTimeout=setTimeout(  function(){
  lfgAjax=$.ajax({
    url: config_.domain + '/oc-ajax/go-social/view-blocked-followers.php',
    type:'POST',
  // timeout: 30000,
     dataType: "json",
    data: {
//      "uid": uid,
//      "username": username,
      "page": pageNum,
      "version": config_.APP_VERSION,
      "token": __TOKEN__,
    }
}).done(function(result){
   //alert(JSON.stringify(result));
   connCounts--;
      loadingBFollowers=false;  
      loader.css('visibility','hidden');
  $('#nb__').remove();
 if( result.no_blocked){
   $('#go-blocked-followers').html( '<div id="nb__" class="text-center">' + result.no_blocked + '</div>');
    } 
    else  
  if( result.status=='success' ){
    var posts= result.result;
    var nextPage=result.next_page;
    pnElem.val( nextPage );
  loadBlockedFollowers_( result.result);
 
 }
   else if(result.error){
toast(result.error );
  }
   else toast('That is all!',{type:'info'});
 
 }).fail(function(e,txt,xhr){
 	connCounts--;
   loadingBFollowers=false;
  //  loader.css('display','none');
 // android.toast.show('Something happened! Please try again. ' + xhr );
  
  lbfTimeout=setTimeout(function(){
       loadBlockedFollowers(); },6000);
  });
    
  },1000);
}


var bfTimeout, bfAjax,b_u_block;

function blockUnblockFollower(t){
  if( b_u_block){
   return toast('Please be patient');
 }
  
  var this_=$(t);
  var fuid=this_.data("uid");
  var type=this_.attr('data-type');
 
  this_.prop('disabled', true);
  buttonSpinner(this_);
   
   b_u_block=true;
  
  connCounts++;
  
 bfTimeout=setTimeout(  function(){
  bfAjax=$.ajax({
    url: config_.domain + '/oc-ajax/go-social/block-follower.php',
    type:'POST',
  // timeout: 30000,
     dataType: "json",
    data: {
    //  "uid": uid,
   //   "username": username,
      "fuid": fuid,
      "type": type,
      "version": config_.APP_VERSION,
      "token": __TOKEN__,
    }
  }).done(function(result){
 //  alert(JSON.stringify(result));
   connCounts--;
   this_.prop('disabled', false);
  buttonSpinner(this_,true);
  b_u_block=false;
  if( result.status=='success' ){
    var elem=$('.go-bf-btn-' + fuid );
    elem.text( result.result);
    if( type=='block'){
     elem.attr('data-type', 'unblock');
    }else{
     elem.attr('data-type', 'block'); 
    }
 }
   else if(result.error){
toast( result.error );
  }
   else{
    toast('Something went wrong. Try again.');
   }
    
  }).fail(function(e,txt,xhr){
  	connCounts--;
    this_.prop('disabled', false);
    b_u_block=false;
    buttonSpinner(this_,true);
 toast("Something went wrong");     
  report__('Error "blockUnblockFollowers()" in go-social.js', JSON.stringify(e),true );
 
  });
 },1000);
    
}



function goProfileCameraOption(t){
  var this_=$(t);
  var user=$.trim( this_.attr("data-user") );
  var user_id=$.trim( this_.attr("data-uid") );
var unicename=$.trim( this_.attr("data-unicename") );

var ucont=$("#go-profile-page-" + unicename);

  if( user==USERNAME||
 ( siteAdmin( USERNAME) && goPage( user) ) ){ 

} else{
 	return toast("Unauthorised");
 }
          
 var data='<div class="center_text_div text-left bg-white text-dark" style="width:100%; font-size: 14px; font-weight: bold; padding: 8px 15px; border: 0; border-radius: 5px;">';
    
data+='<div class="mb-1 mt-3" style="padding-bottom: 10px;" data-pin="' + user + '"><label for="goUploadProfilePhoto">Choose existing photo</label></div>';
    
data+='<form class="d-none"><input type="file" id="goUploadProfilePhoto" name="file" data-uid="' + user_id + '" data-user="' + user + '" accept="image/*" onchange="goUploadProfilePicture(this, \'image\');" /></form>';

var icon=ucont.find('.go-profile-photo');

if( icon.hasClass("img-loaded") && !(icon.attr("src")||"").match(/xxx/) ){
   
data+='<div class="mb-1 mt-1" style="padding-bottom: 10px;" data-pin="' + user + '" onclick="removeProfilePhoto(\'' + unicename + '\',' + user_id + ', \'' + user + '\')"><label for="removeProfilePhoto">Remove photo</label></div>';
   }
  
  data+='</div>'; 
  displayData( data, { width: '90%', oszindex: 205, pos: '50', data_class: '.go-profile-camera-option-div', osclose:true});  
}

function removeProfilePhoto( unicename, user_id, user){

var ucont=$("#go-profile-page-" + unicename);
if( !confirm("Remove photo?") ) return;
closeDisplayData(".go-profile-camera-option-div", 0, true);

toast("Removing", {type:"info"});

 setTimeout( function(){
 
$.ajax({
    url: config_.domain + '/oc-upload/remove-profile-picture.php',
    type:'POST',
   timeout: 10000,
     dataType: "json",
    data: {
      "user": user,
      "version": config_.APP_VERSION,
    }
  }).done(function(result){
   // alert(JSON.stringify(result));
 
 connCounts--;
   
if( result.status=="success"){ 
   if( result.arow){
   	
  ucont.find(".go-profile-cover-photo").removeClass("img-loaded").removeAttr("src");
  ucont.find(".go-profile-photo").  removeAttr("src");
   	toast("Photo removed", {type: "success"});
 
var pimg_path=__SITE_URL__ + "/xxx/no-photo.jpg";
  ucont.find(".go-profile-cover-photo").attr("src", pimg_path)
  ucont.find(".go-profile-photo").attr("src", pimg_path);
   }
   else{
   	toast("No changes made", {type: "info"});
   }
   
 }
 else if( result.error){
 	toast( result.error);
 }
   else{
   toast("Failed to remove");	
   }
   
 }).fail( function(e,txt,xhr){
	connCounts--;
 toast("Something went wrong");

   report__('Error "removeProfilePhoto()" ', JSON.stringify(e),true );
  
//   alert(JSON.stringify(e))
   
 });
 
 },1000);
 
}

function goProfilePhotoUploaded( result){
var elem=$('#go-current-opened-profile');

 var avatar=result.avatar;
 var user_id=elem.attr("data-uid");
 var unicename=elem.attr("data-unicename");
 
 var user=$.trim( elem.val());
 
 var ucont=$("#go-profile-page-" + unicename);
 var rid=randomString(3) ;
  localStorage.setItem(SITE_UNIQUE__ + "go_photo_token",  rid);
  
var pimg_path=avatar + "?s=full&i=" + rid;

   var coverImg=ucont.find('.go-profile-cover-photo');
   var img=ucont.find('.go-profile-photo');
  var coverImgCont=ucont.find('.go-profile-cover-photo-container');
  
 img.on("load" , function(){
   var rgb=getAverageRGB( this);
   coverImg.attr("data-bg", rgb);
   coverImgCont.attr("style","background-color: " + rgb);
  // attr("style","background-color:" + bg);
  });
     
var icon=pimg_path.replace("full","small");

   img.attr("src", icon )
          .attr("data-user", user);
   coverImg.attr("src", pimg_path).addClass("img-loaded");

  $("#go-pphoto-reload-btn-" + unicename).remove();
  
  $(".go-post-author-icon-" + user_id ).find("img").attr("src", icon);
  
 if( unicename==NICENAME){
 	 AVATAR= avatar;
   localStorage.setItem(SITE_UNIQUE__ + "AVATAR", avatar);

     $(".my-photo-icon").html( go_user_icon( AVATAR, "small") ); 
   
  }
 
}


function sidebarPages( result){
 if( !result.status ) return;
  if( result.total<1) return;
 
 var data="";
 
 $.each( result.data, function(i, v){
	var uv=v.verified||"";
    var unice=v.nicename;
    var user_id=v.id;
 	var user=v.username;
    var fullname=v.fullname;
    var veri=checkVerified(uv);
    
  data+='<li class="go-open-profile menuItem" data-uid="' + user_id + '" data-uverified="' + uv + '" data-user="' + user + '" data-user-fullname="' + fullname + '" data-unicename="' + unice + '">';
 
var path=__SITE_URL__ + "/" + user + "/photo.jpg";
  data+='<img class="menuItemIcon" src="' + path + '" alt="" style="border: 0; border-radius: 100%;" onerror="go_imgIconError(this);">';
   data+='<a href="' + __SITE_URL__ + '/' + unice + '" class="menuItemTitle" style="text-transform: capitalize;">' + fullname + ' ' + veri.icon + '</a>';
  data+='</li>';
 });

$(".LEFT-MENU").prepend(data);
	}
	

//SPONSORED POSTS
function sponsoredPosts( result){
    alert(JSON.stringify(result));
ADS___=result;
     //    showAds(1);
}

function showAds( cnt){
	
	if(!ADS___) return;
	if( ADS___.error || ADS___.no_post) {
	  return;
	}
	var ad=ADS___.result;
	var total=ADS___.total_posts;

 if( !total) return;
 if( cnt >total) return;
  var post=[ad[cnt-1]];
      
function randBtw(min, max) {
 // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

 if( adPosMin<1 ){
 
var adPosMax=adPosMin + 2;
var pos=randBtw( adPosMin, adPosMax);
    adPosMin=adPosMax + 1; 

    $("#go-the-posts .post-parent:eq(" + pos + ")").after( display_post( post, false, false, true)  );
    
    }else{
       $("#go-the-posts").append( display_post( post, false, false, true) ); 
    }
 }



function downloadApp(){
	var data='<div class="center-header"></div>';
	data+='<div class="center-text-div">';
	data+='<div id="download-app-link" class="mb-5 ps-3 pe-3"><i class="fa fa-spin fa-spinner fa-lg text-primary"></i></div>';
	data+='</div>';
	
 displayData( data,
      { osclose: true, oszindex: 250,data_class:'.download-app'});
     
 connCounts++;

$.ajax({
    url: config_.domain + "/oc-ajax/download-app.php",
    type:  "POST",
   timeout: 15000,
    data: {
//     "uid":uid,
  //   "username": username,
     "version": config_.APP_VERSION,
     "token": __TOKEN__,
    }
  }).done(function(result){
 //  alert(JSON.stringify(result));
 connCounts--;
   
 $("#download-app-link").html( result);
   
 }).fail( function(e,txt,xhr){
 	connCounts--;
 toast("Something went wrong");
 closeDisplayData(".download-app");
  report__('Error "downloadApp()" in go-social2.js', JSON.stringify(e),true );
  //  alert(JSON.stringify(e))
 });
    
}



//PROMPTS

function unhideMessage(action){
var data='<div class="center_text_div text-left bg-white text-dark" style="width:100%; font-size: 14px; font-weight: bold; padding: 8px 15px;">';
     data+='<input type="password" placeholder="Secret pin">';
     data+='<div class="container"><div class="row">';
     data+='<div class="col"><button onclick="action();">OK</button></div>';
   
    data+='</div</div></div>'; 
  displayData(data,{ width: '90%', oszindex:205, pos:'50', data_class: '.go-profile-camera-option-div', osclose:true});  

}


//VIEW SETTINGS

function viewSettingsPage(){
  $('#go-settings-container').fadeIn();
  changeHash("");
  }

function closeSettingsPage(btn){
	if( btn) return history.go(-1);
  $("#go-settings-container").css("display","none");  
}


function closeComposePage( noconfirm,btn){
	if( btn){
 return history.go(-1);
 }
  var info='Dispose post?\n\n If you dispose now, you will lose this post or better still copy your text.';
  
 if( !noconfirm && GO_UPLOAD_FILE_PATHS.length ){
   if( !confirm('If you dispose now, you will lose appended files') ) return;
  }
  var tb=$('#compose-post-box');
  var text=$.trim(tb.val());
  tb.blur();
if(!noconfirm && text.length){
  //if( !confirm(info) ) return;
 }
 
 $("#compose-area-container").css("display","block");
 
  GO_UPLOAD_FILE_PATHS=[];
  GO_UPLOADED_FILE_PATHS=[];
  
  tb.val('');
  sessionStorage.removeItem(SITE_UNIQUE__ + "go_is_sending_post");
  $("#go-repost-data").val("");
  $("#go-upload-preview-container,#go-repost-highlight").empty();
  $("#compose-post-container").css("display","none");
  $("#compose-post-container .go-repost-hide").css("display","block");
}


function closeNotifications(btn){
	if( btn) return history.go(-1);
  $('#go-notifications-container').css('display','none');  
}

function closeSavedPosts(btn){
	if(btn){
 return history.go(-1);
}
  if( $('#go-single-post-container').is(':visible')){
   return closeSinglePost(); 
 }
  $('#go-saved-posts-container').css('display','none');  
}

function closeViewFollowers(btn){
 if(btn){
 return history.go(-1);
}
 $('#go-followers-container').css('display','none');  
clearTimeout( lfTimeout);
  if(lfAjax) lfAjax.abort();
}

function closeViewFollowing(btn){
if(btn){
 return history.go(-1);
}
  $('#go-following-container').css('display','none');  
clearTimeout(lfgTimeout);
  if(lfgAjax) lfgAjax.abort();
}

function closeViewBlockedFollowers(btn){
 if(btn){
 return history.go(-1);
}

 $('#go-blocked-followers-container').css('display','none');  

  clearTimeout(lbfTimeout);
  if(lbfAjax) lbfAjax.abort();
}

function goCloseProfile(btn){
	var pcont=$('#go-profile-container');
 if( btn){
 return history.go(-1);
}
 clearTimeout( gpTimeout);
 if(gpAjax) gpAjax.abort();
  loadingProfilePosts=false;
    var pIndex=+pcont.css("z-index");
  var spcont=$("#go-single-post-container");
  var spIndex=spcont.css("z-index");            
    
 if( spcont.is(":visible") ){
  if( spIndex>pIndex){
   return closeSinglePost(); 
  }
 }
  var user_id=$("#go-current-opened-profile").attr("data-uid");
  var unicename=$('#go-current-opened-profile').attr("data-unicename");
  
  var ucont=$('#go-profile-page-' + unicename);
  var loader=ucont.find('.profile-posts-loading-indicator');
  loader.css('display','none');
  $("#direct-request").attr("data-profile-unicename","");
  
if( !$("#go-comment-container,#go-rcomment-container").is(":visible")){

}
  return  pcont.css('display','none');
}

function closeMenus(){
  toggleLeftSidebar();
}

function closeRightMenus(){
  toggleRightSidebar();
}

function closeReactionsBox(btn){
	if( btn) return history.go(-1);
 $(".reactions-box").remove();
}
	
function closeSinglePost(btn){
	if( btn) return history.go(-1);
  $("#go-single-post-container").css("display","none");
}

function closeFollowForm(){
  $('#go-follow-container').css('display','none');
}

function closeProfileUpdateForm(btn){
	if(btn){
 return history.go(-1);
}
  $('#go-profile-update-container').css('display','none');
}

function closeFullPhoto(btn){
	if( btn) return history.go(-1);
  $('meta[name=viewport]').remove();
  $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0">');
  $('#go-full-photo-div').empty();
  $('#go-full-photo-container').css('display','none');
  
setTimeout(function(){
  $('meta[name=viewport]').remove();
  $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=2.0">'); 
 },1000);
  
//   android.webView.enableZoom(false);
}

function closeFullCoverPhoto(btn){
	if( btn) return history.go(-1);
  $('meta[name=viewport]').remove();
  $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0">');
  $('#go-full-cover-photo-container').css('display','none');
  $('#go-full-cover-photo').empty();


 setTimeout(function(){
  $('meta[name=viewport]').remove();
  $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=2.0">'); 
 },1000);
  }


function closeSearch(btn){
	if( btn ) return history.go(-1);
  $('#go-search-container').css('display','none');
 // $('#go-searched-posts').empty();
  clearTimeout(spTimeout);
  if(spAjax) spAjax.abort();
}

function closeGoSocial(){
  localStorage.removeItem(SITE_UNIQUE__ + 'go_social_opened');
  
}

function closeCreatePageForm(btn){
	if( btn ) return history.go(-1);
  $('#go-create-page-form-container').css('display','none')
}



function closeRequestApp(){
  $('#go-request-app-container').css('display','none');  
}


function removeFromUploadList(val_, vid){
  GO_UPLOAD_FILE_PATHS = jQuery.grep( GO_UPLOAD_FILE_PATHS, function(value) {
  return value != val_;
});
}


function go_captureVideoPoster(video, dimensions,divide){
	video.pause();
 video.currentTime=3;
 
 video.setAttribute("data-triggered","1");
 
  divide=divide||1
  var canvas = document.createElement("canvas");
// scale the canvas accordingly
  var oriWidth= dimensions[0]; //video.videoWidth;
  var oriHeight=dimensions[1]; //video.videoHeight;
  
 var width=oriWidth/divide;
 var perc=(width*100)/oriWidth;
 var height=(perc/100)*oriHeight;
 
  canvas.width = width; 
  canvas.height =height; 
// draw the video at that frame
  var ctx=canvas.getContext("2d");
  
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
// convert it to a usable data URL
 var dataURL = canvas.toDataURL("image/jpeg",0.7);
 
 if( dataURL){
   return [dataURL,[width,height],];
 }
}



function goVideoPreviewLoaded(video){
	if(video.getAttribute("data-triggered")){
return;
		}
  var cid=video.getAttribute("data-cid");
  var src=video.getAttribute("data-src");
  var cid= video.getAttribute("data-cid");
  var dur=video.duration;
 
   if(!dur|| dur<5){
       removeFromUploadList(src );
    $('#uppc-' + cid ).remove();
       toast('Video too short')
       return;
     }
  
 var dimensions = [video.videoWidth, video.videoHeight]; 
 
 setTimeout(function(){

    var res= go_captureVideoPoster(video, dimensions); 
   if( res ){
   	
     var elem=$('#vid-poster-' + cid);
     var poster=res[0]||"";
   elem.val(poster.split(",")[1] );
   elem.attr('data-dim', res[1].toString() );
  $('#vid-child-cont-' + cid).prepend('<img src="'+ poster +'" class="go-video-upload-preview-poster">');

 //$('#vid-child-cont-' + cid).prepend('<img src="data:image/jpeg;base64,' + poster +'" class="go-video-upload-preview-poster">');
  }
  else{ 
  	
  $('#vid-child-cont-' + cid).prepend('<img src="' + __THEME_PATH__ + '/assets/go-icons/bg/black-bg.png" class="go-video-upload-preview-poster">');
  }
   
 $('#uppc-cover-' + cid).remove();
 },150);
 
}

function goVideoPreviewError(t){
 
  var this_=$(t);
  var src=this_.data("src");
  var cid=this_.data("cid");
    removeFromUploadList(src )
    $("#uppc-" + cid ).remove();
   toast('Some files rejected');
 }


function arrayMove(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice( new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
};


function swapIt(t){
  var this_=$(t);
  var swid=+this_.data('swid');
  arrayMove( GO_UPLOAD_FILE_PATHS, swid, 0);
}

function copyToClipboard( text) {
	
	var data='<div class="center-header ps-4 pt-2 text-secondary">Copy from box</div>';
	data+='<div class="center-text-div p-2">';
	data+='<textarea id="copy-text-box" class="form-control">' + text + '</textarea>';
	data+='</div>';
	
	displayData( data, {pos: 100, osclose: true});
	
	}

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.display="none";
  textArea.style.position = "fixed";
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
   
 if(  successful)    toast("Copied", {type:"primary"});
 else toast("Copy failed");
    
  } catch (err) {
    toast('Oops, unable to copy');
  }

 document.body.removeChild(textArea);
}

function copyToClipboardx(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    toast('Copied', {type:"primary"});
  }, function(err) {
  
  	fallbackCopyTextToClipboard(text);
  });
}


function copyToClipboarddd(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
        return window.clipboardData.setData("Text", text);

    }
    else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.style.display="none";
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand("copy");  // Security exception may be thrown by some browsers.
            toast("Copied",{type:"success"});
        }
        catch (ex) {
         toast("Copy to clipboard failed.");
            return prompt("Copy to clipboard: Ctrl+C, Enter", text);
        }
        finally {
            document.body.removeChild(textarea);
        }
    }
}


function changeAccount(){
  var data='<div class="center_header text-left" style="padding-left: 15px; padding-top: 13px; font-size: 15px;">Change account?</div>';
     data+='<div class="center_text_div text-right" style="width:100%; font-size: 13px; padding: 8px 15px;">';
     data+='<div class="row">';
     data+='<div class="col text-left p-2"><i id="change-account-loading" style="display: none;"  class="fa fa-spin fa-spinner fa-lg text-primary"></i></div>';
     data+='<div class="col p-2"><span onclick="closeDisplayData(\'.change-account-div\');">CANCEL</span></div>';
     data+='<div class="col text-center p-2"><span class="" onclick="changeAccount_();">LOGOUT</span></div>';
     data+='</div></div>';  
  displayData(data,{ width: '90%', oszindex:205, pos:'50', data_class:'.change-account-div', osclose:true});  
}


function changeAccount_(t, signin){
 var this_=$(t);
 
  $('#change-account-loading').css('display','inline-block');
  //Delay logout if app is sending, fetching or saving
  //messages from server to avoid loss of data
 if( localStorage.getItem(SITE_UNIQUE__ + 'is_sending_message')
  || localStorage.getItem(SITE_UNIQUE__ + 'is_fetching_messages')
  || localStorage.getItem(SITE_UNIQUE__ + 'saving_message') ){
 
 setTimeout( function(){
   localStorage.setItem(SITE_UNIQUE__ + 'is_logging_out','Yes');
    changeAccount_(t, signin);
  },500);
   return;
  }  
  
  if( signin){
  	 location.href=DOMAIN_ + "/oc-login.php"; 
  return;
  }
  
 $.ajax({
    url: config_.domain + "/oc-ajax/logout.php",
    type: "POST",
   //timeout: 15000,
     dataType: "json",
    data: {
      "version": config_.APP_VERSION,
    }
  }).done(function(result){ 
if( result.status){  
	osbdb.destroy();
  localStorage.setItem(SITE_UNIQUE__ + 'is_logging_out','Yes');
  localStorage.removeItem(SITE_UNIQUE__ + "USERNAME");
  localStorage.removeItem(SITE_UNIQUE__ + "FULLNAME");
  localStorage.removeItem(SITE_UNIQUE__ + "logged_in");
  localStorage.removeItem(SITE_UNIQUE__ + "ID");
  localStorage.removeItem(SITE_UNIQUE__ + "VERIFIED");
  localStorage.removeItem(SITE_UNIQUE__ + "NICENAME");
  
  USERNAME="";
  ID="";
  NICENAME="";
  VERIFIED="";
  FULLNAME="";
  AVATAR="";

localStorage.setItem(SITE_UNIQUE__ + "login_required","YES");
 localStorage.removeItem(SITE_UNIQUE__ + "is_logging_out");
 location.href=__SITE_URL__ + "/oc-login.php";  
 return;
 }else if( result.error){
 toast( result.error );
}else{
	toast("Unable to log you out");
	}
	closeDisplayData( ".change-account-div,0, true");
	
}).fail(function(e,txt,xhr){
	closeDisplayData( ".change-account-div,0, true");
  return toast("Failed to log you out");
});  
}
   
  
  function logoutOtherDevices(t){
 var this_=$(t);
 
if( !confirm("Logout my account on other devices") ) return;
  
 $.ajax({
    url: config_.domain + "/oc-ajax/logout-other-devices.php",
    type: "POST",
     dataType: "json",
    data: {
      "version": config_.APP_VERSION,
    }
  }).done(function(result){ 
if( result.status){  
	return toast( result.result,{type: "success"});
 return;
 }else if( result.error){
 toast( result.error );
}else{
	toast("Unable to log you out");
	}
	//closeDisplayData( ".change-account-div,0, true");
	
}).fail(function(e,txt,xhr){
	//closeDisplayData( ".change-account-div,0, true");
  return toast("Action failed");
});  
   
  }
 
  
function newMessageNotify( total_messages){

  var elem=$('#total-new-messages');
  var curr=+elem.attr('data-total');
  if( total_messages){
    total_messages= +total_messages.split('-')[0];
   var total= total_messages+curr;
   var tt=total;
    if( tt>99){
      tt='99+';  }
    localStorage.setItem(SITE_UNIQUE__ + USERNAME + '_total_new_messages', total + '/' + tt);
    elem.attr('data-total', total).text( tt ).css('display','inline-block');
  }
}

function reload(){
  location.reload();
}


function contactUs(){
  android.activity.loadUrl("main","javascript: createDynamicStadium('" + go_config_.contact_us + "','Contact us');");
   setTimeout( function(){
    openMessage();
   this_.prop('disabled', false);
 },600);
    
}


function changePassword(t){
	
	var resultDiv=$('#change-password-result');
 resultDiv.empty();

 var opbox=$('#old-password-box');
 var pbox=$('#new-password-box');
 var pbox2=$('#new-password-box2');
  
 var opw=$.trim(opbox.val());
 var pw=$.trim( pbox.val() );
var pw2=$.trim( pbox2.val() );

if( !opw||opw.length<6||opw.length>50){
  toast('Old password should contain at least 6 characters. Max: 50.');
 return;
}
else
if( !pw||pw.length<6||pw.length>50){
 toast('New password should contain at least 6 characters. Max: 50.');
 return;
}
 else if( !validPassword(pw) ){
 toast('Passwords can only contain these characters: a-z 0-9 ~@#%_+*?-');
 return;
}
else if( pw!=pw2){
	return toast("New password not equal");
	}

var this_=$(t);
    buttonSpinner( this_);    
    this_.prop('disabled',true);
    
  connCounts++;
  
$.ajax({
  url: config_.domain + '/oc-ajax/change-password.php',
  type:'POST',
dataType:'json',
  data: {
  'version': config_.APP_VERSION,
  'old_password': opw,
  'new_password': pw,
 }
}).done(function( result ){
	connCounts--;
  buttonSpinner( this_,true);
 this_.prop('disabled',false);
  
  if( result.status){
  toast( result.result,{type:'success'});
   pbox.val('');
   opbox.val('');
  }else if(result.error){
  toast(result.error);
}else{
   toast('Password could not be changed.');
  }
}).fail(function(e,txt, xhr){
	connCounts--;
  buttonSpinner( this_,true);
this_.prop('disabled',false);
  toast('Something went wrong. ' + xhr);
 //alert(JSON.stringify(e) );
  });
}





//COMMENTS BEGINS

var GO_COMMENT_UPLOAD_FILE_PATHS=[]; 
var GO_COMMENT_UPLOADED_FILE_PATHS=[];

var sendBtn=$('#send-message-btn');
var voiceBtn= $('#voice-message-btn');
var attachBtn= $('#attachment-btn-container');

var fetchingComment=false;
var commentAjax;
var commentTimeout=0;
var fetchingRComment=false;
var commentRAjax;
var commentRTimeout=0;

function storedCommentsLikes_(){
	var sl=localStorage.getItem(SITE_UNIQUE__ + "COMMENTS_SAVED_LIKES")||"";
	var len=sl.length;
if( len> 3000){
	localStorage.removeItem(SITE_UNIQUE__ + "COMMENTS_SAVED_LIKES");
	sl=null;
}
  return sl?JSON.parse(sl):{}
}

var COMMENTS_SAVED_LIKES= storedCommentsLikes_();

function commentLiked(lid){
	return COMMENTS_SAVED_LIKES[lid];
}
	
function storeCommentLike(lid){
 COMMENTS_SAVED_LIKES[lid]=1;
 localStorage.setItem(SITE_UNIQUE__ + "COMMENTS_SAVED_LIKES", JSON.stringify( COMMENTS_SAVED_LIKES));
}

function removeCommentLike( lid){
		delete COMMENTS_SAVED_LIKES[lid];
		localStorage.setItem(SITE_UNIQUE__ + "COMMENTS_SAVED_LIKES", JSON.stringify( COMMENTS_SAVED_LIKES));
	}

function bbcode_comment(data){
  var reg=/@\[::(.*?)::(.*?)::(.*?)::(.*?)::\]/gi;
    data=data.replace(reg, function(m,tagged, tagged_name, taggedUid, unice){
   return '<span class="go-comment-tagged-pin go-open-profile" data-user="' + tagged + '" data-uid="' + taggedUid + '" data-user-fullname="' + tagged_name + '" data-unicename="' + unice + '">' + tagged_name + '</span>';
    });
  return data;
}


function commentAuthorPicture(fuser, class_, verified){
  class_=class_||'friend-picture';

 var real_path=__SITE_URL__ + "/" + fuser + "/photo.jpg?s=small";
 return '<img class="lazy ' + class_ + '" alt="" onerror="imgError(this);" src="' + __IMG_PLACEHOLDER__ + '" data-src="' + real_path + '" data-verified="' + (verified?'1':'') + '" data-id="' + strtolower(fuser ) + '">';
}

function imgError(image) {
  var src="' + __THEME_PATH__ + '/assets/chat-icons/no_profile_picture.png";
    image.src = src;
}


$(function(){
	
	$("body").on('click','.go-open-comments-box',function(){
		
  var this_=$(this);
  var pid= this_.data("pid");
  var user_id=this_.data("uid");
  var post_by= $.trim( this_.data("post-by") );

var allow_upload=SERVER_SETTINGS.file_upload||"NO";
var allow_image=SERVER_SETTINGS.comment_image||"NO";
var allow_video=SERVER_SETTINGS.comment_video||"NO";

if( !siteAdmin(USERNAME) ) {

 if( allow_upload!="YES"  ){
	$("#go-comment-upload-file-btn").css("display","none");
	}
}

  if( pid.length<1 ) return toast("Post id not found");
  
  var ccont= $('#go-comment-container')
 
 var cpi=$('#current-post-id');
  var cpiv=$.trim(cpi.val() );
      cpi.val( pid);
  $('#current-post-by').val(post_by)
  .attr("data-uid", user_id);

  var zi=zindex();
 
   ccont.css({'z-index': zi, display: 'block'}); 

if( this_.hasClass("direct-request")){
window.history.replaceState(null,  null,  __SITE_URL__ );
 }

 if(!this_.attr("data-no-push")){ 
    var path=__SITE_URL__ + "/comment/" + pid;
  var data={
  	"type":"comment",
      "uid": user_id,
      "pid": pid
      }
    pushState_(data,  path);
 }
  
  var ctempCont=$("#comment-container-" + pid);
  
  $(".comment-page").css("display","none");
  
  if( ctempCont.length ){
     ctempCont.css("display","block");	
     return;
  }
  	 var ctemplate=$(".comment-template").html();
 
   var cdata=$('<div class="comment-page" id="comment-container-'+ pid + '"></div>')
   .append(ctemplate);
   $("#post-comments-container").append( cdata);
   
  if(commentAjax) commentAjax.abort();
   clearTimeout( commentTimeout);
       fetch_comments( pid);
      
});
	
	
$('body').on('click','#comment-refresh-btn',function(){
 
  if( fetchingComment){
   return toast('Please be patient.');
 }   
//  $('#my-comments-container,#post-comments').empty();
//   $('#prev-comments,#next-comments').css('display','none');
   fetch_comments("",false, true);  
 });
  
$('body').on('click','.prev-comments',function(){
 if( fetchingComment){
   return toast('Please be patient.',{type:'light',color:'#333'});
 }
  var page=$(this).attr('data-value');
  if(!page) return toast('No more comments.',{type:'light',color:'#333'});
 //$('#my-comments-container,#post-comments').empty(); 
   fetch_comments("", page);   
 });
  
  
$('body').on('click','.delete-comment',function(){
  var this_=$(this);
  var cid=this_.attr("data-cid");
  var post_id=this_.attr("data-pid");
  var author=this_.attr("cauthor");
 
  if(!confirm('Delete selected comment?') ) return false;

 if(!cid ){
    return toast('Comment id not found.');
  }
 
 var tb=$('#go-comment-box');
     tb.prop('disabled', true); 
      
    $('#post-comment-sending-cont').append('<span id="comment-sending-icon"><i class="fa fa-spin fa-spinner fa-lg"></i></span>');

  var loader=$('#comment-loader-container');
  loader.css('display','block');
  
  connCounts++;
  
  setTimeout(function(){
    $.ajax({
    url: config_.domain + '/oc-ajax/go-social/delete-comment.php',
    type:'POST',
  // timeout: 10000,
     dataType: "json",
    data: {
      "cauthor": author,
      "comment_id": cid,
      "post_id": post_id,
      "version": config_.APP_VERSION,
    }
  }).done(function(result){
  	connCounts--;
    //alert(JSON.stringify(result))
   $('#comment-sending-icon').remove();
   tb.prop('disabled', false); 
  if( result.status){
   $("#ccc-" + cid).remove();
  }
   else if(result.error){
      toast(result.error );
  }
   else toast('Unknown error');
    loader.css('display','none');
 }).fail( function(e,txt,xhr){
 	connCounts--;
   loader.css('display','none');
  $('#comment-sending-icon').remove();
  toast('Something went wrong');
  tb.prop('disabled', false);
  report__('Error ".delete-comment"', JSON.stringify(e),true );
 
  });
    
  },1000);
});
  
});



function fetch_comments( post_id, page_number, refresh){
	
  var cpi=$('#current-post-id');
  var elem=$("#current-post-by");
  var user_id=elem.attr("data-uid")||"";

  var cpiv=$.trim(cpi.val() );
   post_id=cpiv||post_id;
  page_number=page_number?'?page=' + page_number:'';
    
    var cont= $("#comment-container-" + post_id);
    
  var tb=$('#go-comment-box');
      tb.prop('disabled', true);
 
  var loader=$('#comment-loader-container');
  loader.css('display','block');
  var npBtn=$('#prev-comments,#next-comments');
   npBtn.prop('disabled', true);
    
  fetchingComment=true;
   connCounts++;

commentTimeout=setTimeout(function(){
     
  commentAjax =$.ajax({
    url: config_.domain + '/oc-ajax/go-social/fetch_comments.php' + page_number,
    type:'POST',
  // timeout: 30000,
     dataType: "json",
    data: {
   //	"uid":uid,
   //   "username": username,
      "post_id": post_id,
      "version": config_.APP_VERSION,
      "token": __TOKEN__
    }
  }).done(function( result){
  //	alert( JSON.stringify( result))
  	connCounts--;
  if( cpi.val()!=cpiv) return;
    fetchingComment=false;
 npBtn.prop('disabled',false);

if( refresh) {
  cont.find(".my-comments-container").empty()
cont.find(".post-comments").empty();
}
  
    var nextPage=result.next_page;
    var prevPage=result.prev_page;
   
  if(result.no_comment){
    
  cont.find(".post-comments").html('<div class="text-center no-comment-container" id="no-comment-cont-' + post_id + '">No Comment Yet</div>');
  }
 else if( result.result){
    var rdata=result.result;
    var ipp=+result.item_per_page;
    var total=rdata.length;

   var likes_data="";
  
 
try{

display_comment( cont, rdata, false, "prepend");
   
 }catch(e){
    toast(e); 
}

    npBtn.css('display','none');
   
 if( prevPage ){
   // cont.find(".next-comments").attr("data-value", prevPage).css("display","block");  
 }
  if( nextPage ){
    cont.find(".prev-comments").attr("data-value", nextPage).css("display","block");
    }
    else{
    cont.find(".prev-comments").css("display","none");	
    }
    
    
  }
   else if(result.error){
    toast(result.error,{ type: "light", color:"#333"});  
  }
    loader.css('display','none');
    tb.prop('disabled', false);
   // sendBtn.prop('disabled', false)
  }).fail( function(e,txt,xhr){
    connCounts--;
 if( $('#go-comment-container').is(':visible') ){
    commentTimeout=setTimeout(function(){
     fetch_comments( cont, post_id, page_number);
 },5000);
   
 }else{
   fetchingComment=false;
   npBtn.prop('disabled',false)
   loader.css('display','none');    
 }
  //  toast('Check network. ' + xhr,{type:'light',color:'#333'});
   tb.prop('disabled', false);
    report__('Error "fetch_comments()"', JSON.stringify(e),true );
 
    
  });
   }, 1000);  
}

function display_comment( cont, data, me, type){
	
$.each( data, function(i,v){

   var following=v["fstatus"]||"";
   var uv=v["verified"];
   
  if( following!="0"){
    var cid= v["id"];
    var likes=v["likes"];
    var post_id=v["post_id"];
    var avatar=v["avatar"]||"";
    var unice=v["nicename"];
    var cuserid=  v["user_id"];
    var author_=v["username"];
    var comment=v["message"];
    var fullname=v["fullname"];
    var has_replies=+v["has_replies"];
    var post_files=v["post_files"]||"";
 
    var meta=JSON.parse( v["meta"] );
        meta["post_id"]=post_id;
        
if(  commentLiked(cid)  ){
  var liked=true;    
  }else {
   var liked=false;   
  }    

   type=type||"append";
   
 if(me){   
   var mccont= cont.find(".my-comments-container");
 }
else{
  var mccont=cont.find(".post-comments");
}
 
  var com_files=meta.com_files||"";
  var has_files=meta.has_files||"";
	
  var v=checkVerified( uv, fullname);
  var icon=v.icon;
  var author= v.name;
  var ctime=meta.time||moment().unix();

  var cdate=timeSince( ctime);
  
  var isMe=false;
  
 if( cuserid==ID){ 
    isMe=true;
  }
  
 var data='<div class="comment-child-container ' + (isMe?'my-comment-container':'') + '" id="ccc-' + cid + '">';
  data+='<div class="' + ( isMe?'text-right':'') + '">';
  
 if( !isMe) data+='<span class="d-inline-block go-comment-author-icon-container" style="margin-right: 5px; margin-left: 5px;">' + go_user_icon( avatar ) + '</span>';

 data+='<div class="comment-bubble" id="' + cid + '">';
 data+='<span class="highlight comment-author go-open-profile friend-' + author_ + '" data-user-fullname="' + author + '" data-uid="' + cuserid + '" data-user="' + author_ + '" data-unicename="' + unice + '">' + strtolower( fullname||"") + ' ' + icon + '</span>' ;

 data+='<div class="comment-message">' + bbcode_comment( comment ) + '</div>';
 
 data+='<div class="go-comment-files-container">';
 	
 data+= go_formatFiles( post_files, null, null, null, true );
 data+='</div></div>';
  
  
 if( isMe)  data+='<span class="d-inline-block go-comment-author-icon-container" style="margin-left: 5px; margin-right: 5px;">' + go_user_icon( AVATAR ) + '</span>';
 
  data+='</div>';
  
  data+='<div class="comment-footer">';
  
 if(isMe || goAdmin(USERNAME) ){
   data+='<span class="delete-comment" id="delc-' + cid + '" data-pid="'+ post_id + '" data-cid="' + cid + '" cauthor="' + author_ + '"><i class="fa fa-trash fa-lg text-danger"></i></span>';
 }
  likes=likes||0;
  data+=' <span class="comment-date">' + cdate + '</span>';
  data+='<span class="like-comment" id="like-comment-' + cid + '" data-uid="' + cuserid + '" data-pid="' + post_id + '" data-cby="' + author_ + '" data-cid="' + cid + '" data-total-likes="' + likes + '" data-fullname="' + fullname + '"  data-unicename="' + unice + '" onclick="like_comment(this);">';
  data+='<span class="' + ( liked ? 'text-info':'text-secondary' ) + ' me-2"><strong>Like</strong></span>';
  data+='</span>';
 
  data+='<span id="reply-btn-' + cid + '" class="reply-comment text-secondary me-2" data-parent-id="' + cid + '" data-cby="' + author_ + '" data-uid="' + cuserid + '" data-fullname="' + fullname + '" data-unicename="' + unice + '" data-pid="' + post_id + '" onclick="replyComment(this,\'' + cuserid + '\');"><strong>Reply</strong></span>';
  data+=' <img id="like-img-' + cid + '" class="me-2 w-16 h-16" src="' + __RCDN__ + '/' + ( liked?'liked':'like' ) + '.png"> <span class="likes" id="likes-' + cid + '">' + abbrNum( + likes,1 ) + '</span>';
 
 if( has_replies>0){
  data+='<div class="text-dark mt-1 mb-2 text-center" data-parent-id="' + cid + '" data-cby="' + author_ + '" data-uid="' + cuserid + '" data-fullname="' + fullname + '"  data-unicename="' + unice + '" data-pid="' + post_id + '" onclick="replyComment(this);"><strong>View replies</div></div>';
 }
  
  data+='</div>';
  data+='</div>';
  
  if( type=="append"){
  mccont.append(data)
  } else{
  mccont.prepend(data);
  }
  
 }
}); 
  
  
}


function buildComment(cid, post_id, comment, com_files,meta){
 var data=new Object();
 
  data["me_following"]=1;
  data["verified"]=    VERIFIED;
  data["nicename"]=NICENAME;
  data["user_id"]=ID||8;
 data["avatar"]=__SITE_URL__ + "/" + USERNAME + "/photo.jpg";
data["username"]=USERNAME||"anonymous";
  data["fullname"]=FULLNAME||"Anonymous";
  data["id"]=cid;
  data["post_id"]=post_id;
  data["has_replied"]=0;
  data["message"]=comment;
  data["post_files"]=com_files;
  data["meta"]= JSON.stringify( meta )

return [data];
}

function format_comment(gpin, post_id,com_files,clen){
 var currentTime=moment().unix();
   var obj_=new Object();
  obj_.post_id="" +  post_id;
  obj_.cf="" +   USERNAME;
  obj_.fullname = FULLNAME;
//userData("fullname");
  obj_.com_files="" + com_files; //video, image
  obj_.has_files="" + ( com_files?1:0);
  obj_.size="" + clen; //txt size or file size 
  obj_.time="" + currentTime;
  obj_.ver="" + config_.APP_VERSION;
    return obj_;
}



function add_comment( fuser, comment_, mlen){
 var fpaths=GO_COMMENT_UPLOADED_FILE_PATHS;
   var fpaths_="";
   var com_files="";
   var total_files=fpaths.length;
   var hasFiles=0;
  
  if( total_files){
  com_files= JSON.stringify( fpaths)
  hasFiles=1;
  }  
  
   if( mlen > go_config_.mcl){
    return toast('Comment too long.');  
  }
  var rcid=randomString(5);
  
  var disp_comment=sanitizeLocalText(comment_ );
  var comment=sanitizeMessage( comment_);
 
  var tb=$('#go-comment-box');
      tb.prop('disabled', true);
   
  var cpi=$('#current-post-id');
  var cpiv=$.trim(cpi.val());
  var el=$("#current-post-by");
var post_by= $.trim( el.val() );
  var user_id=el.attr("data-uid")||"";
  
  if( !$('#post-comment-sending-cont #comment-sending-icon').length){
  	
    $('#post-comment-sending-cont').append('<span id="comment-sending-icon"><i class="fa fa-spin fa-spinner fa-lg text-primary"></i></span>');
  }
  
 var sb=$('#post-comments-container');
     sb.scrollTop( sb.prop("scrollHeight") );
 
  var fullname=userData("fullname");
  
  var meta=format_comment(fuser, cpiv,com_files,mlen);
  
 var data= buildComment( rcid, cpiv, disp_comment, com_files,meta);
 
 var cont=$("#comment-container-" + cpiv);
 
  display_comment( cont, data, true, "append");
 
 var cdiv=$("#ccc-" + rcid);
 var delBtn= $("#delc-" + rcid);
 var likeBtnCont=$("#like-comment-" + rcid);
 var likeBtn=$("#like-img-" + rcid );
 var replyBtn=$("#reply-btn-" + rcid );
 
  delBtn.css('display','none');
  likeBtnCont.css('display','none');
  replyBtn.css('display','none')
   
     meta=JSON.stringify( meta);
  
 var btn= $('#go-send-comment-btn');
    btn.prop('disabled',true);
    
var loader=$('#comment-loader-container');
  loader.css('display','block');
 
  connCounts++;
  
  setTimeout(function(){
     $.ajax({
    url: config_.domain + '/oc-ajax/go-social/add_comment.php',
    type:'POST',
  // timeout: 10000,
     dataType: "json",
    data: {
      "message": comment,
      "meta": meta,
      "post_files": com_files,
      "has_files": hasFiles,
      "post_id": cpiv,
      "version": config_.APP_VERSION,
    }
  }).done(function(result){
   // alert(JSON.stringify(result) );
   connCounts--;
  $('#comment-sending-icon').remove();
  loader.css('display','none');
  
   btn.prop('disabled', false);
   tb.prop('disabled', false);
 if( result.status=='success'){
   sessionStorage.removeItem(SITE_UNIQUE__ + 'temp-com-text-' + fuser);
   GO_COMMENT_UPLOADED_FILE_PATHS=[];
   $('#go-comment-upload-preview-container').empty()
   cont.find("#no-comment-cont-" + cpiv).remove();
   var id= result.result;
 
if(id>0){
  
  delBtn.attr('data-cid', id).attr('data-pid', cpiv).css('display','inline-block');
  cdiv.attr('id', 'ccc-' + id);
  $('#likes-' + rcid).attr('id','likes-' + id);
  likeBtnCont.attr('data-cid', id).attr('id','like-comment-' + id).css('display','inline-block');
  likeBtn.attr('id','like-img-' + id);
  replyBtn.attr('data-parent-id',id ).attr('id','reply-btn-' + id).css('display','inline-block');
  
}
   tb.val('');
   tb.autoHeight();
  return;
 }else if(result.error){
    toast( result.error);
   $('#post-comments-container #ccc-' + rcid ).remove();
 }

 }).fail(function(e,txt,xhr){
 	connCounts--;
 	loader.css('display','none');
    $('#comment-sending-icon, #post-comments-container #ccc-' + rcid ).remove();
  toast('Something went wrong');
   tb.prop('disabled', false);
   btn.prop('disabled', false);
   report__('Error "add_comment()"', JSON.stringify(e),true );
 
  });
    
  },1000);
}

function like_comment(t){
  var this_=$(t);
  var cpi=$('#current-post-id');
  var el=$('#current-post-by');
var post_by=$.trim(  el.val());

 var post_id=$.trim(this_.attr("data-pid") );
var user_id=this_.attr("data-uid");
 var cid=this_.attr('data-cid');
 var comm_by=this_.attr('data-cby');
 var parent_id=$.trim( $('#comment-parent-id').val())||"";

  var type=1;

 if( commentLiked(cid)){
  type=2;
}
    
   var tb=$('#go-comment-box');
      tb.prop('disabled', true);
   this_.prop('disabled',true);
 
  var isReply=$('#go-rcomment-upload-preview-container').is(':visible');
 
  if( isReply){
 var loader=$('#rcomment-loader-container')
  }else{
 var loader=$('#comment-loader-container');
  }
  
  loader.css('display','block');
 commentLikeTimeout=setTimeout(function(){
    var fullname=userData('fullname');
   
   connCounts++;
   
  commentAjax=$.ajax({
    url: config_.domain + '/oc-ajax/go-social/like-comment.php',
    type:'POST',
  // timeout: 10000,
     dataType: "json",
    data: {
    //	"uid":uid,
      "username": USERNAME,
      "fullname": fullname,
      "comment_id": cid,
      "post_id": post_id,
      "fuid": user_id,
      "parent_id":parent_id,
      "comment_by": comm_by,
      "type": type,
      "version": config_.APP_VERSION,
 //     "token": __TOKEN__
    }
  }).done(function( result){
  //   alert( JSON.stringify(result))
  connCounts--;
    loader.css('display','none');
    this_.prop('disabled', false);
    tb.prop('disabled', false);
  if(result.status  ){
  
   var elem= $('#likes-' + cid);
   var curr_likes=  +this_.attr('data-total-likes');
    
   if( type==1){
     curr_likes=curr_likes+1;
     elem.text( abbrNum( curr_likes, 1) );
     this_.attr('data-total-likes', curr_likes)
   $('#like-img-' + cid).attr('src', __RCDN__ + '/liked.png');
   $('#like-comment-' + cid + ' span').addClass('text-info').removeClass('text-secondary');
  // this_.addClass("comment-liked");
   storeCommentLike(cid);   
  }
    else {
   removeCommentLike( cid);
    
      curr_likes=curr_likes-1;
      elem.text( abbrNum(curr_likes,1) );
      this_.attr('data-total-likes', curr_likes);
     
  this_.removeClass("comment-liked");
  
 $("#like-img-" + cid).attr("src", __RCDN__ + "/like.png");

   $('#like-comment-' + cid + ' span').addClass('text-secondary').removeClass('text-info'); 
 
    }
 }else if( result.error){
    toast(result.error );
 }
    
  }).fail(function(e,txt,xhr){
  	connCounts--;
    loader.css('display','none');
    this_.prop('disabled', false);
    tb.prop('disabled', false);
  report__('Error "like_comment()"', JSON.stringify(e), true );
 
 });

 },2000);
}

function goCommentUploadFiles(){
  var fpaths=GO_COMMENT_UPLOAD_FILE_PATHS;
 
 if( fpaths.length<1 ) return;
  
  var v=fpaths[0];
   
  var v_=v.split(".")
  var ext=v_[1];
  var filename=v_[0];

  var pElem=$('#comment-vid-poster-' + filename);
  var base64=$("#comment-base64-data-" + filename).val();
 
 var file_size= base64.length;
 
  var pCont=$('#go-comment-up-progress-container-' + filename);

  var isReply=$('#go-rcomment-upload-preview-container').is(':visible');
  
  setTimeout(function(){
    var poster=pElem.val()||"";
    var pDim=  pElem.data('dim');
    
  $.ajax({
   xhr: function() {
      var xhr = new window.XMLHttpRequest();
    // Upload progress     
    xhr.upload.addEventListener("progress", function(evt){
        if (evt.lengthComputable) {
     var percent= (evt.loaded / evt.total)*100;
  
   $('#go-comment-up-progress-' + filename).css({ width: "" + percent + "%"});
    pCont.css('display','block');
   
  if( percent==100){
    $('#go-comment-up-progress-' + filename).css({width:'100%'});
   // pCont.css('display','none'); //usc-upload status container @"displayMessage()"
  
  }
   }
 }, false); 
       return xhr;
    },
    "url": config_.domain + '/oc-ajax/go-social/upload-comment-file.php',
    "dataType":"json",
    "data":{
     "version": config_.APP_VERSION,
     "base64": base64,
     "video_poster": poster,
     "video_dimension": pDim,
     "file_ext": ext,
 },
 
 type:'POST'
}).done( function(result){
 //alert( JSON.stringify( resp) )
  $('#go-send-comment-btn,#go-send-rcomment-btn').prop('disabled',false);
  
  if( result.status=="success"){
   
var file_obj=new Object();
    file_obj["path"]=result.file_path;
    file_obj["ext"]=result.ext;
    file_obj["width"]=result.width||500;
    file_obj["height"]=result.height||150;
    file_obj["poster"]=result.poster||"";
    file_obj["size"]=result.file_size||file_size;
   
    
    var push_=result.file_path + '|' + result.ext +  (result.poster? '|' + result.poster:'');
  
   GO_COMMENT_UPLOADED_FILE_PATHS.push( file_obj) //push_);
   GO_COMMENT_UPLOAD_FILE_PATHS =$.grep( GO_COMMENT_UPLOAD_FILE_PATHS, function(value) {
   return value != v;
 });
  
 if( isReply ){
   $('#go-send-rcomment-btn').click()
 }else{
   $('#go-send-comment-btn').click();
 }  
  }else if( result.error){
  // var ecode=result.error;
    $("#ucppc-" + filename).remove();
    toast( result.error);
  }
  else{
     toast('Unknown error occured.');
  }
    
  }).fail(function(e,txt,xhr){
     //alert( JSON.stringify(e));
   $('#go-send-comment-btn,#go-send-rcomment-btn').prop('disabled',false);
    toast('Something went wrong');
    report__('Error "goCommentUploadFiles()"', JSON.stringify(e),true );
 
  });
  },2000); 
  
}


function goCloseComment(btn){
	if(btn) return history.go(-1);
  var ccont=$('#go-comment-container')
  var pcont=$('#go-profile-container');
  var pIndex=+pcont.css('z-index');
  var cIndex=+ccont.css('z-index');
 
if( $('#go-profile-container').is(':visible')){
   if( pIndex > cIndex ) {
     return goCloseProfile();
   }
 }
 
  fetchingComment=false;
  if( commentAjax) commentAjax.abort();
  clearTimeout( commentTimeout);
 $('#comment-loader-container').css('display','none');
 $('#prev-comments,#next-comments').prop('disabled', false);
    
  ccont.css('display','none'); 
}


$(function(){
  
  $('body').on('click','#go-send-comment-btn',function(e){ 
 
if(!loggedIn() && SERVER_SETTINGS.anon_comment!="YES"){
	return toast("Sign in first");
}
	
 var textBox=$('#go-comment-box'); 
 var msg=$.trim( textBox.val() );
 var fuser=""
 var mlen=( msg.length+1)/1024;
     
  var this_=  $(this);
     
     
 if( GO_COMMENT_UPLOAD_FILE_PATHS.length>0 ){
    this_.prop('disabled',true);
  return goCommentUploadFiles();
 }
   
 if( GO_COMMENT_UPLOADED_FILE_PATHS.length<1 && !msg){
    
   return toast('Comment empty');
   }

   this_.prop('disabled',true);
    add_comment(fuser, msg, mlen );
 });
   
 
  
  $('body').on('click','.go-comment-remove-upload-preview',function(){
  var this_=$(this);
   var fpath= this_.data('fpath');
   var contId=this_.data('cid');
   var findex= +this_.data('findex');
  
  GO_COMMENT_UPLOAD_FILE_PATHS =$.grep( GO_COMMENT_UPLOAD_FILE_PATHS, function(value) {
   return value != fpath;
 });
   
   $('#' + contId).remove();
   
  });
  
  //PHOTO FULL- COMMENT AUTHOR
  
$('body').on('click','.go-comment-author-icon-container',function(){
   var this_=$(this);
  var img= this_.find("img").attr('src');
   if(!img) return;
   var img   = replaceLast( img,'small','full');
     $('#go-full-photo-div').html('<div class="absolute-center" style="width: 100%;"><img class="lazy go-full-photo" src="' +  __IMG_PLACEHOLDER__ + '" data-src="' + img + '"></div>')
  var zi=zindex();

  $('#go-full-photo-container').css({'display':'block','z-index': zi});
  changeHash("");
  });
 
});




function goOpenCommentGallery(event,type){
var allow_upload=SERVER_SETTINGS.file_upload||"NO";
var allow_image=SERVER_SETTINGS.comment_image||"NO";
var allow_video=SERVER_SETTINGS.comment_video||"NO";
var max_files=SERVER_SETTINGS.max_total_upload||1;
var max_size=SERVER_SETTINGS.max_upload_size||1; //MB
	
	
 //Type: image, video
  var allow_video_=false;
  var allow_image_=false;
 
if(  siteAdmin( USERNAME) ){
   allow_image_=true;
   allow_video_ =true;
  }
  else if( allow_upload=="YES" ){

   if( allow_video=="YES" ){
   	allow_video_=true;
    }    
  if(  allow_image =="YES" ||userVerified( VERIFIED) ){
   allow_image_=true; 
   }
 } 
 
var cont=$('#go-comment-upload-preview-container');

  cont.empty();
  
 GO_COMMENT_UPLOAD_FILE_PATHS=[]; //Empty paths
   GO_COMMENT_UPLOADED_FILE_PATHS=[]; //Empty uploaded paths
  
var this_=$(event);
    
 this_.prop('disabled',true);  
    
    setTimeout(function(){
    this_.prop('disabled', false);
  }, 1500);

 
 var isVerified= VERIFIED; 
// userVerified( username);

var cont=$('#go-upload-preview-container');
  

try{
	
	var imageTypes = ["jpg", "jpeg", "gif","png"];
   var videoTypes=["mp4"]; 
   
var total_files=event.files.length;
 
 if( !siteAdmin( USERNAME) && total_files>max_files){
 	total_files=max_files;
 }
 

for(let i=0;i<total_files;++i){
	var ext= event.files[i].name.split('.').pop().toLowerCase();  //file extension from input file
	
var fsize=event.files[i].size;

 if(!fsize)  continue;
   fsize= (fsize/(1024*1024)).toFixed(2);
	if( !siteAdmin( USERNAME) && fsize>max_size) continue;
	
    var reader = new FileReader();    
    reader.onload = function(e){
    var data=	this.result; 
      var type=data.match(/(video|image)/);
 
  if( !type ) return toast("One or more file unsupported");
  
   type=type.toString();
   
 if(   type.match(/image/) ){
   if( allow_image_)   comm_image_( i, data); 
  else toast("Image not allowed");
}
   else{
 if(allow_video_)  comm_video_( i, data);  
  else toast("Video not allowed");
 }
    };
    reader.readAsDataURL(event.files[i]);
  }
}catch(e){ alert(e); }
      
 }

function comm_image_( i,image_data){
	resizeImage( image_data, {quality: 0.8, width: 1000, height: 600 }, function( v, error){
 if( error) return toast( error);
 
 var cid=randomString(10);
	var filename=cid;
	var fpath=filename + ".jpg"
	
	var cid=randomString(10);
	var filename=cid;
	var fpath=filename + ".jpg";
	GO_COMMENT_UPLOAD_FILE_PATHS.push( fpath );
	
var cont=$('#go-comment-upload-preview-container');

     var data='<div id="uppc-' + cid + '" data-swid="' + i + '" onclick="swapIt(this)" data-fpath="' + fpath + '" class="go-upload-photo-preview-container">';
  data+='<img class="go-upload-photo-preview" src="' + v + '">';
         data+='<span data-findex="' + i + '" data-fpath="' + fpath + '" data-cid="uppc-' + cid + '" class="go-comment-remove-upload-preview" id="close-upbtn-' + cid + '">x</span>';
         data+='<span id="go-comment-up-progress-container-' + filename + '" class="go-up-progress-container">';
         data+='<span id="go-up-progress-' + filename + '" class="go-up-progress"></span>';
         data+='</span>';
         data+='<textarea class="d-none video-data" id="comment-base64-data-' + filename + '">' + v + '</textarea>';
        data+='<input type="hidden" id="comment-vid-poster-' + cid + '" />';
 
  data+='</div>';
     cont.append( data);
     });
}

function comm_video_(i, v) {
	var cid=randomString(10);
	var filename=cid;
	var fpath=filename + ".mp4"; 
	
    GO_COMMENT_UPLOAD_FILE_PATHS.push(fpath);
   
  var cont=$('#go-comment-upload-preview-container');

   var data='<div id="ucppc-' + cid + '" data-swid="' + i + '" data-fpath="' + fpath + '" class="go-upload-video-preview-container">';
data+='<div id="ucppc-cover-' + cid + '" class="go-video-preview-cover text-center"><i class="fa fa-spin fa-spinner fa-lg text-primary"></i></div>';

         data+='<div class="go-video-preview-child-cont" id="cvid-child-cont-' + cid + '">';
         data+='<i class="fa fa-video-camera fa-lg text-light" style="position: absolute; bottom: 5px; left: 5px; z-index: 10;"></i>';
         data+='<video id="cvid-' + cid + '" data-cid="' + cid + '" data-src="' + v + '" class="go-upload-video-preview" preload="auto"';
         data+=' src="' + v + '" onloadeddata="goCommentVideoPreviewLoaded(this);" onerror="goCommentVideoPreviewError(this);" autoplay muted>';
         data+='</video>';
         data+='</div>';
         data+='<span data-findex="' + i + '" data-fpath="' + fpath + '" data-cid="uppc-' + cid + '" class="go-comment-remove-upload-preview" id="close-upbtn-' + cid + '">x</span>';
         data+='<span id="go-comment-up-progress-container-' + filename + '" class="go-up-progress-container">';
         data+='<span id="go-up-progress-' + filename + '" class="go-up-progress"></span>';
         data+='</span>';
         data+='<textarea class="d-none video-data" id="comment-base64-data-'+ filename + '">' + v + '</textarea>';
   data+='<input type="hidden" id="comment-vid-poster-' + cid + '" />';
 
         data+='</div>'; 
    cont.append( data);
 }

   
function goCommentVideoPreviewLoaded(video){ 
  var cid=video.getAttribute("data-cid");
  var src=video.getAttribute("data-src");
  
  var dur=video.duration;
   if(!dur|| dur<2){
       GO_COMMENT_UPLOAD_FILE_PATHS =$.grep( GO_COMMENT_UPLOAD_FILE_PATHS, function(value) {
   return value != src;
   });   
    $('#ucppc-' + cid ).remove();
       toast('Video too short')
       return;
     }  
  
  var dimensions = [video.videoWidth, video.videoHeight];
  
setTimeout(function(){
  var res= go_captureVideoPoster(video, dimensions, 1);
 
  if( res ){
   $("#ucppc-cover-" + cid).remove();

   var elem=$('#comment-vid-poster-' + cid);
   elem.val( res[0]);
   elem.attr('data-dim', res[1].toString() );
    }else{
    $('#ucppc-' + cid).remove();
   GO_COMMENT_UPLOAD_FILE_PATHS =$.grep( GO_COMMENT_UPLOAD_FILE_PATHS, function(value) {
   return value != src;
   });   
  }
},100);
}

function goCommentVideoPreviewError(video){
    var this_=$(video);
  var src=this_.data("src");
  var cid=this_.data("cid");
    $('#ucppc-' + cid).remove();
   GO_COMMENT_UPLOAD_FILE_PATHS =$.grep( GO_COMMENT_UPLOAD_FILE_PATHS, function(value) {
   return value != src;
   });
   toast("Some files rejected");
}


//COMMENT REPLY BEGINS

function goCloseCommentReply(btn){
	if(btn) return history.go(-1);
	
  var ccont=$('#go-rcomment-container')
  var pcont=$('#go-profile-container');
  var pIndex=+pcont.css('z-index');
  var cIndex=+ccont.css('z-index');
 
if( $('#go-profile-container').is(':visible')){
   if( pIndex > cIndex ) {
     return goCloseProfile();
   }
 }
  fetchingRComment=false;
  if(commentRAjax) commentRAjax.abort();
  clearTimeout( commentRTimeout);
 
   $('#go-rcomment-box').prop('disabled',false);
   $('#go-rcomment-container, #go-view-orig-pos').css('display','none');
  $('#comment-parent-id').val("");
  goRemoveCommentTagged();
}

$(function(){
 
$('body').on('click','#rcomment-refresh-btn',function(){
 if( fetchingRComment){
   return toast('Please be patient.');
 }   
//  $('#my-rcomments-container,#post-rcomments').empty();
 //  $('#prev-rcomments,#next-rcomments').css('display','none');
   fetch_rcomments("", false, true);   
 });
  
$('body').on('click','.prev-rcomments',function(){
 if( fetchingRComment){
   return toast('Please be patient.');
 }
  var page=$(this).attr('data-value');
  if(!page) return toast('No more comments.');
 //$('#my-comments-container,#post-comments').empty(); 
   fetch_rcomments("", page);   
 });
});
  

function deleteRComment(t){
  var this_=$(t);
  var cid=this_.attr("data-cid");
  var post_id=this_.attr("data-pid");
  var author=this_.attr("cauthor");
  var cuserid=this_.attr("cuserid");
  
  if( !confirm("Delete selected comment?") ) return false;

 if(!cid){
    return toast("Comment id not found");
  }
 
 var tb=$('#go-rcomment-box');
     tb.prop('disabled', true); 
      
    $('#post-rcomment-sending-cont').append('<span id="rcomment-sending-icon"><i class="fa fa-spin fa-spinner fa-lg text-primary"></i></span>');
    
  var loader=$('#rcomment-loader-container');
  loader.css('display','block');
 
  setTimeout(function(){
    $.ajax({
    url: config_.domain + '/oc-ajax/go-social/delete-comment.php',
    type:'POST',
  // timeout: 8000,
     dataType: "json",
    data: {
      "cuser_id": cuserid,
      "comment_id": cid,
      "post_id": post_id,
      "version": config_.APP_VERSION,
      "token": __TOKEN__
    }
  }).done(function(result){
    //alert(JSON.stringify(result))
   $('#rcomment-sending-icon').remove();
   tb.prop('disabled', false); 
  if( result.status){
   $('#post-rcomments-container #rccc-' + cid).remove();
  }
   else if(result.error){
      toast(result.error );
  }
   else toast('Unknown error');
    loader.css('display','none');
 }).fail( function(e,txt,xhr){
   loader.css('display','none');
  $('#rcomment-sending-icon').remove();
  toast('Something went wrong');
  tb.prop('disabled', false);
  report__('Error "deleteRComment() in go-reply-comment.js"', JSON.stringify(e),true );
  });
  },1000);
}


var rcommentTimeout;

function fetch_rcomments( parent_id, page_number, refresh){
  var cpi=$('#current-post-id');
  
  var el=$('#current-post-by');
  var post_by=$.trim(   el.val() )
  var user_id=el.attr("data-uid")||"";

  var post_id=$.trim(cpi.val() );
  parent_id=$.trim( $('#comment-parent-id').val() )||parent_id;
 
  page_number=page_number?'?page=' + page_number:'';
    
  var tb=$('#go-rcomment-box');
      tb.prop('disabled', true);
 
  var loader=$('#rcomment-loader-container');
  loader.css('display','block');
  var npBtn=$('#prev-rcomments,#next-rcomments');
  npBtn.prop('disabled',true);
    
  fetchingRComment=true;
  //var containerId=randomString(5);
   rcommentTimeout=setTimeout(function(){
   
  rcommentAjax=$.ajax({
    url: config_.domain + '/oc-ajax/go-social/fetch_comments-replies.php' + page_number,
    type:'POST',
   //timeout: 30000,
     dataType: "json",
    data: {
      "parent_id": parent_id,
      "version": config_.APP_VERSION,
      "token": __TOKEN__
    }
  }).done(function( result){
  	//alert(JSON.stringify(result))

    fetchingRComment=false;
   npBtn.prop('disabled',false)
 
    var nextPage=result.next_page;
    var prevPage=result.prev_page;
    
    var cont=$("#rcomment-container-" + parent_id ); 
    
    if( refresh) {
  cont.find(".my-rcomments-container").empty()
cont.find(".post-rcomments").empty();
}
    
  if(result.no_comment){
    
  cont.find(".post-rcomments").html('<div class="text-center no-comment-container" id="no-rcomment-cont-' + parent_id + '">' + result.no_comment + '</div>');
  }
 else if( result.result){
    var rdata=result.result;
    var ipp=+result.item_per_page;
    var total=rdata.length;
   var likes_data="";  
  
   display_rcomment(cont, rdata, false, "prepend");
     
   npBtn.css('display','none');
 if( prevPage ){
   // $('#next-comments').attr('data-value', prevPage).css('display','block');  
 }
  if( nextPage ){
    cont.find(".prev-rcomments").attr("data-value", nextPage).css("display","block");
 }
 else{
 cont.find(".prev-rcomments").css("display","none");	
 }
   
  }
   else if(result.error){
    toast(result.error,{type:'light',color:'#333'});  
  }
    loader.css('display','none');
    tb.prop('disabled', false);
   // sendBtn.prop('disabled', false)
  }).fail(function(e,txt,xhr){
  
  if( $('#go-rcomment-container').is(':visible') ){

   setTimeout( function(){
     fetch_rcomments( parent_id, page_number);
   },5000);

}
   else{ 
    fetchingRComment=false;
    npBtn.prop('disabled',false)
    loader.css('display','none');
 //  toast('Something went wrong');
    tb.prop('disabled', false);
   report__('Error "fetch_rcomment()"', JSON.stringify(e),true );
 
   }
 });
   },1000);
}


function display_rcomment(cont, data, me, type){
 //cid, comment, post_files, meta, author_, fullname, has_replies,me_, paging,likes,liked
	$.each( data, function(i,v){
  
    var cid= v["id"];
    var likes=v["likes"];
    var cuserid=v["user_id"];
    var uv=v["verified"]||"";
    var unice=v["nicename"];
    var cauthor=v["username"];
    var post_id=v["post_id"];
   var avatar=v["avatar"]||"";
    var comment=v["message"];
    var fullname=v["fullname"];
    var has_replies=v["has_replies"];
    var post_files=v["post_files"]||"";
    
    var meta=JSON.parse( v["meta"] );
        meta["post_id"]=post_id;
        
  if( commentLiked( cid )){
  var liked=true;    
  }else {
   var liked=false;   
   }    
	
   type=type||"append";
  
 if( me ){   
   var mccont= cont.find(".my-rcomments-container");
 }
else{
  var mccont=cont.find(".post-rcomments");
}
 
  var has_files=meta.has_files||"";
//  var post_id= meta.post_id||"";
  
  var v=checkVerified( uv, fullname);
  var icon=v.icon;
  var author=fullname
  var ctime=meta.time||moment().unix();
  
  var cdate=timeSince( ctime);
  var isMe=false;
  
 if( cuserid==ID){ 
    isMe=true;
  }
  
 var data='<div class="comment-child-container ' + (isMe?'my-comment-container':'') + '" id="rccc-' + cid + '">';
  data+='<div class="' + ( isMe?'text-right':'') + '">';
if(!isMe ){
  data+='<span class="d-inline-block go-comment-author-icon-container" style="margin-right: 5px; margin-left: 5px;">' + go_user_icon(avatar ) + '</span>';
}
  
 data+='<div class="comment-bubble" id="' + cid + '">';
 data+='<span class="highlight comment-author go-open-profile" data-user-fullname="' + author + '" data-user="' + cauthor + '" data-uid="' + cuserid + '" data-unicename="' + unice + '">' + fullname + ' ' + icon + '</span>' ;

  
 data+='<div class="comment-message">' + bbcode_comment( comment) + '</div>';
 data+='<div class="go-comment-files-container">';
  
 data+= go_formatFiles( post_files, null,null,null, true );
 
  data+='</div></div>';
  
 if(isMe ){
  data+='<span class="d-inline-block go-comment-author-icon-container" style="margin-right: 5px; margin-left: 5px;">' + go_user_icon( avatar ) + '</span>';
}
  
  data+='</div>';
 
  data+='<div class="comment-footer">';
  
 if(isMe || goAdmin(USERNAME) ){
   data+='<span class="me-3" id="delc-' + cid + '" data-pid="'+ post_id + '" data-cid="' + cid + '" onclick="deleteRComment(this);" cauthor="' + cauthor+ '"><i class="fa fa-trash fa-lg text-danger"></i></span>';
 }
  likes=likes||0
  data+=' <span class="comment-date">' + cdate + '</span>';
  data+='<span class="like-comment" id="like-comment-' + cid + '" data-pid="' + post_id + '" data-cby="' + cauthor+ '" data-cid="' + cid + '" data-uid="' + cuserid + '" data-total-likes="' + likes + '" onclick="like_comment(this);">';
  data+=' <span class="' + ( liked?'text-info':'text-secondary' ) + ' me-2"><strong>Like</strong></span>';
  data+='</span>';
  data+=' <span id="reply-btn-' + cid + '" class="reply-comment text-secondary me-2" onclick="replyComment(this);" data-pid="' + post_id + '" data-uid="' + cuserid + '" data-post-uid="' + post_id + '" parent-id="' + cid + '" data-tag="' + cuserid + '" data-unicename="' + unice + '" data-fullname="' + fullname + '"><strong>Reply</strong></span>';
  data+=' <img id="like-img-' + cid + '" class="me-2 w-16 h-16" src="' + __RCDN__ + '/' + ( liked?'liked':'like' ) + '.png"> <span class="likes" id="likes-' + cid + '">' + abbrNum( +likes, 1 ) + '</span>';
  
 if( has_replies ){
    //data+='<div class="text-dark mt-1 mb-2 text-center" onclick="replyComment(this);" data-cid="' + cid + '"><strong>View replies</div></div>';
  }
  data+='</div>';
  data+='</div>';
  
 
  if( type=="append"){
  mccont.append(data)
  } else{
 mccont.prepend(data);
  }
  
  });
  
}


function format_comment(gpin, post_id, has_files, clen){
 var currentTime=moment().unix();
   var obj_=new Object();
  obj_.post_id="" +  post_id;
  obj_.cf="" +   USERNAME;
  obj_.fullname=userData('fullname');
  obj_.has_files=has_files||0;
  obj_.size="" + clen; //txt size or file size 
  obj_.time="" + currentTime;
  obj_.ver="" + config_.APP_VERSION;
  return obj_;
  }

function add_rcomment( fuser, comment, mlen){
   var fpaths=GO_COMMENT_UPLOADED_FILE_PATHS;
   var fpaths_="";
   var com_files="";
   var total_files=fpaths.length;
   var hasFiles=0;
  
  if( total_files){
    com_files= JSON.stringify( fpaths);
   hasFiles=1;
  }
  
   if( mlen> go_config_.mcl ){
    return toast('Comment too long.');  
  }
  var rcid=randomString(5);
  
  var tb=$('#go-rcomment-box');
      tb.prop('disabled', true);
   
  var cpi=$('#current-post-id');
  var cpiv=$.trim(cpi.val());
  var el=$('#current-post-by');
  var post_by=$.trim(   el.val() )
  var post_owner_id=el.attr("data-uid")||"";
  var cuserid=el.attr("data-cuid")||"";
  var parent_id=$("#comment-parent-id").val();
  
  if( !$("#post-rcomment-sending-cont #rcomment-sending-icon").length){
  	
    $("#post-rcomment-sending-cont").append('<span id="rcomment-sending-icon"><i class="fa fa-spin fa-spinner fa-lg text-primary"></i></span>');
  }
  
 var sb=$('#post-rcomments-container');
     sb.scrollTop( sb.prop("scrollHeight") );
 
  var fullname=userData('fullname');
  
  var meta=format_comment(fuser, cpiv, hasFiles, mlen);
   
 var btn= $('#go-send-rcomment-btn');
    btn.prop('disabled',true);
  
  var displayComment=sanitizeLocalText( comment);
  var comment=sanitizeMessage( comment );
  
 var tagged="";
 var tagged_name="";
 var taggedUid=""; //Tagged person's user_id
  var taggedUnice="";
  
 var taggedDiv=$("#go-comment-tagged");

  if( taggedDiv.length){
   
  tagged=taggedDiv.attr("data-tagged")||"";
  tagged_name=taggedDiv.text()||"";
  taggedUid=taggedDiv.attr("data-uid")||"";
  taggedUnice=taggedDiv.attr("data-unicename")||"";
    
  comment="@[::" + tagged + "::" + tagged_name + "::" + taggedUid + "::" + taggedUnice + "::] " + comment;
  
displayComment="@[::" + tagged + "::" + tagged_name + "::" + taggedUid + "::" + taggedUnice +"::] " + displayComment;
 
  }
  
  var data= buildComment( rcid, cpiv, displayComment,  com_files, meta);
  
  var cont=$("#rcomment-container-"+ parent_id)
  
  display_rcomment(cont, data, true,  "append");
  
 var cdiv=$("#rccc-" + rcid);
 var delBtn= $("#delc-" + rcid);
 var likeBtnCont=$("#like-comment-" + rcid);
 var replyBtn=$("#reply-btn-" + rcid);
 var likeIcon=$("#like-img-" + rcid);
 
  delBtn.css('display','none');
  likeBtnCont.css('display','none');
  replyBtn.css('display','none');
  
  meta=JSON.stringify( meta);
 
  var loader=$("#rcomment-loader-container");
  loader.css('display','block');
  
  setTimeout(function(){
    $.ajax({
    url: config_.domain + '/oc-ajax/go-social/add-comment-reply.php',
    type:'POST',
 //  timeout: 30000,
     dataType: "json",
    data: {
      "message": comment,
      "meta": meta,
      "post_files": com_files,
      "has_files": hasFiles,
      "post_id": cpiv,
      "parent_id": parent_id,
     // "fuid": cuserid,
      "tagged_unice": taggedUnice,
      "tagged_uid": taggedUid,
      "tagged_name": tagged_name,
      "version": config_.APP_VERSION,
      "token": __TOKEN__
    }
  }).done(function(result){
  //alert(JSON.stringify(result) );
loader.css('display','none');
  $('#rcomment-sending-icon').remove();
   btn.prop('disabled', false);
   tb.prop('disabled', false);
      
 if( result.status=='success'){
   goRemoveCommentTagged();
    sessionStorage.removeItem(SITE_UNIQUE__ + 'temp-com-text-' + fuser);
   GO_COMMENT_UPLOADED_FILE_PATHS=[];
   $('#go-rcomment-upload-preview-container').empty()
   cont.find("#no-rcomment-cont-" + parent_id).remove();
   var id= result.result;
 
if(id){
  delBtn.attr('data-cid', id).attr('data-pid', cpiv).css('display','inline-block');
  cdiv.attr('id', 'rccc-' + id);
  $('#likes-' + rcid).attr('id', 'likes-' + id);
  likeBtnCont.attr('data-cid', id).attr('id', 'like-comment-' + id).css('display','inline-block');
  likeIcon.attr('id','like-img-' + id);
  replyBtn.attr('data-parent-id', parent_id).attr('id','reply-btn-' + id).css('display','inline-block');
}
   tb.val("");
   tb.autoHeight();
  return;
 }else if(result.error){
    toast( result.error);
   $('#post-rcomments-container #rccc-' + rcid ).remove();
 }

 }).fail(function(e,txt,xhr){
    $('#rcomment-sending-icon, #post-comments-container #rccc-' + rcid ).remove();
    loader.css('display','none');
   toast('Something went wrong');
   tb.prop('disabled', false);
   btn.prop('disabled', false);
  report__('Error "add_rcomnent()"', JSON.stringify(e),true );
 
  });
    
  },1000);
}


function replyComment(t, parent_cauthor_id){

  var this_=$(t);
  var cid=this_.data("parent-id");
  var cfullname=this_.data("fullname")||"";
  var cuserid=this_.data("uid")||"";
 
 var post_id=this_.data("pid")||$("#current-post-id").val();
 
 if(!post_id) return toast("Post id not found");
 
  $("#go-view-orig-post").attr("data-pid", post_id);
 $("#current-post-id").val(post_id)
 
  var el=$('#current-post-by');
 var post_by=el.val()||"";
 var post_owner_id=el.attr("data-uid")||"";
 el.attr("data-cuid", cuserid)
 
  var from_notification=this_.data("is-notification")||"";   
  var tag=this_.data("tag")||"";
  var unice=this_.data("unicename")||"";
  var tag_uid=this_.data("uid")||"";

  if( tag){
   if( tag!=ID){
     $('#go-comment-tagged-cont').html('<span id="go-comment-tagged" data-tagged="' + tag + '" data-uid="' +tag_uid + '">' + cfullname + '</span> <span onclick="goRemoveCommentTagged();" class="text-danger">X</span>');
     }    
if(!from_notification)    return;
  }
  else if ( parent_cauthor_id && parent_cauthor_id!=ID){
     
$('#go-comment-tagged-cont').html('<span id="go-comment-tagged" data-tagged="' + parent_cauthor_id + '" data-uid="' + cuserid + '" data-unicename="' + unice + '">' + cfullname + '</span> <span onclick="goRemoveCommentTagged();" class="text-danger">X</span>');
 }
 
  $("#comment-parent-id").val(cid);
  
  var ccont= $("#go-rcomment-container");
  
 var cpi=$('#current-post-id');
  var cpiv=$.trim( cpi.val() );
  
 var zi=zindex();
   ccont.css({'display':'block','z-index': zi });
 
 if( this_.hasClass("direct-request")){
    $("#go-view-orig-post")
    .attr("data-pid", post_id)
  .css("display","block");	
 
window.history.replaceState(null,  null,  __SITE_URL__ );
 }
 
 if( !this_.attr("data-no-push") ){ 
    var path=__SITE_URL__ + "/comment/" + post_id + "/replies/" + cid;
    
  var data={
 "type": "comment-reply",
  parent_id: cid,
  fullname: cfullname,
  uid: cuserid,
  tag: tag,
  pid: post_id,
  unicename: unice,
  is_notification: from_notification,
  parent_cauthor_id: (parent_cauthor_id||"")
      }
    pushState_(data,  path);
}
     
 var ctempCont=$("#rcomment-container-" + cid);
  
  $(".rcomment-page").css("display","none");
  
  if( ctempCont.length ){
     ctempCont.css("display","block");	
     return;
  }
  	 var ctemplate=$("#rcomment-template").html();
 
   var cdata=$('<div class="rcomment-page" id="rcomment-container-'+ cid + '"></div>')
   .append(ctemplate);
   $("#post-rcomments-container").append( cdata);
  
   if( commentRAjax) commentRAjax.abort();
   clearTimeout( commentRTimeout);
  
 $("#rcomment-container-" + cid).find(".prev-rcomments").css("display","none");
   fetch_rcomments(cid);
}


function goRemoveCommentTagged(){
  $('#go-comment-tagged-cont').empty();
}

$(function(){
  
  $('body').on('click','#go-send-rcomment-btn',function(e){ 
  	if( !loggedIn()){
		return toast("Login first");
		}
  
 var textBox=$('#go-rcomment-box'); 
 var msg=$.trim( textBox.val() );
 var fuser=""
 var mlen=( msg.length+1)/1024;
     
  var this_=  $(this);
     
 if( GO_COMMENT_UPLOAD_FILE_PATHS.length>0 ){
    this_.prop('disabled',true);
  return goCommentUploadFiles();
 }
   
 if( GO_COMMENT_UPLOADED_FILE_PATHS.length<1 && !msg){   
   return toast('Post still empty.');
   }
   this_.prop('disabled',true);
    add_rcomment(fuser, msg, mlen );
 });
   
 
$('body').on('click','#go-rcomment-upload-file-btn', function(){
  $('#go-rcomment-upload-preview-container').empty();
   
   GO_COMMENT_UPLOAD_FILE_PATHS=[]; //Empty paths
   GO_COMMENT_UPLOADED_FILE_PATHS=[]; //Empty uploaded paths
  
 });
 
 $("body").on("click",".user-post-link", function(e){
 e.preventDefault();
 var href= strtolower( $(this).attr("href") ); 
 checkUrl( href);
 })
 
});

function checkUrl( href){
	href=strtolower( href)

if( !href.match( new RegExp("\\b" + __SITE_URL__) ) ){
	return window.open(href, '_blank').focus(); 
	}
	
	href=href.split("?")[0];
	var params=href.replace(new RegExp("\\b" + __SITE_URL__ + "/?"),"");
	//remove trailing slash
  params=params.replace(/\/+$/, ''); 
	
if( !params) {
	return loadPosts(true)
}

  params=params.split("/");
 var total=params.length;
if( total<1) return
	
 var dir=params[0];

if( dir=="post"){
	var pid=$.trim(params[1]);
var elem=$("<div/>").addClass("go-open-single-post")
      .attr("data-pid", pid);
    elem.appendTo("body").click();    
 }
 else if( total==4 && dir=="comment" && params[2]=="replies" ){
 	var pid=params[1];
    var cid=params[3];
    var elem=$("<div/>")
  .attr("data-parent-id", cid)
  .attr("data-pid", pid);
 
  elem.appendTo('body').click(function(){
  	replyComment(this);
  } ).click()
    }
 else if( total==2 && dir=="comment"  ){
 	var pid=params[1];
 var elem=$("<div/>")
  .addClass("go-open-comments-box")
  .attr("data-pid", pid);
   elem.appendTo("body").click();
 }
 else{
 	var unicename=params[0];
 var elem=$("<div/>").addClass("go-open-profile")
  .attr("data-unicename", unicename);
     elem.appendTo('body').click();	
 }
 
} 


/*CHANGE USER EMAIL BEGIN*/

var emailCodeRequestAjax, emailAjaxTimeout;

function emailCodeRequest(t){
	var this_=$(t);
	
	if( !$("#go-settings-container").is(":visible") ){
  clearTimeout( emailAjaxTimeout);
if( emailCodeRequestAjax) emailCodeRequestAjax.abort();
return;
	}
	
	var opass=$.trim( $("#epassword").val());
	var oEmail=$.trim( $("#current-email-box").val());
var nEmail=$.trim( $("#new-email-box").val() );

 if( oEmail.length <5 ){
  return toast("Old email not found")
	}else
if(nEmail.length<5){
		return toast("Enter your new email address");
		}
		else if(opass.length<4){
	return toast("Enter your password");
			}
	
  connCounts++;
  buttonSpinner(this_);
  this_.prop("disabled", true);
  
 emailAjaxTimeout= setTimeout( function(){
   
 emailCodeRequestAjax=$.ajax({
    url: __SITE_URL__ + '/oc-ajax/change-email.php?code=1',
    type:'POST',
   timeout: 20000,
     dataType: "json",
    data: {
      "email": nEmail,
      "pass": opass,
      "version": config_.APP_VERSION,
    }
  }).done(function(result){
  //   alert(JSON.stringify(result));
   connCounts--;  
   buttonSpinner(this_, true);
  if( result.status=="success"){
 	toast(result.result,{type:"success"});
$("#email-code-container").slideDown();
return;
 }
  else if( result.error ){
  toast(result.error); 
}
 else toast("Unknown error");
 this_.prop("disabled", false);
 
 }).fail(function(e,txt,xhr){
	//alert(JSON.stringify(e));
	buttonSpinner(this_, true);
	this_.prop("disabled", false);
 	connCounts--;
  toast("Try again. " + txt);
   });
  },1000); 
}

var changeEmailAjax, changeEmailAjaxTimeout;

function changeEmail(t){
	var this_=$(t);
	if( !$("#go-settings-container").is(":visible") ){
		clearTimeout( changeEmailAjaxTimeout);
if( changeEmailAjax) changeEmailAjax.abort();
return;
	}

	var oEmail=$.trim( $("#current-email-box").val());
	var nEmail=$.trim( $("#new-email-box").val() );
	var code= $.trim( $("#new-email-code-box").val() );
	
	if( nEmail .length<5){
		return toast("Enter new email address");
		}
	else if(oEmail.length <5 )  return toast("Old email not found")
	else if( code.length<4 ) return toast("Enter verification code");
	
  connCounts++;
  buttonSpinner(this_);
  this_.prop("disabled", true);
  
 changeEmailAjaxTimeout= setTimeout( function(){
   
 changeEmailAjax=$.ajax({
    url: __SITE_URL__ + '/oc-ajax/change-email.php?verify=1',
    type:'POST',
   timeout: 20000,
     dataType: "json",
    data: {
      "email": nEmail, 
      "code": code,
      "version": config_.APP_VERSION,
    }
  }).done(function(result){
  //   alert(JSON.stringify(result));
   connCounts--;  
   buttonSpinner(this_, true);
   this_.prop("disabled", false);
   
  if( result.status=="success"){
 $("#current-email-box").val(nEmail);
 $("#new-email-box,#epassword").val("");
 
 $("#email-code-container").slideUp();
  $("#new-email-code-box").val("");
  
  toast(result.result, {type:"success"});
 }
  else if( result.error ){
 return toast(result.error); 
}
 else toast("Unknown error");
 }).fail(function(e,txt,xhr){
	//alert(JSON.stringify(e));
	this_.prop("disabled", false);
 	connCounts--;
 buttonSpinner(this_, true);
  toast("Try again. " + txt);
   });
  },1000); 
}


$(window).on("hashchange", function() {
 //go_onBackPressed();
});

window.onbeforeunload = function () {
window.scrollTo(0, 0);
  $("#go-next-page-number").val("");

}
