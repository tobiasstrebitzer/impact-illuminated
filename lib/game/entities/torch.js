ig.module('game.entities.torch').requires('plugins.box2d.entity.lamp').defines(function() {
    EntityTorch = ig.Box2DEntityLamp.extend({
        
        lampSettings: {
            distance: 50,
            diffuse: 0,
            color: 'rgba(239,184,134,0.75)',
            radius: 0,
            samples: 1,
            angle: 0,
            roughness: 0,
            offset: {x: 4, y:2}
        },
        
        size: {
            x: 8,
            y: 8
        },
        userData: "torch",
        animSheet: new ig.AnimationSheet('media/torch.png', 8, 8),
        gravityFactor: 0,
        bodyType: Box2D.Dynamics.b2Body.b2_staticBody,
        bodyActive: false,
        init: function(x, y, settings) {
            this.addAnim('idle', 1, [0]);
            this.parent(x, y, settings);
        }
    });
});