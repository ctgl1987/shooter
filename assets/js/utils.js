/**
 * Utils
 */

Function.prototype.extends = function(parent, proto){
	proto = proto || {};

	var c = this.prototype.constructor;
    this.prototype = Object.assign(Object.create(parent.prototype || null), proto);
	this.prototype.super = parent;
	this.prototype.parent = parent.prototype;
	this.prototype.constructor = c;
};

Image.prototype.toJSON = function(){
	var j = {type: "Image",name: this.getAttribute("data-name"),src: this.getAttribute("src")};
	return (j);
};


var Utils = {};

Utils.random = function(min, max, not_floor){
	if(not_floor)
	{
		return (Math.random() * (max-min + 1) + min);
	}
	return Math.floor(Math.random() * (max-min + 1) + min);
};

Utils.pickRandom = function(arr){
    if(!arr.length) return null;
    var rand = Utils.random(0, arr.length-1);
    return arr[rand];
};

Utils.randomPos = function(e){
	return {
		x: Utils.random(e.x, e.x + e.width),
		y: Utils.random(e.y, e.y + e.height),
	};
};

Utils.randomColor = function(){
	return "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase();
}

Utils.inRange = function(num, min, max){
	return num >= min && num <= max;
}

Utils.clamp = function(num, min, max){
	return Math.min(Math.max(num, min), max);
};

Utils.raf = function(cb){
	
	//return window.requestAnimationFrame(cb);
	return setTimeout(cb, 1000/60);
};

Utils.outside = function(area, target){
	return (target.right() < area.x) || 
	(target.x > area.right()) ||
	(target.bottom() < area.y) || 
	(target.y > area.bottom())
	;
};

Utils.collision = function(a, b){
	return (a.x < b.x +b.width) && 
	(a.x + a.width > b.x) &&
	(a.y < b.y + b.height) &&
	(a.y + a.height > b.y)
	;
};

Utils.PointInside = function(area, point){
	return (Utils.inRange(point.x, area.x, area.right())) && (Utils.inRange(point.y, area.y, area.bottom()));
};

Utils.uuid = function(){
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	  var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	  return v.toString(16);
  });
};

Utils.isObject = function(o){
	return (o && typeof o === 'object' && !Array.isArray(o));
};

Utils.clone = function(obj){
	var o = {};
	for(var p in obj)
	{
		if(obj.hasOwnProperty(p))
		{
			if(Utils.isObject(obj[p]))
			{
				o[p] = Utils.clone(obj[p]);

			}else if(Array.isArray(obj[p])){

				var ar = obj[p];
				o[p] = [];
				ar.forEach(function(a){
					
					if(Utils.isObject(a))
					{
						o[p].push(Utils.clone(a));
					}else{
						o[p].push(a);
					}
				});

			}else{
				o[p] = obj[p];
			}
		}
	}
	
	return o;
};

Utils.keepInside = function(target, area){
	target.x = Utils.clamp(target.x, area.x, area.x + area.width - target.width);
	target.y = Utils.clamp(target.y, area.y, area.y + area.height - target.height);
};

Utils.offScreen2DContext = function(w,h){
	var c=document.createElement('canvas');
	c.width = w;
	c.height = h;
	var ctx=c.getContext('2d');
	return ctx;
	
};

Utils.filter = function(p, a){
	var f = [];
	for(var i = 0; i < a.length; i++)
	{
		if(p(a[i]))
		{
			f.push(a[i]);
		}
	}

	return f;
};

var Mouse = {
	_list: {},
	pos: {x: 0, y: 0, click: false, mouseDown: false},
	init: function(callback, context, cancelEvents){
		
		var self = this;

		(context || document).addEventListener("mousemove", function(e){
			var rect = this.getBoundingClientRect();

			self.pos.x = e.clientX - rect.left;
			self.pos.y = e.clientY - rect.top;
			cancelEvents &&  e.preventDefault();
		});

		(context || document).addEventListener("mousedown", function(e){
			MousePos.down = true;
			self._list[e.button] = true;
			
			callback && callback(e.type, e.button, e);
			
			cancelEvents &&  e.preventDefault();
		});

		(context || document).addEventListener("mouseup", function(e){
			MousePos.down = false;
			MousePos.click = false;
			
			delete self._list[e.button];
			
			callback && callback(e.type, null, e);
			cancelEvents &&  e.preventDefault();
		});

		(context || document).addEventListener("click", function(e){
			
			MousePos.click = true;
			callback && callback(e.type, e.button, e);
			MousePos.click = false;
			
			cancelEvents &&  e.preventDefault();
		});
		
		(context || document).addEventListener("contextmenu", function(e){
			
			//callback && callback(e.type, e.button, e);
			
			//cancelEvents &&  e.preventDefault();
		});
	},
	LeftButton: 0,
	MidButton: 1,
	RightButton: 2,
	isDown: function(k){
		return this._list[k] == true;
	},
};

