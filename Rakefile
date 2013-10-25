require 'pathname'

task :build do
    
    # Bake javascripts
    system "php tools/bake.php lib/impact/impact.js lib/game/main.js build/js/game.min.js"
    
    # Sync assets
    system "rm -rf build/media"
    system "cp -r media build/media"
    
end

