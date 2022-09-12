/**
 * Data
 */

//ENEMY TASKS

//enemies
var enemyWaponFireTask = Obj.Task.template("enemyWaponFireTask", {
	init: function(entity){
		entity._fireCounter = new Obj.Counter(50);
	},
	run: function(entity){
		
		if(entity.weapon)
		{
			entity.weapon.update();
			entity._fireCounter.update();
			
			if(entity.weapon.ready() && Utils.random(0,1000) > 980 && entity._fireCounter.ended())
			{
				//create bullet and put values
				var bullets = entity.weapon.fire(entity);
				
				bullets.forEach(function(b){
					b.vy = Math.abs(b.vy);
					b.y = entity.bottom();
				});

				if(bullets.length)
				{
					Sounds.play('fire');
				}

				entity.dispatch("fireEvent", {entity: entity, bullets: bullets});

				entity._fireCounter.reset();
			}
		}
	}
});

var enemyMoveDownTask = Obj.Task.template("enemyMoveDownTask", {
	run: function(entity, delta){
		entity.vy = entity.speed.get();
		entity.vx = 0;
	},
});

var entityWaveHorizontalTask = Obj.Task.template("entityWaveHorizontalTask", {
	init: function(entity){
		
		entity.vx = entity.speed.get()/2;
		entity.vx_counter = new Obj.Counter(90);
		entity.vx_counter.start = Utils.random(0, 90);
	},
	run: function(entity, delta){
		
		entity.vx_counter.update();
		
		if(entity.vx_counter.ended() || (entity.x <= 0 || entity.right() >= game.bounds.right()))
		{
			entity.vx *= -1;
			entity.vx_counter.reset();
		}
	},
});

var enemyDropItemTask = Obj.Task.template("enemyDropItemTask", {
	init: function(entity){
		this._listen = entity.on("entityKilledEvent", function(data){
			var rand = Utils.random(0, 100);

			var drop = null;

			if(Utils.inRange(rand, 0, 5))
			{
				drop = ItemTypes.DrainLifeShot;
			}

			if(Utils.inRange(rand, 10, 15))
			{
				drop = ItemTypes.Coin;
			}

			if(Utils.inRange(rand, 20, 25))
			{
				drop = ItemTypes.Heal;
			}

			if(Utils.inRange(rand, 30, 35))
			{
				drop = ItemTypes.FastShot;
			}

			if(Utils.inRange(rand, 40, 45))
			{
				drop = ItemTypes.Freeze;
			}

			if(Utils.inRange(rand, 50, 55))
			{
				drop = ItemTypes.SilenceShot;
			}

			if(Utils.inRange(rand, 60, 65))
			{
				drop = ItemTypes.Speed;
			}

			if(Utils.inRange(rand, 70, 75))
			{
				drop = ItemTypes.Shield;
			}

			if(Utils.inRange(rand, 80, 85))
			{
				drop = ItemTypes.PoisonShot;
			}

			if(Utils.inRange(rand, 90, 92))
			{
				drop = ItemTypes.LaserWall;
			}

			if(drop != null)
			{
				var i = spawnItem(entity.center().x, entity.center().y, drop, {});
				i.centerTo(entity.center().x, entity.center().y);
			}
		});
	},
	finish: function(entity){
		this._listen.remove();
	},
});



//Enemy Type Tasks
var enemyKamikazeTask = Obj.Task.template("enemyKamikazeTask", {
	init: function(entity){

		entity._kamikaze = false;
	},
	run: function(entity){

		if(!entity._kamikaze)
		{
			var rand = Utils.random(0, 500);
			
			if(entity.y >= game.bounds.height/5 && rand >= 495)
			{
				entity.vx = 0;
				entity.vy *= 4;
				entity._kamikaze = true;
			}
		}
	},
});

var enemyStealthTask = Obj.Task.template("enemyStealthTask", {
	init: function(entity){

		this._real_image = entity.img;
		this._no_image = Images.get('empty');

		entity.color = "#ffffff00";

		entity._stealth = new Obj.reverseCounter(90);
		entity._stealth.start = 0;
		entity.vy = entity.speed.get()/2;

		entity.on("entityHurtEvent", function(){
			entity._stealth.start = 0;
			entity.img = this._real_image;
			entity.hidebar = false;
		});
	},
	run: function(entity){

		entity._stealth.update();

		var rand = Utils.random(0, 1000);

		if(!entity._stealth.ended())
		{
			entity.img = this._no_image;
			entity.hidebar = true;
		}else{
			entity.img = this._real_image;
			entity.hidebar = false;
		}

		if(entity._stealth.ended() && rand >= 995)
		{
			entity.img = this._no_image;
			entity.hidebar = true;
			entity._stealth.reset();
		}
	},
});

var enemyBossTask = Obj.Task.template("enemyBossTask", {
	init: function(entity){

		entity.isBoss = true;

		entity.scale(2);

		entity.vx = entity.speed.get();
		entity.vy = entity.speed.get()/2;
	},
	run: function(entity, delta){

		//go down
		if(entity.y <= 0)
		{
			entity.vy = entity.speed.get()/2;
			return;
		}

		//wave sides
		if(entity.x <= 0)
		{
			entity.vx *= -1;
		}

		if(entity.right() >= game.bounds.right())
		{
			entity.vx *= -1;
		}

		//wave up-down
		if(entity.y <= 0 || entity.y >= 50)
		{
			entity.vy *= -1;
		}
	},
});




