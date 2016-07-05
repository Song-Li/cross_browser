## add the canvas to the dom ##
name = 'no-shadow'
document.write "<div id=\"#{name}\" class=\"example\"></div>"
container = $('#' + name)
canvas = $('<canvas></canvas>').appendTo(container)[0]

## setup the framework ##
try
    gl = new WebGLFramework(canvas)
        .depthTest()
catch error
    container.empty()
    $('<div class="error"></div>').text(error).appendTo(container)
    $('<div class="error-info"></div>').text('(screenshot instead)').appendTo(container)
    $("<img src=\"#{name}.png\">").appendTo(container)
    return

## fullscreen handling ##
fullscreenImg = $('<img class="toggle-fullscreen" src="fullscreen.png">')
    .appendTo(container)
    .click -> gl.toggleFullscreen(container[0])

gl.onFullscreenChange (isFullscreen) ->
    if isFullscreen
        container.addClass('fullscreen')
        fullscreenImg.attr('src', 'exit-fullscreen.png')
    else
        container.removeClass('fullscreen')
        fullscreenImg.attr('src', 'fullscreen.png')

## handle mouse over ##
hover = false
container.hover (-> hover = true), (-> hover = false)

## animation control ##
animate = true
controls = $('<div class="controls"></div>')
    .appendTo(container)
$('<label>Animate</label>').appendTo(controls)
$('<input type="checkbox" checked="checked"></input>')
    .appendTo(controls)
    .change ->
        animate = @checked

## create webgl objects ##
cubeGeom = gl.drawable meshes.cube
planeGeom = gl.drawable meshes.plane(50)
displayShader = gl.shader
    common: '''//essl
        varying vec3 vWorldNormal; varying vec4 vWorldPosition;
        uniform mat4 camProj, camView;
        uniform mat4 lightProj, lightView; uniform mat3 lightRot;
        uniform mat4 model;
    '''
    vertex: '''//essl
        attribute vec3 position, normal;

        void main(){
            vWorldNormal = normal;
            vWorldPosition = model * vec4(position, 1.0);
            gl_Position = camProj * camView * vWorldPosition;
        }
    '''
    fragment: '''//essl
        float attenuation(vec3 dir){
            float dist = length(dir);
            float radiance = 1.0/(1.0+pow(dist/10.0, 2.0));
            return clamp(radiance*10.0, 0.0, 1.0);
        }
        
        float influence(vec3 normal, float coneAngle){
            float minConeAngle = ((360.0-coneAngle-10.0)/360.0)*PI;
            float maxConeAngle = ((360.0-coneAngle)/360.0)*PI;
            return smoothstep(minConeAngle, maxConeAngle, acos(normal.z));
        }

        float lambert(vec3 surfaceNormal, vec3 lightDirNormal){
            return max(0.0, dot(surfaceNormal, lightDirNormal));
        }

        vec3 skyLight(vec3 normal){
            return vec3(smoothstep(0.0, PI, PI-acos(normal.y)))*0.4;
        }

        vec3 gamma(vec3 color){
            return pow(color, vec3(2.2));
        }

        void main(){
            vec3 worldNormal = normalize(vWorldNormal);

            vec3 camPos = (camView * vWorldPosition).xyz;
            vec3 lightPos = (lightView * vWorldPosition).xyz;
            vec3 lightPosNormal = normalize(lightPos);
            vec3 lightSurfaceNormal = lightRot * worldNormal;

            vec3 excident = (
                skyLight(worldNormal) +
                lambert(lightSurfaceNormal, -lightPosNormal) *
                influence(lightPosNormal, 55.0) *
                attenuation(lightPos)
            );
            gl_FragColor = vec4(gamma(excident), 1.0);
        }
    '''

## matrix setup ##
camProj = gl.mat4()
camView = gl.mat4()
lightProj = gl.mat4().perspective(fov:60, 1, near:0.01, far:100)
lightView = gl.mat4().trans(0, 0, -6).rotatex(30).rotatey(110)
lightRot = gl.mat3().fromMat4Rot(lightView)
model = gl.mat4()

## state variables ##
counter = -Math.PI*0.5
offset = 0
camDist = 10
camRot = 55
camPitch = 41

## mouse handling ##
mouseup = -> $(document).unbind('mousemove', mousemove).unbind('mouseup', mouseup)
mousemove = ({originalEvent}) ->
    x = originalEvent.movementX ? originalEvent.webkitMovementX ? originalEvent.mozMovementX ? originalEvent.oMovementX
    y = originalEvent.movementY ? originalEvent.webkitMovementY ? originalEvent.mozMovementY ? originalEvent.oMovementY
    camRot += x
    camPitch += y
    if camPitch > 85 then camPitch = 85
    else if camPitch < 1 then camPitch = 1

$(canvas)
    .bind 'mousedown', ->
        $(document).bind('mousemove', mousemove).bind('mouseup', mouseup)
        return false
    .bind 'mousewheel', ({originalEvent}) ->
        camDist -= originalEvent.wheelDeltaY/250
        return false
    .bind 'DOMMouseScroll', ({originalEvent}) ->
        camDist += originalEvent.detail/5
        return false

## drawing methods ##
draw = ->
    gl
        .adjustSize()
        .viewport()
        .cullFace('back')
        .clearColor(0,0,0,0)
        .clearDepth(1)

    camProj.perspective(fov:60, aspect:gl.aspect, near:0.01, far:100)
    camView.ident().trans(0, -1, -camDist).rotatex(camPitch).rotatey(camRot)

    displayShader.use()
        .mat4('camProj', camProj)
        .mat4('camView', camView)
        .mat4('lightView', lightView)
        .mat4('lightProj', lightProj)
        .mat3('lightRot', lightRot)
        .mat4('model', model.ident().trans(0, 0, 0))
        .draw(planeGeom)
        .mat4('model', model.ident().trans(0, 1+offset, 0))
        .draw(cubeGeom)
        .mat4('model', model.ident().trans(5, 1, -1))
        .draw(cubeGeom)

## mainloop ##
draw()
gl.animationInterval ->
    if hover
        if animate
            offset = 1 + Math.sin(counter)
            counter += 1/30
        else
            offset = 0
        draw()
