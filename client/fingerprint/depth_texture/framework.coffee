pi = Math.PI
tau = 2*pi
deg = 360/tau
arc = tau/360

class Mat3
    constructor: (@data) ->
        @data ?= new Float32Array 9
        @ident()

    ident: ->
        d = @data
        d[0]  = 1; d[1]  =0; d[2]  = 0
        d[3]  = 0; d[4]  =1; d[5]  = 0
        d[6]  = 0; d[7]  =0; d[8]  = 1
        return @

    transpose: ->
        d = @data
        a01 = d[1]; a02 = d[2]; a12 = d[5]

        d[1] = d[3]
        d[2] = d[6]
        d[3] = a01
        d[5] = d[7]
        d[6] = a02
        d[7] = a12
        return @

    mulVec3: (vec, dst=vec) ->
        @mulVal3 vec.x, vec.y, vec.z, dst
        return dst

    mulVal3: (x, y, z, dst) ->
        dst = dst.data
        d = @data
        dst[0] = d[0]*x + d[3]*y + d[6]*z
        dst[1] = d[1]*x + d[4]*y + d[7]*z
        dst[2] = d[2]*x + d[5]*y + d[8]*z

        return @

    rotatex: (angle) ->
        s = Math.sin angle*arc
        c = Math.cos angle*arc
        return @amul(
             1,  0,  0,
             0,  c,  s,
             0, -s,  c
        )

    rotatey: (angle) ->
        s = Math.sin angle*arc
        c = Math.cos angle*arc
        return @amul(
             c,  0, -s,
             0,  1,  0,
             s,  0,  c
        )

    rotatez: (angle) ->
        s = Math.sin angle*arc
        c = Math.cos angle*arc
        return @amul(
             c,  s,  0,
            -s,  c,  0,
             0,  0,  1
        )

    amul: (
        b00, b10, b20,
        b01, b11, b21,
        b02, b12, b22,
        b03, b13, b23
    ) ->
        a = @data

        a00 = a[0]
        a10 = a[1]
        a20 = a[2]

        a01 = a[3]
        a11 = a[4]
        a21 = a[5]

        a02 = a[6]
        a12 = a[7]
        a22 = a[8]

        a[0]  = a00*b00 + a01*b10 + a02*b20
        a[1]  = a10*b00 + a11*b10 + a12*b20
        a[2]  = a20*b00 + a21*b10 + a22*b20

        a[3]  = a00*b01 + a01*b11 + a02*b21
        a[4]  = a10*b01 + a11*b11 + a12*b21
        a[5]  = a20*b01 + a21*b11 + a22*b21

        a[6]  = a00*b02 + a01*b12 + a02*b22
        a[7]  = a10*b02 + a11*b12 + a12*b22
        a[8]  = a20*b02 + a21*b12 + a22*b22

        return @

    fromMat4Rot: (source) -> source.toMat3Rot @

    log: ->
        d = @data
        console.log '%f, %f, %f,\n%f, %f, %f, \n%f, %f, %f, ', d[0], d[1], d[2], d[3], d[4], d[5], d[6], d[7], d[8]

