var game = null;

//config
var Config = {
	playerAutoFire: false,
	debug: false,
	spawnEnemies: true,
	settings: null,
	showFPS: true,
};

//game keys
var GameKeys = {
	Enter: 13,
	Escape: 27,
	Space: 32,

	ArrowLeft: 37,
	ArrowUp: 38,
	ArrowRight: 39,
	ArrowDown: 40,

	KeyC: 67,
	KeyD: 68,
	KeyF: 70,
	KeyH: 72,
	KeyM: 77,
	KeyO: 79,
	KeyP: 80,
	KeyR: 82,
};

var EnemyTypes = {
	Basic: {
		name: 'Basic',
		color: 'red',
		info: ['Normal Enemy'],
		getImage: function(){
			return Images.get('ship_red');
		},
		create: function(e){
			
		}
	},
	Scout: {
		name: 'Scout',
		color: 'green',
		info: ['Poison on collide', 'Poison Shot'],
		getImage: function(){
			return Images.get('ship_green');
		},
		create: function(e){

			e.weapon = BasicRifle.create();
			
			e.img = this.getImage();
			
			e.color = this.color;
			
			e.health = new Obj.Attrib(20, 0, 20);
			e.damage = e.health.get()/5;
			e.score = 20;
			
			e.weapon = BasicRifle.create();

			e.removeTask("enemyMoveDownTask");
			e.addTask(entityWaveHorizontalTask);
			e.addTask(poisonShotTask);

			e.effect = function(en){
				en.addEffect(poisonEffect);
			};
		}
	},
	Gunner: {
		name: 'Gunner',
		color: 'yellow',
		info: ['Slow Speed on collide', 'Slow Speed Shot'],
		getImage: function(){
			return Images.get('ship_yellow');
		},
		create: function(e){
			
			e.img = this.getImage();
			
			e.color = this.color;
			
			e.health = new Obj.Attrib(30, 0, 30);
			e.damage = e.health.get()/5;
			e.score = 30;
			
			e.weapon = ShotGun.create();

			e.removeTask("enemyMoveDownTask");
			e.addTask(entityWaveHorizontalTask);
			e.addTask(slowSpeedShotTask);

			e.effect = function(en){
				en.addEffect(slowSpeedEffect);
			};
		}
	},
	Sniper: {
		name: 'Sniper',
		color: 'blue',
		info: ['Freeze on collide', 'Freeze Shot'],
		getImage: function(){
			return Images.get('ship_blue');
		},
		create: function(e){

			e.img = this.getImage();

			e.color = this.color;

			e.health = new Obj.Attrib(30, 0, 30);
			e.damage = e.health.get()/5;
			e.score = 30;
			
			e.weapon = SniperRifle.create();

			e.removeTask("enemyMoveDownTask");
			e.addTask(entityWaveHorizontalTask);
			e.addTask(freezeShotTask);

			e.effect = function(en){
				en.addEffect(freezeEffect);
			};
		}
	},
	Kamikaze: {
		name: 'Kamikase',
		color: 'orange',
		info: ['Silence on collide', 'Silence Shot', 'Kamikaze!!!'],
		getImage: function(){
			return Images.get('ship_orange');
		},
		create: function(e){

			e.img = this.getImage();

			e.color = this.color;

			e.health = new Obj.Attrib(30, 0, 30);
			e.damage = e.health.get()/5;
			e.score = 30;
			
			e.weapon = MachineGun.create();

			e.removeTask("enemyMoveDownTask");
			e.addTask(entityWaveHorizontalTask);
			e.addTask(enemyKamikazeTask);
			e.addTask(silenceShotTask);

			e.effect = function(en){
				en.addEffect(silenceEffect);
			};
		}
	},
	Stealth: {
		name: 'Stealth',
		color: 'gray',
		info: ['Blind on collide', 'Blind Shot', 'Stealth!!!'],
		getImage: function(){
			return Images.get('ship_gray');
		},
		create: function(e){

			e.img = this.getImage();

			e.color = this.color;

			e.health = new Obj.Attrib(40, 0, 40);
			e.damage = e.health.get()/5;
			e.score = 40;
			
			e.weapon = MachineGun.create();

			e.removeTask("enemyMoveDownTask");
			e.addTask(entityWaveHorizontalTask);
			e.addTask(enemyStealthTask);
			e.addTask(blindShotTask);

			e.effect = function(en){
				en.addEffect(blindEffect);
			};
		}
	},
	Boss: {
		name: 'Boss',
		color: 'purple',
		info: ['The BOSS!!!'],
		getImage: function(){
			return Images.get('ship_purple');
		},
		create: function(e){

			e.img = this.getImage();

			e.color = this.color;

			e.health = new Obj.Attrib(300, 0, 300);
			e.damage = e.health.get()/20;
			e.score = 300;

			e.weapon = BossGun.create();

			e.weapon.damage = e.damage;

			e.removeTask("enemyMoveDownTask");
			e.addTask(enemyBossTask);

			game.dispatch("bossSpawnEvent", {enemy: e});
		}
	},
};

