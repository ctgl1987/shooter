/**
 * Objects
 */
var Obj = {};

Obj.Square = function(opt){

	this.type = "Obj.Square";
	this.x = 0;
	this.y = 0;
	this.width = 32;
	this.height = 32;

	opt = opt || {};

	for(var p in opt)
	{
		this[p] = opt[p];
	}
};

Obj.Square.prototype = {
	right: function(){
		return this.x + this.width;
	},
	bottom: function(){
		return this.y + this.height;
	},
	center: function(){
		return {
			x: this.x + (this.width/2),
			y: this.y + (this.height/2),
		};
	},
	centerTo: function(cx, cy){
		if(cx != null)
		{
			this.x = cx - (this.width / 2);
		}

		if(cy != null)
		{
			this.y = cy - (this.height / 2);
		}
	},
	expand: function(px){
		
		var ex = this.copy();
		
		ex.x -= px;
		ex.y -= px;
		ex.width += px*2;
		ex.height += px*2;
		return ex;
	},
	collapse: function(px){
		
		var ex = this.copy();
		
		ex.x += px;
		ex.y += px;
		ex.width -= px*2;
		ex.height -= px*2;
		return ex;
	},
	scale: function(t){
		if(!this.oldSize)
		{
			this.oldSize = {
				width: this.width,
				height: this.height,
			};
		}
		var c = this.center();
		this.width *= t;
		this.height *= t;
		this.centerTo(c.x, c.y);
	},
	resetSize: function(){
		if(this.oldSize)
		{
			var c = this.center();
			this.width = this.oldSize.width;
			this.height = this.oldSize.height;
			this.centerTo(c.x, c.y);
		}
	},
	copy: function(){
		return new this.__proto__.constructor(this);
	},
};

Obj.Entity = function(opt){
	
	this.tag = 'Entity';
	this.color = 'gray';
	this.img = null;
	this.angle = 0;
	this.dead = false;
	
	this._events = {};
	this._tasks = {};
	this._effects = {};

	this.super.call(this, opt);

	this.type = "Obj.Entity";
};

Obj.Entity.extends(Obj.Square, {
	test: function() {
	},
	setDead: function(){
		this.dead = true;
		this.dispatch("entityDeadEvent", {entity: this});
	},
	kill: function(){
		this.dead = true;
		this.dispatch("entityKilledEvent", {entity: this});
	},
	collide: function(other){
		var c = Utils.collision(this, other);

		if(c)
		{
			this.dispatch("entityCollideEvent", {other: other});
		}
		return c;
	},
	render: function(ctx, debug){
		var tint = Array.isArray(this.tint) ? Utils.pickRandom(this.tint) : this.tint;
		if(this.img)
		{
			Draw.drawImage(ctx, this.img, {}, this, {angle: this.angle, tint: tint});
		}else{
			Draw.fillRect(ctx, this.x, this.y, this.width, this.height, {color: this.color});
		}
		debug && Draw.strokeRect(ctx, this.x, this.y, this.width, this.height, {color: 'white'});

		this.dispatch("entityRenderEvent", {entity: this, ctx: ctx});
	},
	addTask: function(t){
		
		var task = t.create();
		
		var name = task.name;

		if(this._tasks[name])
		{
			this._tasks[name].finish(this);
		}

		this._tasks[name] = task;

		this._tasks[name].init(this);
	},
	removeTask: function(name){
		
		if(this._tasks[name])
		{
			this._tasks[name].finish(this);
			delete this._tasks[name];
		}
	},
	removeAllTask: function(){

		for(var t in this._tasks)
		{
			this._tasks[t].finish(this);
			delete this._tasks[t];
		}
	},
	addEffect: function(e){
		
		var effect = e.create();
		
		var name = effect.name;

		if(this._effects[name])
		{
			var ef = this._effects[name];
			ef.duration = effect.duration;

		}else{
			
			effect.init(this);
			this._effects[name] = effect;
		}
	},
	removeEffect: function(effect){

		var name = effect.name;

		if(this._effects[name])
		{
			var effect = this._effects[name];
			effect.finish(this);
		}

		delete this._effects[name];
	},
	on: function(evt, cb){
		
		this._events[evt] = this._events[evt] || [];

		this._events[evt].push(cb);

		var self = this;

		return {
			remove: function(){
				self._events[evt] = self._events[evt].filter(function(c){ return c != cb});
			},
		};
	},
	dispatch: function(evt, data){
		
		data = data || {};
		data._event = evt;
		this._events[evt] = this._events[evt] || [];

		this._events[evt].forEach(function(cb){
			cb && cb(data);
		});
	},
	update: function(dt){
		
		for(var t in this._tasks)
		{
			var task = this._tasks[t];
			task.run(this, dt);
		}

		for(var e in this._effects)
		{
			var ef = this._effects[e];	
			ef.update(this, dt);
		}

		this.dispatch("entityUpdateEvent", {entity: this, delta: dt});
	}
});

