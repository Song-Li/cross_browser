root = exports ? this

root.FPSTest = class FPSTest
  constructor: ->
    if !Detector.webgl then Detector.addGetWebGLMessage()

    FAR = 300

    Math.seedrandom "Three.js FPSTest lighting renderer seed"
    # CAMERA

    @camera = new THREE.PerspectiveCamera(50, 256 / 256, 1, FAR)
    @camera.position.set(0, 15, 150)
    @camera.lookAt new THREE.Vector3()

    # SCENE

    @scene = new THREE.Scene()
    @scene.fog = new THREE.Fog(0x040306, 10, FAR)

    # TEXTURES

    textureLoader = new THREE.TextureLoader()

    texture = textureLoader.load "./three/textures/color.png"
    texture.repeat.set(20, 10)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.format = THREE.RGBFormat

    # MATERIALS

    groundMaterial = new THREE.MeshPhongMaterial(
      color : 0xffffff
      map : texture
    )
    objectMaterial = new THREE.MeshStandardMaterial(
      color : 0xffffff
      roughness : 0.5
      metalness : 1.0
    )

    # GROUND

    mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(800, 400, 2, 2),
                              groundMaterial)
    mesh.position.y = -5
    mesh.rotation.x = -Math.PI / 2
    @scene.add(mesh)

    # OBJECTS

    # objectGeometry = new THREE.BoxGeometry( 0.5, 1, 1 )
    # objectGeometry = new THREE.SphereGeometry( 1.5, 16, 8 )
    objectGeometry = new THREE.TorusGeometry(1.5, 0.4, 8, 16)

    # Change this to make this test harder
    numRings = 10000
    for _ in [0...numRings]

      mesh = new THREE.Mesh(objectGeometry, objectMaterial)

      mesh.position.x = 400 * (0.5 - Math.random())
      mesh.position.y = 50 * (0.5 - Math.random()) + 25
      mesh.position.z = 200 * (0.5 - Math.random())

      mesh.rotation.y = 3.14 * (0.5 - Math.random())
      mesh.rotation.x = 3.14 * (0.5 - Math.random())

      mesh.matrixAutoUpdate = false
      mesh.updateMatrix()
      @scene.add(mesh)


    # LIGHTS

    intensity = 2.5
    distance = 100
    decay = 2.0

    c1 = 0xff0040
    c2 = 0x0040ff
    c3 = 0x80ff80
    c4 = 0xffaa00
    c5 = 0x00ffaa
    c6 = 0xff1100

    sphere = new THREE.SphereGeometry(0.25, 16, 8)

    @light1 = new THREE.PointLight(c1, intensity, distance, decay)
    @light1.add new THREE.Mesh(sphere, new THREE.MeshBasicMaterial
      color : c1
    )
    @scene.add(@light1)

    @light2 = new THREE.PointLight(c2, intensity, distance, decay)
    @light2.add new THREE.Mesh(sphere, new THREE.MeshBasicMaterial
      color : c2
    )
    @scene.add(@light2)

    @light3 = new THREE.PointLight(c3, intensity, distance, decay)
    @light3.add new THREE.Mesh(sphere, new THREE.MeshBasicMaterial
      color : c3
    )
    @scene.add(@light3)

    @light4 = new THREE.PointLight(c4, intensity, distance, decay)
    @light4.add new THREE.Mesh(sphere, new THREE.MeshBasicMaterial
      color : c4
    )
    @scene.add(@light4)

    @light5 = new THREE.PointLight(c5, intensity, distance, decay)
    @light5.add new THREE.Mesh(sphere, new THREE.MeshBasicMaterial
      color : c5
    )
    @scene.add(@light5)

    @light6 = new THREE.PointLight(c6, intensity, distance, decay)
    @light6.add new THREE.Mesh(sphere, new THREE.MeshBasicMaterial
      color : c6
    )
    @scene.add(@light6)

    dlight = new THREE.DirectionalLight(0xffffff, 0.05)
    dlight.position.set(0.5, 1, 0).normalize()
    @scene.add dlight

  begin: (canvas, @cb) ->
    # RENDERER


    gl = getGL canvas
    progress 86


    @renderer = new THREE.WebGLRenderer(
      context : gl
      canvas : canvas
    , false)

    @renderer.setClearColor(@scene.fog.color)
    @renderer.setPixelRatio(1)
    @renderer.setSize(canvas.width, canvas.height)

    @renderer.gammaInput = true
    @renderer.gammaOutput = true

    freq = 0.035
    level = 0
    distance = 75

    @times = []

    render = () =>
      @times.push performance.now()
      time = freq * level
      @light1.position.x = Math.sin(time * 0.7) * distance
      @light1.position.z = Math.cos(time * 0.3) * distance

      @light2.position.x = Math.cos(time * 0.3) * distance
      @light2.position.z = Math.sin(time * 0.7) * distance

      @light3.position.x = Math.sin(time * 0.7) * distance
      @light3.position.z = Math.sin(time * 0.5) * distance

      @light4.position.x = Math.sin(time * 0.3) * distance
      @light4.position.z = Math.sin(time * 0.5) * distance

      @light5.position.x = Math.cos(time * 0.3) * distance
      @light5.position.z = Math.sin(time * 0.5) * distance

      @light6.position.x = Math.cos(time * 0.7) * distance
      @light6.position.z = Math.cos(time * 0.5) * distance
      ++level

      @renderer.render(@scene, @camera)

      if (level == 50)
        cancelAnimationFrame(@frame)
        sender.calcFPS @times
        @cb()

    animate = () =>
      @frame = requestAnimationFrame(animate)
      render()


    requestAnimationFrame(animate)


