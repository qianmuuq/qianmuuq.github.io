"use strict";

const { vec3 } = glMatrix;

var canvas;
var gl;
var colors = [];
var points = [];
var theta=0;
var thetaLoc;
var rocked=0;
var step=0.1;

function cupRocked(){
    rocked = 1;
}

window.onload = function initTriangles(){
	canvas = document.getElementById( "gl-canvas" );

	gl = WebGLUtils.setupWebGL( canvas );
	if( !gl ){
		alert( "WebGL isn't available" );
	}

	// initialise data for Sierpinski gasket

	// first, initialise the corners of the gasket with three points.
	points = [];
	var vertices = [
		0.5,0.4,0,
	];

	// var u = vec3.create();
	// vec3.set( u, -1, -1, 0 );
	var u = vec3.fromValues( vertices[0], vertices[1], vertices[2] );
	// var v = vec3.create();
	// vec3.set( v, 0, 1, 0 );
	// var v = vec3.fromValues( vertices[3], vertices[4], vertices[5] );
	// // var w = vec3.create();
	// // vec3.set( w, 1, -1, 0 );
	// var w = vec3.fromValues( vertices[6], vertices[7], vertices[8] );

    cup(u);
    sucker();
    cherry();

	// configure webgl
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	// load shaders and initialise attribute buffers
    //var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    var program = initShaders( gl, "rot-v-shader", "rot-f-shader" );
	gl.useProgram( program );

	// load data into gpu
	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( points ), gl.STATIC_DRAW );

	// associate out shader variables with data buffer
	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    thetaLoc = gl.getUniformLocation( program, "theta" );

    theta = 0.0;
	renderLines2();
};

//绘制杯子形状
function cup( a ){
//绘制最上面的圆形
    var u,v,w;
    u = a[0];
    v = a[1];
    w = 0;
    for(;theta<Math.PI*2+0.1;theta+=0.1){
        points.push(u,v,w);
        u = Math.cos(theta)*0.5;
        v = Math.sin(theta)*0.3+0.4;
        points.push(u,v,w);
    } 

//绘制杯子的左右两条直线
    points.push(0.5,0.4,0);
    points.push(0.4,-0.8,0);
    points.push(-0.5,0.4,0);
    points.push(-0.4,-0.8,0);

//绘制杯子的下面半圆
    var u,v,w;
    u = -0.4;
    v = -0.8;
    w = 0;
    for(theta=Math.PI;theta<Math.PI*2+0.1;theta+=0.1){
        points.push(u,v,w);
        u = Math.cos(theta)*0.4;
        v = Math.sin(theta)*0.2-0.8;
        points.push(u,v,w);
    } 

//绘制杯子的水线
    points.push(0.44,-0.32,0);
    points.push(-0.44,-0.32,0);
}

//吸管
function sucker(){
    //绘制吸管两侧直线
    points.push(0,-0.32,0);
    points.push(0.37,0.90,0);
    points.push(0.08,-0.32,0);
    points.push(0.45,0.90,0);

    //绘制吸管的圆
    var u,v,w;
    u = 0.45;
    v = 0.9;
    w = 0;
    for(theta=0 ;theta<Math.PI*2+0.1;theta+=0.1){
        points.push(u,v,w);
        u = Math.cos(theta)*0.04+0.41;
        v = Math.sin(theta)*0.023+0.9;
        points.push(u,v,w);
    } 
}

//绘制樱桃
function cherry(){
    var u,v,w;
    u = -0.1;
    v = -0.7;
    w = 0;
    for(theta=0 ;theta<Math.PI*2+0.1;theta+=0.1){
        points.push(u,v,w);
        u = Math.cos(theta)*0.1-0.2;
        v = Math.sin(theta)*0.1-0.7;
        points.push(u,v,w);
    } 
    u = -0.14;
    v = -0.79;
    for(theta=-2.1 ;theta<2.2;theta+=0.1){
        points.push(u,v,w);
        u = Math.cos(theta)*0.12-0.1;
        v = Math.sin(theta)*0.1-0.7;
        points.push(u,v,w);
    } 

    points.push(-0.18,-0.65,0);
    points.push(-0.24,-0.65,0);
    points.push(-0.03,-0.63,0);
    points.push(-0.08,-0.65,0);
    points.push(-0.21,-0.65,0);
    points.push(-0.12,-0.45,0);
    points.push(-0.12,-0.45,0);
    points.push(-0.055,-0.64,0);
}

function renderLines(){
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.drawArrays( gl.LINES, 0, points.length/3 );
}

function renderLines2(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(rocked==1){
        if(theta==-0.5){
            step = 0.1;
        }
        if(theta==0.5){
            step = -0.1;
        }
        theta += step;
    }
    else theta = 0;
    gl.uniform1f( thetaLoc, theta );

	gl.drawArrays( gl.LINES, 0, points.length/3 );

	// update and render
	setTimeout( function(){ requestAnimFrame( renderLines2 ); }, 150 );
}


