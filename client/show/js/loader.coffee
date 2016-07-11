root = exports ? this

root.createCopyButton = createCopyButton = (text, home) ->
  clipboard = new Clipboard '.btn'

  clipboard.on 'success', (e) ->
    e.clearSelection()

    trigger = $(e.trigger)

    if trigger.attr('data-toggle') is 'tooltip'
      trigger.attr 'data-original-title', "Coppied"
        .tooltip 'fixTitle'
        .tooltip 'show'

      setTimeout(() ->
        trigger.tooltip 'hide'
      , 1000)

  clipboard.on 'error', (e) ->
    trigger = $(e.trigger)

    if trigger.attr('data-toggle') is 'tooltip'
      trigger.attr 'data-original-title', "Press Cmd+C to copy"
        .tooltip 'fixTitle'
        .tooltip 'show'

      setTimeout(() ->
        trigger.tooltip 'hide'
      , 3000)

  $("<button type='button' class='btn btn-default'
      data-clipboard-action='copy'
      data-clipboard-text='#{text}'
      data-toggle='tooltip'
      data-trigger='manual'
      data-placement='auto'
      data-html='true'
      >Copy</button>")
      .tooltip()
      .appendTo $(home)


class Loader
  constructor: ->
    @parseURL()
    @checkID()
    @numberOfAssets = 0
    @numLoaded = 0
    susanName = './assets/Susan.json'
    simpleName = './assets/simple.json'
    colorName = './assets/color.png'
    colorName1 = './assets/color2.png'

    @loadJSONResource susanName, (err, @susanModel) =>
      if err
        alert 'error getting susan model'
        console.log err
      else
        @assetLoaded()
      true
    @loadJSONResource simpleName, (err, @simpleModel) =>
      if err
        alert 'error getting simpleModel'
        console.log err
      else
        @assetLoaded()
      true

    @loadImage colorName, (err, @texture) =>
      if err
        alert 'error getting color.png'
        console.log err
      else
        @assetLoaded()
      true

    @loadImage colorName1, (err, @texture1) =>
      if err
        alert 'error getting colors.png'
        console.log err
      else
        @assetLoaded()
      true

  checkID: ->
    if not @requests['user_id']?
      uid = Cookies.get('machine_fingerprinting_userid')
      if not uid and not @requests['debug']?
        window.location.href = error_page

      user_id = parseInt(uid)
      if not @commands
        @parser.search = "?user_id=#{user_id}&automated=false"
      else
        @parser.search += "user_id=#{user_id}"

      @url = @parser.href
    else
      user_id = parseInt(requests['user_id'])

    window.url = @url
    window.user_id = user_id

  parseURL: ->
    @url = document.URL
    @parser = document.createElement('a')
    @parser.href = @url
    @commands = @parser.search
    @requests = {}
    if @commands
      for c in @commands.slice(1).split('&')
        seq = c.split('=')
        @requests[seq[0]] = seq[1]

    window.requests = @requests

  assetLoaded: ->
    @numLoaded++
    if @numLoaded is @numberOfAssets
      @beginTests()

  loadTextResource: (url, callback) ->
    ++@numberOfAssets
    request = new XMLHttpRequest()
    request.open('GET', "#{url}?please-dont-cache=#{Math.random()}", true)
    request.onload = () ->
      if request.status < 200 or request.status > 299
        callback("Error: HTTP Status #{request.status} on resource #{url}")
      else
        callback(null, request.responseText)
    request.send()
    true

  loadImage: (url, callback) ->
    ++@numberOfAssets
    image = new Image()
    image.onload = () ->
      callback(null, image)
    image.src = url
    true


  loadJSONResource: (url, callback) ->
    @loadTextResource(url, (err, result) ->
      if err
        callback(err)
      else
        try
          callback(null, JSON.parse(result))
        catch e
          callback(e)
    )
    true

  beginTests: ->
    @susanVertices = @susanModel.meshes[0].vertices
    @susanIndices = [].concat.apply([], @susanModel.meshes[0].faces)
    @susanTexCoords = @susanModel.meshes[0].texturecoords[0]
    @susanNormals = @susanModel.meshes[0].normals

    @simpleVertices = (vert/20.0 for vert in @simpleModel.meshes[0].vertices)
    @simpleIndices = [].concat.apply([], @simpleModel.meshes[0].faces)
    @simpleTexCoords = @simpleModel.meshes[0].texturecoords[0]
    @simpleNormals = @simpleModel.meshes[0].normals

    @combinedVertices = new Array(@simpleIndices.length + @susanIndices.length)
    for i in [0...@susanVertices.length] by 3
      @combinedVertices[i + 0] = @susanVertices[i + 0] # x
      @combinedVertices[i + 1] = @susanVertices[i + 1] + 1.3 # y
      @combinedVertices[i + 2] = @susanVertices[i + 2] # z

    for i in [0...@simpleVertices.length] by 3
      @combinedVertices[i + 0 + @susanVertices.length] = @simpleVertices[i + 0] # x
      @combinedVertices[i + 1 + @susanVertices.length] = @simpleVertices[i + 1] - 1.3 # y
      @combinedVertices[i + 2 + @susanVertices.length] = @simpleVertices[i + 2] # z


    @combinedIndices = new Array(@simpleIndices.length + @susanIndices.length)
    @combinedIndices[0...@susanIndices.length] = @susanIndices

    maxFirst = @susanIndices.reduce (a, b) -> Math.max a, b
    @combinedIndices[@susanIndices.length...@combinedIndices.length] = (index + 1 + maxFirst for index in @simpleIndices)

    @combinedTexCoords = @susanTexCoords.concat(@simpleTexCoords)
    @combinedNormals = @susanNormals.concat(@simpleNormals)


    @testList = []
    window.sender = sender = new Sender()
    @testList.push(new CubeTest())
    @testList.push(new CameraTest())
    @testList.push(new LineTest())
    @testList.push(new TextureTest(@susanVertices, @susanIndices, @susanTexCoords, @texture))
    @testList.push(new TextureTest(@combinedVertices, @combinedIndices, @combinedTexCoords, @texture))
    @testList.push(new SimpleLightTest(@susanVertices, @susanIndices, @susanTexCoords, @susanNormals, @texture))
    @testList.push(new SimpleLightTest(@combinedVertices, @combinedIndices, @combinedTexCoords, @combinedNormals, @texture))
    @testList.push(new MoreLightTest(@combinedVertices, @combinedIndices, @combinedTexCoords, @combinedNormals, @texture))
    @testList.push(new TwoTexturesMoreLightTest(@combinedVertices, @combinedIndices, @combinedTexCoords, @combinedNormals, @texture, @texture1))
    @testList.push(new TransparentTest(@combinedVertices, @combinedIndices, @combinedTexCoords, @combinedNormals, @texture))
    @testList.push(new LightingTest())
    @testList.push(new ClippingTest())
    @testList.push(new BubbleTest())
    @testList.push(new CompressedTextureTest())
    @testList.push(new ShadowTest())

    @asyncTests = []
    @asyncTests.push new VideoTest()
    @asyncTests.push new LanguageDector()

    sender.finalized = true

    @numberOfTests = @testList.length + @asyncTests.length
    @numComplete = 0
    postProgress = () =>
      progress(++@numComplete / @numberOfTests * 98.0)
      if @numComplete is @numberOfTests
        sender.sendData()

    class Tester
      constructor: (@testList, dest) ->
        @canvas = $('<canvas width="256" height="256" />').appendTo(dest)[0]
        @numTestsComplete = 0
        testDone = () =>
          @numTestsComplete++
          postProgress()
          if @numTestsComplete < @testList.length
            @testList[@numTestsComplete].begin @canvas, testDone

        @testList[0].begin @canvas, testDone

    # Tests begin in HERE
    new Tester @testList, $('#test_canvases')
    for test in @asyncTests
      test.begin postProgress

    true

$ ->
  loader = new Loader()