Obj.EntityList = function(_list){
	var self = this;

	self.list = _list || [];

	self.add = function(entity){
		self.list.push(entity);
	};

	self.remove = function(entity){
		self.list = self.filter(function(i){ return i != entity});
	};

	self.delete = function(cb){
		self.list = self.filter(function(i){
			return !cb(i);
		});
	};

	self.find = function(cb){
		var _find = self.list.find(cb);
		return _find;
	};

	self.findAll = function(cb){
		var _findAll = self.filter(cb);
		return _findAll;
	};

	self.filter = function(cb){
		return Utils.filter(cb, self.list);
	};

	self.forEach = function(cb){
		self.list.forEach(cb);
	};

	self.update = function(delta){
		self.list.forEach(function(i){
			i.update(delta);
		});
	};

	self.clear = function(){
		self.list = [];
	};

	self.get = function(){
		return self.list;
	};

	return self;
};

Obj.generator = function(opt){
	var self = this;

	opt = opt || {};

	self.start = 0;

	var initial_value = opt.value;

	self._value = opt.value;

	self.setValue = function(v){
		_value = Utils.clamp(v. initial_value * 0.5, initial_value * 1.5);
	};

	self.getValue = function(){
		return self._value;
	};

	self.paused = false;

	self.init = opt.init || function(){};

	self.condition = opt.condition || function(){ return true;};

	self.generate = opt.generate || function(){};

	self.update = function(){

		if(self.paused) return;

		self.start++;

		if(self.start > self._value)
		{
			self.start = self._value;
		}

		if(self.condition() && self.ended())
		{
			self.generate();
			self.reset();
		}
	};

	self.reset = function(){
		self.start = 0;
	};

	self.ended = function(){
		return self.start == self._value;
	};

	self.pause = function(){
		self.paused = true;
	};

	self.resume = function(){
		self.paused = false;
	};

	self.init();
}

Obj.Counter = function(s){
	var self = this;

	self.type = "Obj.Counter";
	self.start = 0;

	self.update = function(){

		self.start++;

		if(self.start > s)
		{
			self.start = s;
		}
	};

	self.reset = function(new_s){
		if(new_s != null)
		{
			s = new_s;
		}
		self.start = 0;
	};

	self.ended = function(){
		return self.start >= s;
	};
};

Obj.reverseCounter = function(s){
	var self = this;

	self.start = s;

	self.update = function(){

		self.start--;

		if(self.start < 0)
		{
			self.start = 0;
		}
	};

	self.reset = function(new_s){
		if(new_s != null)
		{
			s = new_s;
		}
		self.start = s;
	};

	self.ended = function(){
		return self.start <= 0;
	};
};

Obj.shake = function(ctx, ticks, opt){

	opt = opt || {};

	var self = this;

	self.start = ticks;

	valX = opt.valX || 1;
	valY = opt.valY || 1;

	self.update = function(){

		if(self.ended())
		{
			ctx.resetTransform();
		}else{
			var x = Utils.random(-valX, valX, valX);
			var y = Utils.random(-valY, valY, valX);
			ctx.translate(x, y);
		}

		self.start--;

		if(self.start < 0)
		{
			self.start = 0;
		}
	};

	self.reset = function(){
		self.start = ticks;
	};

	self.ended = function(){
		return self.start == 0;
	};
};

Obj.Rumble = function(){
	
};

Obj.Task = function(name, opt){
	opt = opt || {};

	var self = this;

	self.type = "Obj.Task";
	self.name = name;

	self.init = opt.init || function(entity){};
	self.run = opt.run || function(entity){};
	self.finish = opt.finish || function(entity){};
};

Obj.Task.template = function(name, opt){
	return {
		create: function(){
			return new Obj.Task(name, opt);
		},
	};
};

