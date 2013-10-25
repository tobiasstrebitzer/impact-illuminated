describe("Game", function() {

    it("initializes the game", function() {
        expect(ig.game).toBeDefined();
    });
    
    it("initializes box2d", function() {
        expect(ig.world).toBeDefined();
    });
    
    it("creates collision map", function() {
        expect(ig.game.collisionMap.data).toBeNonEmptyArray();
    });
    
});



describe("MarchingSquares algorithm", function() {

    it("finds collision polygons", function() {
        
        var marchingSquares = new ig.Box2DHelperMarchingSquares(ig.game.collisionMap.data);
        
        var paths = marchingSquares.identifyPaths();
        console.log('paths', paths.length, paths);
        
        expect(paths.length).toBeGreaterThan(0);
    });
  
});