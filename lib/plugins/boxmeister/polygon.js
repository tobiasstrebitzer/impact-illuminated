ig.module(
	'plugins.boxmeister.polygon'
)
.requires(
    'plugins.box2d.helper.concaviator'
)
.defines(function(){ "use strict";

bm.Polygon = ig.Class.extend({
    points: [],
    bounds: false,
    
	init: function(data) {
        this.bounds = false;
        if(data) { this.import(data); }
	},
    
    getConvexPolygons: function() {
        var concaviator = new ig.Box2DHelperConcaviator();
        
        // check if reversal is needed
        if(!this.isClockwise()) {
            this.reverse();
        }
        
        var results = concaviator.Separate(this.points);
        var polygons = [];
        for (var i = 0; i < results.length; i++) {
            polygons.push(new bm.Polygon(results[i]));
        }
        return polygons;
    },
    
    import: function(data) {
        this.reset();
        for (var i = 0; i < data.length; i++) {
            this.add(data[i].x, data[i].y);
        }
    },

    export: function() {
        // check if reversal is needed
        if(!this.isClockwise()) {
            this.reverse();
        }
        var data = [];
        for (var i = 0; i < this.points.length; i++) {
            data.push({x: this.points[i].x, y: this.points[i].y});
        }
        return data;
    },
    
    exportConvex: function() {
        var polygons = this.getConvexPolygons();
        var convexPolygonData = [];
        for (var i = 0; i < polygons.length; i++) {
            convexPolygonData.push(polygons[i].export())
        }
        return convexPolygonData;
    },
    
    isClockwise: function() {
        var area = 0;
        var j;
        for (var i = 0; i < this.points.length; i++) {
            j = (i + 1) % this.points.length;
            area += this.points[i].x * this.points[j].y;
            area -= this.points[j].x * this.points[i].y;
        }
        return (area / 2) > 0;
    },
    
    reverse: function() {
        var result = [];
        for (var i = this.points.length - 1; i >= 0; i--) {
            result.push(this.points[i]);
        }
        this.points = result;
    },
    
    reset: function() {
        this.complete = false;
        this.points = [];
        this.bounds = false;
    },
    
    add: function(x, y) {
        var point = (x instanceof bm.Point) ? x : new bm.Point(x, y);
        
        // check if previous
        if(this.last() && this.last().x == point.x && this.last().y == point.y) {
            return false;
        }
        
        this.points.push(point);
        
        // calculate bounds
        if(!this.bounds) {
            this.bounds = { x1: point.x, x2: point.x, y1: point.y, y2: point.y };
        }else{
            this.bounds.x1 = Math.min(this.bounds.x1, point.x);
            this.bounds.x2 = Math.max(this.bounds.x2, point.x);
            this.bounds.y1 = Math.min(this.bounds.y1, point.y);
            this.bounds.y2 = Math.max(this.bounds.y2, point.y);
        }
        
        return point;
    },
    
    at: function(i) {
        return this.points[i];
    },
    
    first: function() {
        return this.points[0];
    },
    
    last: function() {
        if(this.points.length == 0) { return false; }
        return this.points[this.points.length - 1];
    },
    
    count: function() {
        return this.points.length;
    },
    
    hasPoints: function() {
        return (this.count() > 0);
    },
    
    clone: function() {
        var polygon = new bm.Polygon(this.points);
        return polygon;
    },
    
    trim: function(length) {
        if(!length) { length = -1; }
        if(length == 0) {return false; }
        if(length > 0) {
            this.points = this.points.slice(length);
        }else{
            this.points = this.points.slice(0, length);
        }
        
    },
    
    update: function(index, x, y) {
        this.points[index] = new bm.Point(x, y);
    },
    
    indexOf: function(x, y) {
        for (var i = 0; i < this.points.length; i++) {
            if(this.points[i].matches(x, y)) {
                return i;
            }
        }
    },
    
    pointAt: function(x, y) {
        for (var i = 0; i < this.points.length; i++) {
            if(this.points[i].matches(x, y)) {
                return this.points[i];
            }
        }
        return false;
    },

    contains: function(x, y) {
        var point = (x instanceof bm.Point) ? x : new bm.Point(x, y);
        
        // check if point is in bounds ...
        if(!point.within(this.bounds)) { return false; }
        
        // use canvas path method
        ig.system.context.beginPath();
        ig.system.context.moveTo(this.first().x, this.first().y);
        for (var i = 0; i < this.points.length; i++) {
            ig.system.context.lineTo(this.points[i].x, this.points[i].y);
        }
        ig.system.context.closePath();
        
        if(ig.system.context.isPointInPath(point.x, point.y)){
            return true;
        }else{
            return false;
        }

    }

});

bm.Point = ig.Class.extend({
    x: null,
    y: null,
    
	init: function(x, y) {
        this.x = x;
        this.y = y;
	},
    
    matches: function(x, y) {
        var point = (x instanceof bm.Point) ? x : new bm.Point(x, y);
        return (this.x == point.x && this.y == point.y);
    },
    
    within: function(bounds) {
        return !(this.x < bounds.x1 || this.x > bounds.x2 || this.y < bounds.y1 || this.y > bounds.y2);
    }

});

});