//ENEMY SHOT TASKS

//poison
var poisonShotTask = Obj.Task.template("poisonShotTask", {
	init: function(entity){

		this._listen = entity.on("bulletCreated", function(data){

			var b = data.bullet;

			if(Utils.random(0, 500) >= 450 || entity.tag == 'Player')
			{
				b.color.push('#0f0');
				b.effect = function(en){
					en.addEffect(poisonEffect);
				};
			}
		});
	},
	finish: function(entity){
		this._listen.remove();
	},
});

//slow speed
var slowSpeedShotTask = Obj.Task.template("slowSpeedShotTask", {
	init: function(entity){

		this._listen = entity.on("bulletCreated", function(data){

			var b = data.bullet;

			if(Utils.random(0, 500) >= 450 || entity.tag == 'Player')
			{
				b.color.push('#ff0');
				b.effect = function(en){
					en.addEffect(slowSpeedEffect);
				};
			}
		});
	},
	finish: function(entity){
		this._listen.remove();
	},
});

//freeze
var freezeShotTask = Obj.Task.template("freezeShotTask", {
	init: function(entity){

		this._listen = entity.on("bulletCreated", function(data){

			var b = data.bullet;

			if(Utils.random(0, 500) >= 450 || entity.tag == 'Player')
			{
				b.color.push('#00f');
				b.effect = function(en){
					en.addEffect(freezeEffect);
				};
			}
		});
	},
	finish: function(entity){
		this._listen.remove();
	},
});

//silence
var silenceShotTask = Obj.Task.template("silenceShotTask", {
	init: function(entity){

		this._listen = entity.on("bulletCreated", function(data){

			var b = data.bullet;

			if(Utils.random(0, 500) >= 450 || entity.tag == 'Player')
			{
				b.color.push('#f60');
				b.effect = function(en){
					en.addEffect(silenceEffect);
				};
			}
		});
	},
	finish: function(entity){
		this._listen.remove();
	},
});

//blind
var blindShotTask = Obj.Task.template("blindShotTask", {
	init: function(entity){

		this._listen = entity.on("bulletCreated", function(data){

			var b = data.bullet;

			if(Utils.random(0, 500) >= 450 || entity.tag == 'Player')
			{
				b.color.push('gray');
				b.effect = function(en){
					en.addEffect(blindEffect);
				};
			}
		});
	},
	finish: function(entity){
		this._listen.remove();
	},
});





//PLAYER TASKS

//fire weapon
var weaponFireTask = Obj.Task.template("weaponFireTask", {
	init: function(entity){

	},
	run: function(entity){

		if(entity.weapon)
		{
			entity.weapon.update();
			
			if(entity.weapon.ready() && (Keyboard.isDown(GameKeys.Space) || Config.playerAutoFire))
			{
				var bullets = entity.weapon.fire(entity);

				bullets.forEach(function(b){
					b.vy = -Math.abs(b.vy);
					b.y = entity.y - b.height;
				});

				if(bullets.length)
				{
					Sounds.play('fire');
				}

				entity.dispatch("fireEvent", {entity: entity, bullets: bullets});
			}
		}
	},
});

//move by keyboard
var playerControlledTask = Obj.Task.template("playerControlledTask", {
	init: function(entity){
		entity.vx = entity.vx || 0;
		entity.vy = entity.vy || 0;
	},
	run: function(entity, delta){

		var sp = entity.speed.get();

		if(Keyboard.isDown(GameKeys.ArrowLeft)){entity.vx -= sp/4;}
		if(Keyboard.isDown(GameKeys.ArrowRight)){entity.vx += sp/4;}

		/*
		if(Keyboard.isDown(GameKeys.ArrowUp)){entity.vy -= sp/4;}
		if(Keyboard.isDown(GameKeys.ArrowDown)) {entity.vy += sp/4;}
		*/

		entity.vx = Utils.clamp(entity.vx, -sp, sp);
		entity.vy = Utils.clamp(entity.vy, -sp, sp);

		if(Math.abs(entity.vx) < 0.0004) entity.vx = 0;
		if(Math.abs(entity.vy) < 0.0004) entity.vy = 0;
	},
});

//shield
var playerShieldTask = Obj.Task.template("playerShieldTask", {
	init: function(entity){
		entity.width = 0;
		entity.height = 0;

		var o = entity.owner.center();
		entity.centerTo(o.x, o.y);
	},
	run: function(entity){

		if(entity.width < entity.owner.width * entity.scale)
		{
			entity.width += 4;
		}
		if(entity.height < entity.owner.height * entity.scale)
		{
			entity.height += 4;
		}

		var o = entity.owner.center();
		entity.centerTo(o.x, o.y);

		if(Keyboard.isDown(GameKeys.KeyH))
		{
			if(entity.callerEffect)
			{
				entity.callerEffect.duration = 0;
			}
			entity.removeTask("playerShieldTask");
			entity.vy = -5;
		}
	},
});


