/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/


var OpenGLTestIdx = -1;

// the class inherit from TestScene
// every Scene each test used must inherit from TestScene,
// make sure the test have the menu item for back to main menu
var OpenGLTestScene = TestScene.extend({
    runThisTest:function () {
        OpenGLTestIdx = -1;
        this.addChild(nextOpenGLTest());
        director.replaceScene(this);
    }
});


var OpenGLTestLayer = BaseTestLayer.extend({
    _grossini:null,
    _tamara:null,
    _kathia:null,
    _code:null,

    ctor:function() {
        this._super(cc.c4b(0,0,0,255), cc.c4b(98,99,117,255) );
    },

    title:function () {
        return "OpenGLTest";
    },
    subtitle:function () {
        return "";
    },
    onBackCallback:function (sender) {
        var s = new OpenGLTestScene();
        s.addChild(previousOpenGLTest());
        director.replaceScene(s);
    },
    onRestartCallback:function (sender) {
        var s = new OpenGLTestScene();
        s.addChild(restartOpenGLTest());
        director.replaceScene(s);
    },
    onNextCallback:function (sender) {
        var s = new OpenGLTestScene();
        s.addChild(nextOpenGLTest());
        director.replaceScene(s);
    },

    numberOfPendingTests:function() {
        return ( (arrayOfOpenGLTest.length-1) - OpenGLTestIdx );
    },

    getTestNumber:function() {
        return OpenGLTestIdx;
    }
});

//------------------------------------------------------------------
//
// ReadPixelsTest
//
//------------------------------------------------------------------
var GLReadPixelsTest = OpenGLTestLayer.extend({

    ctor:function() {
        this._super();

        if( 'opengl' in sys.capabilities ) {

            var x = winSize.width;
            var y = winSize.height;

            var blue = cc.LayerColor.create(cc.c4b(0, 0, 255, 255));
            var red = cc.LayerColor.create(cc.c4b(255, 0, 0, 255));
            var green = cc.LayerColor.create(cc.c4b(0, 255, 0, 255));
            var white = cc.LayerColor.create(cc.c4b(255, 255, 255, 255));

            blue.setScale(0.5);
            blue.setPosition(-x / 4, -y / 4);

            red.setScale(0.5);
            red.setPosition(x / 4, -y / 4);

            green.setScale(0.5);
            green.setPosition(-x / 4, y / 4);

            white.setScale(0.5);
            white.setPosition(x / 4, y / 4);

            this.addChild(blue,10);
            this.addChild(white,11);
            this.addChild(green,12);
            this.addChild(red,13);
        }
    },

    title:function () {
        return "gl.ReadPixels()";
    },
    subtitle:function () {
        return "Tests ReadPixels. See console";
    },

    //
    // Automation
    //
    getExpectedResult:function() {
        // red, green, blue, white
        var ret = [{"0":255,"1":0,"2":0,"3":255},{"0":0,"1":255,"2":0,"3":255},{"0":0,"1":0,"2":255,"3":255},{"0":255,"1":255,"2":255,"3":255}];
        return JSON.stringify(ret);
    },

    getCurrentResult:function() {
        var x = winSize.width;
        var y = winSize.height;

        var rPixels = new Uint8Array(4);
        var gPixels = new Uint8Array(4);
        var bPixels = new Uint8Array(4);
        var wPixels = new Uint8Array(4);

        // blue
        gl.readPixels(0,   0,   1, 1, gl.RGBA, gl.UNSIGNED_BYTE, bPixels);

        // red
        gl.readPixels(x-1, 0,   1, 1, gl.RGBA, gl.UNSIGNED_BYTE, rPixels);

        // green
        gl.readPixels(0,   y-1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, gPixels);

        // white
        gl.readPixels(x-1, y-1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, wPixels);

        var ret = [ rPixels, gPixels, bPixels, wPixels];
        return JSON.stringify(ret);
    }

});


//------------------------------------------------------------------
//
// GLClearTest
//
//------------------------------------------------------------------
var GLClearTest = OpenGLTestLayer.extend({

    ctor:function() {
        this._super();

        if( 'opengl' in sys.capabilities ) {

            var blue = cc.LayerColor.create(cc.c4b(0, 0, 255, 255));
            this.addChild( blue, 1 );

            var node = new cc.GLNode();
            node.init();
            node.draw = function() {
                gl.clear( gl.COLOR_BUFFER_BIT );
            };

            this.addChild( node, 10 );
            node.setPosition( winSize.width/2, winSize.height/2 );
        }
    },

    title:function () {
        return "gl.clear(gl.COLOR_BUFFER_BIT)";
    },
    subtitle:function () {
        return "Testing gl.clear() with cc.GLNode";
    },

    //
    // Automation
    //
    getExpectedResult:function() {
        // black pixel, not a blue pixel
        var ret = {"0":0,"1":0,"2":0,"3":255};
        return JSON.stringify(ret);
    },

    getCurrentResult:function() {
        var ret = new Uint8Array(4);
        gl.readPixels(winSize.width/2,  winSize.height/2,  1, 1, gl.RGBA, gl.UNSIGNED_BYTE, ret);
        return JSON.stringify(ret);
    }
});

