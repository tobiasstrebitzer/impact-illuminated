ig.module(
	'plugins.illuminated.debug.graph-panel'
)
.requires(
	'impact.debug.menu',
	'impact.system',
	'impact.game',
	'impact.image',
    'impact.debug.debug',
    'plugins.illuminated.lightManager'
)
.defines(function(){ "use strict";

ig.LightManager.inject({
    
    update:function () {
		ig.graph.beginClock('lighting');
		this.parent();
		ig.graph.endClock('lighting');
    },
    
    toggleMode: function(mode) {
        if(mode == 1) {
            ig.graph.mark("static", "#FDE33E");
        }else if(mode == 2) {
            ig.graph.mark("off", "#FDE33E");
        }else{
            ig.graph.mark("dynamic", "#FDE33E");
        }
        this.parent(mode);
    }
    
});

ig.DebugGraphPanel.inject({
    
    lightingTimeBeforeRun: 0,
    
    init: function( name, label ) {

        alert("init");
        this.parent(name, label);
        
        this.addClock( 'lighting', 'Lighting', '#FDE33E' );
        
    },
    
	beforeRun: function() {
		this.endClock('lighting');
		this.lightingTimeBeforeRun = Date.now();
        this.parent();
	},
		
	afterRun: function() {
		var frameTime = Date.now() - this.lightingTimeBeforeRun;
		var nextFrameDue = (1000/ig.system.fps) - frameTime;
		this.beginClock('lighting', Math.max(nextFrameDue, 0));
        this.parent();
	}
    
});

ig.debug.panels.graph.addClock('lighting', 'Lighting', '#FDE33E');

});