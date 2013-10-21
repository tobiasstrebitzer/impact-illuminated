ig.module('game.entities.torch').requires('plugins.box2d.entity.lamp').defines(function() {
    EntityTorch = ig.Box2DEntityLamp.extend({
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