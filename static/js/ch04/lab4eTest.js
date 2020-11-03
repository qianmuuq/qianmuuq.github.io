"use strict";

var gl;
var points;

var maxNumTriangles = 500;
var maxNumVertices = 3 * maxNumTriangles;

var shape=0;
var shapes = [];

var canvas;
var programT;
var programS;
var vBufferT;
var vBufferS;

var t;
var pointsTriangles = [];
var pointsSquares = [];
var verticesTriangle = [];
var verticesTriangle2 = [];

var indexT = 0;
var indexS = 0;

var vPositionT;
var vPositionS;

window.onload=function initShape(){
	init();
	
	canvas.addEventListener( "mousedown", function( event ){
		//test();
		if(shape==0){
			mouseTriangle(event);
		}else if(shape==1){
			mouseSquare(event);

		}
	} );
}

function init(){
	canvas = document.getElementById( "total1-canvas" );
	gl = WebGLUtils.setupWebGL( canvas );
	if( !gl ){
		alert( "WebGL isn't available" );
	}
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
	
    verticesTriangle = [
		-0.5,0.0,
		 0.0,Math.sqrt(3)/2.0,
		 0.5,0.0,
	];
	verticesTriangle2 = [
		0.0,0.0,
		0.0,1.0,
		0.5,0.0
	]

    //正三角形
	programT = initShaders( gl, "vertexT-shader", "fragmentT-shader" );
	gl.useProgram(programT);
	var t1 = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,t1);
	//gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.DYNAMIC_DRAW);
	vPositionT = gl.getAttribLocation( programT, "vPositionT" );
	gl.vertexAttribPointer( vPositionT, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPositionT );
	gl.drawArrays(gl.TRIANGLES,0,3);
	renderT();
	
	//正方形
	
	programS = initShaders( gl, "vertexS-shader", "fragmentS-shader" );
	gl.useProgram(programS);
	vBufferS = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vBufferS);
	//gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.DYNAMIC_DRAW);
	vPositionS = gl.getAttribLocation( programS, "vPositionS" );
	gl.vertexAttribPointer( vPositionS, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPositionS );
	gl.drawArrays(gl.TRIANGLES,0,3);
	renderS();
    
}

//改变绘制的图形
function onChange(){
	shapes = document.getElementById("shape");
	var index=shapes.selectedIndex;
	shape = shapes.options[index].value;
}

//绘制图形，存进缓存
function mouseTriangle(event){
	gl.useProgram(programT);
	vBufferT = gl.createBuffer(); 
	gl.bindBuffer( gl.ARRAY_BUFFER, vBufferT );
	var rect = canvas.getBoundingClientRect();
	var cx = event.clientX - rect.left;
	var cy = event.clientY - rect.top; // offset
	t = glMatrix.vec2.fromValues( 2 * cx / canvas.width - 1, 2 * ( canvas.height - cy ) / canvas.height - 1 );

	for(var i=0;i<3;i++){
	pointsTriangles.push(verticesTriangle[i*2]+t[0]);
	pointsTriangles.push(verticesTriangle[i*2+1]+t[1]);
	}
	gl.bufferData( gl.ARRAY_BUFFER,new Float32Array( pointsTriangles ),gl.DYNAMIC_DRAW );
	
	indexT++;
	
	var vPositionT = gl.getAttribLocation( programT, "vPositionT" );
	gl.vertexAttribPointer( vPositionT, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPositionT );
	renderT();
}

function mouseSquare(event){
	gl.useProgram(programS);
	vBufferS = gl.createBuffer(); 
	gl.bindBuffer( gl.ARRAY_BUFFER, vBufferS );
	var rect = canvas.getBoundingClientRect();
	var cx = event.clientX - rect.left;
	var cy = event.clientY - rect.top; // offset
	t = glMatrix.vec2.fromValues( 2 * cx / canvas.width - 1, 2 * ( canvas.height - cy ) / canvas.height - 1 );

	for(var i=0;i<3;i++){
	pointsSquares.push(verticesTriangle[i*2]+t[0]);
	pointsSquares.push(verticesTriangle[i*2+1]+t[1]);
	}
	gl.bufferData( gl.ARRAY_BUFFER,new Float32Array( pointsSquares ),gl.DYNAMIC_DRAW );
	indexS++;

	var vPositionS = gl.getAttribLocation( programS, "vPositionS" );
	gl.vertexAttribPointer( vPositionS, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPositionS );
	renderS();
}


function renderT(){
	//console.log("Triangle");

	gl.useProgram(programT);
	gl.bindBuffer(gl.ARRAY_BUFFER,vBufferT);
	//gl.drawArrays(gl.TRIANGLES,0,3);
	gl.drawArrays(gl.TRIANGLES,0,indexT*3);
	requestAnimFrame( renderT );
}


function renderS(){
	//console.log("square");

	gl.useProgram(programS);
	gl.bindBuffer(gl.ARRAY_BUFFER,vBufferS);
	//gl.drawArrays(gl.TRIANGLES,0,3);
	gl.drawArrays(gl.TRIANGLES,0,indexS*3);
	//window.requestAnimFrame( renderS );
	requestAnimFrame(renderS);

}