//global entities
var entityMoveTask = Obj.Task.template("entityMoveTask", {
	init: function(entity){
		entity.vx = entity.vx || 0;
		entity.vy = entity.vy || 0;
	},
	run: function(entity, delta){
		
		entity.x += entity.vx * delta;
		entity.y += entity.vy * delta;
	},
});

var entityFrictionTask = Obj.Task.template("entityFrictionTask", {
	init: function(entity){
		entity.friction = 0.8;
	},
	run: function(entity, delta){
		if(entity.tag != 'Player' || (entity.tag == 'Player' && !Keyboard.isDown(GameKeys.ArrowLeft) && !Keyboard.isDown(GameKeys.ArrowRight)))
		{
			entity.vx *= entity.friction;
		}
		
		{
			entity.vy *= entity.friction;
		}
	},
});



//others
var backImageResetTask = Obj.Task.template("backImageResetTask", {
	run: function(entity){
		if(entity.y >= entity.height)
		{
			entity.y = 0;
		}
	},
});

var deadOutsideTask = Obj.Task.template("deadOutsideTask", {
	run: function(entity){

		if(Utils.outside(game.bounds.expand(250), entity))
		{
			entity.setDead();
		}
	},
});

var deadOutsideBorderTask = Obj.Task.template("deadOutsideBorderTask", {
	run: function(entity){

		if(Utils.outside(game.bounds.expand(entity.height), entity))
		{
			entity.setDead();
		}
	},
});

var itemCollectTask = Obj.Task.template("itemCollectTask", {
	init: function(entity){
		entity.on("entityCollideEvent", function(data){
			var o = data.other;

			if(o.tag == 'Player')
			{
				entity.effect && entity.effect(o);
			}
		});
	}
});


//GOOD EFFECTS

//heals 5HP every second
var regenerationEffect = Obj.Effect.template("regenerationEffect", {
	desc: "HP Regen",
	value: 5,
	duration: 10 * 60,
	run: function(entity){
		
		if(this.duration % 60 == 0)
		{
			if(entity.health.get() < entity.health.max())
			{
				entity.health.increment(this.value);
				game.dispatch("playerHealEvent", {player: entity});
			}
		}
	}
});

//speed increased - player only
var speedBoostEffect = Obj.Effect.template("speedBoostEffect", {
	desc: "Speed Boost x2",
	duration: 10 * 60,
	init: function(entity){

		this._buff = new Obj.Modifier({
			measure: Obj.Modifier.Percent,
			value: 100
		});

		entity.speed.addMod(this._buff);
	},
    finish: function(entity){
        entity.speed.removeMod(this._buff);
    },
});

//create a shield
var playerShieldEffect = Obj.Effect.template("playerShieldEffect", {
	desc: "Shield",
	duration: 10 * 60,
	init: function(entity){

		this._shield = createShield(entity);
		this._shield.callerEffect = this;
	},
    finish: function(entity){
		this._shield.removeTask("playerShieldTask");
		this._shield.vy = -200;
    },
});



//BAD EFEFCTS

//damage 2HP every second
var poisonEffect = Obj.Effect.template("poisonEffect", {
	desc: "Poison",
	value: 2,
	duration: 5 * 60,
	run: function(entity){
		
		if(this.duration % 60 == 0)
		{
			entity.health.decrement(this.value);
			game.dispatch("poisonDamageEvent", {entity: entity});
		}
	}
});

//reduce speed
var slowSpeedEffect = Obj.Effect.template("slowSpeedEffect", {
	desc: "Speed Slow -50%",
	duration: 5 * 60,
	init: function(entity){

		this._buff = new Obj.Modifier({
			measure: Obj.Modifier.Percent,
			value: -50
		});

		entity.speed.addMod(this._buff);

		this._listen = entity.on("entityRenderEvent", function(data){
			Draw.drawImage(data.ctx, Images.get('item_web'), {}, entity.expand(10), {angle: entity.angle});
		});
	},
    finish: function(entity){
		entity.speed.removeMod(this._buff);
		this._listen.remove();
    },
});

//freeze speed
var freezeEffect = Obj.Effect.template("freezeEffect", {
	desc: "Freeze",
	duration: 3 * 60,
	init: function(entity){
		
		this._buff = new Obj.Modifier({
			measure: Obj.Modifier.Percent,
			value: -1000
		});

		entity.speed.addMod(this._buff);

		this._listen = entity.on("entityRenderEvent", function(data){
			Draw.drawImage(data.ctx, Images.get('item_freeze'), {}, entity.expand(10), {angle: entity.angle});
		});

		this._listen2 = game.on("overlayRenderEvent", function(data){
			if(entity.tag == 'Player')
			{
				var ge = game.bounds.expand(20);
				Draw.fillRect(data.ctx, ge.x, ge.y, ge.width, ge.height, {color: "#87ceeb", alpha: 0.2});
			}
		});
	},
    finish: function(entity){
		entity.speed.removeMod(this._buff);
		this._listen.remove();
		this._listen2.remove();
    },
});

