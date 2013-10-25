impact-illuminated
==================

impact.js plugins that integrate box2d and illuminated.js to create some awesome lighting and shadow effects.

### Documentation ###
More documentation and installation/integration instructions will follow soon. Until now, just check out the demo.

### Implementation ###
I've not been getting along with the existing box2d integrations, so i've written a custom implementation of the Box2d- Engine, which works together nicely with illuminated (light sources and "light consuming" entities are custom entity types which can be extended.)

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
