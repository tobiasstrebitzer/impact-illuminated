ig.module('game.entities.crate').requires('plugins.box2d.entity.lighted').defines(function() {
    EntityCrate = ig.Box2DEntityLighted.extend({
        size: {
            x: 8,
            y: 8
        },
        userData: "crate",
        health: 30,
        animSheet: new ig.AnimationSheet('media/crate.png', 8, 8),
        listeners: {
            kill: function() {
                var x = this.pos.x;
                var y = this.pos.y;
                ig.game.spawnEntity(EntityCrateFragment, x-0.5, y-0.5, {fragment: 0});
                ig.game.spawnEntity(EntityCrateFragment, x+0.5, y-0.5, {fragment: 1});
                ig.game.spawnEntity(EntityCrateFragment, x-0.5, y+0.5, {fragment: 2});
                ig.game.spawnEntity(EntityCrateFragment, x+0.5, y+0.5, {fragment: 3});
            }
        },
        init: function(x, y, settings) {
            this.addAnim('idle', 1, [0]);
            this.addAnim('damaged', 1, [1]);
            this.parent(x, y, settings);
            if(this.fixture) { this.fixture.SetRestitution(0.1); }
        },
        receiveDamage: function(amount, from) {
            this.parent(amount, from);
            if(this.health < 15) {
                this.currentAnim = this.anims.damaged;
            }
        }
    });
    
    EntityCrateFragment = ig.Box2DEntity.extend({
        size: {
            x: 4,
            y: 4
        },
        animSheet: new ig.AnimationSheet('media/cratefragment.png', 4, 4),
        health: 1,
        userData: "cratefragment",
        lifetime: 25,
        init: function(x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('idle', 1, [settings.fragment]);
            if(this.fixture) { this.fixture.SetRestitution(0.5); }
            this.body.ApplyImpulse(new b2Vec2(2*Math.random() - 1, 2*Math.random() - 1), this.body.GetPosition());
        }
        
    });
});