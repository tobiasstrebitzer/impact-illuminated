ig.module('game.entities.projectile').requires('plugins.box2d.entity.lamp').defines(function() {

    EntityProjectile = ig.Box2DEntityLamp.extend({
        lampSettings: {
            distance: 25,
            diffuse: 0,
            color: 'rgba(239,45,32,0.75)',
            radius: 0,
            samples: 1,
            angle: 0,
            roughness: 0,
            offset: {x: 0, y:0}
        },
        size: {
            x: 2,
            y: 2
        },
        type: ig.Entity.TYPE.NONE,
        animSheet: new ig.AnimationSheet('media/projectile.png', 2, 2),
        health: 1,
        userData: "bullet",
        lifetime: 100,
        bodyBullet: true,
        collisionHandlers: {
            "player": function(player) {
                player.receiveDamage(10, this);
                this.kill();
            },
            "crate": function(crate) {
                crate.receiveDamage(10, this);
                this.kill();
            },
            "any": function(crate) {
                this.kill();
            },
        },
        init: function(x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('idle', 1, [0]);
            this.currentAnim.flip.x = settings.flip;
            var velocity = (settings.flip ? -settings.power : settings.power);
            if(this.fixture) { this.fixture.SetRestitution(0.4); }
            this.body.ApplyImpulse(new b2Vec2(velocity, 0), this.body.GetPosition());
        }
        
    });
});