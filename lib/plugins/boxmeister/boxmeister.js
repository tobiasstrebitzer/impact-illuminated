var bm = {};

ig.module(
	'plugins.boxmeister.boxmeister'
)
.requires(
    'plugins.boxmeister.polygon',
	'weltmeister.weltmeister',
    'weltmeister.edit-map'
)
.defines(function(){ "use strict";

wm.config.binds["K"] = "divideplus";
wm.config.binds["J"] = "divideminus";
wm.config.binds["ESC"] = "escape";

wm.Weltmeister.inject({	
    
	init: function() {
        this.parent();
	},
    
	keyup: function( action ) {
        this.parent(action);
		if( !this.activeLayer ) { return; }
        
        if( action == "divideplus") {
            this.activeLayer.divisions = Math.min(8, this.activeLayer.divisions * 2);
        }
        
        if( action == "divideminus") {
            this.activeLayer.divisions = Math.max(1, this.activeLayer.divisions / 2);
        }
        
		if( action == 'delete' ) {
            if( this.activeLayer.polygonActive) { 
                this.activeLayer.currentPolygon.trim(-1);
                if(this.activeLayer.currentPolygon.count() == 0) {
                    this.activeLayer.polygonActive = false;
                    this.activeLayer.currentPolygon.reset();
                    this.activeLayer.selectedPolygon = null;
                }
            }else{
                if(this.activeLayer.selectedPolygon) {
                    for (var i = this.activeLayer.polygons.length - 1; i >= 0; i--) {
                        if(this.activeLayer.polygons[i] == this.activeLayer.selectedPolygon) {
                            this.activeLayer.polygons.splice(i, 1);
                            this.activeLayer.selectedPolygon = null;
                            this.setModified();
                            return;
                        }
                    }
                }
                var polygon;
                var info = this.activeLayer.getPositionInfo();

            }
		}

    },
    
	toggleCollisionLayer: function( ev ) {
		var isCollision = $('#layerIsCollision').prop('checked');
		$('#layerPolygonCollision').attr('disabled', !isCollision );
        this.parent();
	},

	updateLayerSettings: function( ) {
		$('#layerPolygonCollision').val( this.activeLayer.polygonCollision );
        this.parent();
	},
    
	saveLayerSettings: function() {
		var isCollision = $('#layerIsCollision').prop('checked');
		if( isCollision ) {
            this.activeLayer.polygonCollision = $('#layerPolygonCollision').prop('checked');
		}
        this.parent();
    },
    
	setActiveLayer: function( name ) {
        this.parent(name);
        if(name == 'collision') {
            $('#layerPolygonCollision').prop('checked', this.activeLayer.polygonCollision );
        }
	},
    
	loadResponse: function( data ) {
        this.parent(data);
        		
		// extract JSON from a module's JS
		var jsonMatch = data.match( /\/\*JSON\[\*\/([\s\S]*?)\/\*\]JSON\*\// );
		data = JSON.parse( jsonMatch ? jsonMatch[1] : data );
        
		for( var i=0; i < data.layer.length; i++ ) {
            this.layers[i].polygonCollision = data.layer[i].polygonCollision;
            
            if(this.layers[i].polygonCollision && data.layer[i].originalPolygons) {
                this.layers[i].polygons = [];
                for (var j = 0; j < data.layer[i].originalPolygons.length; j++) {
                    this.layers[i].polygons.push(new bm.Polygon(data.layer[i].originalPolygons[j]));
                }
            }
            
		}
	},
    
	setTileOnCurrentLayer: function() {
		if( !this.activeLayer || !this.activeLayer.scroll ) { return; }
        
        if(this.activeLayer.polygonCollision) {
            
            // Check for edit mode point drop
            if(this.activeLayer.editMode === true) {
                this.activeLayer.editMode = false;
                return;
            }
            
            // Check if a point was clicked
            if(this.activeLayer.selectedPolygon) {
                var info = this.activeLayer.getPositionInfo();
                var point = this.activeLayer.selectedPolygon.pointAt(info.vx, info.vy);
                if(point) {
                    this.activeLayer.editMode = true;
                    this.activeLayer.editIndex = this.activeLayer.selectedPolygon.indexOf(point);
                    return;
                }
            }
            
            if(this.activeLayer.hoverPolygon) {
                if(this.activeLayer.selectedPolygon != this.activeLayer.hoverPolygon) {
                    // hover polygon clicked -> change selection
                    this.activeLayer.selectedPolygon = this.activeLayer.hoverPolygon;
                }
            }else{
                if(this.activeLayer.selectedPolygon) {
                    this.activeLayer.selectedPolygon = null;
                }else{
                    this.activeLayer.addVertex();
                }
            }
        }else{
            this.parent();
        }
	},

});

wm.EditMap.inject({
    polygonCollision: false,
    polygons: [],
    currentPolygon: null,
    polygonActive: false,
    cursorX: 0,
    cursorY: 0,
    divisions: 2,
    editMode: false,
    editIndex: null,
    
	init: function( name, tilesize, tileset, foreground ) {
	    this.parent(name, tilesize, tileset, foreground);
	},
    
	getSaveData: function() {
        var saveData = this.parent();
        saveData.polygonCollision = this.polygonCollision;
        if(saveData.polygonCollision) {
            saveData.polygons = [];
            saveData.originalPolygons = [];
            for (var i = 0; i < this.polygons.length; i++) {
                saveData.polygons = saveData.polygons.concat(this.polygons[i].exportConvex());
                saveData.originalPolygons.push(this.polygons[i].export());
            }
        }
        return saveData;
	},
    
    addVertex: function() {
        var info = this.getPositionInfo();
        
        // Activate polygon mode and add first vertex
        if(!this.polygonActive) {
            this.polygonActive = true;
            this.currentPolygon = new bm.Polygon();
            this.currentPolygon.add(info.vx, info.vy);
        }else{
            if(this.currentPolygon.first().matches(info.vx, info.vy)) {
                
                // Delete if it contains only 2 points
                if(this.currentPolygon.count() <= 2) {
                    this.polygonActive = false;
                    this.currentPolygon.reset();
                }else{
                    // Finish polygon mode
                    this.polygons.push(this.currentPolygon.clone());
                    this.polygonActive = false;
                    this.currentPolygon.reset();
                }
                
            }else{
                this.currentPolygon.add(info.vx, info.vy)
            }
            
        }
        
    },
    
    getPositionInfo: function(x, y) {
        x = x ? x : ig.input.mouse.x;
        y = y ? y : ig.input.mouse.y;
        
        x = (x + this.scroll.x);
        y = (y + this.scroll.y);
        
		var cx = Math.floor( x / this.tilesize ) * this.tilesize,
            cy = Math.floor( y / this.tilesize ) * this.tilesize,
            rx = Math.floor((x-cx) / this.tilesize * this.divisions) * (this.tilesize / this.divisions),
            ry = Math.floor((y-cy) / this.tilesize * this.divisions) * (this.tilesize / this.divisions);
        
        return {
            x: cx,
            y: cy,
            w: this.tilesize,
            h: this.tilesize,
            vx: cx + rx,
            vy: cy + ry
        }
        
    },
    
    drawCursor: function( x, y ) {
        if(this.polygonCollision) {
            
            var info = this.getPositionInfo(x, y);
            
            // Draw complete polygons
            // this.selectedPolygon = this.getSelectedPolygon();
            this.hoverPolygon = this.getHoverPolygon();
            for (var i = 0; i < this.polygons.length; i++) {
                if(this.polygons[i] != this.hoverPolygon && this.polygons[i] != this.selectedPolygon) {
                    this.drawPolygonLines(this.polygons[i], [175,175,175], 1, 0.25);
                }
            }
            
            // Draw selected polygon
            if(this.selectedPolygon) {
                
                if(this.editMode === true) {
                    this.selectedPolygon.update(this.editIndex, info.vx, info.vy);
                    this.drawPolygonLines(this.selectedPolygon, [179,35,72]);
                    this.drawVertex(info.vx, info.vy, 1, "#FF0000");
                }else{
                    this.drawPolygonLines(this.selectedPolygon, [255,0,0]);
                    this.drawPolygonPoints(this.selectedPolygon, 1, "#FF0000");
                }
            }
            
            // Draw hover polygon
            if(this.hoverPolygon && this.hoverPolygon != this.selectedPolygon) {
                this.drawPolygonLines(this.hoverPolygon, [255,255,255]);
            }
            
            // Draw current polygon (creation mode)
            if(this.currentPolygon && this.currentPolygon.hasPoints()) {
                
                // Draw initial spot
                this.drawVertex(this.currentPolygon.first().x, this.currentPolygon.first().y, 1, "#FF0000");
                
                // Draw path
                this.startPath(this.currentPolygon.first().x, this.currentPolygon.first().y, "#FFFFFF");
                for (var i = 1; i < this.currentPolygon.count(); i++) {
                    this.addToPath(this.currentPolygon.at(i).x, this.currentPolygon.at(i).y);
                }
                
                // Add current cursor position
                this.addToPath(info.vx, info.vy);
                
                // Draw stroke
                ig.system.context.stroke();
                
                // Draw vertices
                for (var i = 1; i < this.currentPolygon.count(); i++) {
                    this.drawVertex(this.currentPolygon.at(i).x, this.currentPolygon.at(i).y, 1, "#FFFFFF");
                }
                
            }
            
            // Draw Box
            this.drawBox(info.x, info.y, info.w, info.h, 'rgba(255,255,255,0.5)');
            
            // Draw vertex circle
            this.drawCircle(info.vx, info.vy, 2, "#FFFFFF");
            
            // Draw vertex
            this.drawVertex(info.vx, info.vy, 0.5, "#FFFFFF");
            
        }else{
            this.parent(x, y);
        }
    },
    
    getHoverPolygon: function() {
        var info = this.getPositionInfo();
        for (var i = 0; i < this.polygons.length; i++) {
            if(this.polygons[i].contains(info.vx, info.vy)) {
                return this.polygons[i];
            }
        }
        return false;
    },
    
    drawPolygonPoints: function(polygon, radius, color) {
        color = color ? color : "#FFFFFF";
        for (var i = 0; i < polygon.count(); i++) {
            this.drawVertex(polygon.at(i).x, polygon.at(i).y, radius, color);
        }
    },
    
    drawPolygonLines: function(polygon, rgb, a1, a2) {
        a1 = a1 ? a1 : 1;
        a2 = a2 ? a2 : 0.5;
        var colorFull = "rgba("+rgb.join(",")+","+a1+")";
        var colorHalf = "rgba("+rgb.join(",")+","+a2+")";
        
        this.startPath(polygon.first().x, polygon.first().y, colorFull);
        var point;
        for (var j = 1; j < polygon.count(); j++) {
            point = polygon.at(j);
            this.addToPath(point.x, point.y);
        }
        ig.system.context.closePath();
        
        ig.system.context.fillStyle = colorHalf;
        ig.system.context.fill();
        ig.system.context.strokeStyle = colorFull;
        ig.system.context.stroke();
    },
    
    startPath: function(x, y, color) {
        ig.system.context.beginPath();
        ig.system.context.moveTo(this.translateX(x), this.translateY(y));
        ig.system.context.strokeStyle = color;
    },
    
    addToPath: function(x, y) {
        ig.system.context.lineTo(this.translateX(x), this.translateY(y));
    },
    
    drawBox: function(x, y, width, height, color) {
		ig.system.context.lineWidth = 1;
		ig.system.context.strokeStyle = color;
		ig.system.context.strokeRect( 
            this.translateX(x), this.translateY(y),
            width*ig.system.scale, height*ig.system.scale 
        );
    },
    
    drawCircle: function(x, y, radius, color) {
        ig.system.context.beginPath();
        ig.system.context.arc(this.translateX(x), this.translateY(y), radius*ig.system.scale, 0, 2 * Math.PI, false);
        ig.system.context.lineWidth = 1;
        ig.system.context.strokeStyle = color;
        ig.system.context.stroke();
    },
    
    drawVertex: function(x, y, radius, color) {
        ig.system.context.beginPath();
        ig.system.context.arc(this.translateX(x), this.translateY(y), radius*ig.system.scale, 0, 2 * Math.PI, false);
        ig.system.context.fillStyle = color;
        ig.system.context.fill();
    },
    
    translateX: function(x) {
        return (x-this.scroll.x)*ig.system.scale;
    },
    
    translateY: function(y) {
        return (y-this.scroll.y)*ig.system.scale;
    }
    
});

});