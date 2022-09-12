(function(){
	
	//entities
	var player = null;
	
	var nextLevel = 0;
	var bossSong = null;
	var themeSong = null;
	
	//counters
	var redFlashCounter = null;
	var greenFlashCounter = null;

	var shakeScreen = null;
	
	var nebulaGenerator = null;
	var enemyGenerator = null;

	var instructions = false;

	var old_data = null;

	var intro_seq = null;
	
	//misc
	function DrawBar(ctx, txt, val, curr, max, x, y, opt)
	{	
		opt = opt || {}
		var barColor = opt.barColor || '#fff';
		var textColor = opt.textColor || '#000';
		var fontSize = opt.fontSize || 16;
		var align =  opt.align || 'center';
		var txt_x = opt.txt_x != null ? opt.txt_x : 100;
	
		var showMax = opt.showMax || false;
		
		var t = (txt ? txt + ": " : "") + curr;
	
		if(showMax)
		{
			t = t + "/" + max;
		}
	
		var percent = Math.round(val * 100 / max);
		var per = percent * 200 / 100;
		curr = Math.round(curr / 60);

		if(val == Infinity)
		{
			//per = 200;
		}
	
		Draw.fillRect(ctx, x, y, 200, 20, {color: "gray", alpha: 0.3});
		Draw.fillRect(ctx, x, y, per, 20, {color: barColor, alpha: 0.3});
	
		Draw.fillText(ctx, t, x + txt_x, y + 12, {color: textColor, align: align, valign: 'middle', fontSize: fontSize, alpha: 0.7});
	}

	function RenderEffects(ctx, effects, eff_y, _step)
	{	
		for(var i in effects)
		{
			var ef = effects[i];
			var txt = (ef.desc || ef.name);
			var dur = Math.round(ef.duration);
			var val = Math.round(dur / 60);
			var max = ef.maxDuration();
			
			DrawBar(ctx, txt, dur, val, max, 10, eff_y, {barColor: 'white', textColor:'black', align: 'left', txt_x: 4});
			eff_y += _step;
		}
	}
	
	function DrawHealthBar(ctx, entity){
	
		/**
		 * MAX - 100
		 * VAL -  ?
		 */
		var hp_percent = entity.health.get() * 100 / entity.health.max();
		/**
		 * MAX - b_width
		 * hp_p -  ?
		 */
		var bar_percent = hp_percent * entity.width / 100;
		//back
		Draw.fillRect(ctx, entity.x, entity.y - 4, entity.width, 2, {color: '#999', alpha: 1});
		//color
		Draw.fillRect(ctx, entity.x, entity.y - 4, bar_percent, 2, {color: entity.health.color(), alpha: 1});
	}
	
	function showCheatText(cheat){
	
		var textOpts = {
			color: 'white',
			align: 'center',
			valign: 'middle',
			fontSize: 20,
		};
	
		var text = "Cheat [" + cheat.code + "]: " + cheat.text;
	
		ShowTimedText(game.bounds.center().x, game.bounds.center().y, text, {duration: 120, textOpts: textOpts});
	}
	
	function ShowTimedText(x, y, text, opt)
	{
		var dur = opt.duration || 180;
	
		var tt = createTimedText(x, y, text, dur, opt);
	
		Entities.texts.add(tt);
	}
	
	function _enter(prev_state){

		ScoreRules.gameLevel = 1;
		ScoreRules.gameScore = 0;
		
		Entities.bullets.clear();
		Entities.enemies.clear();
		Entities.particles.clear();
		Entities.items.clear();
		Entities.texts.clear();
		Entities.ambient.clear();
		Entities.playerObjects.clear();

		instructions = false;

		//Config.spawnEnemies = false;
	
		//create player
		player = createPlayer(game.bounds.center().x, game.bounds.center().y);
		player.centerTo(game.bounds.center().x, null);
		player.y = game.bounds.height - player.height;

		Config.player = player;
	
		//create counters - generators
		redFlashCounter = new Obj.reverseCounter(5);
		redFlashCounter.start = 0;
	
		greenFlashCounter = new Obj.reverseCounter(5);
		greenFlashCounter.start = 0;
	
		shakeScreen = new Obj.shake(game.ctx, 10, {valX: 1, valY: 1});
		shakeScreen.start = 0;
	
		enemyGenerator = new Obj.generator({
			value: 120,
			init: function(){
				this.start = this.getValue();
			},
			condition: function(){
				return Utils.random(0, 1000) > 950 && Config.spawnEnemies && instructions;
			},
			generate: function(){
				spawnEnemy();
				this.setValue(Utils.random(this.getValue() * 0.75, this.getValue() * 1.25));
			},
		});
	
		nebulaGenerator = new Obj.generator({
			value: 600,
			init: function(){
				this.start = this.getValue();
			},
			condition: function(){
				return Utils.random(0, 1000) > 950;
			},
			generate: function(){
				spawnNebula();
				this.setValue(Utils.random(this.getValue() * 0.75, this.getValue() * 1.25));
			},
		});		
	
		bossSong = Sounds.get('boss');
	
		_events();
	
		for(var i = 0; i < 100; i++){
			var rp = Utils.randomPos(game.bounds);spawnFirework(rp.x, rp.y);
		}

		this.resume();

		var b = game.bounds;

		intro_seq = new Obj.Sequence({
			nested: true,
			data: {
				y: 0,
			},
		});
		
		/**/
		intro_seq.add({
			action: function(s){
				ShowTimedText(b.center().x, b.center().y + s.data.y, "Arrows: Move", {duration: 60 * 9, textOpts: {align: 'center', valign: 'bottom', fontSize: 30}});
				s.data.y += 40;
			},
			time: 60*2,
		});
		
		intro_seq.add({
			action: function(s){
				ShowTimedText(b.center().x, b.center().y + s.data.y, "Space: Fire", {duration: 60 * 7, textOpts: {align: 'center', valign: 'bottom', fontSize: 30}});
				s.data.y += 40;
			},
			time: 60*2,
		});
		
		intro_seq.add({
			action: function(s){
				ShowTimedText(b.center().x, b.center().y + s.data.y, "Key H: Drop Shield", {duration: 60 * 5, textOpts: {align: 'center', valign: 'bottom', fontSize: 30}});
				s.data.y += 40;
			},
			time: 60*2,
		});
		
		intro_seq.add({
			action: function(s){
				ShowTimedText(b.center().x, b.center().y + s.data.y, "Get Ready!!!", {duration: 60 * 3, textOpts: {align: 'center', valign: 'bottom', fontSize: 30}});
				s.data.y += 40;
			},
			time: 60*2,
		});

		intro_seq.add({
			action: function(s){
				instructions = true;
			},
			time: 60*3,
		});
		/**/
		
		old_data = Config.settings.get("old_data");

		if(old_data)
		{
			ScoreRules.gameLevel = old_data.gameLevel;
			ScoreRules.gameScore = old_data.gameScore;
			player.x = old_data.playerX;
			player.health.setValue(old_data.playerHealth);
			//instructions = true;
		}

		//intro_seq.run(30*1);
		instructions = true;
	}

	function _events(){

		game.on("entityHurtEvent", function(data){
			var eee = data.entity;
			var y = eee.y;
			var damage = data.damage;
			var type = data.type;
			ShowTimedText(eee.center().x, y, damage, {duration: 60, textOpts: {align: 'center', valign: 'center', fontSize: 15, color: '#fff'}});
		});

		game.on("entityHealEvent", function(data){
			var eee = data.entity;
			var y = eee.y;
			var damage = data.damage;
			var type = data.type;
			ShowTimedText(eee.center().x, y, damage, {duration: 60, textOpts: {align: 'center', valign: 'center', fontSize: 15, color: '#fff'}});
		});

		//game events
		game.on("playerHurtEvent", function(data){
			var _player = data.player;
			redFlashCounter.reset();
			shakeScreen.reset();
			Sounds.play('damage');
			spawnFirework(_player.center().x, _player.center().y, {color: _player.color, rate: Utils.random(15,25), lifespan: 1, minV: 30, maxV : 40});
		});
	
		game.on("poisonDamageEvent", function(data){
			var _player = data.entity;
			spawnFirework(_player.center().x, _player.center().y, {color: 'green'});
			Sounds.play('damage');
			if(_player.tag == 'Player')
			{
				greenFlashCounter.reset();
				shakeScreen.reset();
			}
		});
	
		game.on("playerHealEvent", function(data){
			Sounds.play('heal');
		});
		
		game.on("enemyKilledEvent", function(data){
			var _enemy = data.enemy;
	
			Sounds.play('explosion');
	
			ScoreRules.gameScore += _enemy.score;
	
			if(_enemy.isBoss)
			{
				bossSong && bossSong.stop();
			}
	
			spawnFirework(_enemy.center().x, _enemy.center().y, {color: _enemy.color});
		});
	
		game.on("bulletDestroyedEvent", function(data){
			var _bullet = data.bullet;
			spawnFirework(_bullet.center().x, _bullet.center().y, {color: 'white', rate: Utils.random(15,25), lifespan: 1, minV: 30, maxV : 40});
		});
	
		game.on("bossSpawnEvent", function(data){
			var b = game.bounds.collapse(10);
			bossSong.play();
			ShowTimedText(b.center().x, b.center().y, "Boss Arrives!!!", {duration: 180, textOpts: {align: 'center', valign: 'top', fontSize: 30}});
		});
	
	
		/**
		 * CHEATS
		 */
		Obj.CheatManager.add(new Obj.Cheat({
			code: 'healme',
			text: "HP AT MAX!!!",
			action: function(){
				player.health.setValue(player.health.max());
	
				showCheatText(this);
			},
		}));
		
		Obj.CheatManager.add(new Obj.Cheat({
			code: 'noenemy',
			text: "No Enemies Spawn!!!",
			action: function(){
				Config.spawnEnemies = !Config.spawnEnemies;
	
				showCheatText(this);
			},
		}));
	
		Obj.CheatManager.add(new Obj.Cheat({
			code: 'kill',
			text: "Kill'em'all!!!",
			action: function(){			
				Entities.enemies.forEach(function(e){
					e.kill();
				});
				Entities.bullets.delete(function(e){ return e.owner != player; });
	
				showCheatText(this);
			},
		}));
	
		Obj.CheatManager.add(new Obj.Cheat({
			code: 'poisonme',
			text: "You are poisoned!!!",
			action: function(){
				player.addEffect(poisonEffect);
	
				showCheatText(this);
			},
		}));
	
		Obj.CheatManager.add(new Obj.Cheat({
			code: 'coverme',
			text: "You have a shield!!!",
			action: function(){
				player.addEffect(playerShieldEffect);
				showCheatText(this);
			},
		}));

		Obj.CheatManager.add(new Obj.Cheat({
			code: 'rifle',
			text: "BasicRifle!",
			action: function(){
				player.weapon = BasicRifle.create();
				showCheatText(this);
			},
		}));

		Obj.CheatManager.add(new Obj.Cheat({
			code: 'machinegun',
			text: "Machine-gun Man!",
			action: function(){
				player.weapon = MachineGun.create();
				showCheatText(this);
			},
		}));

		Obj.CheatManager.add(new Obj.Cheat({
			code: 'sniper',
			text: "Sniper Man!",
			action: function(){
				player.weapon = SniperRifle.create();
				showCheatText(this);
			},
		}));

		Obj.CheatManager.add(new Obj.Cheat({
			code: 'shotgun',
			text: "Shotgun Man!",
			action: function(){
				player.weapon = ShotGun.create();
				showCheatText(this);
			},
		}));
	
		Obj.CheatManager.add(new Obj.Cheat({
			code: 'godmode',
			text: "You are a GOD!!!",
			action: function(){
				player.addEffect(fastShotEffect);
				player.addEffect(silenceShotEffect);
				player.addEffect(poisonShotEffect);
				player.addEffect(freezeShotEffect);
				player.addEffect(slowSpeedShotEffect);

				player.addEffect(speedBoostEffect);
				player.addEffect(playerShieldEffect);
				player.addEffect(regenerationEffect);
				player.addEffect(drainLifeShotEffect);

				showCheatText(this);
			},
		}));
	}
	
	function _input(evt, code, ke)
	{
		if(evt == Keyboard.events.KeyDown)
		{
			//key press events
			Config.debug && console.log(code, evt, ke);
	
			//pause
			if(code == GameKeys.Escape)
			{
				Obj.SceneManager.change('pause');
			}
	
			//mute
			if(code == GameKeys.KeyM)
			{
				Sounds.toggle();
			}
	
			//autofire
			if(code == GameKeys.KeyF)
			{
				Config.playerAutoFire = !Config.playerAutoFire;
			}	
	
			//debug
			if(code == GameKeys.KeyD)
			{
				Config.debug = !Config.debug;
			}
			console.log("llego??");

			Obj.CheatManager.capture(ke.key);
		}
	}
	
	function _update(delta){

		intro_seq.update();
	
		nextLevel = ScoreRules.Calculate(ScoreRules.gameLevel);
		
		if(ScoreRules.gameScore >= nextLevel)
		{
			ScoreRules.gameLevel++;
			var b = game.bounds.collapse(10);
			ShowTimedText(b.center().x, b.center().y, "Level " + ScoreRules.gameLevel, {duration: 180, textOpts: {align: 'center', valign: 'bottom', fontSize: 30}});
			
			if(ScoreRules.gameLevel % 5 == 0)
			{
				spawnEnemy(1001);
			}
		}
	
		Utils.keepInside(player, game.bounds.collapse(10));
	
		//counters
		redFlashCounter.update();
		greenFlashCounter.update();

		shakeScreen.update();
	
		//spawn enemies
		enemyGenerator.update();
		//spawn clouds
		nebulaGenerator.update();
	
		//background
		backImage.update(delta);
		backImage2.update(delta);
	
		//update player
		player.update(delta);
		Entities.bullets.update(delta);
		Entities.enemies.update(delta);
		Entities.particles.update(delta);
		Entities.items.update(delta);
		Entities.texts.update(delta);
		Entities.ambient.update(delta);
		Entities.playerObjects.update(delta);
		
		var playerBullets = Entities.bullets.findAll(function(i){ return i.owner == player});
		var enemyBullets = Entities.bullets.findAll(function(i){ return i.owner != player});
		
		enemyBullets.forEach(function(e_bu){
	
			if(!e_bu.dead)
			{
				//player react to enemyBullet
				player.collide(e_bu);
	
				Entities.playerObjects.forEach(function(po){
	
					if(!po.dead)
					{
						//playerObject react to enemyBullet
						po.collide(e_bu);
					}
				});
			}
		});
		
		playerBullets.forEach(function(p_bu){
	
			Entities.enemies.forEach(function(en){
				if(!en.dead && !p_bu.dead)
				{
					//playerBullet to enemy
					en.collide(p_bu);
				}
			});
		});
	
		Entities.playerObjects.forEach(function(po){
			
			Entities.enemies.forEach(function(en){
				if(!en.dead && !po.dead)
				{
					//playerObject react to enemy
					po.collide(en);
				}
			});
		});
	
		Entities.enemies.forEach(function(en){
	
			if(!en.dead)
			{
				//player react to enemy
				player.collide(en);
			}		
		});
	
		Entities.items.forEach(function(it){
			if(!it.dead)
			{
				//items collide with player
				it.collide(player);
			}
		});
		
	
		if(player.health.get() == 0 && player.tag == 'Player')
		{
			Sounds.play("explosion");
			spawnFirework(player.center().x, player.center().y, {color: '#f00'});
			spawnFirework(player.center().x + 50, player.center().y, {color: '#f00'});
			spawnFirework(player.center().x - 50, player.center().y, {color: '#f00'});
			player.removeTask(playerControlledTask);
			player.removeTask(weaponFireTask);
			//player.width = player.height = 0;
			player.tag = 'none';
			Obj.SceneManager.change("gameover");
		}	
	
		//clean dead entites
		Entities.bullets.delete(function(x){ return x.dead;});
		Entities.enemies.delete(function(x){ return x.dead;});
		Entities.particles.delete(function(x){ return x.dead;});
		Entities.items.delete(function(x){ return x.dead;});
		Entities.texts.delete(function(x){ return x.dead;});
		Entities.ambient.delete(function(x){ return x.dead;});
		Entities.playerObjects.delete(function(x){ return x.dead;});
	}
	
	function _render(){

		var ge = game.bounds.expand(30);
	
		//background
		Draw.clearCtx(game.ctx, ge.x, ge.y, ge.width, ge.height);
		
		//game.canvas.width = game.canvas.width;
		
		backImage2.render(game.ctx, Config.debug);
		backImage.render(game.ctx, Config.debug);
	
		//ambient
		Entities.ambient.forEach(function(am){
			am.render(game.ctx, Config.debug);
		});
			
		//player
		player.render(game.ctx, Config.debug);
		DrawHealthBar(game.ctx, player);
	
		//enemies
		Entities.enemies.forEach(function(en){
			en.render(game.ctx, Config.debug);
			!en.hidebar && DrawHealthBar(game.ctx, en);
		});
	
		//bullets
		Entities.bullets.forEach(function(bu){
            bu.render(game.ctx, Config.debug);
		});
		
		//items
		Entities.items.forEach(function(it){
			it.render(game.ctx, Config.debug);
		});
	
		//texts
		Entities.texts.forEach(function(tx){
			tx.render(game.ctx, Config.debug);
		});
	
		//playerObjects
		Entities.playerObjects.forEach(function(po){
			po.render(game.ctx, Config.debug);
		});
	
		//particles
		Entities.particles.forEach(function(pa){
			pa.render(game.ctx);
		});

		game.dispatch('overlayRenderEvent', {ctx: game.ctx});

		//player hurt flash
		if(!redFlashCounter.ended())
		{
			Draw.fillRect(game.ctx, ge.x, ge.y, ge.width, ge.height, {color: "#f00", alpha: 0.2});
		}
	
		//player poison flash
		if(!greenFlashCounter.ended())
		{
			Draw.fillRect(game.ctx, ge.x, ge.y, ge.width, ge.height, {color: "#0f0", alpha: 0.2});
		}
	

		Draw.clearCtx(game.ctxUI, ge.x, ge.y, ge.width, ge.height);

		//player hp
		DrawBar(game.ctxUI, "", player.health.percent(), player.health.get(), player.health.max(), 10, 10, {barColor: player.health.color(), textColor:'black', fontSize: 20, showMax: 1});
			
		//player effects
		RenderEffects(game.ctxUI, player._effects, 35, 25);
	
		//Level - Score
		Draw.fillText(game.ctxUI, "Level: " + ScoreRules.gameLevel, 10, game.bounds.bottom() - 25, {color: 'white', align: 'left', fontSize: 20, alpha: 0.5});
		Draw.fillText(game.ctxUI, "Score: " + ScoreRules.gameScore, game.bounds.center().x, 10, {color: 'white', align: 'center', fontSize: 20, alpha: 0.5});
		Draw.fillText(game.ctxUI, "Next Level: " + nextLevel, game.bounds.right() - 10, game.bounds.bottom() - 25, {color: 'white', align: 'right', fontSize: 20, alpha: 0.5});
		
		var b = game.bounds.collapse(10);
		//sound
		Draw.fillText(game.ctxUI, "Sound (M)", b.right(), b.y, {color:(Sounds.isEnabled() ? 'green' :'gray'), align: 'right', fontSize: 14});
		//autofire
		Draw.fillText(game.ctxUI, "Autofire (F)", b.right(), b.y + 20, {color: (Config.playerAutoFire ? 'green' :'gray'), align: 'right', fontSize: 14});
		//autofire
		Draw.fillText(game.ctxUI, "Debug (D)", b.right(), b.y + 40, {color: (Config.debug ? 'green' :'gray'), align: 'right', fontSize: 14});
	}
	
	function _on_pause(){
		//themeSong.get().pause();
	}

	function _on_resume(){
		//themeSong.get().play();
	}

	function _leave(){

		var data = {
			gameLevel: ScoreRules.gameLevel,
			gameScore: ScoreRules.gameScore,
			playerX: Config.player.x,
			playerHealth: Config.player.health.get(),
		};

		if(data.playerHealth != 0)
		{
			Config.settings.set("old_data", data);
			Config.settings.save();
		}

		intro_seq.stop();
		intro_seq = null;

		bossSong.stop();
		//themeSong.stop();

		bossSong = null;
		//themeSong = null;

		Config.player = null;
	}
	
	var PlayScene = new Obj.Scene("play", {
		enter: _enter,
		leave: _leave,
		input: _input,
		update: _update,
		render: _render,
		onPause: _on_pause,
		onResume: _on_resume,
	});
	
	Obj.SceneManager.add(PlayScene);

}());