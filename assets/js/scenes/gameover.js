(function(){

	var GameOverScene = new Obj.Scene("gameover", {
		enter: function(prev_state){
			var self = this;

			self._title = "Game Over!!!";
			self._instruction = "Press [Enter] to Menu";
			self._highscore = "Score: " + ScoreRules.gameScore;

			self._tick = 0;

			self._color = '#f00';

			Entities.bullets.clear();
			Entities.enemies.clear();
			Entities.particles.clear();
			Entities.items.clear();
			Entities.texts.clear();
			Entities.ambient.clear();
			Entities.playerObjects.clear();
		},
		input: function(evt, code, ke){
			var self = this;

			if(evt == Keyboard.events.KeyDown)
			{
				if(code == GameKeys.Enter)
				{
					Sounds.play("click");
					Obj.SceneManager.change('menu');
				}
			}
		},
		update: function(delta){
			var self = this;

			backImage.update(delta);
			backImage2.update(delta);
		},
		render: function(){
			var self = this;

			var b = game.bounds;
			Draw.fillRect(game.ctx, b.x, b.y, b.width, b.height, {color: 'black'});

			backImage2.render(game.ctx, Config.debug);
			backImage.render(game.ctx, Config.debug);

			//loading
			Draw.fillText(game.ctx, self._title, b.center().x, b.center().y - 80, {color: self._color, align: 'center', fontSize: 50});
			Draw.fillText(game.ctx, self._highscore, b.center().x, b.center().y, {color: '#fff', align: 'center', fontSize: 40, valign: 'middle'});
			Draw.fillText(game.ctx, self._instruction, b.center().x, b.center().y + 40, {color: '#fff', align: 'center', fontSize: 20});
		},
		leave: function(){
			
		},
	});

	Obj.SceneManager.add(GameOverScene);

}());