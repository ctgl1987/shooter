var ECS = {};

ECS.Components = {};

ECS.Entity = function(){

	this.uuid = Utils.uuid();

	//Components (Data)
	this.Components = {};
	//Events
	this.Events = {};
	//Tasks
	this.Tasks = {};
};

ECS.Entity.prototype = {
	//COMPONENTS
	addComponent: function(c, data){
		data = data || {};
		this.Components[c.name] = new c(data);
		return this;
	},
	removeComponent: function(c){
		delete this.Components[c.name];
		return this;
	},
	getComponent: function(c){
		
		if(typeof c != 'string')
		{
			c = c.name;
		}

		return this.Components[c];
	},
	hasComponent: function(c){
		var self = this;
		c = Array.isArray(c) ? c : [c];

		var cmps = c.map(function(c){return c.name});

		var has = cmps.every(function(i){
			//because 0 is falsy
			return self.Components[i] !== undefined;
		});

		return has;
	},
	//EVENTS
	on: function(evt, cb){
		this.Events[evt] = this.Events[evt] || [];

		this.Events[evt].push(cb);

		var self = this;

		//OFF
		return {
			remove: function(){
				self.Events[evt] = self.Events[evt].filter(function(c){ return c != cb});
			},
		};
	},
	dispatch: function(evt, data){
		data = data || {};
		data._event = evt;

		(this.Events[evt] || []).forEach(function(cb){
			cb && cb(data);
		});
	},
	//TASKS
	addTask: function(t){
		var task = t.create();
		
		var name = task.name;

		if(this.Tasks[name])
		{
			this.Tasks[name].finish(this);
		}

		this.Tasks[name] = task;

		this.Tasks[name].init(this);
		return this;
	},
	runTask: function(dt){
		for(var t in this.Tasks)
		{
			this.Tasks[t].run(this, dt);
		}
	},
	removeTask: function(name){
		if(this.Tasks[name])
		{
			this.Tasks[name].finish(this);
			delete this.Tasks[name];
		}
		return this;
	},
	removeAllTask: function(){
		for(var t in this._tasks)
		{
			this.Tasks[t].finish(this);
			delete this.Tasks[t];
		}
		return this;
	},
};

ECS.List = function(list){
	this.list = list || [];
	this.length = this.list.length || 0;
};

ECS.List.prototype = {
	add: function(e){
		this.list.push(e);
		this.length = this.list.length;
		return this;
	},
	remove: function(cb){
		this.list = this.filter(function(i){
			return !cb(i);
		});
		this.length = this.list.length;
	},
	removeEntity: function(e){
		this.list = this.filter(function(i){
			return i != e;
		});
		this.length = this.list.length;
	},
	filter: function(cb){
		return Utils.filter(cb, this.list);
	},
	forEach: function(cb){
		this.list.forEach(cb);
	},
	clear: function(){
		this.list = [];
		this.length = this.list.length;
	},
};

//example

//components
var Position = function(data){
	this.x = data.x || 0;
	this.y = data.y || 0;
};
ECS.Components[Position.name] = Position;

var Size = function(data){
	this.width = data.width || 0;
	this.height = data.height || 0;
};
ECS.Components[Size.name] = Size;

var Movement = function(data){
	this.vx = data.vx || 0;
	this.vy = data.vy || 0;
	this.speed = data.speed || 0;
};
ECS.Components[Movement.name] = Movement;

var Visual = function(data){
	this.img = data.img || null;
	this.color = data.color || null;
};
ECS.Components[Visual.name] = Visual;

var PlayerController = function(data){
	this.value = true;
};
ECS.Components[Visual.name] = Visual;

