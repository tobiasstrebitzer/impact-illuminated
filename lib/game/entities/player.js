ig.module('game.entities.player').requires('plugins.box2d.entity.sensor', 'game.entities.projectile').defines(function() {
    EntityPlayer = ig.Box2DEntitySensor.extend({
        name: "bimf",
        size: {
            x: 8,
            y: 14
        },
        offset: {
            x: 4,
            y: 2
        },
        sensor: {
            x: 0, y: 14,
            width: 6, height: 1,
            activate: function() {
                this.standing = true;
            },
            deactivate: function() {
                this.standing = false;
            }
        },
        stats: {
            // 1 - 10
            agility: 3,
            shooting: 10
        },
        points: [
            [3, 2],
            [10, 2],
            [10, 12],
            [12, 12],
            [12, 16],
            [2, 16],
            [2, 10],
            [3, 10]
        ],
        standing: false,
        animSheet: new ig.AnimationSheet('media/player.png', 16, 24),
        flip: false,
        health: 10000,
        alwaysUpdate: true,
        jumpTimer: 0,
        shootTimer: 0,
        userData: "player",
        init: function(x, y, settings) {
            this.parent(x, y, settings);
            this.addAnim('idle', 1, [0]);
            this.addAnim('jump', 0.07, [1, 2]);
            if (!ig.global.wm) {
                this.body.SetFixedRotation(true);
            }
        },
        update: function() {
            
            var velocity = this.body.GetLinearVelocity();
            
            if (ig.input.state('left')) {
                if(velocity.x > -this.stats.agility-3) {
                    this.body.ApplyForce(new b2Vec2(-(this.stats.agility*2+9), 0), this.body.GetPosition());
                }
                this.flip = true;
            } else if (ig.input.state('right')) {
                if(velocity.x < this.stats.agility+3) {
                    this.body.ApplyForce(new b2Vec2(+(this.stats.agility*2+9), 0), this.body.GetPosition());
                }
                this.flip = false;
            }
            if (this.jumpTimer == 0 && this.standing && ig.input.pressed('jump')) {
                this.jumpTimer = 10;
                this.body.ApplyImpulse(new b2Vec2(0, -(this.stats.agility+7)), this.body.GetPosition());
            } else {
                this.currentAnim = this.anims.idle;
            }
            
            if (ig.input.state('shoot') && this.shootTimer == 0) {
                this.shootTimer = Math.round(100 / (this.stats.shooting + 1));
                var x = this.pos.x + (this.flip ? -12 : 12);
                var y = this.pos.y + 9;
                ig.game.spawnEntity(EntityProjectile, x, y, {
                    flip: this.flip,
                    power: this.stats.shooting / 2
                });
            }
            
            if (!this.standing) {
                this.currentAnim = this.anims.jump;
            }
            
            // Decrease jump timer
            if(this.jumpTimer > 0) { this.jumpTimer--; }
            if(this.shootTimer > 0) { this.shootTimer--; }
            
            this.currentAnim.flip.x = this.flip;
            this.parent();
        }
        
    });
});