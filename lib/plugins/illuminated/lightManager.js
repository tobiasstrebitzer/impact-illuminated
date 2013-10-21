ig.module('plugins.illuminated.lightManager')
    .requires('plugins.illuminated.illuminated', 'plugins.box2d.entity.lamp')
    .defines(function () {
        var Lamp = illuminated.Lamp
            , Vec2 = illuminated.Vec2
            , DiscObject = illuminated.DiscObject
            , RectangleObject = illuminated.RectangleObject
            , Lighting = illuminated.Lighting
            , DarkMask = illuminated.DarkMask;

        var PseudoContext = ig.Class.extend({
            translate: true,
            drawImage: function(context, x, y) {
                
                if(this.translate === true) {
                    x = -ig.game.screen.x*ig.system.scale + x;
                    y = -ig.game.screen.y*ig.system.scale + y;
                }else{
                    x = ig.game.screen.x*ig.system.scale + x;
                    y = ig.game.screen.y*ig.system.scale + y;
                }
                
                ig.system.context.drawImage.call(ig.system.context, context, x, y);
            }
        });

        ig.LightManager = ig.Class.extend({
            
            // internals
            shouldUpdate: false,
            darkMask: null,
            viewportWidth: null,
            viewportHeight: null,
            mode: 0, // 0: dynamic, 1: static, 2: off
            
            // objects
            lights: [],
            entities: [],
            rects: [],
            lightings: [],
            pseudoContext: new PseudoContext(),

            // config options
            lightsCompositeOperation: "lighter",
            darkMapCompositeOperation: "source-over",
            clearColor: '#000000',
            maskColor: 'rgba(0,0,0,1)',
            lightDefaults: {
                x: 0,
                y: 0,
                distance: 50,
                diffuse: 0,
                color: 'rgba(239,184,134,0.75)',
                radius: 0,
                samples: 1
            },
            objectDefaults: {
                x: 0,
                y: 0,
                width: 8,
                height: 8
            },
            
            init: function(options) {
                $.extend(this, options);
                
                // Create dark mask
                this.darkMask = new DarkMask({
                    lights: this.lights,
                    color: this.maskColor
                });
                
            },
            
            reset: function() {
                //this.rects = [];
                //this.entities = [];
                //this.setup();
            },
            
            setup: function() {
                
                // Set viewport
                var colMap = ig.game.collisionMap;
                this.viewportWidth = colMap.width * colMap.tilesize * ig.system.scale;
                this.viewportHeight = colMap.height * colMap.tilesize * ig.system.scale;
                
                // Add rects
                var rects = ig.game.collisionRects;
                for (var i=0; i < rects.length; i++) {
                    this.addRect(rects[i]);
                }
                
                // Update lightings
                this.updateAllLightings();
                
                // Initial update
                this.darkMask.compute(this.viewportWidth, this.viewportHeight);
                this.update();
                
            },
            
            // instance
            instance: null,
            getInstance: function() {
                return (ig.LightManager.instance == null) ? null : ig.LightManager.instance;
            },
            
            updateAllLightings: function(skipEntities) {
                var objects = [];
                $.merge(objects, this.rects);
                if(this.mode == 0) {
                    $.merge(objects, this.entities);
                }
                for(var i=0; i<this.lightings.length; i++) {
                    this.lightings[i].objects = objects;
                }
            },
            
            clearLights: function() {
                this.lights = [];
            },
            
            addLight: function(entity) {
                var objects = [];
                $.merge(objects, this.rects);
                $.merge(objects, this.entities);
                this.lightings.push(new Lighting({
                    light: entity,
                    objects: objects
                }));
                this.lights.push(entity);
                
                this.darkMask.lights = this.lights;
                
            },
            
            removeLight: function(entity) {
                
                // Remove lighting
                for(var i=0; i<this.lightings.length; i++) {
                    if(this.lightings[i].light == entity) {
                        this.lightings.splice(i, 1);
                        break;
                    }
                }
                
                // Remove light
                for(var i=0; i<this.lights.length; i++) {
                    if(this.lights[i] == entity) {
                        this.lights.splice(i, 1);
                        break;
                    }
                }
                
                // Update darkmask
                this.darkMask.lights = this.lights;
                
                return false;
            },
            
            addEntity: function(entity) {
                this.entities.push(entity);
                for(var i=0; i<this.lightings.length; i++) {
                    this.lightings[i].objects.push(entity);
                }
            },
            
            removeEntity: function(entity) {
                // Remove from entity array
                for(var i=0; i<this.entities.length; i++) {
                    if(this.entities[i] == entity) {
                        this.entities.splice(i, 1);
                    }
                }
                
                this.updateAllLightings();
                
            },
            
            addRect: function(rect) {

                var rectObject = new RectangleObject({
                    topleft: new Vec2(rect.x*8*ig.system.scale, rect.y*8*ig.system.scale),
                    bottomright: new Vec2(rect.x*8*ig.system.scale+rect.width*8*ig.system.scale, rect.y*8*ig.system.scale+rect.height*8*ig.system.scale)
                });

                this.rects.push(rectObject);
            },
            
            update:function () {
                
                if(this.mode != 2) {
                    if(this.shouldUpdate) {
                        this.shouldUpdate = false;
                    
                        // Compute lightings
                        for(var i=0; i<this.lightings.length; i++) {
                            this.lightings[i].compute(this.viewportWidth, this.viewportHeight);
                        }
            
                        // Compute dark mask
                        this.darkMask.compute(this.viewportWidth, this.viewportHeight);
                        
                    }
                }
                
            },
            
            draw: function() {
                if(this.mode != 2) {
                    this.drawLights();
                    this.drawDarkmap();
                }
            },
            
            drawLights: function() {
                ig.system.context.globalCompositeOperation = this.lightsCompositeOperation;
                for(var i=0; i<this.lightings.length; i++) {
                    this.lightings[i].render(this.pseudoContext);
                }
            },
            
            drawDarkmap: function() {
                ig.system.context.globalCompositeOperation = this.darkMapCompositeOperation;
                this.darkMask.render(this.pseudoContext);
            },
            
            toggleMode: function(mode) {
                this.mode = mode;
                
                if(this.mode == 1) {
                    this.updateAllLightings();
                    this.shouldUpdate = true;
                }else if(mode == 0) {
                    this.updateAllLightings();
                    this.shouldUpdate = true;
                }
                
                
            }
            
        })
    });