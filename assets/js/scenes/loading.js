(function(){

	var LoadingScene = new Obj.Scene("load", {
		enter: function(prev_state){

			var self = this;

			var sound_list = [
				{type: 'audio', name: "click", src: "assets/sounds/click.wav"},
				{type: 'audio', name: "heal", src: "assets/sounds/heal.wav"},
				{type: 'audio', name: "fire", src: "assets/sounds/FireShotGood.wav", opt: {volume: 0.4, size: 20}},
				{type: 'audio', name: "explosion", src: "assets/sounds/explosion.mp3"},
				{type: 'audio', name: "switch", src: "assets/sounds/switch.mp3"},
				{type: 'audio', name: "damage", src: "assets/sounds/damage.ogg"},
				{type: 'audio', name: "boss", src: "assets/sounds/boss.mp3", opt: {size: 1, loop: true}},
			];

			var image_list = [
				{type: 'image', name: 'empty', src: 'assets/images/empty.png'},

				{type: 'image', name: 'bg', src: 'assets/images/background.png'},
				{type: 'image', name: 'bg2', src: 'assets/images/background_4.png'},
				
				{type: 'image', name: 'ship_white', src: 'assets/images/ship_white.png'},

				
				{type: 'image', name: 'ship_red', src: 'assets/images/ship_red.png'},
				
				{type: 'image', name: 'ship_green', src: 'assets/images/ship_green.png'},
				
				{type: 'image', name: 'ship_yellow', src: 'assets/images/ship_yellow.png'},
				
				{type: 'image', name: 'ship_blue', src: 'assets/images/ship_blue.png'},
				
				{type: 'image', name: 'ship_orange', src: 'assets/images/ship_orange.png'},
				
				{type: 'image', name: 'ship_gray', src: 'assets/images/ship_gray.png'},

				{type: 'image', name: 'ship_purple', src: 'assets/images/ship_purple.png'},


				
				{type: 'image', name: 'pot_red', src: 'assets/images/pot_red.png'},
				{type: 'image', name: 'pot_green', src: 'assets/images/pot_green.png'},
				
				
				{type: 'image', name: 'nebula_dual', src: 'assets/images/nebula_dual.png'},
				{type: 'image', name: 'nebula_cloud', src: 'assets/images/nebula_cloud.png'},
				{type: 'image', name: 'nebula_helix', src: 'assets/images/nebula_helix.png'},
				
				{type: 'image', name: 'mask_white', src: 'assets/images/mask_white.png'},
			
				{type: 'image', name: 'item_web', src: 'assets/images/item_web.png'},
				{type: 'image', name: 'item_coin', src: 'assets/images/item_coin.png'},
				{type: 'image', name: 'item_heart', src: 'assets/images/item_heart.png'},
				{type: 'image', name: 'item_speed', src: 'assets/images/item_speed.png'},
				{type: 'image', name: 'item_freeze', src: 'assets/images/item_freeze.png'},
				{type: 'image', name: 'item_shield', src: 'assets/images/item_shield.png'},
				{type: 'image', name: 'item_silence', src: 'assets/images/item_silence.png'},
				{type: 'image', name: 'item_laser_wall', src: 'assets/images/item_laser_wall.png'},
				{type: 'image', name: 'item_dual_shot', src: 'assets/images/item_dual_shot.png'},
				{type: 'image', name: 'item_poison_shot', src: 'assets/images/item_poison_shot.png'},
				{type: 'image', name: 'item_fast_shot', src: 'assets/images/item_fast_shot.png'},

				{type: 'image', name: 'item_drain_life', src: 'assets/images/item_drain_life.png'},
				
				{type: 'image', name: 'glow_green', src: 'assets/images/glow_green.png'},
				{type: 'image', name: 'glow_blue', src: 'assets/images/glow_blue.png'},
				{type: 'image', name: 'glow_yellow', src: 'assets/images/glow_yellow.png'},
				{type: 'image', name: 'glow_orange', src: 'assets/images/glow_orange.png'},
			
			
				{type: 'image', name: 'shield', src: 'assets/images/shield.png'},
				{type: 'image', name: 'laser', src: 'assets/images/laser.png'},
				{type: 'image', name: 'laser_wall', src: 'assets/images/laser_wall.png'},
			];

			Preloader.add(image_list);

			Preloader.add(sound_list);
			
			Preloader.on("progress", function(event){
				self.progressBar.setProgress(event.progress);
			});

			Preloader.on("loaded", function(event){
				var item = event.item;

				if(item.type == 'image')
				{
					Images.register(item.name, event.file);
				}

				if(item.type == 'audio')
				{
					Sounds.register(item.name, event.file, item.opt);
				}
			});

			Preloader.on("complete", function(event){
				setTimeout(function(){
					Obj.SceneManager.change('intro');
				}, 200);
			});

			Preloader.download();

			var b = game.bounds;
			var backBar = {
				x: b.center().x - 150,
				y: b.center().y + 20,
				width: 300,
				height: 30,
			};

			self.progressBar = new Obj.ProgressBar(backBar);
		},
		input: function(evt, code, ke){

		},
		update: function(delta){
			
		},
		render: function(){
			var self = this;

			var b = game.bounds;

			//background
			Draw.fillRect(game.ctx, b.x, b.y, b.width, b.height, {color: 'black'});

			//loading
			Draw.fillText(game.ctx, "Loading", b.center().x, b.center().y, {color: 'white', align: 'center', fontSize: 50, valign: 'bottom'});

			//progress bar
			self.progressBar.render(game.ctx);
		},
		leave: function(){},
	});

	Obj.SceneManager.add(LoadingScene);

}());