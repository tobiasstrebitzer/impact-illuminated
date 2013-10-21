ig.module('plugins.box2d.entity.lamp').requires('plugins.box2d.entity').defines(function() {
    ig.Box2DEntityLamp = ig.Box2DEntity.extend({
        
        lampSettings: {
            distance: 50,
            diffuse: 0,
            color: 'rgba(239,184,134,0.75)',
            radius: 0,
            samples: 1,
            angle: 0,
            roughness: 0,
            offset: {x: 0, y:0}
        },
        
        lamp: null,
        
        init: function(x, y, settings) {
            
            this.parent(x, y, settings);
            
            this.lampSettings.distance *= ig.system.scale;
            this.lampSettings.radius *= ig.system.scale;
            
            
            if (!ig.global.wm) {
                this.lamp = new illuminated.Lamp(this.lampSettings);
                this.syncLamp();
                ig.game.lightManager.addLight(this);
            }
            
        },
        
        syncLamp: function() {
            this.lamp.position = new illuminated.Vec2((this.pos.x+this.lampSettings.offset.x)*ig.system.scale, (this.pos.y+this.lampSettings.offset.y)*ig.system.scale);
        },
        
        update: function() {
            this.parent();
            this.syncLamp();
            
            if(this.body.IsActive()) {
                ig.game.lightManager.shouldUpdate = true;
            }
        },
        
        
        kill: function(force) {
            this.parent(force);
            if(force) {
                ig.game.lightManager.removeLight(this);
                ig.game.lightManager.shouldUpdate = true;
            }
        },
        
        // Illuminate.js methods
        
        mask: function(ctx) { return this.lamp.mask.call(this.lamp, ctx); },
        render: function(ctx) { return this.lamp.render.call(this.lamp, ctx); },
        bounds: function() { return this.lamp.bounds.call(this.lamp); },
        forEachSample: function(fn) { return this.lamp.forEachSample.call(this.lamp, fn); }

    });
});
