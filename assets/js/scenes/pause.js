(function(){

	var prev = null;
	
	var PauseScene = new Obj.Scene("pause", {
		enter: function(prev_scene){
			var self = this;

			prev = prev_scene;

			self._title = "Pause";

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
						return 'AutoFire (F): ' + (state ? 'On' : 'Off');
					},
					getState: function(){
						return Config.playerAutoFire;
					},
					action: function(){
						Config.playerAutoFire = !Config.playerAutoFire;
						Sounds.play("click");
					},
					center: true,
				}),new Obj.Button({
					empty: true,
				}),
				new Obj.Button({
					getText: function(state){
						return 'Resume (Escape)';
					},
					getState: function(){
						return 1;
					},
					action: function(){
						Obj.SceneManager.change('play');
						Sounds.play("click");
					},
					center: true,
				}),
				new Obj.Button({
					getText: function(state){
						return 'Menu (R)';
					},
					getState: function(){
						return 1;
					},
					action: function(){
						prev.leave();
						Obj.SceneManager.change('menu');
						Sounds.play("click");
					},
					center: true,
				}),
			]);

			self._color = '#ff0';
		},
		input: function(evt, code, ke){
			var self = this;

			if(evt == Keyboard.events.KeyDown)
			{
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

				if(code == GameKeys.Escape)
				{
					Obj.SceneManager.change("play");
				}

				if(code == GameKeys.KeyR)
				{
					prev.leave();
					Obj.SceneManager.change("menu");
				}
			}

			self._buttons.input(evt, code, ke);
		},
		update: function(delta){
			var self = this;
			self._buttons.update();
		},
		render: function(){

			var self = this;

			prev.render();

			var b = game.bounds;

			Draw.fillRect(game.ctx, b.x, b.y, b.width, b.height, {color: "#000", alpha: 0.8});

			Draw.fillText(game.ctx, self._title, b.center().x, b.center().y - 80, {color: self._color, align: 'center', fontSize: 50});
			
			var yy = b.center().y;
			self._buttons.render(game.ctx, b.center().x, yy);
		},
		isTemporal: function(){
			return true;
		},
	});

	Obj.SceneManager.add(PauseScene);

}());