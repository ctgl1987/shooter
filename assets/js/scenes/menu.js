(function(){

	var MenuScene = new Obj.Scene("menu", {
		enter: function(prev_state){
			var self = this;

			self._title = "Shooter V2.0";

			self._buttons = new Obj.ButtonList([
				new Obj.Button({
					getText: function(state){
						return 'New Game (Enter)';
					},
					getState: function(){
						return 1;
					},
					action: function(){
						Config.settings.clear();
						Config.settings.save();
						Obj.SceneManager.change('instructions');
						Sounds.play("click");
					},
					center: true,
				}),
				new Obj.Button({
					getText: function(state){
						return 'Continue (C)';
					},
					getState: function(){
						return 1;
					},
					action: function(){
						Obj.SceneManager.change('play');
						Sounds.play("click");
					},
					isEnabled: function(){
						return Config.settings.get("old_data");
					},
					center: true,
				}),
				new Obj.Button({
					getText: function(state){
						return 'Options (O)';
					},
					getState: function(){
						return 1;
					},
					action: function(){
						Obj.SceneManager.change('options');
						Sounds.play("click");
					},
					center: true,
				}),
			]);

			self._tick = 0;

			self._color = Utils.randomColor();

			if(!backImage)
			{
				backImage = spawnBackground(Images.get('bg'), true);
				backImage2 = spawnBackground(Images.get('bg2'), false);
			}
		},
		input: function(evt, code, ke){

			var self = this;

			if(evt == Keyboard.events.KeyDown)
			{
				if(code == GameKeys.Enter)
				{
					Config.settings.clear();
					Obj.SceneManager.change('instructions');
					Sounds.play("click");
				}

				if(code == GameKeys.KeyC)
				{
					Obj.SceneManager.change('instructions');
					Sounds.play("click");
				}

				if(code == GameKeys.KeyO)
				{
					Obj.SceneManager.change('options');
					Sounds.play("click");
				}
			}

			self._buttons.input(evt, code, ke);
		},
		update: function(delta){
			var self = this;

			self._tick++;

			if(self._tick % 10 == 0)
			{
				self._color = Utils.randomColor();
			}

			backImage.update(delta);
			backImage2.update(delta);

			self._buttons.update();

			Entities.particles.update(delta);
			Entities.particles.delete(function(x){ return x.dead;});
		},
		render: function(){
			var self = this;

			var b = game.bounds;
			Draw.fillRect(game.ctx, b.x, b.y, b.width, b.height, {color: 'black'});

			backImage2.render(game.ctx, Config.debug);
			backImage.render(game.ctx, Config.debug);

			Entities.particles.forEach(function(pa){
				pa.render(game.ctx);
			});

			//loading
			Draw.fillText(game.ctx, self._title, b.center().x, b.center().y / 2, {color: self._color, align: 'center', fontSize: 50});
			
			var yy = b.center().y;
			self._buttons.render(game.ctx, b.center().x, yy);
		},
		leave: function(){},
	});

	Obj.SceneManager.add(MenuScene);

}());