Obj.Attrib = function(val, min, max){
	var self = this;

	self.type = "Obj.Attrib";
	self.value = val || 0;
	self._min = min || 0;
	self._max = max || 0;

	self.mods = [];

	self.min = function(){
		return self._min;
	};

	self.max = function(){
		return self._max;
	};

	self.base = function(){
		return self.value;
	};

	self.increment = function(v){
		self.value += Math.abs(v);
		self.value = Utils.clamp(self.value, self._min, self._max);
	};
	self.decrement = function(v){
		self.value -= Math.abs(v);
		self.value = Utils.clamp(self.value, self._min, self._max);
	};
	self.setValue = function(v){
		self.value = Math.abs(v);
		self.value = Utils.clamp(self.value, self._min, self._max);
	};
	self.get = function(){
		var v = self.value;

		self.mods.forEach(function(m){
			if(m.measure() == Obj.Modifier.Unit)
			{
				v = v + m.value();
			}

			if(m.measure() == Obj.Modifier.Percent)
			{
				v = v + (self.value * m.value() / 100);
			}

			if(m.measure() == Obj.Modifier.Multiply)
			{
				v = v + (self.value * m.value());
			}

			if(m.measure() == Obj.Modifier.Replace)
			{
				v = m.value();
			}
		});

		v = Utils.clamp(v, self._min, self._max);

		return v;
	};

	self.addMod = function(mod){
		self.mods.push(mod);
	};

	self.removeMod = function(mod){
		self.mods = self.mods.filter(function(m){ return m !=mod;});
	};

	self.modList = function(){
		return self.mods;
	};

	self.percent = function(){
		return self.value * 100 / (max - min);
	};

	self.color = function(){
		if(self.percent() <= 20) return 'red';
		if(self.percent() <= 50) return 'yellow';
		return "green";
	};
};

Obj.Modifier = function(opt){

	opt = opt || {};

	var self = this;

	self.type = "Obj.Modifier";
	self._value = opt.value || 0;
	self._measure = opt.measure || Obj.Modifier.Unit;

	self.value = function(){
		return self._value;
	};

	self.measure = function(){
		return self._measure;
	};
};

Obj.Modifier.Unit = 1;
Obj.Modifier.Percent = 2;
Obj.Modifier.Multiply = 3;
Obj.Modifier.Replace = 4;

Obj.Effect = function(name, opt){

	opt = opt || {};

	var self = this;

	self.type = "Obj.Effect";
	
	self.uuid = Utils.uuid();
	
	self.name = name;

	self.desc = opt.desc;

	self.value = opt.value;    

	self.duration = opt.duration || 0;

	self.init = opt.init || function(entity){};

	self.run = opt.run || function(entity){};
	
	self.finish = opt.finish || function(entity){};

	self.maxDuration = function(){
		return opt.duration;
	};

	self.update = function(entity){
		
		self.run(entity);

		self.duration--;

		if(self.duration <= 0)
		{
            self.finish(entity);
			entity.removeEffect(self);
			return;
		}
	};
};

Obj.Effect.template = function(name, opt){
	return {
		create: function(){
			return new Obj.Effect(name, opt);
		},
	};
};

Obj.CheatManager = {
	_lastTime: null,
	buffer: [],
	_list: [],
	capture: function(value){
		var self = this;

		if(self._lastTime)
		{
			self._lastTime = Date.now();
		}

		value = value.toLowerCase();

		var charList = 'abcdefghijklmnopqrstuvwxyz0123456789';
		
        // we are only interested in alphanumeric keys
		if (charList.indexOf(value) === -1) return;

		var currentTime = Date.now();

		if (currentTime - self._lastTime > 1000)
		{
			self.resetLog();
        }
		
		self.buffer.push(value);

		self._lastTime = currentTime;

		self.check();
	},
	add: function(cheat){
		if(!cheat.code) return;
		this._list.push(cheat);
	},
	remove: function(){
		this._list = this._list.filter(function(ch){ return ch !=cheat});
	},
	check: function(){
		var self = this;
		var done = false;
		self._list.forEach(function(ch){
			if(done) return;
			var code = ch.code;

			var log = self.buffer.join("");

			if(log.indexOf(code) !== -1)
			{
				ch.action();
				self.resetLog();
				done = true;
			}
		});
	},
	apply: function(code){
		var self = this;
		var done = false;
		self._list.forEach(function(ch){
			if(done) return;
			if(code == ch.code)
			{
				ch.action();
				self.resetLog();
				done = true;
			}
		});
	},
	resetLog: function(){
		this.buffer = [];
	},
};

Obj.Cheat = function(opt){

	var self = this;

	opt = opt || {};

	if(!opt.code) return;

	self.code = opt.code;

	self.action = opt.action || function (){};

	self.text = opt.text || "";
}

