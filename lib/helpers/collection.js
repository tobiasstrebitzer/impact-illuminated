ig.module('helpers.collection')
    .requires('plugins.box2d.entity')
    .defines(function () {

        ig.Collection = ig.Class.extend({
            
            // internals
            entities: null,
            filters: {},

            init: function(filters) {
                if(filters !== false) {
                    $.extend(this.filters, filters);
                    this.filter();                    
                }else{
                    this.entities = [];
                }
            },
            
            sample: function(filters) {
                
                if(Object.keys(filters).length) {
                    var c = this;
                    return $(this.entities).filter(function() {
                        for(var key in filters) {
                            if(key == "instanceOf") {
                                if(!(this instanceof filters[key])) {
                                    return false;
                                }
                            }else if(key == "distance") {
                                if(c.distanceTo(filters[key].x, filters[key].y, this) > filters[key].val) {
                                    return false;
                                }
                            }else if($.isFunction(filters[key])) {
                                var result = filters[key].call(this, this[key]);
                                if(result === false) {
                                    return false;
                                }
                            }else{
                                if(this[key] != filters[key]) {
                                    return false;
                                }
                            }
                        }
                        return true;
                    }).toArray();
                }else{
                    return false;
                }
                
            },
            
            contains: function(entity) {
                for(var i=0; i<this.entities; i++) {
                    if(this.entities[i] == entity) {
                        return true;
                    }
                }
                return false;
            },
            
            filter: function() {
                this.entities = ig.game.entities;
                this.entities = this.sample(this.filters);
            },
            
            getEntities: function() {
                return this.entities;
            },
            
            setFilters: function(filters) {
                this.filters = filters;
                this.filter();
            },
            
            addFilter: function(key, value) {
                this.filters[key] = value;
                this.filter();
            },
            
            addEntity: function(entity) {
                this.entities.push(entity);
            },
            
            removeFilter: function(key) {
                delete(this.filters[key]);
            },
            
            empty: function() {
                this.entities = [];
            },
            
            distanceTo: function(x, y, entity) {
        		var xd = x - (entity.pos.x + entity.size.x/2);
        		var yd = y - (entity.pos.y + entity.size.y/2);
        		return Math.sqrt( xd*xd + yd*yd );
            }
            
        })
    });