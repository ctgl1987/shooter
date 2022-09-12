(function(){

	var InstructionsScene = new Obj.Scene("instructions", {
		enter: function(prev_state){
			var self = this;

			self._title = "Instructions:";

			if(!backImage)
			{
				backImage = spawnBackground(Images.get('bg'), true);
				backImage2 = spawnBackground(Images.get('bg2'), false);
            }

            self._enemy_shape = new Obj.Square({
                x: 0,
                y: 0,
                width: 32,
                height: 32,    
			});
			
            self._item_shape = new Obj.Square({
                x: 0,
                y: 0,
                width: 32,
                height: 32,    
            });
            
            self._enemies = [];
			
			for(var d in EnemyTypes)
			{	
				var item = EnemyTypes[d];
				self._enemies.push({img: item.getImage(), name: item.name, color: item.color, info: item.info});
			}

            self._powerups = [];
			
			for(var d in ItemTypes)
			{	
				var item = ItemTypes[d];
				self._powerups.push({img: item.getImage(), name: item.name});
			}

            self._instruction = "[Click] or [Enter] to continue";
		},
		input: function(evt, code, ke){

			var self = this;

			if(evt == Keyboard.events.KeyDown)
			{
				if(code == GameKeys.Enter)
				{
					Obj.SceneManager.change('play');
					Sounds.play("click");
				}
            }
            
            if(evt == 'click')
			{
				Obj.SceneManager.change('play');
                Sounds.play("click");
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
            Draw.fillText(game.ctx, self._title, b.center().x, b.y + 30, {color: 'white', align: 'center', fontSize: 50});

            Draw.fillText(game.ctx, 'Enemies:', b.center().x, b.y + 150, {color: 'white', align: 'center', fontSize: 30});
            
            var e_width = (game.bounds.width - 20) / self._enemies.length;

            var xx = 0;
            var yy = b.y + 200;
            self._enemies.forEach(function(e){
                var each = self._enemy_shape;

                each.x = xx + (e_width/2);
                each.y = yy;

                Draw.drawImage(game.ctx, e.img, {}, each, {angle: 180});
                Draw.fillText(game.ctx, e.name, each.center().x, each.bottom() + 10, {color: 'white', align: 'center', fontSize: 20});
                Draw.fillText(game.ctx, e.name, each.center().x+1, each.bottom() + 11, {color: e.color, align: 'center', fontSize: 20});

                var yy_t = each.bottom() + 40;
                e.info.forEach(function(i){

                    Draw.fillText(game.ctx, i, each.center().x, yy_t, {color: 'white', align: 'center', fontSize: 15});

                    yy_t += 25;
                });

                xx += e_width;
            });

            
            var yy2 = b.y + 400;
            Draw.fillText(game.ctx, 'PowerUps:', b.center().x, yy2, {color: 'white', align: 'center', fontSize: 30});

            var p_width = (game.bounds.width - 20) / self._powerups.length;

            var xx2 = 0;
            yy2 += 50;
            self._powerups.forEach(function(p){
                var each = self._item_shape;

                each.x = xx2 + (p_width/2);
                each.y = yy2;

                Draw.drawImage(game.ctx, p.img, {}, each);
                Draw.fillText(game.ctx, p.name, each.center().x, each.center().y + 30, {color: 'white', align: 'center', fontSize: 15});

                xx2 += p_width;
            });

            Draw.fillText(game.ctx, self._instruction, b.center().x, b.bottom() - 20, {color: '#fff', align: 'center', fontSize: 15, alpha: self._alpha});
            
		},
		leave: function(){},
	});

	Obj.SceneManager.add(InstructionsScene);

}());