//systems
var PlayerInputSystem = function(){

	var self = this;

	this.queryComponents = [PlayerController, Movement];

	this.update = function(entities, dt){
		var list = entities.filter(function(e){return e.hasComponent(self.queryComponents)});
		
		list.forEach(function(e){
			
			var mov = e.getComponent(Movement);
			
			if(Keyboard.isDown(GameKeys.ArrowLeft))
			{
				e.getComponent(Movement).vx = -mov.speed;
			}
			if(Keyboard.isDown(GameKeys.ArrowRight))
			{
				e.getComponent(Movement).vx = mov.speed;
			}
			if(Keyboard.isDown(GameKeys.ArrowUp))
			{
				e.getComponent(Movement).vy = -mov.speed;
			}
			if(Keyboard.isDown(GameKeys.ArrowDown))
			{
				e.getComponent(Movement).vy = mov.speed;
			}
		});
	};
};

var MovementSystem = function(){

	var self = this;

	this.queryComponents = [Position, Movement];

	this.update = function(entities, dt){
		var list = entities.filter(function(e){return e.hasComponent(self.queryComponents)});

		list.forEach(function(e){
			e.Components.Position.x += e.Components.Movement.vx * dt;
			e.Components.Position.y += e.Components.Movement.vy * dt;

			if(e.hasComponent(PlayerController))
			{
				e.Components.Movement.vx *= 0.8;
				e.Components.Movement.vy *= 0.8;
			}
		});
		
	};
};

var TaskSystem = function(){

	var self = this;

	this.queryComponents = [];

	this.update = function(entities, dt){
		var list = entities;

		list.forEach(function(e){
			e.runTask(dt);
		});
		
	};
};

var RenderSystem = function(){

	var self = this;

	this.queryComponents = [Position, Size, Visual];

	this.update = function(entities, dt){
		Draw.clearCtx(game.ctx, game.bounds.x, game.bounds.y, game.bounds.width, game.bounds.height);
		Draw.fillRect(game.ctx, game.bounds.x, game.bounds.y, game.bounds.width, game.bounds.height, {color: "#000"});
		
		var list = entities.filter(function(e){return e.hasComponent(self.queryComponents)});
		
		list.forEach(function(e){
			var visual = e.Components.Visual;

			var rect = Object.assign({}, e.Components.Position, e.Components.Size);

			if(visual.img)
			{
				Draw.drawImage(game.ctx, visual.img, {}, rect);
			}

			if(visual.color)
			{
				Draw.fillRect(game.ctx, rect.x, rect.y, rect.width, rect.height, {color: visual.color});
				
			}
		});
	};
};

var systemList = [];

systemList.push(new PlayerInputSystem());
systemList.push(new MovementSystem());
systemList.push(new TaskSystem());
systemList.push(new RenderSystem());

//list
var List = new ECS.List();

var gb = {
	x: 0,
	y: 0,
	width: 960,
	height: 600,
};

/*
var BounceTask = Obj.Task.template("BounceTask", {
	run: function(entity, delta){
		var game = gb;
		if(entity.hasComponent([Position, Movement, Size]))
		{
			var pos = entity.getComponent(Position);
			var mov = entity.getComponent(Movement);
			var size = entity.getComponent(Size);

			if(pos.x < 0 || pos.x + size.width > game.width)
			{
				mov.vx *= -1;
			}

			if(pos.y < 0 || pos.y + size.height > game.height)
			{
				mov.vy *= -1;
			}
		}
	},
});
*/
//entities
var p;
/**/
p = new ECS.Entity();
p.addComponent(Position, Utils.randomPos(gb));
p.addComponent(Size, {width: 32, height: 32});
p.addComponent(Movement, {speed: 6});
p.addComponent(Visual, {color: '#0f0'});
List.add(p);

p = new ECS.Entity();
p.addComponent(Position, Utils.randomPos(gb));
p.addComponent(Size, {width: 32, height: 32});
p.addComponent(Movement, {speed: 6, vx: 1, vy: 1});
p.addComponent(Visual, {color: '#f00'});
//p.addTask(BounceTask);
List.add(p);
/**/

p = new ECS.Entity();
p.addComponent(Position, {x: 300, y: 300});
p.addComponent(Size, {width: 32, height: 32});
p.addComponent(Movement, {speed: 6});
p.addComponent(Visual, {color: '#00f'});
p.addComponent(PlayerController);
List.add(p);
//player = p;

ECS.run = function(dt){
	systemList.forEach(function(s){
		s.update(List, 1);
	});
};