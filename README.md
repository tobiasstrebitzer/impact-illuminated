impact-illuminated
==================

impact.js plugins that integrate box2d and illuminated.js to create some awesome lighting and shadow effects.


### Demo ###

http://www.puffypets.at/impact-illuminated/

### Installation ###

1. copy your impact.js library to lib/impact/
2. for building, just place your impacts.js tools directory in the root folder, and run

        $ rake build

### What is this? ###
I've not been getting along with the existing box2d integrations, so i've written a custom implementation of the Box2d- Engine, which works together nicely with illuminated (light sources and "light consuming" entities are custom entity types which can be extended). Additionally it supports "sloped tiles" by using polygon based collision maps (see "boxmeister" below). All collision handling is done by box2d, although some classes and utilities were created to ease the pain.

### Documentation ###

1. Box2DEntity is the basic entity class to use for this plugin. Check out this example:

        EntityPlayer = ig.Box2DEntity.extend({
            name: "Tobi",
            userData: "player",
            size: { x: 8, y: 14 },
            offset: { x: 4, y: 2 },
            animSheet: new ig.AnimationSheet('media/player.png', 16, 24),
            health: 100,
            update: function() {
                // You can use the body property anytime to control Box2D behaviour
                if ( ig.input.state('left') ) {
                    this.body.ApplyForce(new b2Vec2(-10, 0), this.body.GetPosition());
                } else if( ig.input.state('right') ) {
                    this.body.ApplyForce(new b2Vec2(+10, 0), this.body.GetPosition());
                } else if ( ig.input.pressed('jump') ) {
                    this.body.ApplyImpulse(new b2Vec2(0, -5, this.body.GetPosition());
                }
                this.parent();
            }
        });


2. Box2DEntitySensor allows to add a "sensor plate" anywhere around the entity. It's commonly used to check whether an entity is standing on the ground:
        
        EntityPlayer = ig.Box2DEntitySensor.extend({
            sensor: { 
                x: 0, y: 14, width: 6, height: 1,
                activate: function() { this.standing = true; },
                deactivate: function() { this.standing = false; }
            }
            ...
        });


3.  Box2DEntityLamp allows you to illuminate an entity. It may be used for torches, projectiles and anything else:

        EntityLamp = ig.Box2DEntityLamp.extend({
            lampSettings: {
                distance: 50, angle: (270).toRad(),
                color: 'rgba(239,284,234,0.75)',
                roughness: 1, offset: {x: 3, y:5}
            }
            ...
        });


4.  Box2DEntityLighted allows an entity to block light, like crates and trees. Just extend this class, that's all you need to do:

        EntityCrate = ig.Box2DEntityLighted.extend({
            ...
        });

More documentation and installation/integration instructions will follow soon. Until now, just check out the demo.

### boxmeister Polygon Editor ###
I've recently created a plugin for the weltmeister editor, which enhances the collision layer to draw polygon- based collision maps. On a collision layer, you just need to check "Polygon Collision" and "Apply Changes" to enable this feature. After that, you can use the mouse to draw/select/manipulate polygons on the map. Using the "Backspace"- key deletes a selected (red) polygon. using the keys "J" and "K" changes the grid snapping of the polygon cursor.

### Performance ###
The demo is running "quite" fine on my machine. By using the lights engine, there are usually 2 game states:
    
1. Computing State: When light-blocking objects or lamps are moving, lighting needs to be recomputes every frame.
2. Resting State: No light-blocking objects or lamps are moving, so there's no recomputing going on.

I'm running on 60 FPS during Resting State, and 30 FPS during Computing State.
Depending on how fancy you want to integrate lighting, performance varies widely. If you only need to create a "static" lighting map after loading the game, then there's nothing to worry about. If you're casting shadows from moving bodies, or create enlightened bullets (see demo), performance might be a problem.

Illuminated.js is currently working on performance optimizations. I believe there's still quite some potential.

The plugin itself (especially the "Light Manager") have been tweaked to only recompute "affected" lightings (i.e. only lightings that are close to moving, light-interacting objects/entities are being recomputed).

### Plugin Repository ###
https://github.com/tobiasstrebitzer/impact-illuminated

### Credits ###
1. Dominic Szablewski for creating the outstanding impact.js framework!
2. Collin Hover (creator of impact++) for providing great helpful feedback.
3. Antoan Angelov for creating his awesome "Convex Separator for Box2D Flash" class, which i ported to javascript.

Thank you guys!
