(function(){

	var IntroScene = new Obj.Scene("intro", {
		enter: function(prev_state){
			var self = this;

			self._title1 = "Made By";
			self._title2 = "Pirulo";
			self._instruction = "[Click] or [Enter] to skip Intro";

			self._tick = 0;

			self._duration = 180;

			self._color = '#0099ff';

			self._alpha = 0;

			self._fade = new Obj.FadeAlpha({
				start: Math.round(self._duration * 0.25),
				end: Math.round(self._duration * 0.25),
				duration: self._duration,
				finish: function(){
					setTimeout(function(){
						self.finishIntro();
					}, 500);
				},
			});
		},
		finishIntro: function(){
			Obj.SceneManager.change('menu');
		},
		input: function(evt, code, ke){

			var self = this;

			if(evt == Keyboard.events.KeyUp)
			{
				if(code == GameKeys.Enter)
				{
					self.finishIntro();
				}
			}
			if(evt == 'click')
			{
				self.finishIntro();
			}
		},
		update: function(delta){
			var self = this;

			self._fade.update();

			self._alpha = self._fade.alpha();
		},
		render: function(){
			var self = this;

			var b = game.bounds;
			Draw.fillRect(game.ctx, b.x, b.y, b.width, b.height, {color: 'black'});

			//title1
			Draw.fillText(game.ctx, self._title1, b.center().x, b.center().y - 30, {color: self._color, align: 'center', fontSize: 25, alpha: self._alpha});

			//title2
			Draw.fillText(game.ctx, self._title2, b.center().x, b.center().y + 30, {color: self._color, align: 'center', fontSize: 45, alpha: self._alpha});

			Draw.fillText(game.ctx, self._instruction, b.center().x, b.bottom() - 20, {color: '#fff', align: 'center', fontSize: 15, alpha: self._alpha});
		},
		leave: function(){},
	});

	Obj.SceneManager.add(IntroScene);

}());