var Keyboard = {
	_list: {},
	init: function(callback){
		var self = this;

		document.addEventListener("keydown", function(e){
			var code = e.keyCode;
			self._list[code] = true;
			callback && callback(e.type, code, e);
		});

		document.addEventListener("keyup", function(e){
			var code = e.keyCode;
			delete self._list[code];
			callback && callback(e.type, code, e);
		});
	},
	events: {
		KeyUp: 'keyup',
		KeyDown: 'keydown',
	},
	isDown: function(k){
		return this._list[k] == true;
	},
};

var Pool = function(name, sound, opt){

	var self = this;

	opt = opt || {};

	self._pool = [];

	self.name = name;

	self.size = opt.size || 10;

	self.onload = function(){};

	self.init = function(){

		self._total = self.size;

		for(var i = 0; i < self.size; i++)
		{
			var ss = sound.cloneNode();

			ss.volume = opt.volume || 1;

			ss.loop = opt.loop || false;
			
			ss.autoplay = opt.autoplay || false;
			
			self._pool.push(ss);
		}
	}

	self.get = function(){

		if(self.size == 1)
		{
			return self._pool[0];
		}

		for(var i = 0; i < self.size; i++)
		{
			if(self._pool[i])
			{
				var s = self._pool[i];
				
				if(s.currentTime === 0 || s.ended)
				{
					return s;
				}
			}
		}
	   
		return null;
	};

	self.play = function(){
		var self = this;

		var sound = self.get();
            
		if(sound && !sound.muted)
		{
			sound.play();
			return;
		}
	};

	self.enable = function(){

		self._pool.forEach(function(d){
            d.muted = false;
        });
	};

	self.disable = function(){

		self._pool.forEach(function(d){
            d.muted = true;
        });
	};

	self.stop = function(){
		self._pool.forEach(function(d){
			d.pause();
			d.currentTime = 0;
        });
	};

	self.init();
};

var Sounds = {
	_list: {},
	_muted: false,
	register: function(name, audio, opt){
		var self = this;
		self._list[name] = new Pool(name, audio, opt || {});
	},
	play: function(name){

		var self = this;

		var sound = self.get(name);
            
		if(sound)
		{
			sound.play();
			return sound;
		}

		return null;
	},
	get: function(name){

		var self = this;

		if(self._list[name])
		{
			return self._list[name];
		}

		console.log("Sound '" + name + "' not found!");
		return null;
		
	},
	enable: function(){

		var self = this;
		self._muted = false;

		for(var d in self._list)
		{
			self._list[d].enable();
		}
	},
	disable: function(){

		var self = this;
		self._muted = true;

		for(var d in self._list)
		{
			self._list[d].disable();
		}
	},
	toggle: function(){
		var self = this;
		self.isEnabled() ? self.disable() : self.enable();
	},
	isEnabled: function(){
		var self = this;
		return self._muted == false;
	},
};

var Images = {
	_list: {},
	register: function(name, img){
		var self = this;
		self._list[name] = img;
	},
	get: function(name){
		var self = this;
		return self._list[name];
	},
};

var Preloader = {
	_tmp: [],
	_list: {},
	_total: 0,
	_loaded: 0,
	_success: 0,
	_error: 0,
	_events: {},
	_loadImage: function(d){
		
		var self = this;

		var img = new Image();

		img.addEventListener("error", function() {
			self._error++;

			self.reportEvents();

		}, false);

		img.addEventListener("load", function() {
			self._success++;
			self._loaded++;
			self._list['image_'+d.name] = img;

			self.dispatch("loaded", {file: img, item: d});

			self.reportEvents();

		}, false);
		
		img.setAttribute('data-name', d.name);

		img.src = d.src + '?x=' + Utils.random(0,9999);
	},
	_loadAudio: function(d){
		
		var self = this;

		var sound = new Audio(d.src);

		sound.load();
			
		sound.addEventListener("error", function(e) {
			
			self._error++;
			
			self.reportEvents();

			console.log(d.name, 'error', e);
		});

		sound.addEventListener("loadeddata", function() {

			self._success++;

			self._list['audio_'+d.name] = sound;

			self.reportEvents();

			self.dispatch("loaded", {file: sound, item: d});

		}, true);
	},
	on: function(evt, callback){
		var self = this;
		this._events[evt] = this._events[evt] || [];

		this._events[evt].push(callback);
	},
	dispatch: function(evt, data){
		var self = this;
		data = data || {};
		data._event = evt;
		(self._events[evt] || []).forEach(function(d,i){
			d(data);
		});
	},
	add: function(obj){
		var self = this;
		if(Array.isArray(obj))
		{
			obj.forEach(function(o){
				self.add(o);
			});
		}else{
			self._tmp.push(obj);
			self._total++;
		}
	},
	download: function(){
		var self = this;
		self._tmp.forEach(function(d,i){
			if(d.type == 'image')
			{
				self._loadImage(d);
			}

			if(d.type == 'audio')
			{
				self._loadAudio(d);
			}
		});
	},
	reportEvents: function(){

		var self = this;

		var p = (self._success + self._error) * 100 / self._total;

		self.dispatch("progress", {progress: Math.round(p), progress_float: p});

		if(p == 100)
		{
			self.dispatch("complete", {
				total: self._total,
				succes: self._success,
				error: self._error,
			});
		}
	},
};