//Can't shot!
var silenceEffect = Obj.Effect.template("silenceEffect", {
	desc: "Silence",
	duration: 5 * 60,
	init: function(entity){

		this._buff = new Obj.Modifier({
			measure: Obj.Modifier.Replace,
			value: 0
		});
		
		entity.weapon.can_shot.addMod(this._buff);

		this._listen = entity.on("entityRenderEvent", function(data){
			Draw.drawImage(data.ctx, Images.get('item_silence'), {}, entity.expand(10), {angle: entity.angle});
		});

		this._listen2 = game.on("overlayRenderEvent", function(data){
			if(entity.tag == 'Player')
			{
				var ge = game.bounds.expand(20);
				Draw.fillRect(data.ctx, ge.x, ge.y, ge.width, ge.height, {color: "#ff0", alpha: 0.2});
			}
		});

	},
    finish: function(entity){
		entity.weapon.can_shot.removeMod(this._buff);
		this._listen.remove();
		this._listen2.remove();
    },
});

//blind - PLAYER ONLY
var blindEffect = Obj.Effect.template("blindEffect", {
	desc: "Blind!",
	duration: 3 * 60,
	init: function(entity){

		this._listen2 = game.on("overlayRenderEvent", function(data){
			if(entity.tag == 'Player')
			{
				var ge = game.bounds.expand(20);
				Draw.fillRect(data.ctx, ge.x, ge.y, ge.width, ge.height, {color: "#000", alpha: 0.9});
			}
		});
	},
	finish: function(entity){
		this._listen2.remove();
	},
});




//PLAYER SHOT EFEFCTS

//weapon's cooldown decreased
var fastShotEffect = Obj.Effect.template("fastShotEffect", {
	desc: "Fast Shot",
	duration: 10 * 60,
	init: function(entity){

		this._buff = new Obj.Modifier({
			measure: Obj.Modifier.Percent,
			value: -50
		});

		entity.weapon.fire_rate.addMod(this._buff);
	},
    finish: function(entity){
        entity.weapon.fire_rate.removeMod(this._buff);
    },
});

//add poison to bullets
var poisonShotEffect = Obj.Effect.template("poisonShotEffect", {
	desc: "Poison Shot",
	duration: 10 * 60,
	init: function(entity){
		
		this._listen = entity.on("bulletCreated", function(data){

			var b = data.bullet;
            b.color.push('#0F0');
			b.bulletEffects.push(function(en){
				en.addEffect(poisonEffect);
			});
		});
	},
	run: function(entity){
		entity.tint.push("#0f0");
	},
	finish: function(entity){
		this._listen.remove();
	},
});

//add freeze to bullets
var freezeShotEffect = Obj.Effect.template("freezeShotEffect", {
	desc: "Freeze Shot",
	duration: 10 * 60,
	init: function(entity){

		this._listen = entity.on("bulletCreated", function(data){

			var b = data.bullet;
			b.color.push('#00F');
			b.bulletEffects.push(function(en){
				en.addEffect(freezeEffect);
			});
			
		});
	},
	run: function(entity){
		entity.tint.push("#00f");
	},
	finish: function(entity){
		this._listen.remove();
	},
});

//add silence to bullets
var silenceShotEffect = Obj.Effect.template("silenceShotEffect", {
	desc: "Slience Shot",
	duration: 10 * 60,
	init: function(entity){

		this._listen = entity.on("bulletCreated", function(data){

			var b = data.bullet;
			b.color.push('#f80');
			b.bulletEffects.push(function(en){
				en.addEffect(silenceEffect);
			});
			
		});
	},
	run: function(entity){
		entity.tint.push("#f80");
	},
	finish: function(entity){
		this._listen.remove();
	},
});

//add slow speed to bullets
var slowSpeedShotEffect = Obj.Effect.template("slowSpeedShotEffect", {
	desc: "Slow Speed Shot",
	duration: 10 * 60,
	init: function(entity){

		this._listen = entity.on("bulletCreated", function(data){

			var b = data.bullet;
			b.color.push('#ff0');
			b.bulletEffects.push(function(en){
				en.addEffect(slowSpeedEffect);
			});
			
		});
	},
	run: function(entity){
		entity.tint.push("#ff0");
	},
	finish: function(entity){
		this._listen.remove();
	},
});

//drain life
var drainLifeShotEffect = Obj.Effect.template("drainLifeShotEffect", {
	desc: "Drain Life Shot",
	duration: 10 * 60,
	init: function(entity){
		
		//add color to bullet - no effect
		this._listen = entity.on("bulletCreated", function(data){

			var b = data.bullet;
			b.color.push('purple');
		});

		//when entity hurt drain life!
		this._listen2 = game.on("entityHurtEvent", function(data){
			if(data.entity.tag != entity.tag && data.type == DamageType.Bullet && data.other.owner == entity)
			{
				entity.health.increment(data.damage/2);
			}
		});
	},
	run: function(entity){
		entity.tint.push("purple");
	},
	finish: function(entity){
		this._listen.remove();
		this._listen2.remove();
	},
});




