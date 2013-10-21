ig.module('helpers.collection')
    .requires('plugins.box2d.entity')
    .defines(function () {

        ig.Collection = ig.Class.extend({
            
            // internals
            entities: null,
            filters: {},

            init: function(filters) {
                $.extend(this.filters, filters);
                this.filter();
            },
            
            filter: function() {
                this.entities = ig.game.entities;
                if(Object.keys(this.filters).length) {
                    var c = this;
                    this.entities = $(this.entities).filter(function() {
                        for(var key in c.filters) {
                            if($.isFunction(c.filters[key])) {
                                var result = c.filters[key].call(this, this[key]);
                                if(result === false) {
                                    return false;
                                }
                            }else{
                                if(this[key] != c.filters[key]) {
                                    return false;
                                }
                            }
                        }
                        return true;
                    });
                }
            },
            
            getEntities: function() {
                return this.entities.toArray();
            },
            
            setFilters: function(filters) {
                this.filters = filters;
                this.filter();
            },
            
            addFilter: function(key, value) {
                this.filters[key] = value;
                this.filter();
            },
            
            removeFilter: function(key) {
                delete(this.filters[key]);
            }
            
        })
    });