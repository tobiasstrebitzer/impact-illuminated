ig.module('plugins.box2d.entity').requires('impact.entity', 'plugins.box2d.game').defines(function() {
    ig.Box2DEntity = ig.Entity.extend({
        
        // quick access variables
        angle: 0,
        
        // event listeners
        listeners: {},
        collisionHandlers: {},
        
        // impact internals
        collides: ig.Entity.COLLIDES.NEVER,
        checkAgainst: ig.Entity.TYPE.NONE,
        
        // box2d internals
        body: null,
        fixture: null,
        
        // box2d settings
        bodyActive: true,
        bodyType: Box2D.Dynamics.b2Body.b2_dynamicBody,
        bodyBullet: false,
        fixtureDensity: 1.0,
        
        // box2d mechanics
        alwaysUpdate: false,
        killed: false,
        
        // game mechanics
        lifetime: false,
        maxLifetime: false,
        
        init: function(x, y, settings) {
            this.parent(x, y, settings);
            if (!ig.global.wm) {
                this.createBody();
                if(this.userData && this.fixture) {
                    this.fixture.SetUserData(this.userData);
                }
                this.maxLifetime = this.lifetime;
            }
        },
        
        createBody: function() {
            
            // Create body
            var bodyDef = new Box2D.Dynamics.b2BodyDef();
            bodyDef.position = new Box2D.Common.Math.b2Vec2((this.pos.x + this.size.x / 2) * Box2D.SCALE, (this.pos.y + this.size.y / 2) * Box2D.SCALE);
            bodyDef.type = this.bodyType;
            bodyDef.active = this.bodyActive;
            bodyDef.bullet = this.bodyBullet;
            this.body = ig.world.CreateBody(bodyDef);
            this.body.entity = this;
            
            // Create fixture
            var fixtureDef = new Box2D.Dynamics.b2FixtureDef;
            fixtureDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
            fixtureDef.shape.SetAsBox(this.size.x / 2 * Box2D.SCALE, this.size.y / 2 * Box2D.SCALE);
            fixtureDef.density = this.fixtureDensity;
            this.fixture = this.body.CreateFixture(fixtureDef);
            
        },
        update: function() {
        
            // Handle entity lifetime
            if(this.lifetime !== false) {
                this.lifetime--;
                this.currentAnim.alpha = this.lifetime / this.maxLifetime;
                if(this.lifetime <= 0) { this.kill(); }
            }
            
            // Set impact variables
            var p = this.body.GetPosition();
            this.pos = {
                x: (p.x / Box2D.SCALE - this.size.x / 2),
                y: (p.y / Box2D.SCALE - this.size.y / 2)
            };
            this.angle = this.body.GetAngle().round(2);
            if (this.currentAnim) {
                this.currentAnim.update();
                this.currentAnim.angle = this.angle;
            }
            
        },
        
        kill: function(force) {
            
            if(force === true) {
                if(this.listeners.kill) {
                    this.listeners.kill.call(this);
                }
                ig.world.DestroyBody(this.body);
                this.body = null;
                this.parent();
            }else{
                this.killed = true;
            }

        },
        
        onCollide: function(targetData, callback) {
            this.collisionHandlers[targetData] = callback;
        }

    });
});