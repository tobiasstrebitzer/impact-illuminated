ig.module('plugins.box2d.entity.lighted').requires('plugins.box2d.entity').defines(function() {
    ig.Box2DEntityLighted = ig.Box2DEntity.extend({
        
        
        init: function(x, y, settings) {
            this.parent(x, y, settings);

            // initialize light blocker object
            if (!ig.global.wm) {
                this.object = new illuminated.PolygonObject();
                this.syncObject();
                ig.game.lightManager.addEntity(this);
            }
            
        },
        
        update: function() {
            
            this.parent();
            
            // Update light blocker object
            this.syncObject();
            
            // Update lightmanager
            ig.game.lightManager.shouldUpdate = true;
            
        },
        
        syncObject: function() {

            // Get Vertices
            var vertices = this.fixture.GetShape().GetVertices();
            var points = [];
            var wp;
            var point;
            for(var i=0; i<vertices.length; i++) {
                wp = this.body.GetWorldPoint(vertices[i]);
                point = new illuminated.Vec2(wp.x/Box2D.SCALE*ig.system.scale, wp.y/Box2D.SCALE*ig.system.scale);
                points.push(point);
            }
            
            this.object.points = points;
        },
        
        kill: function(force) {
            this.parent(force);
            if(force) {
                ig.game.lightManager.removeEntity(this);
                ig.game.lightManager.shouldUpdate = true;
            }
        },
        
        // Illuminate.js methods
        contains: function(point) { return this.object.contains.call(this.object, point); },
        cast: function(ctx, origin, bounds) { return this.object.cast.call(this.object, ctx, origin, bounds); },
        path: function(ctx) { return this.object.path.call(this.object, ctx); }

    });
});
