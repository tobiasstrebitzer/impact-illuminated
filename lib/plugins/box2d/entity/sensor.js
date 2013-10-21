ig.module('plugins.box2d.entity.sensor').requires('plugins.box2d.entity').defines(function() {
    ig.Box2DEntitySensor = ig.Box2DEntity.extend({
                
        sensor: {
            x: 0,
            y: 0,
            width: 1,
            height: 1,
            activate: function() {
                
            },
            deactivate: function() {
                
            }
        },
        sensorFixture: null,
        sensorIncrement: 0,
        
        sensorIncrease: function() {
            this.sensorIncrement++;
            if(this.sensorIncrement == 1) {
                this.sensor.activate.call(this);
            }
        },
        
        sensorDecrease: function() {
            this.sensorIncrement--;
            if(this.sensorIncrement == 0) {
                this.sensor.deactivate.call(this);
            }
        },
                
        init: function(x, y, settings) {
            
            this.parent(x, y, settings);

            // Add sensor
            if(this.body) {
                
                // Create shape
                var position = new Box2D.Common.Math.b2Vec2(this.sensor.x*Box2D.SCALE/ig.system.scale, this.sensor.y*Box2D.SCALE/ig.system.scale);
                var polygonShape = new Box2D.Collision.Shapes.b2PolygonShape(null, null, position);
                polygonShape.SetAsOrientedBox(this.sensor.width*Box2D.SCALE/ig.system.scale, this.sensor.height*Box2D.SCALE/ig.system.scale, position, 0);
            
                // Create fixture
                var sensorFixtureDef = new Box2D.Dynamics.b2FixtureDef();
                sensorFixtureDef.shape = polygonShape;
                sensorFixtureDef.density = 0;
                sensorFixtureDef.isSensor = true;
            
                this.sensorFixture = this.body.CreateFixture(sensorFixtureDef);
                this.sensorFixture.SetUserData('sensor');
            }
            
        }
        
    });
});