//------------------------------------------------------------------
//
// GLCustomDrawTest
//
//------------------------------------------------------------------
var GLCustomDrawTest = OpenGLTestLayer.extend({

    ctor:function() {
        this._super();

        if( 'opengl' in sys.capabilities ) {

            // simple shader example taken from:
            // http://learningwebgl.com/blog/?p=134
            var vsh = "\n" +
"attribute vec3 aVertexPosition;\n" +
"attribute vec4 aVertexColor;\n" +
"uniform mat4 uMVMatrix;\n" +
"uniform mat4 uPMatrix;\n" +
"varying vec4 vColor;\n" +
"void main(void) {\n" +
" gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n" +
" vColor = aVertexColor;\n" +
"}\n";

            var fsh = "\n" +
"#ifdef GL_ES\n" +
"precision mediump float;\n" +
"#endif\n" +
"varying vec4 vColor;\n" +
"void main(void) {\n"+
" gl_FragColor = vColor;\n" +
"}\n";

            var fshader = this.compileShader(fsh, 'fragment');
            var vshader = this.compileShader(vsh, 'vertex');

            var shaderProgram = this.shaderProgram = gl.createProgram();

            gl.attachShader(shaderProgram, vshader);
            gl.attachShader(shaderProgram, fshader);
            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                throw("Could not initialise shaders");
            }


            gl.useProgram(shaderProgram);

            shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
            gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

            shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
            gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

            shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
            shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

            this.initBuffers();

            var glnode = cc.GLNode.create();
            this.addChild(glnode,10);
            this.glnode = glnode;

            glnode.draw = function() {

                var pMatrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
                this.pMatrix = pMatrix = new Float32Array(pMatrix);

                var mvMatrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
                this.mvMatrix = mvMatrix = new Float32Array(mvMatrix);

                gl.useProgram(this.shaderProgram);
                gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
                gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);

                gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
                gl.enableVertexAttribArray(this.shaderProgram.vertexColorAttribute);


                // Draw fullscreen Square
                gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVertexPositionBuffer);
                gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVertexColorBuffer);
                gl.vertexAttribPointer(this.shaderProgram.vertexColorAttribute, this.squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

                this.setMatrixUniforms();
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.squareVertexPositionBuffer.numItems);


                // Draw fullscreen Triangle
                gl.bindBuffer(gl.ARRAY_BUFFER, this.triangleVertexPositionBuffer);
                gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, this.triangleVertexColorBuffer);
                gl.vertexAttribPointer(this.shaderProgram.vertexColorAttribute, this.triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

                gl.drawArrays(gl.TRIANGLES, 0, this.triangleVertexPositionBuffer.numItems);


                gl.bindBuffer(gl.ARRAY_BUFFER,0);

            }.bind(this);

        }
    },

    setMatrixUniforms:function() {
        gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
        gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
    },

    initBuffers:function() {
        var triangleVertexPositionBuffer = this.triangleVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
        var vertices = [
             0.0,  1.0,  0.0,
            -1.0, -1.0,  0.0,
             1.0, -1.0,  0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        triangleVertexPositionBuffer.itemSize = 3;
        triangleVertexPositionBuffer.numItems = 3;

        var triangleVertexColorBuffer = this.triangleVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
        var colors = [
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        triangleVertexColorBuffer.itemSize = 4;
        triangleVertexColorBuffer.numItems = 3;


        var squareVertexPositionBuffer = this.squareVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        vertices = [
             1.0,  1.0,  0.0,
            -1.0,  1.0,  0.0,
             1.0, -1.0,  0.0,
            -1.0, -1.0,  0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        squareVertexPositionBuffer.itemSize = 3;
        squareVertexPositionBuffer.numItems = 4;

        var squareVertexColorBuffer = this.squareVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
        colors = [];
        for (var i=0; i < 4; i++) {
            colors = colors.concat([0.0, 0.0, 1.0, 1.0]);
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        squareVertexColorBuffer.itemSize = 4;
        squareVertexColorBuffer.numItems = 4;

        gl.bindBuffer(gl.ARRAY_BUFFER,0);
    },

    compileShader:function(source, type) {
        var shader;
        if( type == 'fragment' )
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        else
            shader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) {
            cc.log( gl.getShaderInfoLog(shader) );
            throw("Could not compile " + type + " shader");
        }
        return shader;
    },

    title:function () {
        return "gl.drawElements()";
    },
    subtitle:function () {
        return "blue background with a red triangle in the middle";
    },

    //
    // Automation
    //
    getExpectedResult:function() {
        // blue, red, blue
        var ret = [{"0":0,"1":0,"2":255,"3":255},{"0":0,"1":0,"2":255,"3":255},{"0":255,"1":0,"2":0,"3":255}];
        return JSON.stringify(ret);
    },

    getCurrentResult:function() {
        var ret1 = new Uint8Array(4);
        gl.readPixels(10, winSize.height-1,  1, 1, gl.RGBA, gl.UNSIGNED_BYTE, ret1);
        var ret2 = new Uint8Array(4);
        gl.readPixels(winSize.width-10, winSize.height-1,  1, 1, gl.RGBA, gl.UNSIGNED_BYTE, ret2);
        var ret3 = new Uint8Array(4);
        gl.readPixels(winSize.width/2, winSize.height/2,  1, 1, gl.RGBA, gl.UNSIGNED_BYTE, ret3);

        return JSON.stringify([ret1,ret2,ret3]);
    }
});
//-
//
// Flow control
//
var arrayOfOpenGLTest = [

    GLReadPixelsTest,
    GLClearTest,
    GLCustomDrawTest
];

var nextOpenGLTest = function () {
    OpenGLTestIdx++;
    OpenGLTestIdx = OpenGLTestIdx % arrayOfOpenGLTest.length;

    return new arrayOfOpenGLTest[OpenGLTestIdx]();
};
var previousOpenGLTest = function () {
    OpenGLTestIdx--;
    if (OpenGLTestIdx < 0)
        OpenGLTestIdx += arrayOfOpenGLTest.length;

    return new arrayOfOpenGLTest[OpenGLTestIdx]();
};
var restartOpenGLTest = function () {
    return new arrayOfOpenGLTest[OpenGLTestIdx]();
};