//WEAPONS
var BasicRifle = Obj.Weapon.template("BasicRifle", {
	damage: 5,
	fire_rate: 15,
	bullet_speed: 180,
	createBullets: function(entity){

		var self = this;

		var bullets = [];

		var b = spawnBullet(entity.center().x, entity.center().y, 0, self.bullet_speed, entity, null, true);
		b.damage = self.damage;
		
		entity.dispatch("bulletCreated", {bullet: b});
		
		bullets.push(b);

		self.reload();

		return bullets;
	},
});

var ShotGun = Obj.Weapon.template("ShotGun", {
	damage: 3,
	fire_rate: 40,
	bullet_speed: 180,
	createBullets: function(entity){

		var self = this;

		var bullets = [];

		self.reload();
		
		var b = spawnBullet(entity.center().x, entity.center().y, 0, self.bullet_speed, entity, null, true);
		b.damage = self.damage;
		b.x -= 6;

		entity.dispatch("bulletCreated", {bullet: b});
		bullets.push(b);

		b = spawnBullet(entity.center().x, entity.center().y, 0, self.bullet_speed, entity, null, true);
		b.damage = self.damage;
		b.x -= 3;

		entity.dispatch("bulletCreated", {bullet: b});
		bullets.push(b);

		b = spawnBullet(entity.center().x, entity.center().y, 0, self.bullet_speed, entity, null, true);
		b.damage = self.damage;
		b.x += 3;

		entity.dispatch("bulletCreated", {bullet: b});
		bullets.push(b);

		b = spawnBullet(entity.center().x, entity.center().y, 0, self.bullet_speed, entity, null, true);
		b.damage = self.damage;
		b.x += 6;

		entity.dispatch("bulletCreated", {bullet: b});
		bullets.push(b);

		return bullets;
	},
});

var MachineGun = Obj.Weapon.template("MachineGun", {
	damage: 1,
	fire_rate: 10,
	bullet_speed: 400,
	createBullets: function(entity){

		var self = this;

		var bullets = [];

		self.reload();

		var b = spawnBullet(entity.center().x, entity.center().y, 0, self.bullet_speed, entity, null, true);
		b.damage = self.damage;
		b.x -= 15;
		b.height = 10;

		entity.dispatch("bulletCreated", {bullet: b});
		bullets.push(b);

		b = spawnBullet(entity.center().x, entity.center().y, 0, self.bullet_speed, entity, null, true);
		b.damage = self.damage;
		b.x += 15;
		b.height = 10;

		entity.dispatch("bulletCreated", {bullet: b});
		bullets.push(b);

		return bullets;
	},
});

var SniperRifle = Obj.Weapon.template("SniperRifle", {
	damage: 15,
	fire_rate: 60,
	bullet_speed: 280,
	createBullets: function(entity){

		var self = this;

		var bullets = [];

		self.reload();

		var b = spawnBullet(entity.center().x, entity.center().y, 0, self.bullet_speed, entity, null, true);
		b.damage = self.damage;
		
		b.height = 30;
		entity.dispatch("bulletCreated", {bullet: b});

		bullets.push(b);

		return bullets;
	},
});

var BossGun = Obj.Weapon.template("BossGun", {
	damage: 15,
	fire_rate: 15,
	bullet_speed: 350,
	createBullets: function(entity){

		var self = this;

		var bullets = [];

		self.reload();

		var b = spawnBullet(entity.center().x, entity.center().y, 0, self.bullet_speed, entity, null, true);
		b.damage = self.damage;
		b.height = 30;
		b.x -= 15;
		entity.dispatch("bulletCreated", {bullet: b});
		bullets.push(b);
		
		b = spawnBullet(entity.center().x, entity.center().y, 0, self.bullet_speed, entity, null, true);
		b.damage = self.damage;
		b.height = 30;
		entity.dispatch("bulletCreated", {bullet: b});
		bullets.push(b);
		
		b = spawnBullet(entity.center().x, entity.center().y, 0, self.bullet_speed, entity, null, true);
		b.damage = self.damage;
		b.height = 30;
		b.x += 15;
		entity.dispatch("bulletCreated", {bullet: b});
		bullets.push(b);

		return bullets;
	},
});

//PLAYER OBJECTS

//shield
function createShield(owner){
	var e = new Obj.Entity({
		x: 0,
		y: 0,
		tag: 'Shield',
	});

	e.img = Images.get('shield');

	e.owner = owner;

	e.scale = 3;

	e.centerTo(owner.center().x, owner.center().y);

	e.addTask(playerShieldTask);
	e.addTask(entityMoveTask);
	e.addTask(deadOutsideTask);

	e.on("entityCollideEvent", function(data){
		
		var o = data.other;

		if(o.tag == 'Bullet' && o.owner != owner)
		{
			o.kill();
		}

		if(o.tag == 'Enemy')
		{
			if(o.isBoss)
			{
				o.health.decrement(e.owner.damage * 10);
				
				e.setDead();
			}else{
				o.kill();
			}
		}
	});

	e.on("entityDeadEvent", function(entity){
		spawnFirework(e.center().x, e.center().y, {color: "white"});
	});

	Entities.playerObjects.add(e);

	return e;
}

