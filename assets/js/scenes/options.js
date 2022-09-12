(function(){

	var OptionsScene = new Obj.Scene("options", {
		enter: function(prev_state){
			var self = this;

			self._title = "Options";
			self._buttons = new Obj.ButtonList([
				new Obj.Button({
					getText: function(state){
						return 'Sound (M): ' + (state ? 'On' : 'Off');
					},
					getState: function(){
						return Sounds.isEnabled();
					},
					action: function(){
						Sounds.toggle();
						Sounds.play("click");
					},
					center: true,
				}),
				new Obj.Button({
					getText: function(state){
						return 'AutoFire (F) :' + (state ? 'On' : 'Off');
					},
					getState: function(){
						return Config.playerAutoFire;
					},
					action: function(){
						Config.playerAutoFire = !Config.playerAutoFire;
						Sounds.play("click");
					},
					center: true,
				}),
				new Obj.Button({
					getText: function(state){
						return 'Clear Data (C)';
					},
					getState: function(){
						return Config.settings.get("old_data");
					},
					action: function(){
						Config.settings.clear();
						Config.settings.save();
						Sounds.play("click");
					},
					isEnabled: function(){
						return Config.settings.get("old_data");
					},
					center: true,
				}),
				new Obj.Button({
					empty: true,
				}),
				new Obj.Button({
					getText: function(state){
						return 'Back (Escape)';
					},
					getState: function(){
						return 1;
					},
					action: function(){
						Obj.SceneManager.change('menu');
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
				if(code == GameKeys.Escape)
				{
					Obj.SceneManager.change('menu');
					Sounds.play("click");
				}

				if(code == GameKeys.KeyM)
				{
					Sounds.toggle();
					Sounds.play("click");
				}

				if(code == GameKeys.KeyF)
				{
					Config.playerAutoFire = !Config.playerAutoFire;
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
		},
		render: function(){
			var self = this;

			var b = game.bounds;
			Draw.fillRect(game.ctx, b.x, b.y, b.width, b.height, {color: 'black'});

			backImage2.render(game.ctx, Config.debug);
			backImage.render(game.ctx, Config.debug);

			//loading
			Draw.fillText(game.ctx, self._title, b.center().x, b.center().y / 2, {color: self._color, align: 'center', fontSize: 50});

			var yy = b.center().y;

			self._buttons.render(game.ctx, b.center().x, yy);
		},
		leave: function(){},
	});

	Obj.SceneManager.add(OptionsScene);

}());