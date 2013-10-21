ig.module('plugins.box2d.listener').requires('impact.entity', 'plugins.box2d.game').defines(function() {
    
    ig.Box2DListener = new Box2D.Dynamics.b2ContactListener;
    
    ig.Box2DListener.BeginContact = function(contact) {
        var bodyA = contact.GetFixtureA().GetBody(), bodyB = contact.GetFixtureB().GetBody(),
            dataA = contact.GetFixtureA().GetUserData(), dataB = contact.GetFixtureB().GetUserData();
        
        // Check for registered listener
        if(bodyA.entity && bodyB.entity) {
            if(bodyA.entity.collisionHandlers[dataB]) {
                bodyA.entity.collisionHandlers[dataB].call(bodyA.entity, bodyB.entity);
            }else if(bodyB.entity.collisionHandlers[dataA]) {
                bodyB.entity.collisionHandlers[dataA].call(bodyB.entity, bodyA.entity);
            }            
        }
        
        // Check for sensor
        if(dataA == "sensor") {
            bodyA.entity.sensorIncrease();
        }else if(dataB == "sensor") {
            bodyB.entity.sensorIncrease();
        }
        
    }
    
    ig.Box2DListener.EndContact = function(contact) {
        var bodyA = contact.GetFixtureA().GetBody(), bodyB = contact.GetFixtureB().GetBody(),
            dataA = contact.GetFixtureA().GetUserData(), dataB = contact.GetFixtureB().GetUserData();
            
        // Check for feet signal
        if(dataA == "sensor") {
            bodyA.entity.sensorDecrease();
        }else if(dataB == "sensor") {
            bodyB.entity.sensorDecrease();
        }
    }
    
    ig.Box2DListener.PostSolve = function(contact, impulse) {

    }
    
    ig.Box2DListener.PreSolve = function(contact, oldManifold) {

    }

});