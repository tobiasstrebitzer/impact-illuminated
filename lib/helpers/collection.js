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
                    var sample = [];
                    var skip;
                    
                    for (var i = 0; i < this.entities.length; i++) {
                        skip = false;
                        for(var key in filters) {
                            if(key == "instanceOf") {
                                if(!(this.entities[i] instanceof filters[key])) {
                                    skip = true;
                                }
                            }else if(key == "distance") {
                                if(c.distanceTo(filters[key].x, filters[key].y, this.entities[i]) > filters[key].val) {
                                    skip = true;
                                }
                            }else if($.isFunction(filters[key])) {
                                var result = filters[key].call(this.entities[i], this.entities[i][key]);
                                if(result === false) {
                                    skip = true;
                                }
                            }else{
                                if(this.entities[i][key] != filters[key]) {
                                    skip = true;
                                }
                            }
                        }
                        if(skip === false) {
                            sample.push(this.entities[i]);
                        }
                    }
                    return sample;
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