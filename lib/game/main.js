ig.module('game.main')
.requires(
    'impact.game',
    // 'impact.debug.debug',
    'plugins.illuminated.debug.graph-panel',
    'impact.font',
    'game.levels.level1',
    'plugins.illuminated.lightManager',
    'plugins.box2d.game',
    // 'plugins.box2d.debug',
    'plugins.box2d.listener',
    'helpers.collection'
)
.defines(function() {
    MyGame = ig.Box2DGame.extend({
        // debugCollisionRects: true,
        gravity: 100,
        font: new ig.Font('media/font.png'),
        clearColor: '#1b2026',
        lightTimer: 0,
        lightingMode: 0,
        
        init: function() {
            
            // Init controls
            ig.input.initMouse();
            ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
            ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
            ig.input.bind(ig.KEY.X, 'jump');
            ig.input.bind(ig.KEY.C, 'shoot');
            ig.input.bind(ig.KEY.M, 'mode');
            ig.input.bind( ig.KEY.MOUSE1, 'click' );

            // Create light manager
            this.lightManager = new ig.LightManager({
                illuminatedEntities: ["EntityCrate"]
            });
            
            this.loadLevel(LevelLevel1);
            ig.world.SetContactListener(ig.Box2DListener);
            
            // Setup light manager
            this.lightManager.setup();

        },
        loadLevel: function(data) {
            this.parent(data);
            for (var i = 0; i < this.backgroundMaps.length; i++) {
                this.backgroundMaps[i].preRender = true;
            }
        },
        update: function() {
            this.parent();
            
            if (ig.input.released('mode')) {
                this.lightingMode = (this.lightingMode == 2) ? 0 : this.lightingMode+1;
                this.lightManager.toggleMode(this.lightingMode);
            }
            
            // Calculate view
            var player = ig.game.getEntitiesByType(EntityPlayer)[0];
            if (player) {
                this.screen.x = Math.min(Math.max(0, player.pos.x - ig.system.width / 2), ig.game.backgroundMaps[0].width*8 - ig.system.width);
                this.screen.y = Math.min(Math.max(0, player.pos.y - ig.system.height / 2), ig.game.backgroundMaps[0].height*8 - ig.system.height);
            }
            
            // Update lighting
            if(this.lightingMode == 0 || this.lightingMode == 1) {
                this.lightManager.update();
            }
            
            
        },
        draw: function() {
            
            // Clear screen
            ig.system.clear( this.clearColor );
		
    		// This is a bit of a circle jerk. Entities reference game._rscreen 
    		// instead of game.screen when drawing themselfs in order to be 
    		// "synchronized" to the rounded(?) screen position
    		this._rscreen.x = ig.system.getDrawPos(this.screen.x)/ig.system.scale;
    		this._rscreen.y = ig.system.getDrawPos(this.screen.y)/ig.system.scale;

    		var mapIndex;
    		for( mapIndex = 0; mapIndex < this.backgroundMaps.length; mapIndex++ ) {
    			var map = this.backgroundMaps[mapIndex];
    			if( map.foreground ) {
    				// All foreground layers are drawn after the entities
    				break;
    			}
    			map.setScreenPos( this.screen.x, this.screen.y );
    			map.draw();
    		}
		
    		for( mapIndex; mapIndex < this.backgroundMaps.length; mapIndex++ ) {
    			var map = this.backgroundMaps[mapIndex];
    			map.setScreenPos( this.screen.x, this.screen.y );
    			map.draw();
    		}
            
            // Draw entities
    		this.drawEntities();

            // Draw lights
            if(this.lightingMode == 0 || this.lightingMode == 1) {
                this.lightManager.draw();
            }
            
            // Box2D debugging
            /*
            if (this.debugCollisionRects) {
                var ts = this.collisionMap.tilesize;
                for (var i = 0; i < this.collisionRects.length; i++) {
                    var rect = this.collisionRects[i];
                    ig.system.context.strokeStyle = '#00ff00';
                    ig.system.context.strokeRect(ig.system.getDrawPos(rect.x * ts - this.screen.x), ig.system.getDrawPos(rect.y * ts - this.screen.y), ig.system.getDrawPos(rect.width * ts), ig.system.getDrawPos(rect.height * ts));
                }
            }
            */
            
            // Main debugging
            this.font.draw('Use arrow keys to move', 2, 2);
            this.font.draw('[X]: Jump   [C]: Shoot', 2, 12);
            this.font.draw('[M]: Mode (' + this.getLightingMode() + ")", 2, 22);
            var now = (new Date()).getTime();
            var delta = now - this.framerateNow;
            this.framerateNow = (new Date()).getTime();
            this.font.draw( "FPS: " + Math.floor(1000/(delta)) + 'fps', 2, 32 );
            // this.debugDrawer.draw();
        },
        
        getLightingMode: function() {
            if(this.lightingMode == 0) {
                return "dynamic";
            }else if(this.lightingMode == 1) {
                return "static";
            }else if(this.lightingMode == 2) {
                return "disabled";
            }
        }
        
    });


    // ig.main('#canvas', Illuminated, 60, 200, 200, 2);
    // ig.main('#canvas', MyGame, 60, $(window).width()/2, $(window).height()/2, 2);
    ig.main('#canvas', MyGame, 10, 320, 240, 2);

});