enchant();

// マウス関数の設定。コピペ。
window.document.onmousemove = myGetEvent; // マウスを動かした。
function myGetEvent(evt) {
	myEvent = (evt) ? evt : window.event; // FireFox 対策
	myObj = document.getElementById("cursor").style;
	myObj.left = document.body.scrollLeft + myEvent.clientX + 15; // X表示位置
	myObj.top = document.body.scrollTop + myEvent.clientY + 15; // Y表示位置
}

mouse_x = 0;
mouse_y = 0;
window.document.onmousemove = myGetEvent;	// マウスを動かした。
function myGetEvent( evt ){	
	myEvent = ( evt ) ? evt : window.event;	// FireFox 対策
	mouse_x = document.body.scrollLeft + myEvent.clientX;	// X表示位置
	mouse_y = document.body.scrollTop + myEvent.clientY;	// Y表示位置
}	
window.onload = function() {
	// ゲームウィンドウの作成
	var game = new Game(800, 600);
	// フレームレートの設定する
	game.fps = 60;

	// ゲームで使う素材を読み込む
	game.preload(all_use_images());

	game.onload = function() {
		// ゴルーバル変数
		deck_contents = new Array;
		// 変数設定
		select_age = 0;
		login_user_id = 0;
		screen_x = 0;
		screen_y = 0;
		new_screen_x = screen_x;
		new_screen_y = screen_y;

		make_world_data();
		player_data = new Game_Player();
		data_unit = {};
		for (i = 0; i < UNIT_DATA.length; i++) {
			data_unit[UNIT_DATA[i][0]] = UNIT_DATA[i];
		}

		// --------------------------------------------------------------------------
		// 画像表示
		// --------------------------------------------------------------------------
		// ラベル
		scene_login = new Scene();
		scene_game = new Scene();
		scene_game.backgroundColor = 'black';
		// 背景画像とか表示
		var back = new Sprite(800, 600);
		back.image = game.assets['images/login_back.png'];
		// ヘルプテキストを（何故か）ここで監視
		back.addEventListener('enterframe', function() {
			if (help_text.active == false) {
				set_help_text(0, -999, -1)
			}
			help_text.active = false;
		});

		scene_login.addChild(back);

		deckback_sprites = new Array;
		deckage_sprites = new Array;
		inventory_age_sprites = new Array;
		for (i = 0; i < 6; i++) {
			deckback_sprites[i] = new Sprite(528, 48);
			deckback_sprites[i].image = game.assets['images/SlotBack.png'];
			deckback_sprites[i].x = 264;
			deckback_sprites[i].y = 60 + 52 * i;
			deckback_sprites[i].id = i;
			// クリック時に時代カードインベントリの内容変更
			deckback_sprites[i].addEventListener('touchstart', function() {
				select_age = this.id;
				change_view_inventory(select_age);
			});
			scene_login.addChild(deckback_sprites[i]);

			deckage_sprites[i] = new Sprite_AgeButton(264, 60 + 52 * i);
			deckage_sprites[i].id = i;
			scene_login.addChild(deckage_sprites[i]);

			inventory_age_sprites[i] = new Sprite_AgeButton(160 + 52 * i, 384);
			inventory_age_sprites[i].id = i;
			inventory_age_sprites[i].opacity = 0.5;
			scene_login.addChild(inventory_age_sprites[i]);
		}
		deck_contents_sprites = new Array;
		for (i = 0; i < 10 * 6; i++) {
			deck_contents_sprites[i] = new Sprite_DeckContents(i);
			scene_login.addChild(deck_contents_sprites[i]);
		}

		var inventory_back_sprites = new Array;
		inventory_contents_sprites = new Array;
		for (i = 0; i < 3; i++) {
			inventory_back_sprites[i] = new Sprite(768, 48);
			inventory_back_sprites[i].image = game.assets['images/SlotBack2.png'];
			inventory_back_sprites[i].x = 16;
			inventory_back_sprites[i].y = 434 + 54 * i;
			scene_login.addChild(inventory_back_sprites[i]);
		}
		for (i = 0; i < 3 * 16; i++) {
			inventory_contents_sprites[i] = new Sprite_InventoryContents(i);
			scene_login.addChild(inventory_contents_sprites[i]);
		}
		help_text = new Label('');
		help_text.font = "18px 'Arial'";
		help_text.color = "white";
		help_text.id = -1;
		help_text.backgroundColor = "rgba(0,0,0,6)";
		help_text.y = -999;
		help_text.width = 280;
		help_text.height = 40;
		help_text.active = false;
		scene_login.addChild(help_text);

		// ログインユーザー。完成時は変更
		var login_user_list = new Array;
		for (i = 0; i < 10; i++) {
			login_user_list[i] = new Label('');
			login_user_list[i].x = 24;
			login_user_list[i].y = 24 + 24 * i;
			login_user_list[i].color = "white";
			login_user_list[i].text = "プレイヤー" + i;
			login_user_list[i].addEventListener('touchstart', function() {
				for (i = 0; i < login_user_list.length; i++) {
					login_user_list[i].color = "white";
				}
				this.color = "orange";
				login_user_id = (this.y - 24) / 24;
			});
			scene_login.addChild(login_user_list[i]);
		}
		login_button = new Sprite(246, 51);
		login_button.image = game.assets['images/Button_Login.png'];
		login_button.x = 8;
		login_button.y = 256 + 24;
		scene_login.addChild(login_button);
		login_button.addEventListener('touchstart', function() {
			start_game_phase();
		});

		change_view_inventory(select_age);
		game.pushScene(scene_login);

		// --------------------------------------------------------------------------
		// ここからゲームマップ編
		// --------------------------------------------------------------------------
		// ラベル

		hex_triangle_sprites = new Array;
		for (i = 0; i < HexTri_WIDTH * HexTri_HEIGHT; i++) {
			var x = (i % HexTri_WIDTH);
			var y = Math.floor(i / HexTri_WIDTH);
			hex_triangle_sprites[i] = new Sprite_HexTriangle(x, y, i);
			scene_game.addChild(hex_triangle_sprites[i]);
		}
		hex_tile_sprites = new Array;
		for (i = 0; i < MAP_WIDTH * MAP_HEIGHT; i++) {
			var x = (i % MAP_WIDTH);
			var y = Math.floor(i / MAP_WIDTH);
			hex_tile_sprites[i] = new Sprite_HexTile(x, y, i);
			scene_game.addChild(hex_tile_sprites[i]);
		}
		hex_center_sprites = new Array;
		for (i = 0; i < MAP_WIDTH * MAP_HEIGHT; i++) {
			var x = (i % MAP_WIDTH);
			var y = Math.floor(i / MAP_WIDTH);
			hex_center_sprites[i] = new Sprite_HexCenter(x, y, i);
			scene_game.addChild(hex_center_sprites[i]);
		}
		unit_sprites = new Array;
		game_units = new Array;
		// for (i = 0; i < MAP_WIDTH * MAP_HEIGHT * 4; i++){
		// unit_sprites[i] = new Sprite_Unit(i);
		// scene_game.addChild(unit_sprites[i]);
		// }

		// マップ画面上のバー
		map_header = new Sprite(800, 99);
		map_header.image = game.assets['images/Map_Header.png'];
		scene_game.addChild(map_header);
		// マップ画面上のバーのボタン
		var map_header_buttons = new Array;
		var button_contents = [ 'マップ', '資源', '交易', '情報' ];
		for (i = 0; i < button_contents.length; i++) {
			map_header_buttons[i] = new Label('');
			map_header_buttons[i].font = "20px 'Arial'";
			map_header_buttons[i].text = button_contents[i];
			map_header_buttons[i].x = 100 + i * 80;
			map_header_buttons[i].y = 40;
			scene_game.addChild(map_header_buttons[i]);
		}
		// ユニット管理ウィンドウ
		spriteset_unithandler = new SpritesetUnihandler(600 - 72);
		unitselect_index = 0;
		game_stack = new Array;
	}
	game.start();

	// --------------------------------------------------------------------------
	// クラス定義
	// --------------------------------------------------------------------------
	var SpritesetUnihandler = Class
			.create({
				initialize : function(y) {
					this.spriteunithandler_back = new Sprite(184, 72);
					this.spriteunithandler_back.image = game.assets['images/UnitBack.png'];
					this.spriteunithandler_back.y = y;
					this.spriteunithandler_back.visible = false;
					scene_game.addChild(this.spriteunithandler_back);
					this.spriteunithandler_text = new Label('');
					this.spriteunithandler_text.x = 64 - 8;
					this.spriteunithandler_text.y = y + 8;
					this.spriteunithandler_text.color = "white";
					this.spriteunithandler_text.font = "18px 'Arial'";
					this.visible = false;
					scene_game.addChild(this.spriteunithandler_text);
					this.stackcommands = new Array;
					for (i = 0; i < 1; i++) {
						this.stackcommands[i] = new Sprite(106, 67);
						this.stackcommands[i].image = game.assets['images/StackButton' + (i + 1) + '.png'];
						this.stackcommands[i].visible = false;
						this.stackcommands[i].y = 600-69;
						this.stackcommands[i].x = 184+16;
						this.stackcommands[i].id = i;
						scene_game.addChild(this.stackcommands[i]);
						
					}
				},
				set_new_unit : function(unit) {
					this.unit = unit;
					this.set_visible(true);
					var name = unit.name();
					var unit_count = unit.unitsize;
					var atk = unit.power();
					this.spriteunithandler_text.text = name + '<br>軍団規模 : '
							+ unit_count + '<br>戦闘力 : ' + atk;

				},
				set_visible : function(v) {
					this.spriteunithandler_back.visible = v;
					if (this.unit != undefined){
						for (i = 0; i < this.stackcommands.length; i++) {
							if (this.unit.ability().indexOf(i) != -1){
								this.stackcommands[i].visible = v;
							} else {
								this.stackcommands[i].visible = false;
							}
						}
					}
					this.visible = v;
				}
			});
	function ageunit_atk(ind) {
		var age = 0;
		return UNIT_DATA[age + ind * 6][UNIT_DATA_INDEX_ATTACK];
	}
	// ラベル
	var Game_Player = Class
			.create({
				initialize : function() {
					this.player_id = -1;
					this.resource = [ 0, 0, 0 ];
					this.map_sight = new Array(MAP_WIDTH);
					for (i = 0; i < MAP_WIDTH; i++) {
						this.map_sight[i] = new Array(MAP_HEIGHT);
						for (t = 0; t < MAP_HEIGHT; t++) {
							this.map_sight[i][t] = [ false, false, false,
									false, false, false, ];
						}
					}
				},
				// viewにはtrue/falseを期待
				set_sight : function(x, y, hex_id, view) {
					if (valid(x, y)) {
						if (hex_id == -1) {
							this.map_sight[x][y] = [ true, true, true, true,
									true, true ];
							return;
						}
						this.map_sight[x][y][hex_id] = view;
						// alert([x,y,this.map_sight[x][y]])
					}
				},
				set_near_sight : function(x, y) {
					this.set_sight(x, y, -1, true);
					var ss_dir = [ 3, 4, 5 ];
					for (i = 0; i < ss_dir.length; i++) {
						this.set_sight(x, y - 1, ss_dir[i], true);
					}
					var ss_dir = [ 0, 1, 2 ];
					for (i = 0; i < ss_dir.length; i++) {
						this.set_sight(x, y + 1, ss_dir[i], true);
					}
					if (x % 2 == 1) {
						var ss_dir = [ 2, 4, 5 ];
						for (i = 0; i < ss_dir.length; i++) {
							this.set_sight(x - 1, y, ss_dir[i], true);
						}
						var ss_dir = [ 0, 3, 4 ];
						for (i = 0; i < ss_dir.length; i++) {
							this.set_sight(x + 1, y, ss_dir[i], true);
						}
						var ss_dir = [ 1, 2, 5 ];
						for (i = 0; i < ss_dir.length; i++) {
							this.set_sight(x - 1, y + 1, ss_dir[i], true);
						}
						var ss_dir = [ 0, 1, 3 ];
						for (i = 0; i < ss_dir.length; i++) {
							this.set_sight(x + 1, y + 1, ss_dir[i], true);
						}
					} else {
						var ss_dir = [ 2, 4, 5 ];
						for (i = 0; i < ss_dir.length; i++) {
							this.set_sight(x - 1, y - 1, ss_dir[i], true);
						}
						var ss_dir = [ 0, 3, 4 ];
						for (i = 0; i < ss_dir.length; i++) {
							this.set_sight(x + 1, y - 1, ss_dir[i], true);
						}
						var ss_dir = [ 1, 2, 5 ];
						for (i = 0; i < ss_dir.length; i++) {
							this.set_sight(x - 1, y, ss_dir[i], true);
						}
						var ss_dir = [ 0, 1, 3 ];
						for (i = 0; i < ss_dir.length; i++) {
							this.set_sight(x + 1, y, ss_dir[i], true);
						}
					}
				},
				check_sight : function(x, y, hex_id) {
					if (hex_id == -1) {
						return (this.map_sight[x][y].indexOf(true) >= 0);
					}
					return (this.map_sight[x][y][hex_id]);
				}
			});
	// ●スタック
	var Game_Unit = Class.create({
		initialize : function(x, y, dir, unittype) {
			this.unittype = unittype;
			this.unitsize = 1;
			this.x = x;
			this.y = y;
			this.dir = dir;
			this.movecount = 0;
		},
		ability :function(){
			return data_unit[this.name()][UNIT_DATA_INDEX_ABILITY];
		},
		name : function() {
			if (this.unittype == UNITTYPE_SETTLER) {
				return '開拓者';
			} else {
				return UNIT_DATA[this.unittype * 6][0];
			}
		},
		power : function() {
			return data_unit[this.name()][3];
		},
		unit_id : function() {
			return ((this.x + this.y * MAP_WIDTH) * 7 + 1 + this.dir);
		}
	});
	// ●スタック表示Sprite
	var Sprite_Unit = Class
			.create(
					Sprite,
					{
						set_graphics : function(x, y, col) {
							this.base_x = x * 96 + 48;
							this.base_y = y * 108 + (x % 2) * 55 + 54 - 32 - 8;
							this.frame = 0;
							this.update_graphics();
						},
						update_graphics : function() {
							if (!this.hang) {
								this.x = this.base_x + screen_x;
								this.y = this.base_y + screen_y;
							}
						},
						initialize : function(x, y, dir, col, id, unit) {
							enchant.Sprite.call(this, 32, 54);
							this.x = 0;
							this.y = 0;
							this.base_x = 0;
							this.base_y = 0;
							this.pos_x = x;
							this.pos_y = y;
							this.unit = unit;
							this.dir = 0;
							this.hang = false;
							this.image = game.assets['images/UnitSimbol.png'];
							this.frame = 0;
							this.id = i;
							this.set_graphics(x, y, col);
						},// ドラッグ＆ドロップで移動
						ontouchmove : function() {
							this.x = mouse_x - 12;
							this.y = mouse_y - 60;
						},
						ontouchstart : function() {
							this.hang = true;
							hang_unit = this.unit;
							set_map_movearea(this.pos_x, this.pos_y);
							spriteset_unithandler.set_new_unit(this.unit);
						},
						ontouchend : function() {
							this.hang = false;
							var map_x = mouse_x - screen_x - 12;
							var map_y = mouse_y - screen_y - 60;
							map_x = Math.floor((map_x) / 96);
							map_y = Math
									.floor((map_y - ((map_x % 2) * 55 - 54 + 16)) / 108);
							if (valid(map_x, map_y)) {
								var near_pos = get_neighbor_poses(this.pos_x,
										this.pos_y);
								var result = false;

								for (ind = 0; ind < near_pos.length; ind++) {
									if (near_pos[ind][0] == map_x
											&& near_pos[ind][1] == map_y) {
										result = true;
									}
								}
								if (result) {
									this.pos_x = map_x;
									this.pos_y = map_y;
									player_data.set_near_sight(map_x, map_y);
								}
							}
							this.set_graphics(this.pos_x, this.pos_y, 0);
							refresh_worldmap();
						},
						onenterframe : function() {
							this.update_graphics();
						}
					});
	// ●ヘックスの地形表示Sprite
	var Sprite_HexCenter = Class.create(Sprite, {
		set_tile_graphics : function() {
			this.frame = 0;
			var hex_data = world_hex[this.pos_x][this.pos_y];
			if (hex_data[0] == TILE_OCEAN) {
				this.frame = 1;
			} // else if (rand(3) == 0){
			// this.frame = 3;
			// if (rand(3) == 0){
			// this.frame = 2;
			// }
			// }
			this.visible = player_data.check_sight(this.pos_x, this.pos_y, -1);
		},
		initialize : function(pos_x, pos_y, i) {
			enchant.Sprite.call(this, 48, 48);
			this.image = game.assets['images/HexCenterIcons.png'];
			this.base_x = pos_x * 96 + 48 - 8;
			this.base_y = pos_y * 108 + (pos_x % 2) * 55 + 54 - 24;
			this.x = this.base_x;
			this.y = this.base_y;
			this.pos_x = pos_x;
			this.pos_y = pos_y;
			this.visible = false;
			this.set_tile_graphics();

			this.active = false;
			this.id = i;
		},
		ontouchstart : function() {
			if (this.visible) {
				if (this.active) {
					this.go_city = true;
					return;
				}
				new_screen_x = mouse_x;
				new_screen_y = mouse_y;
				this.active = true;
			}
		},
		ontouchmove : function() {
			screen_x -= new_screen_x - mouse_x;
			screen_y -= new_screen_y - mouse_y;
			new_screen_x = mouse_x;
			new_screen_y = mouse_y;
			this.active = false;
		},
		update_graphics : function() {
			this.x = this.base_x + screen_x;
			this.y = this.base_y + screen_y;
		},
		onenterframe : function() {
			this.update_graphics();
		}
	});
	// ●ヘックスの地形表示Sprite
	var Sprite_HexTile = Class.create(Sprite, {
		set_tile_graphics : function() {
			this.visible = player_data.check_sight(this.pos_x, this.pos_y, -1);
			this.set_color(0);
		},
		initialize : function(pos_x, pos_y, i) {
			enchant.Sprite.call(this, 128, 110);
			this.image = game.assets['images/Hex0.png'];
			this.base_x = pos_x * 96;
			this.base_y = pos_y * 108 + (pos_x % 2) * 55;
			this.x = this.base_x;
			this.y = this.base_y;
			this.pos_x = pos_x;
			this.pos_y = pos_y;
			this.active = false;
			this.visible = player_data.check_sight(pos_x, pos_y, -1);
			this.id = i;
		},
		ontouchstart : function() {
			if (this.visible) {
				if (this.active) {
					this.go_city = true;
					return;
				}
				new_screen_x = mouse_x;
				new_screen_y = mouse_y;
				this.active = true;
			}
		},
		ontouchmove : function() {
			screen_x -= new_screen_x - mouse_x;
			screen_y -= new_screen_y - mouse_y;
			new_screen_x = mouse_x;
			new_screen_y = mouse_y;
			this.active = false;
		},
		onenterframe : function() {
			this.x = this.base_x + screen_x;
			this.y = this.base_y + screen_y;
		},
		set_color : function(col) {
			this.image = game.assets['images/Hex' + col + '.png'];
		}
	});
	// ●ヘックスの地形表示Sprite
	var Sprite_HexTriangle = Class
			.create(
					Sprite,
					{
						set_tile_graphics : function() {
							var ind_x = Math.floor(this.pos_x / 3);
							var ind_y = Math.floor((this.pos_y - Math
									.floor((this.pos_x % 6) / 3)) / 2);
							var tile_id = 8;
							var hex_index = -1;
							if (valid(ind_x, ind_y)) {
								var hex_data = world_hex[ind_x][ind_y];
								var hex_index = this.pos_x
										% 3
										+ ((this.pos_y + Math
												.floor((this.pos_x % 6) / 3)) % 2)
										* 3;
								var tile_id = HEX_TILE_PRITORITY[hex_data[0]][hex_data[hex_index + 1]] + 1;
								this.visible = player_data.check_sight(ind_x,
										ind_y, hex_index);
							}
							this.frame = tile_id + (this.hex_ind % 2) * 10;
							if (this.pos_y == 0 && ((this.pos_x % 6) / 3 >= 1)) {
								this.frame = 0;
							}
							if (this.pos_y == HexTri_HEIGHT - 1
									&& ((this.pos_x % 6) / 3 < 1)) {
								this.frame = 0;
							}
						},
						initialize : function(pos_x, pos_y, i) {
							enchant.Sprite.call(this, 65, 54);
							this.image = game.assets['images/Tileset.png'];
							this.base_x = pos_x * 32;
							this.base_y = pos_y * 54;
							this.x = this.base_x;
							this.y = this.base_y;
							this.pos_x = pos_x;
							this.pos_y = pos_y;
							this.visible = false;
							this.hex_ind = i + (pos_y % 2);
							this.set_tile_graphics();
							this.id = i;
							this.update_graphics();
						},
						update_graphics : function() {
							this.x = this.base_x + screen_x;
							this.y = this.base_y + screen_y;
						},
						onenterframe : function() {
							this.update_graphics();
						}
					});
	// ●デッキのアイテムを描写するSprite
	var Sprite_DeckContents = Class.create(Sprite, {
		initialize : function(i) {
			enchant.Sprite.call(this, 40, 40);
			this.image = game.assets['images/Pop_Icons.png'];
			this.x = -(264 + (i % 10) * 48 + 52);
			this.y = 64 + 52 * Math.floor(i / 10);
			this.frame = 0;
			this.id = -1;
		},
		// クリック時の判定：デッキからクリックしたものを除去
		ontouchstart : function() {
			if (this.id != -1) {
				var ind = deck_contents.indexOf(this.id);
				if (ind != -1) {
					deck_contents.splice(ind, 1);
					change_view_deck();
					change_view_inventory(select_age);
				}
			}
		},
		onenterframe : function() {
			if (in_mouse(this.x, this.y, 40, 40)) {
				set_help_text(this.x, this.y, this.id);
			}
		}
	});

	// ●インベントリのアイテムを描写するSprite
	var Sprite_InventoryContents = Class.create(Sprite, {
		initialize : function(i) {
			enchant.Sprite.call(this, 40, 40);
			this.image = game.assets['images/Pop_Icons.png'];
			this.x = 16 + (i % 16) * 47 + 8;
			this.y = 439 + 54 * Math.floor(i / 16);
			this.frame = 0;
			this.id = -1;
		},
		// クリック時の判定：インベントリの内容をデッキに追加
		ontouchstart : function() {
			if (this.id >= 0) {
				if (deck_contents.indexOf(this.id) == -1) {
					deck_contents.push(this.id);
					change_view_deck();
					change_view_inventory(select_age);
				}
			}
		},
		onenterframe : function() {
			if (in_mouse(this.x, this.y, 40, 40)) {
				set_help_text(this.x, this.y, this.id);
			}
		}
	});

	// ●時代ボタンを描写するSprite
	var Sprite_AgeButton = Class.create(Sprite, {
		initialize : function(x, y) {
			enchant.Sprite.call(this, 48, 48);
			this.x = x;
			this.y = y;
			this.image = game.assets['images/AgeButton_' + (i + 1) + '.png'];
		},
		// クリック時の判定：インベントリの内容を時代に合わせたものに帰る
		ontouchstart : function() {
			select_age = this.id;
			change_view_inventory(select_age);
		}
	});
	// ラベル ゲームログイン
	function start_game_phase() {
		game.popScene();
		var first_pos = [ -1, -1 ];
		while (first_pos[0] == -1) {
			var x = rand(MAP_WIDTH);
			var y = rand(MAP_HEIGHT);
			if (world_hex[x][y][0] != 0) {
				first_pos = [ x, y ];
			}
		}
		create_new_unit(first_pos[0], first_pos[1], UNITTYPE_SETTLER);
		create_new_unit(first_pos[0], first_pos[1] + 1, UNITTYPE_MELEE);
		screen_x = (400 - 48 - first_pos[0] * 96);
		screen_y = (300 - 54 - first_pos[1] * 108);
		refresh_worldmap();

		game.pushScene(scene_game);
	}
	function create_new_unit(x, y, unittype) {
		player_data.set_near_sight(x, y);
		var unit = new Game_Unit(x, y, -1, unittype);
		game_stack.push(unit);
		var ind = unit_sprites.length;
		unit_sprites.push(new Sprite_Unit(x, y, -1, 0, 0, unit));
		scene_game.addChild(unit_sprites[ind]);
	}
	function refresh_worldmap() {
		for (i = 0; i < hex_triangle_sprites.length; i++) {
			hex_triangle_sprites[i].set_tile_graphics();
		}
		for (i = 0; i < hex_tile_sprites.length; i++) {
			hex_tile_sprites[i].set_tile_graphics();
		}
		for (i = 0; i < hex_center_sprites.length; i++) {
			hex_center_sprites[i].set_tile_graphics();
		}
	}

}
function in_mouse(x, y, width, height) {
	return (mouse_x >= x & mouse_x <= x + width & mouse_y >= y & mouse_y <= y
			+ height);
}
function set_help_text(x, y, id) {
	help_text.active = true;
	if (help_text.id != id) {
		help_text.id = id;
		if (id != -1) {
			help_text.text = get_data_helptext(DeckContents[id]);
		} else {
			help_text.text = '';
		}
		help_text.x = x;
		help_text.y = y - 56;
	}
}
function get_data_helptext(data) {
	switch (data[0]) {
	case DECKTYPE_UNIT:
		var unit = data_unit[data[2]];
		var unitdata = '(' + unit[3] + '/' + unit[4] + '/' + unit[5] + ')';
		return data[2] + unitdata + 'を' + data[3] + '体獲得<br>'
				+ UNITTYPE_DESCRIPTION[unit[1]];
	case DECKTYPE_RESOURCE:
		return data[2] + 'を' + data[3] + '獲得';
	}
	return '';
}

