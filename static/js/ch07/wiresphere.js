"use strict";

const {
    vec2,vec3, vec4, mat4
} = glMatrix;

var canvas;
var gl;

var numOfSubdivides = 0;

var points = [];
var index = 0;
var colors = [];

var va = vec4.fromValues(0.0, 0.0, -1.0, 1);
var vb = vec4.fromValues(0.0, 0.942809, 0.333333, 1);
var vc = vec4.fromValues(-0.816479, -0.471405, 0.333333, 1);
var vd = vec4.fromValues(0.816479, -0.471405, 0.333333, 1);

var vBuffer = null;
var vPosition = null;

var texCoords = [];

var texture;

var texCoord = [
    vec2.fromValues( 0, 0 ),
    vec2.fromValues( 0, 1 ),
    vec2.fromValues( 1, 0 ),
    vec2.fromValues( 1, 0 ),
    vec2.fromValues( 0, 1 ),
    vec2.fromValues( 1, 1 )
];

var texSize = 4;

var image1 = new Array()
	for( var i=0; i<texSize; i++ ) 
		image1[i] = new Array();
	for( var i=0; i<texSize; i++ )
		for( var j=0; j<texSize; j++ )
			image1[i][j] = new Float32Array(4);
	for( var i=0; i<texSize; i++ )
		for( var j=0; j<texSize; j++ ){
			var c = ((( i & 0x2 ) == 0 ) ^ (( j & 0x2 ) == 0 ));
			image1[i][j] = [ c, c, c, 1 ];
		}

var image2 = new Uint8Array( 4 * texSize * texSize )
for( var i = 0; i < texSize; i++ )
	for( var j = 0; j < texSize; j++ )
		for( var k = 0; k < 4; k++ )
			image2[ 4 * texSize * i + 4 * j + k ] = 255 * image1[i][j][k];	


function triangle(a, b, c) {
    points.push(a[0], a[1], a[2], a[3]);
    texCoords.push( texCoord[ 0 ][0], texCoord[ 0 ][1] );
	colors.push( 1.0,1.0,0.0,1.0);
    points.push(b[0], b[1], b[2], b[3]);
    texCoords.push( texCoord[ 1 ][0], texCoord[ 1 ][1] );
	colors.push( 1.0,1.0,0.0,1.0);
    points.push(b[0], b[1], b[2], b[3]);
    texCoords.push( texCoord[ 2 ][0], texCoord[ 2 ][1] );
	colors.push( 1.0,1.0,0.0,1.0);
    points.push(c[0], c[1], c[2], c[3]);
    texCoords.push( texCoord[ 3 ][0], texCoord[ 3 ][1] );
	colors.push( 1.0,1.0,0.0,1.0);
    points.push(c[0], c[1], c[2], c[3]);
    texCoords.push( texCoord[ 4 ][0], texCoord[ 4 ][1] );
	colors.push( 1.0,1.0,0.0,1.0);
    points.push(a[0], a[1], a[2], a[3]);
    texCoords.push( texCoord[ 5 ][0], texCoord[ 5 ][1] );
	colors.push( 1.0,1.0,0.0,1.0);
    index += 6;
}

function divideTriangle(a, b, c, n) {
    if (n > 0) {
        var ab = vec4.create();
        vec4.lerp(ab, a, b, 0.5);
        var abt = vec3.fromValues(ab[0], ab[1], ab[2]);
        vec3.normalize(abt, abt);
        vec4.set(ab, abt[0], abt[1], abt[2], 1.0);

        var bc = vec4.create();
        vec4.lerp(bc, b, c, 0.5);
        var bct = vec3.fromValues(bc[0], bc[1], bc[2]);
        vec3.normalize(bct, bct);
        vec4.set(bc, bct[0], bct[1], bct[2], 1.0);

        var ac = vec4.create();
        vec4.lerp(ac, a, c, 0.5);
        var act = vec3.fromValues(ac[0], ac[1], ac[2]);
        vec3.normalize(act, act);
        vec4.set(ac, act[0], act[1], act[2], 1.0);

        divideTriangle(a, ab, ac, n - 1);
        divideTriangle(ab, b, bc, n - 1);
        divideTriangle(bc, c, ac, n - 1);
        divideTriangle(ab, bc, ac, n - 1);
    } else {
        triangle(a, b, c);
    }
}

function divideTetra(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

function configureTexture( image ){
	texture = gl.createTexture();
	
	gl.activeTexture( gl.TEXTURE0 );
	gl.bindTexture( gl.TEXTURE_2D, texture );
	gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image );	
	gl.generateMipmap( gl.TEXTURE_2D );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
}

window.onload = function initSphere() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.width);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    divideTetra(va, vb, vc, vd, 8);

    var cBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( colors ), gl.STATIC_DRAW );

	var vColor = gl.getAttribLocation( program, "vColor" );
	gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vColor );

	var vBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( points ), gl.STATIC_DRAW );

	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );

	var tBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( texCoords ), gl.STATIC_DRAW );

	var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
	gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vTexCoord );

    configureTexture( image2 );
    
    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.LINES, 0, points.length/4);
    requestAnimFrame(render);
}