//glow_aura
function createGlowAura(owner, img){
	var e = new Obj.Entity({
		x: 0,
		y: 0,
		tag: 'GlowAura',
	});

	//e.img = img;
	e.img = Images.get('empty');

	e.owner = owner;

	e.scale(3);

	e.rotationSpeed = 4;

	e.angle = Utils.random(0, 1080);

	e.centerTo(owner.center().x, owner.center().y);

	e.on("entityUpdateEvent", function(data){
		e.angle += e.rotationSpeed;

		if(e.angle > 1080)
		{
			e.angle = 0;
		}

		e.centerTo(owner.center().x, owner.center().y);
	});

	e.on("entityDeadEvent", function(entity){
		spawnFirework(e.center().x, e.center().y, {color: "white"});
	});

	Entities.playerObjects.add(e);

	return e;
}

//laser
function createLaser(owner){
	var e = new Obj.Entity({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		vy: -80,
		tag: 'Laser',
	});

	e.centerTo(owner.center().x, null);
	
	e.width = 8;
	e.height = owner.height;
	e.y = owner.y - e.height;

	e.img = Images.get('laser');

	e.color = '#0F0';
	e.owner = owner;

	e.damage = 10;

	e.addTask(entityMoveTask);
	e.addTask(deadOutsideBorderTask);

	e.on("entityCollideEvent", function(data){
		
		var o = data.other;

		if(o.tag == 'Bullet' && o.owner != owner)
		{
			o.kill();
		}

		if(o.tag == 'Enemy')
		{	
			o.health.decrement(e.damage);
			e.kill();
		}
	});

	e.on("entityKilledEvent", function(entity){
		game.dispatch("bulletDestroyedEvent", {bullet: e});
	});

	Entities.playerObjects.add(e);

	return e;
}

//wall laser
function createLasetWall(owner){
	var e = new Obj.Entity({
		x: 0,
		y: game.bounds.bottom(),
		width: game.bounds.width,
		height: 8,
		vy: -60,
		tag: 'LaserWall',
	});

	e.img = Images.get('laser_wall');
	e.owner = owner;

	e.addTask(entityMoveTask);
	e.addTask(deadOutsideBorderTask);

	e.on("entityCollideEvent", function(data){
		
		var o = data.other;

		if(o.tag == 'Bullet' && o.owner != owner)
		{
			o.kill();
		}

		if(o.tag == 'Enemy')
		{
			if(o.isBoss)
			{
				o.health.decrement(e.owner.damage/2);
			}else{
				o.kill();
			}
		}
	});

	e.on("entityDeadEvent", function(entity){
		//cb.remove();
	});

	Entities.playerObjects.add(e);

	return e;
}



//PLAYER
function createPlayer(x,y,w,h){
	var e = new Obj.Entity({
		x: x,
		y: y,
		width: w || 32,
		height: h || 32,
		tag: 'Player',
	});

	e.color = '#fff';
	
	e.damage = 5;
	
	e.health = new Obj.Attrib(100, 0, 100);
	e.speed = new Obj.Attrib(150, 0, 600);

	e.img = Images.get('ship_white');

	e.weapon = BasicRifle.create();

	e.addTask(weaponFireTask);
	e.addTask(playerControlledTask);
	e.addTask(entityMoveTask);
	e.addTask(entityFrictionTask);

	e.render = function(ctx, debug){
		var tint = Array.isArray(e.tint) ? Utils.pickRandom(e.tint) : e.tint;

		Draw.drawImage(ctx, e.img, {}, e, {tint: tint});

		debug && Draw.strokeRect(ctx, e.x, e.y, e.width, e.height, {color: 'white'});

		e.dispatch("entityRenderEvent", {entity: e, ctx: ctx});

		e.tint = ['#fff'];
	};

	e.on("entityUpdateEvent", function(data){
		
	});

	e.on("entityCollideEvent", function(data){
		var other = data.other;

		var damage = 0;

		if(other.tag == 'Enemy')
		{
			damage = other.health.get();

			other.kill();
		}

		if(other.tag == 'Bullet' && other.owner != e)
		{
			damage = other.damage;

			e.dispatch("entityHurtEvent", {
				entity: e,
				damage: other.damage,
				type: DamageType.Bullet,
				other: other,
			});

			other.kill();
		}

		if(other.tag == 'Item')
		{
			other.collide(e);
		}

		if(other.effect)
		{
			other.effect(e);
		}

		if(damage)
		{
			game.dispatch("playerHurtEvent", {player: e, damage: damage});
			e.health.decrement(damage);
		}

	});

	return e;
};

//ITEMS
//item
function createItem(x, y, itemType, data){

    var e = new Obj.Entity({
		x: x,
		y: y,
		vx: 0,
		vy: 0,
		width: 32,
		height: 32,
		tag: 'Item',
    });
    
    data = data || {};

	e.color = '#ff0';
	
	e.speed = new Obj.Attrib(60, 0, 60);
	e.vy = e.speed.get();

	e.addTask(entityMoveTask);
	e.addTask(entityWaveHorizontalTask);
	e.addTask(deadOutsideTask);
	e.addTask(itemCollectTask);
    
	e.itemType = itemType;

	e.img = itemType.getImage();

	e.effect = function(entity){
		e.itemType.effect(entity, e);
	};
    
	e.render = function(ctx, debug){
		Draw.drawImage(ctx, Images.get('mask_white'), {}, e.expand(20));
		Draw.drawImage(ctx, e.img, {}, e);
		debug && Draw.strokeRect(ctx, e.x, e.y, e.width, e.height, {color: 'white'});

		e.dispatch("entityRenderEvent", {entity: e, ctx: ctx});
	};

	return e;
}


