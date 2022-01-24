var FPSTest, root;

root = typeof exports !== "undefined" && exports !== null ? exports : this;

root.FPSTest = FPSTest = (function() {
  function FPSTest() {
    var FAR, _, c1, c2, c3, c4, c5, c6, decay, distance, dlight, groundMaterial, i, intensity, mesh, numRings, objectGeometry, objectMaterial, ref, sphere, texture, textureLoader;
    if (!Detector.webgl) {
      Detector.addGetWebGLMessage();
    }
    FAR = 300;
    Math.seedrandom("Three.js FPSTest lighting renderer seed");
    this.camera = new THREE.PerspectiveCamera(50, 256 / 256, 1, FAR);
    this.camera.position.set(0, 15, 150);
    this.camera.lookAt(new THREE.Vector3());
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x040306, 10, FAR);
    textureLoader = new THREE.TextureLoader();
    texture = textureLoader.load("./three/textures/color.png");
    texture.repeat.set(20, 10);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.format = THREE.RGBFormat;
    groundMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      map: texture
    });
    objectMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 1.0
    });
    mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(800, 400, 2, 2), groundMaterial);
    mesh.position.y = -5;
    mesh.rotation.x = -Math.PI / 2;
    this.scene.add(mesh);
    objectGeometry = new THREE.TorusGeometry(1.5, 0.4, 8, 16);
    numRings = 10000;
    for (_ = i = 0, ref = numRings; 0 <= ref ? i < ref : i > ref; _ = 0 <= ref ? ++i : --i) {
      mesh = new THREE.Mesh(objectGeometry, objectMaterial);
      mesh.position.x = 400 * (0.5 - Math.random());
      mesh.position.y = 50 * (0.5 - Math.random()) + 25;
      mesh.position.z = 200 * (0.5 - Math.random());
      mesh.rotation.y = 3.14 * (0.5 - Math.random());
      mesh.rotation.x = 3.14 * (0.5 - Math.random());
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      this.scene.add(mesh);
    }
    intensity = 2.5;
    distance = 100;
    decay = 2.0;
    c1 = 0xff0040;
    c2 = 0x0040ff;
    c3 = 0x80ff80;
    c4 = 0xffaa00;
    c5 = 0x00ffaa;
    c6 = 0xff1100;
    sphere = new THREE.SphereGeometry(0.25, 16, 8);
    this.light1 = new THREE.PointLight(c1, intensity, distance, decay);
    this.light1.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({
      color: c1
    })));
    this.scene.add(this.light1);
    this.light2 = new THREE.PointLight(c2, intensity, distance, decay);
    this.light2.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({
      color: c2
    })));
    this.scene.add(this.light2);
    this.light3 = new THREE.PointLight(c3, intensity, distance, decay);
    this.light3.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({
      color: c3
    })));
    this.scene.add(this.light3);
    this.light4 = new THREE.PointLight(c4, intensity, distance, decay);
    this.light4.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({
      color: c4
    })));
    this.scene.add(this.light4);
    this.light5 = new THREE.PointLight(c5, intensity, distance, decay);
    this.light5.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({
      color: c5
    })));
    this.scene.add(this.light5);
    this.light6 = new THREE.PointLight(c6, intensity, distance, decay);
    this.light6.add(new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({
      color: c6
    })));
    this.scene.add(this.light6);
    dlight = new THREE.DirectionalLight(0xffffff, 0.05);
    dlight.position.set(0.5, 1, 0).normalize();
    this.scene.add(dlight);
  }

  FPSTest.prototype.begin = function(canvas, cb) {
    var animate, distance, freq, gl, level, render;
    this.cb = cb;
    gl = getGL(canvas);
    progress(86);
    this.renderer = new THREE.WebGLRenderer({
      context: gl,
      canvas: canvas
    }, false);
    this.renderer.setClearColor(this.scene.fog.color);
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(canvas.width, canvas.height);
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
    freq = 0.035;
    level = 0;
    distance = 75;
    this.times = [];
    render = (function(_this) {
      return function() {
        var time;
        _this.times.push(performance.now());
        time = freq * level;
        _this.light1.position.x = Math.sin(time * 0.7) * distance;
        _this.light1.position.z = Math.cos(time * 0.3) * distance;
        _this.light2.position.x = Math.cos(time * 0.3) * distance;
        _this.light2.position.z = Math.sin(time * 0.7) * distance;
        _this.light3.position.x = Math.sin(time * 0.7) * distance;
        _this.light3.position.z = Math.sin(time * 0.5) * distance;
        _this.light4.position.x = Math.sin(time * 0.3) * distance;
        _this.light4.position.z = Math.sin(time * 0.5) * distance;
        _this.light5.position.x = Math.cos(time * 0.3) * distance;
        _this.light5.position.z = Math.sin(time * 0.5) * distance;
        _this.light6.position.x = Math.cos(time * 0.7) * distance;
        _this.light6.position.z = Math.cos(time * 0.5) * distance;
        ++level;
        _this.renderer.render(_this.scene, _this.camera);
        if (level === 50) {
          cancelAnimationFrame(_this.frame);
          sender.calcFPS(_this.times);
          return _this.cb();
        }
      };
    })(this);
    animate = (function(_this) {
      return function() {
        _this.frame = requestAnimationFrame(animate);
        return render();
      };
    })(this);
    return requestAnimationFrame(animate);
  };

  return FPSTest;

})();

// ---
// generated by coffee-script 1.9.2