class Mat4
    constructor: (@data) ->
        @data ?= new Float32Array 16
        @ident()

    ident: ->
        d = @data
        d[0]  = 1; d[1]  =0; d[2]  = 0; d[3]  = 0
        d[4]  = 0; d[5]  =1; d[6]  = 0; d[7]  = 0
        d[8]  = 0; d[9]  =0; d[10] = 1; d[11] = 0
        d[12] = 0; d[13] =0; d[14] = 0; d[15] = 1
        return @

    zero: ->
        d = @data
        d[0]  = 0; d[1]  =0; d[2]  = 0; d[3]  = 0
        d[4]  = 0; d[5]  =0; d[6]  = 0; d[7]  = 0
        d[8]  = 0; d[9]  =0; d[10] = 0; d[11] = 0
        d[12] = 0; d[13] =0; d[14] = 0; d[15] = 0
        return @

    copy: (dest) ->
        src = @data
        dst = dest.data
        dst[0] = src[0]
        dst[1] = src[1]
        dst[2] = src[2]
        dst[3] = src[3]
        dst[4] = src[4]
        dst[5] = src[5]
        dst[6] = src[6]
        dst[7] = src[7]
        dst[8] = src[8]
        dst[9] = src[9]
        dst[10] = src[10]
        dst[11] = src[11]
        dst[12] = src[12]
        dst[13] = src[13]
        dst[14] = src[14]
        dst[15] = src[15]
        return dest

    toMat3: (dest) ->
        src = @data
        dst = dest.data
        dst[0] = src[0]
        dst[1] = src[1]
        dst[2] = src[2]
        dst[3] = src[4]
        dst[4] = src[5]
        dst[5] = src[6]
        dst[6] = src[8]
        dst[7] = src[9]
        dst[8] = src[10]

        return dest

    toMat3Rot: (dest) ->
        dst = dest.data
        src = @data
        a00 = src[0]; a01 = src[1]; a02 = src[2]
        a10 = src[4]; a11 = src[5]; a12 = src[6]
        a20 = src[8]; a21 = src[9]; a22 = src[10]

        b01 = a22 * a11 - a12 * a21
        b11 = -a22 * a10 + a12 * a20
        b21 = a21 * a10 - a11 * a20

        d = a00 * b01 + a01 * b11 + a02 * b21
        id = 1 / d

        dst[0] = b01 * id
        dst[3] = (-a22 * a01 + a02 * a21) * id
        dst[6] = (a12 * a01 - a02 * a11) * id
        dst[1] = b11 * id
        dst[4] = (a22 * a00 - a02 * a20) * id
        dst[7] = (-a12 * a00 + a02 * a10) * id
        dst[2] = b21 * id
        dst[5] = (-a21 * a00 + a01 * a20) * id
        dst[8] = (a11 * a00 - a01 * a10) * id

        return dest

    perspective: ({fov, aspect, near, far}) ->
        fov ?= 60
        aspect ?= 1
        near ?= 0.01
        far ?= 100

        @zero()
        d = @data
        top = near * Math.tan(fov*Math.PI/360)
        right = top*aspect
        left = -right
        bottom = -top

        d[0] = (2*near)/(right-left)
        d[5] = (2*near)/(top-bottom)
        d[8] = (right+left)/(right-left)
        d[9] = (top+bottom)/(top-bottom)
        d[10] = -(far+near)/(far-near)
        d[11] = -1
        d[14] = -(2*far*near)/(far-near)

        return @

    inversePerspective: (fov, aspect, near, far) ->
        @zero()
        dst = @data
        top = near * Math.tan(fov*Math.PI/360)
        right = top*aspect
        left = -right
        bottom = -top

        dst[0] = (right-left)/(2*near)
        dst[5] = (top-bottom)/(2*near)
        dst[11] = -(far-near)/(2*far*near)
        dst[12] = (right+left)/(2*near)
        dst[13] = (top+bottom)/(2*near)
        dst[14] = -1
        dst[15] = (far+near)/(2*far*near)

        return @

    ortho: (near=-1, far=1, top=-1, bottom=1, left=-1, right=1) ->
        rl = right-left
        tb = top - bottom
        fn = far - near

        return @set(
            2/rl,   0,      0,      -(left+right)/rl,
            0,      2/tb,   0,      -(top+bottom)/tb,
            0,      0,      -2/fn,  -(far+near)/fn,
            0,      0,      0,      1,
        )

    inverseOrtho: (near=-1, far=1, top=-1, bottom=1, left=-1, right=1) ->
        a = (right-left)/2
        b = (right+left)/2
        c = (top-bottom)/2
        d = (top+bottom)/2
        e = (far-near)/-2
        f = (near+far)/2
        g = 1

        return @set(
            a, 0, 0, b,
            0, c, 0, d,
            0, 0, e, f,
            0, 0, 0, g
        )

    fromRotationTranslation: (quat, vec) ->
        x = quat.x; y = quat.y; z = quat.z; w = quat.w
        x2 = x + x
        y2 = y + y
        z2 = z + z

        xx = x * x2
        xy = x * y2
        xz = x * z2
        yy = y * y2
        yz = y * z2
        zz = z * z2
        wx = w * x2
        wy = w * y2
        wz = w * z2

        dest = @data

        dest[0] = 1 - (yy + zz)
        dest[1] = xy + wz
        dest[2] = xz - wy
        dest[3] = 0
        dest[4] = xy - wz
        dest[5] = 1 - (xx + zz)
        dest[6] = yz + wx
        dest[7] = 0
        dest[8] = xz + wy
        dest[9] = yz - wx
        dest[10] = 1 - (xx + yy)
        dest[11] = 0

        dest[12] = vec.x
        dest[13] = vec.y
        dest[14] = vec.z
        dest[15] = 1

        return @

    trans: (x, y, z) ->
        d = @data
        a00 = d[0]; a01 = d[1]; a02 = d[2]; a03 = d[3]
        a10 = d[4]; a11 = d[5]; a12 = d[6]; a13 = d[7]
        a20 = d[8]; a21 = d[9]; a22 = d[10]; a23 = d[11]

        d[12] = a00 * x + a10 * y + a20 * z + d[12]
        d[13] = a01 * x + a11 * y + a21 * z + d[13]
        d[14] = a02 * x + a12 * y + a22 * z + d[14]
        d[15] = a03 * x + a13 * y + a23 * z + d[15]

        return @

    rotatex: (angle) ->
        d = @data
        rad = tau*(angle/360)
        s = Math.sin rad
        c = Math.cos rad

        a10 = d[4]
        a11 = d[5]
        a12 = d[6]
        a13 = d[7]
        a20 = d[8]
        a21 = d[9]
        a22 = d[10]
        a23 = d[11]

        d[4] = a10 * c + a20 * s
        d[5] = a11 * c + a21 * s
        d[6] = a12 * c + a22 * s
        d[7] = a13 * c + a23 * s

        d[8] = a10 * -s + a20 * c
        d[9] = a11 * -s + a21 * c
        d[10] = a12 * -s + a22 * c
        d[11] = a13 * -s + a23 * c

        return @

    rotatey: (angle) ->
        d = @data
        rad = tau*(angle/360)
        s = Math.sin rad
        c = Math.cos rad

        a00 = d[0]
        a01 = d[1]
        a02 = d[2]
        a03 = d[3]
        a20 = d[8]
        a21 = d[9]
        a22 = d[10]
        a23 = d[11]

        d[0] = a00 * c + a20 * -s
        d[1] = a01 * c + a21 * -s
        d[2] = a02 * c + a22 * -s
        d[3] = a03 * c + a23 * -s

        d[8] = a00 * s + a20 * c
        d[9] = a01 * s + a21 * c
        d[10] = a02 * s + a22 * c
        d[11] = a03 * s + a23 * c

        return @

    rotatez: (angle) ->
        d = @data
        rad = tau*(angle/360)
        s = Math.sin rad
        c = Math.cos rad

        a00 = d[0]
        a01 = d[1]
        a02 = d[2]
        a03 = d[3]
        a10 = d[4]
        a11 = d[5]
        a12 = d[6]
        a13 = d[7]

        d[0] = a00 * c + a10 * s
        d[1] = a01 * c + a11 * s
        d[2] = a02 * c + a12 * s
        d[3] = a03 * c + a13 * s
        d[4] = a00 * -s + a10 * c
        d[5] = a01 * -s + a11 * c
        d[6] = a02 * -s + a12 * c
        d[7] = a03 * -s + a13 * c

        return @

    scale: (scalar) ->
        d = @data

        a00 = d[0]; a01 = d[1]; a02 = d[2]; a03 = d[3]
        a10 = d[4]; a11 = d[5]; a12 = d[6]; a13 = d[7]
        a20 = d[8]; a21 = d[9]; a22 = d[10]; a23 = d[11]

        d[0] = a00 * scalar
        d[1] = a01 * scalar
        d[2] = a02 * scalar
        d[3] = a03 * scalar

        d[4] = a10 * scalar
        d[5] = a11 * scalar
        d[6] = a12 * scalar
        d[7] = a13 * scalar

        d[8] = a20 * scalar
        d[9] = a21 * scalar
        d[10] = a22 * scalar
        d[11] = a23 * scalar

        return @

    mulMat4: (other, dst=@) ->
        dest = dst.data
        mat = @data
        mat2 = other.data

        a00 = mat[ 0]; a01 = mat[ 1]; a02 = mat[ 2]; a03 = mat[3]
        a10 = mat[ 4]; a11 = mat[ 5]; a12 = mat[ 6]; a13 = mat[7]
        a20 = mat[ 8]; a21 = mat[ 9]; a22 = mat[10]; a23 = mat[11]
        a30 = mat[12]; a31 = mat[13]; a32 = mat[14]; a33 = mat[15]

        b0  = mat2[0]; b1 = mat2[1]; b2 = mat2[2]; b3 = mat2[3]
        dest[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30
        dest[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31
        dest[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32
        dest[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33

        b0 = mat2[4]
        b1 = mat2[5]
        b2 = mat2[6]
        b3 = mat2[7]
        dest[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30
        dest[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31
        dest[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32
        dest[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33

        b0 = mat2[8]
        b1 = mat2[9]
        b2 = mat2[10]
        b3 = mat2[11]
        dest[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30
        dest[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31
        dest[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32
        dest[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33

        b0 = mat2[12]
        b1 = mat2[13]
        b2 = mat2[14]
        b3 = mat2[15]
        dest[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30
        dest[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31
        dest[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32
        dest[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33

        return dst

    mulVec3: (vec, dst=vec) ->
        return @mulVal3 vec.x, vec.y, vec.z, dst

    mulVal3: (x, y, z, dst) ->
        dst = dst.data
        d = @data
        dst[0] = d[0]*x + d[4]*y + d[8] *z
        dst[1] = d[1]*x + d[5]*y + d[9] *z
        dst[2] = d[2]*x + d[6]*y + d[10]*z

        return dst

    mulVec4: (vec, dst) ->
        dst ?= vec
        return @mulVal4 vec.x, vec.y, vec.z, vec.w, dst

    mulVal4: (x, y, z, w, dst) ->
        dst = dst.data
        d = @data
        dst[0] = d[0]*x + d[4]*y + d[8] *z + d[12]*w
        dst[1] = d[1]*x + d[5]*y + d[9] *z + d[13]*w
        dst[2] = d[2]*x + d[6]*y + d[10]*z + d[14]*w
        dst[3] = d[3]*x + d[7]*y + d[11]*z + d[15]*w

        return dst

    invert: (dst=@) ->
        mat = @data
        dest = dst.data

        a00 = mat[0]; a01 = mat[1]; a02 = mat[2]; a03 = mat[3]
        a10 = mat[4]; a11 = mat[5]; a12 = mat[6]; a13 = mat[7]
        a20 = mat[8]; a21 = mat[9]; a22 = mat[10]; a23 = mat[11]
        a30 = mat[12]; a31 = mat[13]; a32 = mat[14]; a33 = mat[15]

        b00 = a00 * a11 - a01 * a10
        b01 = a00 * a12 - a02 * a10
        b02 = a00 * a13 - a03 * a10
        b03 = a01 * a12 - a02 * a11
        b04 = a01 * a13 - a03 * a11
        b05 = a02 * a13 - a03 * a12
        b06 = a20 * a31 - a21 * a30
        b07 = a20 * a32 - a22 * a30
        b08 = a20 * a33 - a23 * a30
        b09 = a21 * a32 - a22 * a31
        b10 = a21 * a33 - a23 * a31
        b11 = a22 * a33 - a23 * a32

        d = (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06)

        if d==0 then return
        invDet = 1 / d

        dest[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet
        dest[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet
        dest[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet
        dest[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet
        dest[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet
        dest[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet
        dest[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet
        dest[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet
        dest[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet
        dest[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet
        dest[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet
        dest[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet
        dest[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet
        dest[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet
        dest[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet
        dest[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet

        return dst

    set: (
        a00, a10, a20, a30,
        a01, a11, a21, a31,
        a02, a12, a22, a32,
        a03, a13, a23, a33,
    ) ->
        d = @data
        d[0]=a00; d[4]=a10; d[8]=a20; d[12]=a30
        d[1]=a01; d[5]=a11; d[9]=a21; d[13]=a31
        d[2]=a02; d[6]=a12; d[10]=a22; d[14]=a32
        d[3]=a03; d[7]=a13; d[11]=a23; d[15]=a33

        return @

class Shader
    boilerplate = '''
        #ifdef GL_FRAGMENT_PRECISION_HIGH
            precision highp int;
            precision highp float;
        #else
            precision mediump int;
            precision mediump float;
        #endif
        #define PI 3.141592653589793
        #define TAU 6.283185307179586
        #define PIH 1.5707963267948966
    '''
    constructor: (@framework, {common, vertex, fragment}) ->
        @gl = @framework.gl

        @program    = @gl.createProgram()
        @vs         = @gl.createShader @gl.VERTEX_SHADER
        @fs         = @gl.createShader @gl.FRAGMENT_SHADER
        @gl.attachShader @program, @vs
        @gl.attachShader @program, @fs

        common ?= ''
        @compileShader @vs, [common, vertex].join('\n')
        @compileShader @fs, [common, fragment].join('\n')
        @link()

        @uniformCache = {}
        @attributeCache = {}
        @samplers = {}
        @unitCounter = 0

    compileShader: (shader, source) ->
        source = [boilerplate, source].join('\n')
        [source, lines] = @preprocess source

        @gl.shaderSource shader, source
        @gl.compileShader shader

        if not @gl.getShaderParameter shader, @gl.COMPILE_STATUS
            error = @gl.getShaderInfoLog(shader)
            throw @translateError error, lines

    preprocess: (source) ->
        lines = []
        result = []
        filename = 'no file'
        lineno = 1
        for line in source.split('\n')
            match = line.match /#line (\d+) (.*)/
            if match
                lineno = parseInt(match[1], 10)+1
                filename = match[2]
            else
                lines.push
                    source: line
                    lineno: lineno
                    filename: filename
                result.push line
                lineno += 1
        return [result.join('\n'), lines]

    translateError: (error, lines) ->
        result = ['Shader Compile Error']
        for line, i in error.split('\n')
            match = line.match /ERROR: \d+:(\d+): (.*)/
            if match
                lineno = parseFloat(match[1])-1
                message = match[2]
                sourceline = lines[lineno]
                result.push "File \"#{sourceline.filename}\", Line #{sourceline.lineno}, #{message}"
                result.push "   #{sourceline.source}"
            else
                result.push line
        return result.join('\n')

    link: ->
        @gl.linkProgram @program

        if not @gl.getProgramParameter @program, @gl.LINK_STATUS
            throw "Shader Link Error: #{@gl.getProgramInfoLog(@program)}"

    attributeLocation: (name) ->
        location = @attributeCache[name]
        if location is undefined
            location = @attributeCache[name] = @gl.getAttribLocation @program, name
        return location

    uniformLocation: (name) ->
        location = @uniformCache[name]
        if location is undefined
            location = @uniformCache[name] = @gl.getUniformLocation @program, name
        return location

    use: ->
        if @framework.currentShader isnt @
            @framework.currentShader = @
            @gl.useProgram @program
        return @

    draw: (drawable) ->
        drawable.setPointersForShader(@).draw()
        return @

    int: (name, value) ->
        loc = @uniformLocation name
        @gl.uniform1i loc, value if loc
        return @

    sampler: (name, texture) ->
        unit = @samplers[name]
        if unit is undefined
            unit = @samplers[name] = @unitCounter++
        texture.bind(unit)
        @int name, unit
        return @

    vec2: (name, a, b) ->
        loc = @uniformLocation name
        @gl.uniform2f loc, a, b if loc
        return @

    vec3: (name, a, b, c) ->
        loc = @uniformLocation name
        @gl.uniform3f loc, a, b, f if loc
        return @

    mat4: (name, value) ->
        loc = @uniformLocation name
        if loc
            if value instanceof Mat4
                @gl.uniformMatrix4fv loc, @gl.FALSE, value.data
            else
                @gl.uniformMatrix4fv loc, @gl.FALSE, value
        return @

    mat3: (name, value) ->
        loc = @uniformLocation name
        if loc
            if value instanceof Mat3
                @gl.uniformMatrix3fv loc, @gl.FALSE, value.data
            else
                @gl.uniformMatrix3fv loc, @gl.FALSE, value
        return @

    float: (name, value) ->
        loc = @uniformLocation name
        @gl.uniform1f loc, value if loc
        return @

class Drawable
    float_size = Float32Array.BYTES_PER_ELEMENT

    constructor: (@framework, {@pointers, vertices, @mode}) ->
        @gl = @framework.gl
        @buffer = @gl.createBuffer()
        @mode ?= @gl.TRIANGLES

        @vertexSize = 0
        for pointer in @pointers
            @vertexSize += pointer.size

        @upload vertices

    upload: (vertices) ->
        if vertices instanceof Array
            data = new Float32Array vertices
        else
            data = vertices

        @size = data.length/@vertexSize
        @gl.bindBuffer @gl.ARRAY_BUFFER, @buffer
        @gl.bufferData @gl.ARRAY_BUFFER, data, @gl.STATIC_DRAW
        @gl.bindBuffer @gl.ARRAY_BUFFER, null

    setPointer: (shader, pointer, idx) ->
        location = shader.attributeLocation pointer.name
        if location >= 0
            unit = @framework.vertexUnits[location]
            if not unit.enabled
                unit.enabled = true
                @gl.enableVertexAttribArray location

            if unit.drawable isnt @ or unit.idx != idx
                unit.idx = idx
                unit.drawable = @
                @gl.vertexAttribPointer(
                    location,
                    pointer.size,
                    @gl.FLOAT,
                    false,
                    pointer.stride*float_size,
                    pointer.offset*float_size
                )
        return @

    setPointersForShader: (shader) ->
        @gl.bindBuffer @gl.ARRAY_BUFFER, @buffer
        for pointer, i in @pointers
            @setPointer shader, pointer, i
        return @

    draw: (first=0, size=@size, mode=@mode) ->
        @gl.drawArrays mode, first, size
        return @

class Texture
    constructor: (@framework, params={}) ->
        @gl = @framework.gl
        @channels = @gl[(params.channels ? 'rgb').toUpperCase()]

        if typeof(params.type) == 'number'
            @type = params.type
        else
            @type = @gl[(params.type ? 'unsigned_byte').toUpperCase()]

        @target = @gl.TEXTURE_2D
        @handle = @gl.createTexture()

    destroy: ->
        @gl.deleteTexture @handle

    bind: (unit=0) ->
        if unit > 15
            throw 'Texture unit too large: ' + unit

        @gl.activeTexture @gl.TEXTURE0+unit
        @gl.bindTexture @target, @handle

        return @

    setSize: (@width, @height) ->
        @gl.texImage2D @target, 0, @channels, @width, @height, 0, @channels, @type, null
        return @

    linear: ->
        @gl.texParameteri @target, @gl.TEXTURE_MAG_FILTER, @gl.LINEAR
        @gl.texParameteri @target, @gl.TEXTURE_MIN_FILTER, @gl.LINEAR
        return @

    nearest: ->
        @gl.texParameteri @target, @gl.TEXTURE_MAG_FILTER, @gl.NEAREST
        @gl.texParameteri @target, @gl.TEXTURE_MIN_FILTER, @gl.NEAREST
        return @

    clampToEdge: ->
        @gl.texParameteri @target, @gl.TEXTURE_WRAP_S, @gl.CLAMP_TO_EDGE
        @gl.texParameteri @target, @gl.TEXTURE_WRAP_T, @gl.CLAMP_TO_EDGE
        return @

    repeat: ->
        @gl.texParameteri @target, @gl.TEXTURE_WRAP_S, @gl.REPEAT
        @gl.texParameteri @target, @gl.TEXTURE_WRAP_T, @gl.REPEAT
        return @

class Framebuffer
    constructor: (@framework) ->
        @gl = @framework.gl
        @buffer = @gl.createFramebuffer()
        @ownDepth = false

    destroy: ->
        @gl.deleteFRamebuffer @buffer

    bind: ->
        @gl.bindFramebuffer @gl.FRAMEBUFFER, @buffer
        return @

    unbind: ->
        @gl.bindFramebuffer @gl.FRAMEBUFFER, null
        return @

    check: ->
        result = @gl.checkFramebufferStatus @gl.FRAMEBUFFER
        switch result
            when @gl.FRAMEBUFFER_UNSUPPORTED
                throw 'Framebuffer is unsupported'
            when @gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT
                throw 'Framebuffer incomplete attachment'
            when @gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS
                throw 'Framebuffer incomplete dimensions'
            when @gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT
                throw 'Framebuffer incomplete missing attachment'
        return @

    color: (@colorTexture) ->
        @gl.framebufferTexture2D @gl.FRAMEBUFFER, @gl.COLOR_ATTACHMENT0, @colorTexture.target, @colorTexture.handle, 0
        @check()
        return @

    depth: (@depthBuffer) ->
        if @depthBuffer is undefined
            if @colorTexture is undefined
                throw 'Cannot create implicit depth buffer without a color texture'
            else
                @ownDepth = true
                @depthBuffer = @framework.depthbuffer().bind().setSize(@colorTexture.width, @colorTexture.height)
        @gl.framebufferRenderbuffer @gl.FRAMEBUFFER, @gl.DEPTH_ATTACHMENT, @gl.RENDERBUFFER, @depthBuffer.id
        @check()
        return @

    destroy: ->
        @gl.deleteFramebuffer @buffer
        if @ownDepth
            @depthBuffer.destroy()

class Renderbuffer
    constructor: (@framework) ->
        @gl = @framework.gl
        @id = @gl.createRenderbuffer()

    bind: ->
        @gl.bindRenderbuffer @gl.RENDERBUFFER, @id
        return @

    setSize: (@width, @height) ->
        @bind()
        @gl.renderbufferStorage @gl.RENDERBUFFER, @gl[@format], @width, @height
        @unbind()

    unbind: ->
        @gl.bindRenderbuffer @gl.RENDERBUFFER, null
        return @

    destroy: ->
        @gl.deleteRenderbuffer @id

Depthbuffer = class extends Renderbuffer
    format: 'DEPTH_COMPONENT16'

window.raf = (
    window.requestAnimationFrame or
    window.mozRequestAnimationFrame or
    window.webkitRequestAnimationFrame or
    window.oRequestAnimationFrame
)

window.caf = (
    window.cancelAnimationFrame or
    window.mozcancelAnimationFrame or
    window.webkitcancelAnimationFrame or
    window.ocancelAnimationFrame
)

window.performance.now = (
    performance.now or
    performance.mozNow or
    performance.webkitNow or
    performance.oNow or
    Date.now
)

window.WebGLFramework = class WebGLFramework
    constructor: (@canvas, params) ->
        try
            @gl = @canvas.getContext('webgl', params)
            if @gl == null
                @gl = @canvas.getContext('experimental-webgl', params)
                if @gl == null
                    throw 'WebGL not supported'
        catch error
            throw 'WebGL not supported'

        @textureUnits = []
        for _ in [0...16]
            @textureUnits.push(null)

        @vertexUnits = []
        for _ in [0...16]
            @vertexUnits.push(enabled:false, drawable:null, idx:null)

        @currentShader = null

    shader: (params) -> new Shader @, params
    drawable: (params) -> new Drawable @, params
    texture: (params) -> new Texture @, params
    framebuffer: -> new Framebuffer @
    depthbuffer: -> new Depthbuffer @

    mat3: (data) -> new Mat3 data
    mat4: (data) -> new Mat4 data

    clearColor: (r=0, g=0, b=0, a=1) ->
        @gl.clearColor r, g, b, a
        @gl.clear @gl.COLOR_BUFFER_BIT
        return @

    clearDepth: (depth=1) ->
        @gl.clearDepth depth
        @gl.clear @gl.DEPTH_BUFFER_BIT
        return @

    adjustSize: ->
        canvasWidth = @canvas.width
        canvasHeight = @canvas.height

        if @width isnt canvasWidth or @height isnt canvasHeight
            @canvas.width = canvasWidth
            @canvas.height = canvasHeight
            @width = canvasWidth
            @height = canvasHeight
            @aspect = @width/@height

        return @

    viewport: (left=0, top=0, width=@width, height=@height) ->
        @gl.viewport left, top, width, height
        return @

    depthTest: (value=true) ->
        if value then @gl.enable @gl.DEPTH_TEST
        else @gl.disable @gl.DEPTH_TEST
        return @

    animationInterval: (callback) =>
        interval = ->
            frame = raf interval
            if callback
                callback(frame)

        raf interval

    now: -> performance.now()/1000

    getExt: (name, throws=true) ->
        ext = @gl.getExtension name
        if not ext and throws
            throw "WebGL Extension not supported: #{name}"
        return ext

    requestFullscreen: (elem=@canvas) ->
        if elem.mozRequestFullScreen then elem.mozRequestFullScreen()
        else if elem.webkitRequestFullScreen then elem.webkitRequestFullScreen()
        else if elem.oRequestFullScreen then elem.oRequestFullScreen()
        return @

    isFullscreen: ->
        a = getVendorAttrib(document, 'fullscreenElement')
        b = getVendorAttrib(document, 'fullScreenElement')
        if a or b
            return true
        else
            return false

    onFullscreenChange: (fun) ->
        callback = =>
            fun(@isFullscreen())
        for vendor in vendors
            document.addEventListener vendor + 'fullscreenchange', callback, false
        return @

    exitFullscreen: ->
        document.cancelFullscreen()
        return @

    toggleFullscreen: (elem=@canvas) ->
        if @isFullscreen() then @exitFullscreen()
        else @requestFullscreen(elem)

    getFloatExtension: (spec) -> @gl.getFloatExtension(spec)

    cullFace: (value='back') ->
        if value
            @gl.enable @gl.CULL_FACE
            @gl.cullFace @gl[value.toUpperCase()]
        else
            @gl.disable @gl.CULL_FACE
        return @

    getContext: ->
        return @gl

## shims ##
vendors = [null, 'webkit', 'apple', 'moz', 'o', 'xv', 'ms', 'khtml', 'atsc', 'wap', 'prince', 'ah', 'hp', 'ro', 'rim', 'tc']

vendorName = (name, vendor) ->
    if vendor == null
        return name
    else
        return vendor + name[0].toUpperCase() + name.substr(1)

getVendorAttrib = (obj, name, def) ->
    if obj
        for vendor in vendors
            attrib_name = vendorName(name, vendor)
            attrib = obj[attrib_name]
            if attrib != undefined
                return attrib
    return def

document.fullscreenEnabled = getVendorAttrib document, 'fullscreenEnabled'
document.cancelFullscreen = getVendorAttrib document, 'cancelFullScreen'
