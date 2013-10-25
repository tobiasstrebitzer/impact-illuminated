ig.module('plugins.box2d.helper.marchingsquares').requires().defines(function() {
    ig.Box2DHelperMarchingSquares = ig.Class.extend({
        
        // privates
        map: null,
        width: null,
        height: null,
        current: null,
        index: {},
        
        // constants
        transform: [
            [ 1, 0], // 0000 =  0 = right
            [ 0,-1], // 1000 =  1 = up
            [ 1, 0], // 0100 =  2 = right
            [ 1, 0], // 1100 =  3 = right
            [ 0, 1], // 0010 =  4 = down
            [ 0,-1], // 1010 =  5 = up
            [ 0, 1], // 0110 =  6 = down
            [ 0, 1], // 1110 =  7 = down
            [-1, 0], // 0001 =  8 = left
            [ 0,-1], // 1001 =  9 = up
            [-1, 0], // 0101 = 10 = left
            [ 1, 0], // 1101 = 11 = right
            [-1, 0], // 0011 = 12 = left
            [ 0,-1], // 1011 = 13 = up
            [-1, 0], // 0111 = 14 = left
            false    // 1111 = 15 = error
        ],
        
        init: function(map) {
            this.map = ig.copy(map);
            this.width = map[0].length;
            this.height = map.length;
            this.current = {x: -1, y:0};
            
            // Add vertical borders
            this.map[-1] = [];
            this.map[this.height] = [];
        },
        
        identifyPaths: function() {
            var paths = [];
            while (this.next()) {
                var pos = ig.copy(this.current);
                var rect = this.rect(pos);
                var rectValue = this.rectValue(rect);
                if(rectValue != 15) {
                    paths.push(this.path(pos));
                }
            }
            
            return paths;
        },

        path: function(pos) {
            var last = ig.copy(pos);
            var path = [ig.copy(pos)];
            
            while (true) {
                this.index[pos.x+"-"+pos.y] = true;
                var rect = this.rect(pos);
                var rectValue = this.rectValue(rect);
                var transform = this.transform[rectValue];
                if(transform === false) {
                    return false;
                }
                pos.x += transform[0];
                pos.y += transform[1];
                path.push(ig.copy(pos));
                
                if(pos.x == last.x && pos.y == last.y) {
                    break;
                }

            }         
            
            return path;

            
        },
        
        rectValue: function(rect) {
            var rectValue = 0;
            if(rect[0]) { rectValue += 1; }
            if(rect[1]) { rectValue += 2; }
            if(rect[2]) { rectValue += 4; }
            if(rect[3]) { rectValue += 8; }
            return rectValue;
        },

        next: function() {
            while (true) {
                this.current.x++;
                if(this.current.x >= this.width-1) {
                    this.current.y++;
                    this.current.x = 0;
                    // Last line finished?
                    if(this.current.y >= this.height-1) { 
                        return false;
                    }
                }
                
                // Is solid mass
                if(this.solid()) {
                    
                    // Is not yet indexed?
                    if(!this.index[this.current.x+"-"+this.current.y]) {
                        return true;
                    }
                }
                
            }
        },
        
        solid: function() {
            return this.map[this.current.y][this.current.x];
        },
        
        rect: function(pos) {
            return [
                this.map[pos.y-1][pos.x-1] ? 1 : 0,
                this.map[pos.y-1][pos.x-0] ? 1 : 0,
                this.map[pos.y-0][pos.x-0] ? 1 : 0,
                this.map[pos.y-0][pos.x-1] ? 1 : 0
            ];
        }

    });
});