var DamageType = {
	Poison: {color: 'green'},
	Bullet: {color: 'red'},
};

var ItemTypes = {
	Coin: {
		name: 'Coin',
		value: 50,
		getImage: function(){
			return Images.get('item_coin');
		},
		effect: function(entity, e){
			ScoreRules.gameScore += this.value;
			e.setDead();
		}
	},
	Heal: {
		name: 'Heal',
		value: 10,
		getImage: function(){
			return Images.get('item_heart');
		}, 
		effect: function(entity, e){
			entity.health.increment(this.value);
			game.dispatch("playerHealEvent", {player: entity});
			e.setDead();
		}
	},
	PoisonShot: {
		name: 'Poison Shot',
		getImage: function(){
			return Images.get('item_poison_shot');
		}, 
		effect: function(entity, e){
			entity.addEffect(poisonShotEffect);
			e.setDead();
		}
	},
	Speed: {
		name: 'Speed',
		getImage: function(){
			return Images.get('item_speed');
		}, 
		effect: function(entity, e){
			entity.addEffect(speedBoostEffect);
			e.setDead();
		}
	},
	SlowSpeed: {
		name: 'Slow Speed',
		getImage: function(){
			return Images.get('item_web');
		}, 
		effect: function(entity, e){
			entity.addEffect(slowSpeedShotEffect);
			e.setDead();
		}
	},
	Shield: {
		name: 'Shield',
		getImage: function(){
			return Images.get('item_shield');
		}, 
		effect: function(entity, e){
			entity.addEffect(playerShieldEffect);
			e.setDead();
		}
	},
	Freeze: {
		name: 'Freeze',
		getImage: function(){
			return Images.get('item_freeze');
		}, 
		effect: function(entity, e){
			entity.addEffect(freezeShotEffect);
			e.setDead();
		}
	},
	LaserWall: {
		name: 'Laser Wall',
		getImage: function(){
			return Images.get('item_laser_wall');
		}, 
		effect: function(entity, e){
			createLasetWall(entity);
			e.setDead();
		}
	},
	FastShot: {
		name: 'Fast Shot',
		getImage: function(){
			return Images.get('item_fast_shot');
		}, 
		effect: function(entity, e){
			entity.addEffect(fastShotEffect);
			e.setDead();
		}
	},
	SilenceShot: {
		name: 'Silence Shot',
		getImage: function(){
			return Images.get('item_silence');
		}, 
		effect: function(entity, e){
			entity.addEffect(silenceShotEffect);
			e.setDead();
		}
	},
	DrainLifeShot: {
		name: 'Drain Life',
		getImage: function(){
			return Images.get('item_drain_life');
		}, 
		effect: function(entity, e){
			entity.addEffect(drainLifeShotEffect);
			e.setDead();
		}
	}
};

var ScoreRules = {
	Base: 300,
	Multiplier: 1.5,
	Calculate: function(lvl){
		return parseInt(this.Base * Math.pow(lvl, this.Multiplier));
	},
	gameLevel: 1,
	gameScore: 0,
};

var Entities = {
	enemies: null,
	bullets: null,
	particles: null,
	items: null,
	texts: null,
	ambient: null,
	playerObjects: null,
};

var MousePos = {
	x: 0,
	y: 0,
	down: false,
	click: false,
};

var backImage = null;
var backImage2 = null;

//game methods
function _preload(){
	//ctx
	game.ctx.imageSmoothingEnabled = false;

	Config.settings = new Obj.Settings({
		old_data: null,
	});

	Config.settings.load();

	Entities.enemies = new Obj.EntityList();
	Entities.bullets = new Obj.EntityList();
	Entities.particles = new Obj.EntityList();
	Entities.items = new Obj.EntityList();
	Entities.texts = new Obj.EntityList();
	Entities.ambient = new Obj.EntityList();
	Entities.playerObjects = new Obj.EntityList();
}

var game = new GameEngine({
	canvas: document.querySelector("#game_canvas"),
	uicanvas: document.querySelector("#ui_canvas"),
	width: 960,
	height: 600,
	fps: 60,
	init: function(){
		_preload();

		var wrapper = document.querySelector(".game_container");
		wrapper.style.width = game.canvas.width + "px";
		wrapper.style.height = game.canvas.height + "px";

		//init mouse
		Mouse.init(function(evt, code, e){
			Obj.SceneManager.input(evt, code, e);
		}, wrapper, true);

		//init keyboard
		Keyboard.init(function(evt, code, e){
			Obj.SceneManager.input(evt, code, e);
		});

		Obj.SceneManager.change("load");

	},
	update: function(dt){
		Obj.SceneManager.update(dt);
		//ECS.run(dt);
	},
	render: function(dt){
		Obj.SceneManager.render(dt);

		if(Config.showFPS)
		{
			game.printFPS(game.ctx, 2, 2);
		}
	},
});

document.addEventListener("DOMContentLoaded", function(){
	game.start();
});