Obj.FadeAlpha = function(opt){
	opt = opt || {};

	var self = this;

	self.start = opt.start || 0;
	self.end = opt.end || 0;
	self.duration = opt.duration || 0;

	self.ended = false;

	var _alpha = 0;

	self.update = function(){

		if(self.ended){
			return;
		}

		self.duration--;

		if(self.duration == 0)
		{
			self.ended = true;
			opt.finish && opt.finish();
		}

		var alpha = 0;

		if(self.start && self.duration >= self.start)
		{
			alpha = ((opt.duration - self.duration) * 100 / (opt.duration - self.start)) / 100;
		}else if(self.end && self.duration <= self.end)
		{
			alpha = (self.duration * 100 / self.end) / 100;
		}else{
			alpha = 1;
		}

		_alpha = Utils.clamp(alpha || 0, 0, 1);
	};

	self.alpha = function(){
		return _alpha;
	};

	self.reset = function(){
		self.duration = opt.duration || 0;
		self.ended = false;
		_alpha = 0;
	};
};

//LOGIC

Obj.Settings = function(opt){

	var self = this;

	self.data = opt || {};

	self.load = function(){
		var s = JSON.parse(localStorage.getItem("game_settings"));

		if(!s)
		{
			s = {};
		}

		self.data = Object.assign(Utils.clone(self.data), Utils.clone(s));

		self.save();

		return self;
	};

	self.get = function(key, def){
		def = def || null;
		return self.data[key] != undefined ? self.data[key] : def;
	};

	self.set = function(key, val){
		self.data[key] = val;
		return self;
	};

	self.save = function(){
		var s = JSON.stringify(self.data);
		localStorage.setItem("game_settings", s);
		return self;
	};

	self.clear = function(){
		self.data = {};
	};
};

Obj.Scene = function(name, opt){

	var self = this;

	opt = opt || {};

	var _paused = false;

	self.name = name;

	self.togglePause = function(){
		_paused = !_paused;	
	};
	self.pause = function(){
		_paused = true;
		self.onPause();
	};
	self.resume = function(){
		_paused = false;
		self.onResume();
	};
	self.isPaused = function(){
		return _paused;
	};

	self.enter = opt.enter || function(prev_state){};	
	self.input = opt.input || function(evt, code, ke){};
	self.update = opt.update || function(dt){};
	self.render = opt.render || function(dt){};
	self.leave = opt.leave || function(){};
	self.onPause = opt.onPause || function(){};
	self.onResume = opt.onResume || function(){};

	self.isTemporal = opt.isTemporal || function(){ return false;};

	for(var o in opt)
	{
		if(!self.hasOwnProperty())
		{
			self[o] = opt[o];
		}
	}
};

Obj.SceneManager = {
	_scenes: {},
	_current: null,
	add: function(scene){
		this._scenes[scene.name] = scene;
	},
	change: function(name, timeout){
		var self = this;
		var new_state = self._scenes[name];

		timeout = timeout || 0;

		setTimeout(function(){
			if(new_state)
			{
				var old = null;

				if(self._current)
				{
					old = self._current;

					if(new_state.isTemporal())
					{
						old.pause();
						console.log(old.name +" pause");
					}else{
						old.leave();
						console.log(old.name +" leave");
					}
				}

				self._current = new_state;

				if(old && old.isTemporal())
				{
					self._current.resume();
					console.log(self._current.name +" resume");
				}else{
					self._current.enter(old);
					console.log(self._current.name +" enter");
				}

			}else{
				console.log(name + " not found!");
			}
		}, timeout);
	},
	pause: function(){
		this._current && this._current.pause();
	},
	resume: function(){
		this._current && this._current.resume();
	},
	input: function(evt, code, ke){
		this._current && this._current.input(evt, code, ke);
	},
	update: function(dt){
		this._current && !this._current.isPaused() &&  this._current.update(dt);
	},
	render: function(dt){
		this._current && this._current.render(dt);
	},
};