//ENEMIES

//Basic
function createEnemy(x, y){
	var e = new Obj.Entity({
		x: x,
		y: y,
		width: 32,
		height: 32,
		vx: 0,
		vy: 0,
		angle: 180,
		tag: 'Enemy',
	});

	e.color = 'red';

	e.health = new Obj.Attrib(10, 0, 10);
	e.damage = e.health.get()/5;
	e.score = 10;
	e.speed = new Obj.Attrib(50, 0, 100);
	
	e.vy = e.speed.get();

	e.weapon = BasicRifle.create();

	e.addTask(enemyWaponFireTask);
	e.addTask(enemyDropItemTask);
	e.addTask(deadOutsideTask);
	e.addTask(enemyMoveDownTask);
	e.addTask(entityMoveTask);

	e.tint = ["#fff"];
	
	e.on("entityUpdateEvent", function(data){

		if(e.health.get() <= 0)
		{
			e.kill();
		}
	});

	e.on("entityRenderEvent", function(data){
		e.tint = ["#fff"];
	});

	e.on("entityCollideEvent", function(data){
		var other = data.other;
		
		if(other.tag == 'Bullet' && other.owner.tag != 'Enemy')
		{
			e.health.decrement(other.damage);

			if(other.effect)
			{
				other.effect(e);
			}

			game.dispatch("entityHurtEvent", {
				entity: e,
				damage: other.damage,
				type: DamageType.Bullet,
				other: other,
			});

			e.dispatch("entityHurtEvent", {
				entity: e,
				damage: other.damage,
				type: DamageType.Bullet,
				other: other,
			});
		
			Sounds.play('damage');
	
			if(e.health.get() <= 0)
			{
				e.kill();
			}

			other.kill();
		}		
	});

	e.on("entityKilledEvent", function(data){
		game.dispatch("enemyKilledEvent", {enemy: e});
	});

	return e;
};


//bullets
function createBullet(x, y, vx, vy, owner){
	var e = new Obj.Entity({
		x: x,
		y: y,
		vx: vx,
		vy: vy,
		width: 2,
		height: 16,
		tag: 'Bullet',
	});
	
	e.color = ['#fff'];

	e.owner = owner;

	e.damage = 1;

    e.bulletEffects = [];
    
    e.render = function(ctx, debug){
        var _color = Array.isArray(e.color) ? Utils.pickRandom(e.color) : e.color;

        Draw.fillRect(ctx, e.x, e.y, e.width, e.height, {color: _color});
        debug && Draw.strokeRect(ctx, e.x, e.y, e.width, e.height, {color: 'white'});
    };

	e.effect = function(en){
		e.bulletEffects.forEach(function(ef){
			ef(en);
		});
	};
	
	e.addTask(entityMoveTask);
	e.addTask(deadOutsideBorderTask);

	e.on("entityKilledEvent", function(){
		game.dispatch("bulletDestroyedEvent", {bullet: e});
	});

	return e;
};


//background
function createBackground(img, w, h, vx){
	var e = new Obj.Entity({
		x: 0,
		y: 0,
		vx: 0,
		vy: vx,
		width: w,
		height: h,
		tag: 'Background',
	});

	e.color = '#000';

	e.img = img;

	e.height = img.width / img.height * e.width;

	e.addTask(backImageResetTask);
	e.addTask(entityMoveTask);

	e.render = function(ctx, debug){

		Draw.drawImage(ctx, this.img, {}, this);
		debug && Draw.strokeRect(ctx, this.x, this.y, this.width, this.height, {color: 'white'});

		var b2 = this.expand(0);
		b2.y = b2.y - this.height;

		Draw.drawImage(ctx, this.img, {}, b2);
		debug && Draw.strokeRect(ctx, b2.x, b2.y, b2.width, b2.height, {color: 'white'});
	};

	return e;
}

//timed text
function createTimedText(x, y, text, duration, opt){

	opt = opt || {};

	var e = new Obj.Entity({
		x: x,
		y: y,
		tag: 'TimedText',
	});

	e.color = opt.color || 'white';

	var gap = opt.nofade ? 0 : 0.15;

	var fadeAlpha = new Obj.FadeAlpha({
		start: Math.round(duration * gap),
		end: Math.round(duration * gap),
		duration: duration,
		finish: function(){
			e.setDead();
			//infinite faded text!!!
			//fadeAlpha.reset();
		},
	});

	e.on("entityUpdateEvent", function(data){

		fadeAlpha.update();
	});

	e.render = function(ctx){

		var o = Utils.clone(opt.textOpts);

		o.alpha = fadeAlpha.alpha();
			
		Draw.fillText(ctx, text, x, y, o);
	};

	return e;
}


