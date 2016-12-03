###
This test renders to a canvas a whole bunch of words in 36 different
alphabets to test which alphabets the user has installed on their computer.
The words are kept in the 2D array called codes in their UTF-16 format
to ensure that they aren't interpreted before it is time to render them
The 37th string in codes is a single character that we are hoping will
always show up as a cannot be displayed character.
#
While wether the alphabet can be displayed or not is deteremined by the
operating system, the symbol used to represent cannot be displayed is
deteremined by the browser.  However, it does seem like it is always some
sort of box
###

root = exports ? this

safeParseJSON = (s) ->
  try
    JSON.parse s
  catch
    false

raf = (
  window.requestAnimationFrame or
  window.mozRequestAnimationFrame or
  window.webkitRequestAnimationFrame or
  window.oRequestAnimationFrame
)

caf = (
  window.cancelAnimationFrame or
  window.mozcancelAnimationFrame or
  window.webkitcancelAnimationFrame or
  window.ocancelAnimationFrame
)

root.LanguageDector = class LanguageDector
  constructor: ->
    @codes = safeParseJSON "[[76,97,116,105,110],
    [27721,23383],
    [1575,1604,1593,1585,1576,1610,1577],
    [2342,2375,2357,2344,2366,2327,2352,2368],
    [1050,1080,1088,1080,1083,1080,1094,1072],
    [2476,2494,2434,2482,2494,32,47,32,2437,2488,2478,2496,2479,2492,2494],
    [20206,21517],
    [2583,2625,2608,2606,2625,2582,2624],
    [43415,43438],
    [54620,44544],
    [3108,3142,3122,3137,3095,3137],
    [2980,2990,3007,2996,3021],
    [3374,3378,3375,3390,3379,3330],
    [4121,4156,4116,4154,4121,4140],
    [3652,3607,3618],
    [7070,7077,7060,7082,7059],
    [3221,3240,3277,3240,3233],
    [2711,2753,2716,2736,2750,2724,2752],
    [3749,3762,3751],
    [2825,2852,2893,2837,2867],
    [4877,4821,4829],
    [3523,3538,3458,3524,3517],
    [1344,1377,1397,1400,1409],
    [6017,6098,6040,6082,6042],
    [917,955,955,951,957,953,954,972],
    [6674,6682,6664,6673],
    [1488,1500,1508,1489,1497,1514],
    [3926,3964,3921,3851],
    [4325,4304,4320,4311,4323,4314,4312],
    [41352,41760],
    [6190,6179,6185,6189,6179,6191],
    [11612,11593,11580,11593,11599,11568,11606],
    [1808,1834,1825,1821,1808],
    [1931,1960,1928,1964,1920,1960],
    [5123,5316,5251,5198,5200,5222],
    [5091,5043,5033],
    [55295]]"

    @fontSize = 20
    @extraHeigth = 15
    @height = @fontSize + @extraHeigth
    @width = 100
    @canvas = $("<canvas height='#{@height}' width='#{@width}'/>").appendTo $('#test_canvases')
    @ctx = @canvas[0].getContext '2d'

    @results = []

  begin: (@cb) ->
    tester = (index) =>
      if index is @codes.length
        console.log "Lang done"
        sender.postLangsDetected @results
        @cb()
      else
        text = ""
        for c in @codes[index]
          text += String.fromCharCode c

        @ctx.fillStyle = "white"
        @ctx.fillRect 0, 0, @width, @height
        @ctx.fillStyle = "black"
        @ctx.font = "#{@fontSize}px sans-serif"
        @ctx.fillText text, 5,  @height - @extraHeigth/2.0

        @results.push
          w: @width
          h: @height
          pixels: stringify @ctx.getImageData(0, 0, @width, @height).data

        raf ->
          tester index + 1

    raf ->
      tester 0

