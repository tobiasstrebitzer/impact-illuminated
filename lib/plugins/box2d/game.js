ig.module('plugins.box2d.game').requires('plugins.box2d.lib', 'impact.game').defines(function() {
    ig.Box2DGame = ig.Game.extend({
        collisionRects: [],
        collisionPolygons: [],
        debugCollisionRects: false,
        worldVelocityIterations: 6,
        worldPositionIterations: 6,
        loadLevel: function(data) {
            for (var i = 0; i < data.layer.length; i++) {
                var ld = data.layer[i];
                if (ld.name == 'collision') {
                    ig.world = this.createWorldFromMap(ld, ld.data, ld.width, ld.height, ld.tilesize);
                    break;
                }
            }
            this.parent(data);
        },
        createWorldFromMap: function(level, origData, width, height, tilesize) {
            var worldBoundingBox = new Box2D.Collision.b2AABB();
            worldBoundingBox.lowerBound.Set(0, 0);
            worldBoundingBox.upperBound.Set((width + 1) * tilesize * Box2D.SCALE, (height + 1) * tilesize * Box2D.SCALE);
            var gravity = new Box2D.Common.Math.b2Vec2(0, this.gravity * Box2D.SCALE);
            world = new Box2D.Dynamics.b2World(gravity, true);
            var data = ig.copy(origData);
            
            this.collisionRects = [];
            this.collisionPolygons = [];
            
            if(level.polygonCollision && level.polygonCollision === true) {
                // Fill collision polygons
                this.collisionPolygons = level.polygons;
                
                // Create bodies from polygons
                for (var i = 0; i < this.collisionPolygons.length; i++) {
                    this.addCollisionPolygon(world, this.collisionPolygons[i]);
                }
                
            }
        
            /*
            // Fill collision rects
            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    if (data[y][x]) {
                        var r = this._extractRectFromMap(data, width, height, x, y);
                        this.collisionRects.push(r);
                    }
                }
            }
            
            // Create bodies from rects
            for (var i = 0; i < this.collisionRects.length; i++) {
                var rect = this.collisionRects[i];
                var bodyDef = new Box2D.Dynamics.b2BodyDef();
                bodyDef.position.Set(rect.x * tilesize * Box2D.SCALE + rect.width * tilesize / 2 * Box2D.SCALE, rect.y * tilesize * Box2D.SCALE + rect.height * tilesize / 2 * Box2D.SCALE);
                var body = world.CreateBody(bodyDef);
                var shape = new Box2D.Collision.Shapes.b2PolygonShape();
                shape.SetAsBox(rect.width * tilesize / 2 * Box2D.SCALE, rect.height * tilesize / 2 * Box2D.SCALE);
                body.CreateFixture2(shape);
            }
            */
                
            

            return world;
        },
        
        addCollisionPolygon: function(world, polygon) {
            var bodyDef = new Box2D.Dynamics.b2BodyDef();
            bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody,
            bodyDef.active = true;
            bodyDef.position.Set(0, 0);
            var body = world.CreateBody(bodyDef);
            var shape = new Box2D.Collision.Shapes.b2PolygonShape();
            
            // Add points/vecs to shape
            var vecs = [];
            for (var i = 0; i < polygon.length; i++) {
                vecs[i] = new Box2D.Common.Math.b2Vec2(polygon[i].x*Box2D.SCALE, polygon[i].y*Box2D.SCALE);
            }
            
            var fixtureDef = new Box2D.Dynamics.b2FixtureDef;
            fixtureDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
            fixtureDef.shape.SetAsArray(vecs, vecs.length);
            fixtureDef.density = 100000;
            body.CreateFixture(fixtureDef);
            
            body.SetActive(false);
            body.SetActive(true);
        },
        
        _extractRectFromMap: function(data, width, height, x, y) {
            var rect = {
                x: x,
                y: y,
                width: 1,
                height: 1
            };
            for (var wx = x + 1; wx < width && data[y][wx]; wx++) {
                rect.width++;
                data[y][wx] = 0;
            }
            for (var wy = y + 1; wy < height; wy++) {
                var rowWidth = 0;
                for (wx = x; wx < x + rect.width && data[wy][wx]; wx++) {
                    rowWidth++;
                }
                if (rowWidth == rect.width) {
                    rect.height++;
                    for (wx = x; wx < x + rect.width; wx++) {
                        data[wy][wx] = 0;
                    }
                } else {
                    return rect;
                }
            }
            return rect;
        },
        update: function() {
            ig.world.Step(ig.system.tick, this.worldVelocityIterations, this.worldPositionIterations);
            ig.world.ClearForces();
            this.parent();
        },
    	updateEntities: function() {
    		for( var i = 0; i < this.entities.length; i++ ) {
    			var ent = this.entities[i];
    			if( !ent._killed ) {
                    
                    // kill entity if set 
                    if(ent.killed === true) {
                        ent.kill(true);
                    }else{
                        if(ent.body) {
                            if(ent.alwaysUpdate === true || (ent.body.IsAwake() && ent.body.IsActive())) {
                                ent.update();
                            }
                        }else{
                            ent.update();
                        }
                    }
                    
    			}
    		}
    	},
        draw: function() {
            this.parent();
            if (this.debugCollisionRects) {
                var ts = this.collisionMap.tilesize;
                for (var i = 0; i < this.collisionRects.length; i++) {
                    var rect = this.collisionRects[i];
                    ig.system.context.strokeStyle = '#00ff00';
                    ig.system.context.strokeRect(ig.system.getDrawPos(rect.x * ts - this.screen.x), ig.system.getDrawPos(rect.y * ts - this.screen.y), ig.system.getDrawPos(rect.width * ts), ig.system.getDrawPos(rect.height * ts));
                }
            }
        }
    });
});