// ラベル
function change_view_deck() {
	// deck_contents.sort(function(a,b){
	// if( a < b ) return -1;
	// if( a > b ) return 1;
	// return 0;
	// }
	// );
	var deck_present_contents = new Array;
	for (i = 0; i < 6; i++) {
		deck_present_contents[i] = new Array;
	}
	for (i = 0; i < deck_contents.length; i++) {
		var data = DeckContents[deck_contents[i]];
		deck_present_contents[data[1]].push(deck_contents[i]);
	}
	for (i = 0; i < 10 * 6; i++) {
		deck_contents_sprites[i].x = -Math.abs(deck_contents_sprites[i].x);
		deck_contents_sprites[i].frame = 0;
		var index = deck_present_contents[Math.floor(i / 10)][i % 10];
		if (index != undefined) {
			var data = DeckContents[index];
			deck_contents_sprites[i].frame = get_data_icon(data);
			deck_contents_sprites[i].id = DeckContents.indexOf(data);
			deck_contents_sprites[i].x *= -1;
		}
	}
}
function change_view_inventory(select_age) {
	// alert(select_age);
	for (i = 0; i < 6; i++) {
		inventory_age_sprites[i].opacity = 0.5;
	}
	inventory_age_sprites[select_age].opacity = 1.0;
	// インベントリ内容を時代に合わせたものに変更
	// データ取得
	var inv_unit = new Array;
	var inv_resources = new Array;
	for (i = 0; i < DeckContents.length; i++) {
		if (DeckContents[i][1] == select_age) {
			switch (DeckContents[i][0]) {
			case DECKTYPE_UNIT:
				inv_unit.push(DeckContents[i]);
				break;
			case DECKTYPE_RESOURCE:
				inv_resources.push(DeckContents[i]);
				break;
			}
		}
	}
	// 軍事ユニットカード
	for (i = 0; i < 16; i++) {
		if (inv_unit[i]) {
			set_inventory_contents(i, inv_unit[i]);
		} else {
			set_inventory_contents(i, -1);
		}
	}
	// 資源カード
	for (i = 0; i < 16; i++) {
		if (inv_resources[i]) {
			set_inventory_contents(i + 16, inv_resources[i]);
		} else {
			set_inventory_contents(i + 16, -1);
		}
	}
}
function get_data_icon(data) {
	switch (data[0]) {
	case DECKTYPE_UNIT:
		var unit = data_unit[data[2]];
		return unit[UNIT_DATA_INDEX_ICON];
	case DECKTYPE_RESOURCE:
		return data[4] + 1;
	}
	return 0;
}
function set_inventory_contents(i, data) {
	var index = -1;
	inventory_contents_sprites[i].frame = 0;
	if (data != -1) {
		inventory_contents_sprites[i].frame = get_data_icon(data);
		index = DeckContents.indexOf(data);
	}
	inventory_contents_sprites[i].id = index;
	if (index != -1) {
		if (deck_contents.indexOf(index) == -1) {
			inventory_contents_sprites[i].opacity = 1.0;
		} else {
			inventory_contents_sprites[i].opacity = 0.5;
		}
	}
}
function set_map_movearea(x, y) {
	var ind = x + y * MAP_WIDTH;
	hex_tile_sprites[ind].set_color(1);
	var neighbor_poses = get_neighbor_poses(x, y);
	for (i = 0; i < neighbor_poses.length; i++) {
		ind = neighbor_poses[i][0] + neighbor_poses[i][1] * MAP_WIDTH;
		hex_tile_sprites[ind].set_color(1);
	}

}
function get_neighbor_poses(x, y) {
	var result = [ [ x + 1, y ], [ x - 1, y ], [ x, y + 1 ], [ x, y - 1 ] ];
	if (x % 2 == 0) {
		result.push([ x - 1, y - 1 ]);
		result.push([ x + 1, y - 1 ]);
	} else {
		result.push([ x - 1, y + 1 ]);
		result.push([ x + 1, y + 1 ]);
	}
	var res2 = new Array;
	for (i = 0; i < result.length; i++) {
		if (valid(result[i][0], result[i][1])) {
			res2.push(result[i]);
		}
	}
	return res2;
}
function rand(num) {
	return Math.floor(Math.random() * num);
}
function all_use_images() {
	var array = new Array;
	array.push('images/login_back.png');
	array.push('images/SlotBack.png');
	array.push('images/SlotBack2.png');
	array.push('images/Pop_Icons.png');
	array.push('images/Button_Login.png');
	array.push('images/Tileset.png');
	array.push('images/HexCenterIcons.png');
	array.push('images/Map_Header.png');
	array.push('images/UnitSimbol.png');
	array.push('images/UnitBack.png');
	array.push('images/StackButton1.png');

	for (i = 1; i <= 6; i++) {
		array.push('images/AgeButton_' + i + '.png');
	}
	for (i = 0; i <= 3; i++) {
		array.push('images/Hex' + i + '.png');
	}
	return array;
}
function valid(x, y) {
	return (x >= 0 && y >= 0 && x < MAP_WIDTH && y < MAP_HEIGHT);
}