//particle
function Firework(x, y, opt){

	var self = this;

	var list = [];
	var rate = null;

	opt = opt || {};
	
	self.x = x;
	self.y = y;

	self.dead = false;

	self.reset = function(){

		color = opt.color || Utils.randomColor();

		list = [];
		rate = opt.rate || Utils.random(30, 50);

		for(var i = 0; i < rate; i++)
		{
			var vector = {
				angle: Utils.random(0, 360, 1),
				velocity: Utils.random(opt.minV || 40, opt.maxV || 90, 1),
				dt: Utils.random(50, 80, 1) / 1000
			};
			
			var p = {
				x: x,
				y: y,
				color: color,
				vx: 0,
				vy: 0,
				lifespan: 0.5 + Math.random() * (opt.lifespan || 4),
				age: 0,
				vector: vector,
				vx: vector.velocity * Math.cos(vector.angle) * vector.dt,
				vy: vector.velocity * Math.sin(vector.angle) * vector.dt,
				dead: false,
				update: function(){
					this.x += this.vx;
					this.y += this.vy;
					this.age += vector.dt;

					var scale = Utils.clamp(1 - (this.age / this.lifespan), 0, 1);
					if(scale == 0)
					{
						this.dead = true;
					}
				},
			};
	
			list.push(p);
		}
	
		self.max_out = Math.floor(list.length/2);
		self.last_alive = self.max_out;
	
		for(var i = self.max_out; i < list.length; i++)
		{
			var o = list[i];
			o.age = o.lifespan;
		}
	};

	self.update = function(){
		for(var i = 0; i < list.length; i++)
		{
			while(self.last_alive < self.max_out)
			{
				self.last_alive++;
				list[self.last_alive].age = 0;
				list[self.last_alive].x = self.x;
				list[self.last_alive].y = self.y;
			}

			for(var i = 0; i < list.length; i++)
			{
				list[i].update();
			}

			list = list.filter(function(p){ return !p.dead;});
		}

		if(list.length == 0)
		{
			self.dead = true;
		}
	};

	self.render = function(ctx){
		list.forEach(function(p){
			var scale = Utils.clamp(1 - (p.age / p.lifespan), 0, 1);
			//if(scale >= 1)
			{
				Draw.fillRect(ctx, p.x, p.y, 5 * scale, 5 * scale, {color: p.color});
			}
		});
	};

	self.reset();
}


//spawns

function spawnItem(x, y, itemType, data){
	var i = createItem(x, y, itemType, data);
	Entities.items.add(i);
	return i;
}

function spawnNebula(){

	var co = game.bounds.expand(50);

	var x = Utils.random(co.x, co.width);
	var y = 0;

	var e = new Obj.Entity({
		x: x,
		y: y,
		width: 100*2,
		height: 50*2,
		vy: 30,
		tag: 'Ambient',
	});

	e.img = Images.get('nebula_cloud');

	if(Utils.random(0,100) >= 33)
	{
		e.img = Images.get('nebula_dual');
	}

	if(Utils.random(0,100) >= 66)
	{
		e.img = Images.get('nebula_helix');
	}

	e.width = e.img.width;
	e.height = e.img.height;

	e.y = -e.height;

	e.addTask(entityMoveTask);
	e.addTask(deadOutsideTask);

	e.render = function(ctx, debug){
		Draw.drawImage(ctx, e.img, {}, e, {alpha: 0.5});
		debug && Draw.strokeRect(ctx, e.x, e.y, e.width, e.height, {color: 'white'});
	};

	Entities.ambient.add(e);
}

function spawnEnemy(rand){
	
	var lvlRate = ((ScoreRules.gameLevel - 1) * 5);
	
	if(rand == undefined){ rand = Utils.random(0, 1000); }

	var enemyType = EnemyTypes.Basic;	

	if(rand >= 900 - lvlRate)
	{
		enemyType = EnemyTypes.Scout;
	}

	if(rand >= 950 - lvlRate)
	{
		enemyType = EnemyTypes.Gunner;
	}
	
	if(rand >= 970 - lvlRate)
	{
		enemyType = EnemyTypes.Sniper;
	}

	if(rand >= 980 - lvlRate)
	{
		enemyType = EnemyTypes.Kamikaze;
	}
	
	if(rand >= 990 - lvlRate)
	{
		enemyType = EnemyTypes.Stealth;
	}

	if(rand > 1000)
	{
		enemyType = EnemyTypes.Boss;
	}

	var co = game.bounds.collapse(40);

	var x = Utils.random(co.x, co.width);
	var y = -40;
	var e = createEnemy(x,y);

	e.img = Images.get('ship_red');
	e.bulletImg = Images.get('bullet_gray');

	e.enemyType = enemyType;

	enemyType.create(e);

	Entities.enemies.add(e);
}

function spawnBullet(x, y, vx, vy, owner, img, center){

	var e = createBullet(x, y, vx, vy, owner);

	e.img = img;

	center && e.centerTo(owner.center().x, null);

	Entities.bullets.add(e);

	return e;
}

function spawnFirework(x, y, opt){

	Entities.particles.add(new Firework(x, y, opt));
}

function spawnBackground(img, fast){

	return createBackground(img, game.bounds.width, game.bounds.height, (fast ? 40 : 30));
}