Obj.Button = function(opt){

	var self = this;
	opt = opt || {};

	self.x = 0;
	self.y = 0;

	self.width = 300;
	self.height = 30;

	self.me = new Obj.Square(self);

	self.center = opt.center || false;

	self.getText = opt.getText || function(){return "-no text-";};

	self.getState = opt.getState || function(){ return 0;};
	self.action = opt.action || function(){};
	self.isEnabled = opt.isEnabled || function(){ return 1;};

	self.mouse_over = false;

	self.empty = opt.empty || false;

	self.input = function(evt, code, ke){
		if(evt == 'click')
		{
			if(self.mouse_over && self.isEnabled())
			{
				self.action();
			}
		}
	};

	self.update = function(){
		self.me = new Obj.Square(self);
	};

	self.render = function(ctx, x, y){

		if(self.empty) return;

		var state =  self.getState();
		var text = self.getText(state);

		self.x = x;
		self.y = y;

		self.me = new Obj.Square(self);		

		self.mouse_over = Utils.PointInside(self.me, Mouse.pos);

		var textColor = state ? 'green' : '#333';
		var buttonColor = self.mouse_over ? '#fff' : '#bbb';

		if(!self.isEnabled())
		{
			textColor = "#333";
			buttonColor = '#777';
		}

		Draw.fillRect(ctx, x, y, self.width, self.height, {color: buttonColor});
		Draw.fillText(ctx, text, x + (self.width/2), y + 5, {color: textColor, align: 'center', fontSize: 20});
	};
};

Obj.ButtonList = function(list){
	var self = this;

	self.list = [];

	self.renderGap = 15;

	list = Array.isArray(list) ? list : [list];

	list.forEach(function(b){
		self.list.push(b);
	});

	self.input = function(evt, code, ke){
		self.list.forEach(function(b){
			b.input(evt, code, ke);
		});
	};

	self.update = function(){
		self.list.forEach(function(b){
			b.update();
		});
	};
	self.render = function(ctx, x, y){
		var yy = y;
		self.list.forEach(function(b){
			var xx = b.center ? (x - b.width/2) : x;
			b.render(ctx, xx, yy);
			yy += b.height + self.renderGap;
		});
	};
};

Obj.Sequence = function(opt){

	var self = this;

	opt = opt || {};

	self.list = [];

	self.time = 0;
	self.nested = opt.nested || false;
	self.data = opt.data || {};

	self.counter = 0;

	/**
	 * Info
	 */
	self.add = function(obj){
		obj = obj || {};

		if(self.nested)
		{
			self.time += obj.time || 0;
		}else{
			self.time = obj.time || 0;
		}

		self.list.push({
			action: obj.action || function(){},
			time: self.time,
			context: obj.context,
		});
	};

	self.update = function(){

		self.counter++;

		self.list.forEach(function(s){
			if(self.counter == s.time + self.delay)
			{
				if(s.context)
				{
					s.action.bind(s.context);
				}

				s.action(self);
			}
		});
	};

	self.run = function(delay){

		self.delay = parseInt(delay || 0);
	};

	self.stop = function(){
		
	};
};

Obj.Weapon = function(name, opt){
	var self = this;

	opt = opt || {};

	self.type = "Obj.Weapon";
	self.name = name;

	self.damage = opt.damage || 5;
	
	var fire_rate = opt.fire_rate || 15;
	self.fire_rate = new Obj.Attrib(fire_rate, 0, fire_rate * 5);
	self.bullet_speed = opt.bullet_speed || 3;
	
	self.cooldown = new Obj.Counter(self.fire_rate.get());
	self.createBullets = opt.createBullets || function(e){ return [];};

	self.can_shot = new Obj.Attrib(1, 0, 1);

	self.fire = function(entity, callback){
		if(!self.can_shot.get()) return [];
		return self.createBullets(entity, callback || function(b){});
	};

	self.update = function(){
		self.cooldown.update();
	};

	self.ready = function(){
		return self.cooldown.ended();
	};

	self.reload = function(){
		self.cooldown.reset(self.fire_rate.get());
	};
};

Obj.Weapon.template = function(name, opt){
	return {
		create: function(){
			return new Obj.Weapon(name, opt);
		},
	};
};

Obj.ProgressBar = function(opt){
	var self = this;

	opt = opt || {};

	self.x = opt.x || 0;
	self.y = opt.y || 0;
	self.width = opt.width || 200;
	self.height = opt.height || 20;

	self.backColor = opt.backColor || 'gray';
	self.frontColor = opt.backColor || 'blue';
	self.textColor = opt.textColor || 'white';

	self.progress = 0;

	self.getText = opt.getText || function(pb){ return pb.progress + "%"};

	self.setProgress = function(p){
		self.progress = p;
	};

	self.render = function(ctx){

		var me = new Obj.Square(self);
	
		var p = self.progress * self.width / 100;

		//back
		Draw.fillRect(ctx, me.x, me.y, me.width, me.height, {color: self.backColor});
		//front
		Draw.fillRect(ctx, me.x, me.y, p, me.height, {color: 'blue'});
		//text
		Draw.fillText(ctx, self.getText(self), me.center().x, me.center().y + 2, {color: self.textColor, valign: 'middle', align: 'center', fontSize: self.height*0.75});
	};
};