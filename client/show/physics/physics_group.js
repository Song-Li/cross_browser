$(function() {
    var game = new Phaser.Game(256, 256, Phaser.WEBGL, 'phaser',
                               {preload : preload, create : create});

    var startY = [
      32, 38, 10, 66, 36, 70, 7,  71, 15, 59, 68, 71, 55, 11, 53, 81, 55,
      73, 80, 53, 69, 45, 52, 1,  42, 8,  70, 48, 52, 35, 47, 17, 28, 97,
      5,  57, 12, 78, 97, 43, 73, 41, 2,  97, 78, 95, 51, 82, 86, 99
    ];
    var startX = [
      213, 235, 14,  111, 86,  31,  192, 27,  192, 242, 198, 13, 88,
      229, 67,  211, 168, 249, 191, 207, 88,  61,  223, 174, 12, 178,
      235, 223, 94,  57,  107, 224, 167, 11,  205, 250, 233, 74, 232,
      111, 90,  113, 176, 241, 130, 69,  118, 19,  236, 169
    ];
    function preload() {
        game.antialias = false;
        game.preserveDrawingBuffer = true;
        game.load.image('ball', './physics/pangball.png');
        var level = 0;
        var state = game.state;
        var renderer = game.renderer;
        var gl = renderer.gl;
        state.onUpdateCallback = function() {
            if (++level == 40) {
                var pixels = new Uint8Array(256*256*4);
                gl.readPixels(0,0,256,256, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

                var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                var ren, ven;
                if(debugInfo){
                    ven = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                    ren = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                }else{
                    console.log("debugInfo is not accessable");
                    ven = 'No debug Info';
                    ren = 'No debug Info';
                }
                var hash = pixels.hashCode();
                console.log("Physics: " + hash);
                var physID = 10;
                toServer(true, ven, ren, hash, physID, pixels);
            }
        }
    }

    function create() {

      //  Enable p2 physics
      game.physics.startSystem(Phaser.Physics.P2JS);

      game.stage.backgroundColor = '#124184';

      game.physics.p2.gravity.y = 100;
      game.physics.p2.restitution = 0.95;

      var group = game.add.physicsGroup(Phaser.Physics.P2JS);

      for (var i = 0; i < 30; i++) {
        var ball =
            group.create(startX[i], startY[i], 'ball');
        ball.body.setCircle(16);
        ball.body.fixedRotation = false;
      }
    }
});
