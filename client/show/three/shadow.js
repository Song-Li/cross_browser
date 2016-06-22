$(function() {

  var container;

  var camera, scene, renderer;

  var mesh, geometry;

  var cubeCamera;

  var sunLight, pointLight, ambientLight;

  var mixer;

  var gui, shadowCameraHelper, shadowConfig = {

    shadowCameraVisible : false,
    shadowCameraNear : 750,
    shadowCameraFar : 4000,
    shadowCameraFov : 30,
    shadowBias : -0.0002

  };

  init();
  animate();

  function init() {

    container = $('#test_canvas')[0];

    // CAMERA

    camera = new THREE.PerspectiveCamera(45, 256 / 256, 2, 10000);
    camera.position.set(300, 500, 2000);

    // SCENE

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0, 1000, 10000);

    // CUBE CAMERA

    cubeCamera = new THREE.CubeCamera(1, 10000, 128);

    // TEXTURES
    var textureLoader = new THREE.TextureLoader();

    var textureSquares =
        textureLoader.load("three/textures/patterns/bright_squares256.png");
    textureSquares.repeat.set(50, 50);
    textureSquares.wrapS = textureSquares.wrapT = THREE.RepeatWrapping;
    textureSquares.magFilter = THREE.NearestFilter;
    textureSquares.format = THREE.RGBFormat;

    // GROUND

    var groundMaterial = new THREE.MeshPhongMaterial({
      shininess : 80,
      color : 0xffffff,
      specular : 0xffffff,
      map : textureSquares
    });

    var planeGeometry = new THREE.PlaneBufferGeometry(100, 100);

    var ground = new THREE.Mesh(planeGeometry, groundMaterial);
    ground.position.set(0, 0, 0);
    ground.rotation.x = -Math.PI / 2;
    ground.scale.set(1000, 1000, 1000);
    ground.receiveShadow = true;
    scene.add(ground);

    // MATERIALS

    var materialLambert = new THREE.MeshPhongMaterial(
        {shininess : 50, color : 0x00ff00});
    var materialPhong = new THREE.MeshPhongMaterial({
      shininess : 50,
      color : 0xff0000,
      specular : 0x999999
    });
    var materialPhongCube = new THREE.MeshPhongMaterial({
      shininess : 50,
      color : 0xffffff,
      specular : 0x999999,
      envMap : cubeCamera.renderTarget.texture
    });

    // OBJECTS

    var sphereGeometry = new THREE.SphereGeometry(100, 64, 32);
    var torusGeometry = new THREE.TorusGeometry(240, 60, 32, 64);
    var cubeGeometry = new THREE.BoxGeometry(150, 150, 150);

    addObject(torusGeometry, materialPhong, 0, 100, 0, 0);
    addObject(cubeGeometry, materialLambert, 350, 75, 300, 0);

    mesh = addObject(sphereGeometry, materialPhongCube, 350, 100, -350, 0);
    mesh.add(cubeCamera);

    function addObjectColor(geometry, color, x, y, z, ry) {

      var material = new THREE.MeshPhongMaterial({color : 0xffffff});

      return addObject(geometry, material, x, y, z, ry);
    }

    function addObject(geometry, material, x, y, z, ry) {

      var tmpMesh = new THREE.Mesh(geometry, material);

      tmpMesh.material.color.offsetHSL(0.1, -0.1, 0);

      tmpMesh.position.set(x, y, z);

      tmpMesh.rotation.y = ry;

      tmpMesh.castShadow = true;
      tmpMesh.receiveShadow = true;

      scene.add(tmpMesh);

      return tmpMesh;
    }

    var bigCube = new THREE.BoxGeometry(50, 500, 50);
    var midCube = new THREE.BoxGeometry(50, 200, 50);
    var smallCube = new THREE.BoxGeometry(100, 100, 100);

    addObjectColor(bigCube, 0xff0000, -500, 250, 0, 0);
    addObjectColor(smallCube, 0xff0000, -500, 50, -150, 0);

    addObjectColor(midCube, 0x00ff00, 500, 100, 0, 0);
    addObjectColor(smallCube, 0x00ff00, 500, 50, -150, 0);

    addObjectColor(midCube, 0x0000ff, 0, 100, -500, 0);
    addObjectColor(smallCube, 0x0000ff, -150, 50, -500, 0);

    addObjectColor(midCube, 0xff00ff, 0, 100, 500, 0);
    addObjectColor(smallCube, 0xff00ff, -150, 50, 500, 0);

    addObjectColor(new THREE.BoxGeometry(500, 10, 10), 0xffff00, 0, 600, 0,
                   Math.PI / 4);
    addObjectColor(new THREE.BoxGeometry(250, 10, 10), 0xffff00, 0, 600, 0, 0);

    addObjectColor(new THREE.SphereGeometry(100, 32, 26), 0xffffff, -300, 100,
                   300, 0);

    // MORPHS

    var loader = new THREE.JSONLoader();

    loader.load("three/models/animated/sittingBox.js", function(geometry) {

      var morphMaterial = new THREE.MeshPhongMaterial({
        color : 0x000000,
        specular : 0xff9900,
        shininess : 50,
        morphTargets : true,
        side : THREE.DoubleSide,
        shading : THREE.FlatShading
      });

      var mesh = new THREE.Mesh(geometry, morphMaterial);

      mixer = new THREE.AnimationMixer(mesh);

      mixer.clipAction(geometry.animations[0]).setDuration(10).play();

      var s = 200;
      mesh.scale.set(s, s, s);

      // morph.duration = 8000;
      // morph.mirroredLoop = true;

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      scene.add(mesh);

    });

    // LIGHTS

    ambientLight = new THREE.AmbientLight(0x3f2806);
    scene.add(ambientLight);

    pointLight = new THREE.PointLight(0xffaa00, 1, 5000);
    scene.add(pointLight);

    sunLight = new THREE.SpotLight(0xffffff, 0.3, 0, Math.PI / 2);
    sunLight.position.set(1000, 2000, 1000);

    sunLight.castShadow = true;

    sunLight.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(
        shadowConfig.shadowCameraFov, 1, shadowConfig.shadowCameraNear,
        shadowConfig.shadowCameraFar));
    sunLight.shadow.bias = shadowConfig.shadowBias;

    scene.add(sunLight);

    // SHADOW CAMERA HELPER

    shadowCameraHelper = new THREE.CameraHelper(sunLight.shadow.camera);
    shadowCameraHelper.visible = shadowConfig.shadowCameraVisible;
    scene.add(shadowCameraHelper);

    // RENDERER

    renderer = new THREE.WebGLRenderer({
      antialias : false,
      preserveDrawingBuffer : true,
      willReadFrequently : false,
      depth : true
    });
    renderer.autoClear = true;
    renderer.setPixelRatio(1);
    renderer.setSize(256, 256);
    container.appendChild(renderer.domElement);

    //

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //

    renderer.gammaInput = true;
    renderer.gammaOutput = true;
  }

  //

  function animate() {

    requestAnimationFrame(animate);
    render();
  }
  var level = 0;
  function render() {

    // update
    if (mixer) {
      mixer.update(0.02);
    }

    // render cube map

    mesh.visible = false;
    cubeCamera.updateCubeMap(renderer, scene);
    mesh.visible = true;

    // render scene

    renderer.render(scene, camera);

    if (++level == 50) {
      getData(renderer.getContext(), 'three_shadow', -1);
    }
  }
});
