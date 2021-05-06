var TransparentTest = function (vertices, indices, texCoords, normals, texture) {
    this.vertices = vertices;
    this.indices = indices;
    this.texCoords = texCoords;
    this.texture = texture;
    this.normals = normals;
    this.canvas = null;
    this.cb = null;
    this.level = null;
    this.numChildren = 8;
    this.children = [];
    this.IDs = sender.getIDs(this.numChildren);
    this.numChildrenRun = 0;
    this.childComplete = function() {
      if (++this.numChildrenRun == this.numChildren) {
        this.cb(this.level);
      } else {
        var index = this.numChildrenRun;
        this.children[index].begin(this.canvas);
      }
    };

    this.numChildrenLoaded = 0;
    this.childLoaded = function() {
      if (++this.numChildrenLoaded == this.numChildren) {
        var index = this.numChildrenRun;
        this.children[index].begin(this.canvas);
      }
    };
    var RunTransparent = function (vertexShaderText, fragmentShaderText, alp, childNumber, parent) {
        this.begin = function(canvas) {
                var gl;
                if(childNumber == 10){
                    canvas = getCanvas("can_aa");
                    gl = getGLAA(canvas);
                }else gl = getGL(canvas);
                var WebGL = true;

                gl.clearColor(0.0, 0.0, 0.0, 0.0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                gl.enable(gl.DEPTH_TEST);
                gl.enable(gl.CULL_FACE);
                gl.frontFace(gl.CCW);
                gl.cullFace(gl.BACK);

                //
                // Create shaders
                //
                var vertexShader = gl.createShader(gl.VERTEX_SHADER);
                var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

                gl.shaderSource(vertexShader, vertexShaderText);
                gl.shaderSource(fragmentShader, fragmentShaderText);

                gl.compileShader(vertexShader);
                if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
                    console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
                    return;
                }

                gl.compileShader(fragmentShader);
                if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
                    console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
                    return;
                }

                var program = gl.createProgram();
                gl.attachShader(program, vertexShader);
                gl.attachShader(program, fragmentShader);
                gl.linkProgram(program);
                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    console.error('ERROR linking program!', gl.getProgramInfoLog(program));
                    return;
                }
                gl.validateProgram(program);
                if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
                    console.error('ERROR validating program!', gl.getProgramInfoLog(program));
                    return;
                }

                //
                // Create buffer
                //
                var vertices = parent.vertices;
                var indices = parent.indices;
                var texCoords = parent.texCoords;
                var normals = parent.normals;

                var susanPosVertexBufferObject = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, susanPosVertexBufferObject);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

                var susanTexCoordVertexBufferObject = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, susanTexCoordVertexBufferObject);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

                var susanIndexBufferObject = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, susanIndexBufferObject);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

                var susanNormalBufferObject = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, susanNormalBufferObject);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

                gl.bindBuffer(gl.ARRAY_BUFFER, susanPosVertexBufferObject);
                var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
                gl.vertexAttribPointer(
                    positionAttribLocation, // Attribute location
                    3, // Number of elements per attribute
                    gl.FLOAT, // Type of elements
                    gl.FALSE,
                    3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
                    0 // Offset from the beginning of a single vertex to this attribute
                );
                gl.enableVertexAttribArray(positionAttribLocation);

                gl.bindBuffer(gl.ARRAY_BUFFER, susanTexCoordVertexBufferObject);
                var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
                gl.vertexAttribPointer(
                    texCoordAttribLocation, // Attribute location
                    2, // Number of elements per attribute
                    gl.FLOAT, // Type of elements
                    gl.FALSE,
                    2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
                    0
                );
                gl.enableVertexAttribArray(texCoordAttribLocation);

                gl.bindBuffer(gl.ARRAY_BUFFER, susanNormalBufferObject);
                var normalAttribLocation = gl.getAttribLocation(program, 'vertNormal');
                gl.vertexAttribPointer(
                    normalAttribLocation,
                    3, gl.FLOAT,
                    gl.TRUE,
                    3 * Float32Array.BYTES_PER_ELEMENT,
                    0
                );
                gl.enableVertexAttribArray(normalAttribLocation);

                //
                // Create texture
                //
                var tex = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texImage2D(
                    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    parent.texture
                );
                gl.bindTexture(gl.TEXTURE_2D, null);

                // Tell OpenGL state machine which program should be active.
                gl.useProgram(program);

                var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
                var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
                var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

                var worldMatrix = new Float32Array(16);
                var viewMatrix = new Float32Array(16);
                var projMatrix = new Float32Array(16);
                mat4.identity(worldMatrix);
                mat4.lookAt(viewMatrix, [0, 0, -7], [0, 0, 0], [0, 1, 0]);

                mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

                gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
                gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
                gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

                var xRotationMatrix = new Float32Array(16);
                var yRotationMatrix = new Float32Array(16);

                //
                // Lighting information
                //
                gl.useProgram(program);

                var ambientUniformLocation = gl.getUniformLocation(program, 'ambientLightIntensity');
                var sunlightDirUniformLocation = gl.getUniformLocation(program, 'sun.direction');
                var sunlightDiffuse = gl.getUniformLocation(program, 'sun.diffuse');
                var sunlightSpecular = gl.getUniformLocation(program, 'sun.specular');
                var uAlpha = gl.getUniformLocation(program, 'uAlpha');

                gl.uniform3f(ambientUniformLocation, 0.3, 0.3, 0.3);
                gl.uniform3f(sunlightDirUniformLocation, 0.8, -0.8, -0.8);
                gl.uniform3f(sunlightDiffuse, 0.75, 0.75, 1.0);
                gl.uniform3f(sunlightSpecular, 0.8, 0.8, 0.8);
                gl.uniform1f(uAlpha, alp / 100);

                //
                // Main render loop
                //
                var identityMatrix = new Float32Array(16);
                mat4.identity(identityMatrix);
                var angle = 0;
                var count = 45;
                var ven, ren;
                var identityMatrix = new Float32Array(16);
                mat4.identity(identityMatrix);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                gl.disable(gl.DEPTH_TEST);
                gl.enable(gl.BLEND);
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
                //ctx.font = "48px";
                var loop = function () {
                    var frame = requestAnimationFrame(loop);
                    angle = count++ / 20;
                    mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
                    mat4.rotate(xRotationMatrix, identityMatrix, -1.5, [1, 0, 0]);
                    mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
                    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

                    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
                    gl.bindTexture(gl.TEXTURE_2D, tex);
                    gl.activeTexture(gl.TEXTURE0);
                    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
                    //ctx.fillText("Hello world", 9, 50);

                    if(count == 50){
                        cancelAnimationFrame(frame);
                        sender.getData(gl, parent.IDs[childNumber]);
                        parent.childComplete();
                    }
                };
                requestAnimationFrame(loop);
        };
    };

    this.begin = function (canvas, cb, level) {
        this.canvas = canvas;
        this.cb = cb;
        this.level = level;
        var root = './transparent/'
        loadTextResource(root + 'shader.vs.glsl', function (vsErr, vsText, self) {
            if (vsErr) {
                alert('Fatal error getting vertex shader (see console)');
                console.error(vsErr);
            } else {
                loadTextResource(root + 'shader.fs.glsl', function (fsErr, fsText, self) {
                    if (fsErr) {
                        alert('Fatal error getting fragment shader (see console)');
                        console.error(fsErr);
                    } else {
                        self.children.push(new RunTransparent(vsText, fsText, 100, 0, self));
                        self.childLoaded();
                        self.children.push(new RunTransparent(vsText, fsText, 9, 1, self));
                        self.childLoaded();
                        self.children.push(new RunTransparent(vsText, fsText, 10, 2, self));
                        self.childLoaded();
                        self.children.push(new RunTransparent(vsText, fsText, 11, 3, self));
                        self.childLoaded();
                        self.children.push(new RunTransparent(vsText, fsText, 50, 4, self));
                        self.childLoaded();
                        self.children.push(new RunTransparent(vsText, fsText, 79, 5, self));
                        self.childLoaded();
                        self.children.push(new RunTransparent(vsText, fsText, 80, 6, self));
                        self.childLoaded();
                        self.children.push(new RunTransparent(vsText, fsText, 81, 7, self));
                        self.childLoaded();
                    }
                }, self);
            }
        }, this);
    };
};