var Timer = function(opt){
    var self = this;

    self.paused = false;

    self.interval = null;

	self.fps = opt.fps || 60;
	
	self.ticks = {};

	self.add = function(name, func){
		self.ticks[name] = func;
	};

    self.pause = function(){
		self.paused = true;
    };

    self.resume = function(){
		self.paused = false;
	};
	
	var _currentTime = 0;
	var _lastTime = 0;
	var _delta = 0;

    self.start = function(){

		_lastTime = Date.now();

        self.interval = setInterval(function(){
			if(self.paused) return;

			_currentTime = Date.now();

            for(var t in self.ticks)
            {
				var d = self.ticks[t];
				_delta = _currentTime - _lastTime
                d && d(_delta/1000);
			}

			_lastTime = _currentTime;
			
        }, 1000/self.fps);
    };

    self.reset = function(){
        self.stop();
        self.start();
    };
};

var GameEngine = function(opt){

	var self = this;

	var _paused = false;

	self.events = {};

	self.fps = opt.fps || 60;

	self.timer = new Timer({fps: self.fps});
	
	self.init = function(){
		self.canvas = opt.canvas;
		self.uicanvas = opt.uicanvas || opt.canvas;

		self.canvas.width = self.uicanvas.width = opt.width;
		self.canvas.height = self.uicanvas.height = opt.height;

		self.ctx = self.canvas.getContext("2d");
		self.ctx.textBaseline = "top";

		self.ctxUI = self.uicanvas.getContext("2d");
		self.ctxUI.textBaseline = "top";

		self.update = opt.update || function(){
			console.log("update...");
		};
		self.render = opt.render || function(){
			console.log("render...");
		};

		self.bounds = new Obj.Entity({
			x:0,
			y:0,
			width: self.canvas.width,
			height: self.canvas.height,
			tag: 'GameBounds',
		});

		opt.init && opt.init();
		
	};

	self.on = function(evt, cb){
		self.events[evt] = self.events[evt] || [];

		self.events[evt].push(cb);

		return {
			remove: function(){
				self.events[evt] = self.events[evt].filter(function(c){ return c != cb});
			},
		};
	};

	self.dispatch = function(evt, data){
		data = data || {};
		data._event = evt;
		var ee = self.events[evt] || [];

		ee.forEach(function(cb){
			cb && cb(data);
		});
	};

	self.pause = function(){
		_paused = true;
	};

	self.resume = function(){
		_paused = false;
	};

	self.togglePause = function(){
		_paused = !_paused;
	};

	self.isPaused = function(){
		return _paused == true;
	};

	self.run = function(dt){

		/*
		self.timer.add('main_loop', function(delta){
			self.loop(delta);
		});

		self.timer.start();
		*/
		
		/*
		Utils.raf(function(){
			self.run();
		});
		*/
		self.then = 0;
		
		self.loop();
	};

	var _last = 0;
	var _delta = 0; 

	self.now = 0;
	self.then = 0;
	self.delta = 0;
	self.deltaTime = 0;
	self.runningFPS = 0;

	self.frames = 0;
	self.good = 0;
	self.bad = 0;

	self.getRunningFPS = function(){
		return self.runningFPS;
	};

	var desired_delta = (1000/1000/self.fps).toFixed(4);

	self.loop = function(now){

		if(!self.then) { self.then = now; }
		self.now = now;

		self.delta = self.now - self.then;
		self.deltaTime = (self.delta / 1000).toFixed(4);

		self.runningFPS = Math.round(1 / self.deltaTime);
		self.frames++;

		if(self.runningFPS == self.fps)
		{
			self.good++;
		}else{
			self.bad++;
		}

		!_paused && self.update(self.deltaTime);

		self.render(self.deltaTime);

		self.then = self.now;
		
		requestAnimationFrame(self.loop);
	};

	self.loop_old = function(now){
		if(!_last) {_last = now;}

		_delta = (now - _last) / 1000;

		//log(desired_delta + " : " + _delta.toFixed(4));

		//log2();
		!_paused && self.update(desired_delta);
		
		self.render(desired_delta);

		_last = now;

		requestAnimationFrame(self.loop);
	};

	self.printFPS = function(ctx, x, y){
		var per = (self.bad * 100 / self.frames).toFixed(2);
		var _fps = "FPS: " + self.runningFPS + " - Frames: " + self.frames + " - Good: " + self.good + " - Bad: " + self.bad + " - " + per + "%";
		Draw.fillText(ctx, _fps, x, y, {color: 'white'});
	};

	self.start = function(){
		self.init();
		self.run();
	};
};