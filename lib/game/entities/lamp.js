ig.module('game.entities.lamp').requires('plugins.box2d.entity.lamp').defines(function() {
    EntityLamp = ig.Box2DEntityLamp.extend({

        lampSettings: {
            distance: 50,
            diffuse: 0,
            color: 'rgba(239,284,234,0.75)',
            radius: 0,
            samples: 1,
            angle: (270).toRad(),
            roughness: 1,
            offset: {x: 3, y:5}
        },
        
        size: {
            x: 8,
            y: 8
        },
        userData: "lamp",
        animSheet: new ig.AnimationSheet('media/lamp.png', 8, 8),
        gravityFactor: 0,
        bodyType: Box2D.Dynamics.b2Body.b2_staticBody,
        bodyActive: false,
        init: function(x, y, settings) {
            this.addAnim('idle', 1, [0]);
            this.parent(x, y, settings);
        }
    });
});