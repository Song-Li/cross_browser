# This file is responsible for laoding the in the assets needed
# by each program if they are shared and it is responsible for
# syncronizing the tests and sender

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


root.mobileAndTabletCheck = mobileAndTabletCheck= ->
  ((a) ->
    if /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)) then true else false)(navigator.userAgent||navigator.vendor||window.opera)


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

    root.url = @url
    root.user_id = user_id

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

    root.requests = @requests

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
    root.sender = sender = new Sender()
    @testList.push new CubeTest()
    @testList.push new CameraTest()
    @testList.push new LineTest()
    @testList.push new TextureTest(@susanVertices, @susanIndices, @susanTexCoords, @texture)
    @testList.push new TextureTest(@combinedVertices, @combinedIndices, @combinedTexCoords, @texture)
    @testList.push new SimpleLightTest(@susanVertices, @susanIndices, @susanTexCoords, @susanNormals, @texture)
    @testList.push new SimpleLightTest(@combinedVertices, @combinedIndices, @combinedTexCoords, @combinedNormals, @texture)
    @testList.push new MoreLightTest(@combinedVertices, @combinedIndices, @combinedTexCoords, @combinedNormals, @texture)
    @testList.push new TwoTexturesMoreLightTest(@combinedVertices, @combinedIndices, @combinedTexCoords, @combinedNormals, @texture, @texture1)
    @testList.push new TransparentTest(@combinedVertices, @combinedIndices, @combinedTexCoords, @combinedNormals, @texture)
    @testList.push new LightingTest()
    @testList.push new ClippingTest()
    @testList.push new BubbleTest()
    @testList.push new CompressedTextureTest()
    @testList.push new ShadowTest()

    @asyncTests = []
    if not mobileAndTabletCheck()
      @asyncTests.push new VideoTest()

    @asyncTests.push new LanguageDector()

    sender.finalized = true

    @numberOfTests = @testList.length + @asyncTests.length
    @numComplete = 0
    postProgress = () =>
      progress(++@numComplete / @numberOfTests * 98.0)
      if @numComplete is @numberOfTests
        sender.sendData()

    d = 256
    class Tester
      constructor: (@testList, dest) ->
        @canvas = $("<canvas width='#{d}' height='#{d}'/>").appendTo(dest)[0]
        @numTestsComplete = 0
        testDone = () =>
          @numTestsComplete++
          postProgress()
          if @numTestsComplete < @testList.length
            console.log "#{@numTestsComplete}, #{@testList.length}"
            @testList[@numTestsComplete].begin @canvas, testDone

        @testList[0].begin @canvas, testDone

    canvasContainer = if @requests['demo'] is "True" then $('body') else $('#test_canvases')
    $("<canvas id='can_aa' width='#{d}' height='#{d}'/>").appendTo canvasContainer

    # Tests begin in HERE
    new Tester @testList, canvasContainer
    for test in @asyncTests
      test.begin postProgress

    true

$ ->
  loader = new Loader()
