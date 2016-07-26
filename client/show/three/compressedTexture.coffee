###
Compressed Texture Test
This test use two different formats of compressed textures to test how
the GPU decompress the textures (and which formats it supports).  Compressed
textures differ from normal textures as webgl cannot decompress them and
thus the raw byte values are sent directly to the GPU for decompression
This makes use of a variety of different webgl compressed texture extensions
###

root = exports ? this

root.CompressedTextureTest = class CompressedTextureTest

  textureRoot = 'three/textures/compressed'
  geometry = new THREE.BoxGeometry(150, 150, 150)
  startX = -400
  xStop = Math.abs startX
  startY = -200
  delta = 250

  # class that takes care of loading and testing the .dds compressed
  # texture format
  class DDSTest
    constructor: (@id) ->

      @camera = new THREE.PerspectiveCamera(60, 1, 1, 2000)
      @camera.position.z = 1000

      @scene = new THREE.Scene()

      ###
      This is how compressed textures are supposed to be used:

      DXT1 - RGB - opaque textures
      DXT3 - RGBA - transparent textures with sharp alpha transitions
      DXT5 - RGBA - transparent textures with full alpha range
      ###

      @materials = []
      loader = new THREE.DDSLoader()

      map1 = loader.load("#{textureRoot}/disturb_dxt1_nomip.dds")
      map1.minFilter = map1.magFilter = THREE.LinearFilter
      map1.anisotropy = 4

      map2 = loader.load("#{textureRoot}/disturb_dxt1_mip.dds")
      map2.anisotropy = 4

      map3 = loader.load("#{textureRoot}/hepatica_dxt3_mip.dds")
      map3.anisotropy = 4

      map4 = loader.load("#{textureRoot}/explosion_dxt5_mip.dds")
      map4.anisotropy = 4

      map5 = loader.load("#{textureRoot}/disturb_argb_nomip.dds")
      map5.minFilter = map5.magFilter = THREE.LinearFilter
      map5.anisotropy = 4

      map6 = loader.load("#{textureRoot}/disturb_argb_mip.dds")
      map6.anisotropy = 4

      cubemap1 = loader.load("#{textureRoot}/Mountains.dds", (texture) =>
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearFilter
        texture.mapping = THREE.CubeReflectionMapping
        @materials[0].needsUpdate = true)

      cubemap2 = loader.load("#{textureRoot}/Mountains_argb_mip.dds", (texture) =>
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearFilter
        texture.mapping = THREE.CubeReflectionMapping
        @materials[1].needsUpdate = true)


      cubemap3 = loader.load("#{textureRoot}/Mountains_argb_nomip.dds", (texture) =>
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearFilter
        texture.mapping = THREE.CubeReflectionMapping
        @materials[2].needsUpdate = true)

      @materials.push new THREE.MeshBasicMaterial(map : map1, envMap : cubemap1)
      @materials.push new THREE.MeshBasicMaterial(envMap : cubemap2)
      @materials.push new THREE.MeshBasicMaterial(envMap : cubemap3)
      @materials.push new THREE.MeshBasicMaterial(map : map2)
      @materials.push new THREE.MeshBasicMaterial(
        map : map3, alphaTest : 0.5, side : THREE.DoubleSide
      )
      @materials.push new THREE.MeshBasicMaterial(
        map : map4,
        side : THREE.DoubleSide,
        blending : THREE.AdditiveBlending,
        depthTest : false,
        transparent : true
      )
      @materials.push new THREE.MeshBasicMaterial(map : map5)
      @materials.push new THREE.MeshBasicMaterial(map : map6)

      @meshes = []
      x = startX
      y = startY
      for mat in @materials
        mesh = new THREE.Mesh(geometry, mat)
        mesh.position.x = x
        mesh.position.y = y
        @scene.add mesh
        @meshes.push mesh

        x += delta
        if  x > xStop
          y += delta
          x = startX

    begin: (canvas, @cb) ->
      @renderer = new THREE.WebGLRenderer(
        context: getGL(canvas),
        canvas: canvas
      , false)
      @renderer.setClearColor '#050505'
      @renderer.setPixelRatio 1
      @renderer.setSize canvas.width, canvas.height

      @counter = 0
      animate = () =>
        frame = raf animate
        time = @counter++ * 0.01

        for mesh in @meshes
          mesh.rotation.x = time
          mesh.rotation.y = time

        @renderer.render @scene, @camera


        if @counter is 10
          caf frame
          sender.getData @renderer.getContext(), @id
          @cb()

      raf animate

  # class that takes care of loading and testing the .pvr texture format
  # As of July 13th, 2016 .pvr is still in draft mode for webgl
  class PVRTest
    constructor: (@id) ->
      @camera = new THREE.PerspectiveCamera(60, 1, 1, 2000)
      @camera.position.z = 1500

      @scene = new THREE.Scene()

      # Load PVR Textures

      @materials = []
      loader = new THREE.PVRLoader()

      disturb_4bpp_rgb = loader.load("#{textureRoot}/disturb_4bpp_rgb.pvr")
      disturb_4bpp_rgb_v3 = loader.load("#{textureRoot}/disturb_4bpp_rgb_v3.pvr")
      disturb_4bpp_rgb_mips = loader.load("#{textureRoot}/disturb_4bpp_rgb_mips.pvr")
      disturb_2bpp_rgb = loader.load("#{textureRoot}/disturb_2bpp_rgb.pvr")
      flare_4bpp_rgba = loader.load("#{textureRoot}/flare_4bpp_rgba.pvr")
      flare_2bpp_rgba = loader.load("#{textureRoot}/flare_2bpp_rgba.pvr")
      park3_cube_nomip_4bpp_rgb = loader.load("#{textureRoot}/park3_cube_nomip_4bpp_rgb.pvr", (texture) =>
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearFilter
        texture.mapping = THREE.CubeReflectionMapping
        @meshes[0].needsUpdate = true)

      park3_cube_mip_2bpp_rgb_v3 = loader.load("#{textureRoot}/park3_cube_mip_2bpp_rgb_v3.pvr", (texture) =>
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearFilter
        texture.mapping = THREE.CubeReflectionMapping
        @meshes[1].needsUpdate = true)

      disturb_2bpp_rgb.minFilter = disturb_2bpp_rgb.magFilter =
          flare_4bpp_rgba.minFilter = flare_4bpp_rgba.magFilter =
              disturb_4bpp_rgb.minFilter = disturb_4bpp_rgb.magFilter =
                  disturb_4bpp_rgb_v3.minFilter = disturb_4bpp_rgb_v3.magFilter =
                      flare_2bpp_rgba.minFilter = flare_2bpp_rgba.magFilter =
                          THREE.LinearFilter

      @materials.push new THREE.MeshBasicMaterial(envMap : park3_cube_nomip_4bpp_rgb)
      @materials.push new THREE.MeshBasicMaterial(envMap : park3_cube_mip_2bpp_rgb_v3)
      @materials.push new THREE.MeshBasicMaterial(map : disturb_4bpp_rgb)
      @materials.push new THREE.MeshBasicMaterial(map : disturb_4bpp_rgb_mips)
      @materials.push new THREE.MeshBasicMaterial(map : disturb_2bpp_rgb)
      @materials.push new THREE.MeshBasicMaterial(
        map : flare_4bpp_rgba,
        side : THREE.DoubleSide,
        depthTest : false,
        transparent : true
      )
      @materials.push new THREE.MeshBasicMaterial(
        map : flare_2bpp_rgba,
        side : THREE.DoubleSide,
        depthTest : false,
        transparent : true
      )
      @materials.push new THREE.MeshBasicMaterial(map : disturb_4bpp_rgb_v3)


      @meshes = []
      x = startX
      y = startY
      for mat in @materials
        mesh = new THREE.Mesh(geometry, mat)
        mesh.position.x = x
        mesh.position.y = y
        @scene.add mesh
        @meshes.push mesh

        x += delta
        if x > xStop
          y += delta
          x = startX

    begin: (canvas, @cb) ->
      @renderer = new THREE.WebGLRenderer(
        context: getGL(canvas),
        canvas: canvas
      , false)
      @renderer.setClearColor '#050505'
      @renderer.setPixelRatio 1
      @renderer.setSize canvas.width, canvas.height

      @counter = 0
      animate = () =>
        frame = raf animate
        time = @counter++ * 0.001

        for mesh in @meshes
          mesh.rotation.x = time
          mesh.rotation.y = time

        @renderer.render @scene, @camera

        if @counter is 10
          caf frame
          sender.getData @renderer.getContext(), @id
          @cb()

      raf animate

  constructor: ->
    if not Detector.webgl then Detector.addGetWebGLMessage()
    @tests = []
    @tests.push new DDSTest sender.getID()
    @tests.push new PVRTest sender.getID()

  begin: (@canvas, @cb) ->
    @index = 0
    tester = () =>
      if @index is @tests.length
        @cb()
      else
        @tests[@index++].begin(@canvas, tester)

    tester()