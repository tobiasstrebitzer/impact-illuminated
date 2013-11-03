ig.module('plugins.illuminated.lightManager')
    .requires('plugins.illuminated.illuminated', 'plugins.box2d.entity.lamp')
    .defines(function () {

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
            darkMask: null,
            viewportWidth: null,
            viewportHeight: null,
            mode: 0, // 0: dynamic, 1: static, 2: off,
            movingEntityLightedCollection: null,
            movingEntityLampCollection: null,
            
            // objects
            lights: [],
            entities: [],
            rects: [],
            polygons: [],
            lightings: [],
            computeQueue: [],
            pseudoContext: new PseudoContext(),

            // config options
            illuminatedEntities: [],
            lightsCompositeOperation: "lighter",
            darkMapCompositeOperation: "source-over",
            clearColor: '#000000',
            maskColor: 'rgba(0,0,0,1)',
            
            init: function(options) {
                ig.merge(this, options);
                
                // Create dark mask
                this.darkMask = new illuminated.DarkMask({
                    lights: this.lights,
                    color: this.maskColor
                });
                
                // Create entity collections
                this.movingEntityLightedCollection = new ig.Collection(false);
                this.movingEntityLampCollection = new ig.Collection(false);
                
            },
                        
            setup: function() {
                
                // Set viewport
                var colMap = ig.game.collisionMap;
                this.viewportWidth = colMap.width * colMap.tilesize * ig.system.scale;
                this.viewportHeight = colMap.height * colMap.tilesize * ig.system.scale;

                // Add polygons
                var polygons = ig.game.collisionPolygons;
                for (var i=0; i < polygons.length; i++) {
                    this.addPolygon(polygons[i]);
                }

                
                // Add rects
                /*
                var rects = ig.game.collisionRects;
                for (var i=0; i < rects.length; i++) {
                    this.addRect(rects[i]);
                }
                */
                
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
                var objects = this.rects.concat(this.polygons);
                if(this.mode == 0) {
                    objects = objects.concat(this.entities);
                }
                for(var i=0; i<this.lightings.length; i++) {
                    this.lightings[i].objects = objects;
                }
            },
            
            clearLights: function() {
                this.lights = [];
            },
            
            addLight: function(entity) {
                var objects = this.rects.concat(this.entities).concat(this.polygons);
                entity.lighting = new illuminated.Lighting({
                    light: entity,
                    objects: objects
                });
                
                this.lightings.push(entity.lighting);
                this.lights.push(entity);
                this.darkMask.lights = this.lights;
                this.movingEntityLampCollection.addEntity(entity);
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
            
            addPolygon: function(polygon) {

                var polygonObject = new illuminated.PolygonObject();
                var points = [];
                for (var i = 0; i < polygon.length; i++) {
                    points.push(new illuminated.Vec2(polygon[i].x * ig.system.scale, polygon[i].y * ig.system.scale));
                }
                polygonObject.points = points;

                this.polygons.push(polygonObject);
            },
            
            addRect: function(rect) {

                var rectObject = new illuminated.RectangleObject({
                    topleft: new illuminated.Vec2(rect.x*8*ig.system.scale, rect.y*8*ig.system.scale),
                    bottomright: new illuminated.Vec2(rect.x*8*ig.system.scale+rect.width*8*ig.system.scale, rect.y*8*ig.system.scale+rect.height*8*ig.system.scale)
                });

                this.rects.push(rectObject);
            },
            
            update:function () {
                
                if(this.mode != 2) {
                
                    var lightingsUpdated = false;
                
                    // Compute lightings with moving entities in distance
                    for(var i=0; i<this.lightings.length; i++) {

                        // Get light source entity
                        var lampEntity = this.lightings[i].light;

                        // Check if light moved
                        if(this.movingEntityLightedCollection.contains(lampEntity)) {
                            this.lightings[i].compute(this.viewportWidth, this.viewportHeight);
                            lightingsUpdated = true;
                        }else{

                            // Get moving entities in range
                            var checkEntities = this.movingEntityLightedCollection.sample({
                                distance: {x: lampEntity.pos.x, y: lampEntity.pos.y, val: lampEntity.lamp.distance}
                            });
                        
                            if(checkEntities.length > 0) {
                                this.lightings[i].compute(this.viewportWidth, this.viewportHeight);
                                lightingsUpdated = true;
                            }
                        }
                    }
        
                    // Compute dark mask
                    if(lightingsUpdated) {
                        this.darkMask.compute(this.viewportWidth, this.viewportHeight);
                    }
                    
                }
                
                // Reset movingEntities to empty collection
                this.movingEntityLightedCollection.empty();
                this.movingEntityLampCollection.empty();
                
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
                    if(this.lightings[i]._cache) {
                        this.lightings[i].render(this.pseudoContext);
                    }
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
                }else if(mode == 0) {
                    this.updateAllLightings();
                }
                
            },
            
            registerEntityLighted: function(entity) {
                this.movingEntityLightedCollection.addEntity(entity);
            },
            
            registerEntityLamp: function(entity) {
                this.movingEntityLampCollection.addEntity(entity);
            }
            
        })
    });