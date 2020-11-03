"use strict";

const { vec4 } = glMatrix;
var gl;
var points;

var maxNumTriangles = 1000;
var maxNumVertices = 3 * maxNumTriangles;

var shape=0;
var shapes = [];
var drawShapes = [];

var canvas;
var program;
var vBuffer;
var cBuffer;
var vColor;

var t;
var ui;
var circleD;
var move=0;
var moveDig = 0.03;
var verticesTriangle = [];
var verticesSquare = [];
var verticesCube = [];
var verticesCircle = [];
var vertexColors = [];
var circlePoints = [
	0.0, 0.0, 0.0
];

var index = 0;

var vPosition;
var colorU=[0.0,0.0,0.0,1.0];
var colorLoc;

var scale = [1.0,1.0,1.0];
var scaleLoc;
var scaleNum = 0.05;

var theta = [0.0,0.0,0.0];
var thetaLoc;
var thetaSquareZ = 0;
var thetaCube = 0;

var posRec = [];
var posLoc;


window.onload=function initShape(){
	init();
	
	canvas.addEventListener( "mousedown", function( event ){
        var x = document.getElementById("myColor").value;
        colorChange(x);
		if(shape==0){
			mouseTriangle(event);
		}else if(shape==1){
			mouseSquare(event);
		}else if(shape==2){
            mouseCube(event);
        }else if(shape==3){
            mouseCircle(event);
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
    
    gl.enable(gl.DEPTH_TEST);

    ui = document.getElementById("circleBlock");
    ui.style.display = "none";
	
    verticesTriangle = [
		-0.25,0.0,
		 0.0,Math.sqrt(3)/4.0,
		 0.25,0.0,
    ];
    verticesSquare = [
        -0.1,0.1,
        0.1,0.1,
        -0.1,-0.1,
        0.1,0.1,
        -0.1,-0.1,
        0.1,-0.1,
    ];
    verticesCube = [
        vec4.fromValues(-0.25, -0.25, 0.25, 1.0),
        vec4.fromValues(-0.25, 0.25, 0.25, 1.0),
        vec4.fromValues(0.25, 0.25, 0.25, 1.0),
        vec4.fromValues(0.25, -0.25, 0.25, 1.0),
        vec4.fromValues(-0.25, -0.25, -0.25, 1.0),
        vec4.fromValues(-0.25, 0.25, -0.25, 1.0),
        vec4.fromValues(0.25, 0.25, -0.25, 1.0),
        vec4.fromValues(0.25, -0.25, -0.25, 1.0),
    ];

    // vertexColors = [
    //     glMatrix.vec4.fromValues(0.0, 0.0, 0.0, 1.0),  // black
    //     glMatrix.vec4.fromValues(0.0, 0.0, 1.0, 1.0),  // blue
    //     glMatrix.vec4.fromValues(0.0, 1.0, 0.0, 1.0),  // green
    //     glMatrix.vec4.fromValues(0.0, 1.0, 1.0, 1.0),  // cyan
    //     glMatrix.vec4.fromValues(1.0, 0.0, 0.0, 1.0),  // red
    //     glMatrix.vec4.fromValues(1.0, 0.0, 1.0, 1.0),  // magenta
    //     glMatrix.vec4.fromValues(1.0, 1.0, 0.0, 1.0),  // yellow
    //     glMatrix.vec4.fromValues(1.0, 1.0, 1.0, 1.0)   // white
    // ];

    //all
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    
    colorLoc = gl.getUniformLocation(program, "color");
    scaleLoc = gl.getUniformLocation(program,"scale");
    thetaLoc = gl.getUniformLocation(program, "theta");
    posLoc = gl.getUniformLocation(program,"pos");

	gl.useProgram(program);
	vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.DYNAMIC_DRAW);
	vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
    gl.drawArrays(gl.TRIANGLES,0,3);
    cBuffer = gl.createBuffer(); // color
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW);

	vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);
	render();
    
}

//改变绘制的图形
function onChange(){   
	shapes = document.getElementById("shape");
	var index=shapes.selectedIndex;
    shape = shapes.options[index].value;
    if(shape==3) {ui.style.display="block";}
    else ui.style.display="none";
}

//改变颜色
function colorChange(x){
    // console.log(x);
    var cX = (strToNum(x.charCodeAt(1)-1)*16)+strToNum(x.charCodeAt(2));
    var cY = (strToNum(x.charCodeAt(3)-1)*16)+strToNum(x.charCodeAt(4));
    var cZ = (strToNum(x.charCodeAt(5)-1)*16)+strToNum(x.charCodeAt(6));
     //console.log(cX);
    colorU = [cX/256.0,cY/256.0,cZ/256.0,1.0];
    // console.log(colorU);
}
function strToNum(num){
    if(num>=48&&num<=57) return num-48+1;
    else return num-87+1;
}

//绘制图形，存进缓存
function mouseTriangle(event){
	var rect = canvas.getBoundingClientRect();
	var cx = event.clientX - rect.left;
	var cy = event.clientY - rect.top; // offset
    //t = glMatrix.vec2.fromValues( 2 * cx / canvas.width - 1, 2 * ( canvas.height - cy ) / canvas.height - 1 );
    posRec.push(2 * cx / canvas.width - 1);
    posRec.push(2 * ( canvas.height - cy ) / canvas.height - 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	for(var i=0;i<3;i++){	
    gl.bufferSubData( gl.ARRAY_BUFFER,16*(index+i),new Float32Array( glMatrix.vec4.fromValues(verticesTriangle[i*2],verticesTriangle[i*2+1],0.0,1.0) ));
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    for(var i=0;i<3;i++){
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index + i), new Float32Array(colorU));
    }
	
    index+=3;
    drawShapes.push(0);
}

function mouseSquare(event){
	var rect = canvas.getBoundingClientRect();
	var cx = event.clientX - rect.left;
	var cy = event.clientY - rect.top; // offset
    // t = glMatrix.vec2.fromValues( 2 * cx / canvas.width - 1, 2 * ( canvas.height - cy ) / canvas.height - 1 );
    posRec.push(2 * cx / canvas.width - 1);
    posRec.push(2 * ( canvas.height - cy ) / canvas.height - 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	for(var i=0;i<6;i++){	
    gl.bufferSubData( gl.ARRAY_BUFFER,16*(index+i),new Float32Array( glMatrix.vec4.fromValues(verticesSquare[i*2],verticesSquare[i*2+1],0.0,1.0) ));
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    for(var i=0;i<6;i++){
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index + i), new Float32Array(colorU));
    }
	
    index+=6;
    drawShapes.push(1);
}

function mouseCube(event){
	var rect = canvas.getBoundingClientRect();
	var cx = event.clientX - rect.left;
	var cy = event.clientY - rect.top; // offset
    // t = glMatrix.vec2.fromValues( 2 * cx / canvas.width - 1, 2 * ( canvas.height - cy ) / canvas.height - 1 );
    posRec.push(2 * cx / canvas.width - 1);
    posRec.push(2 * ( canvas.height - cy ) / canvas.height - 1);

    var faces = [
        1, 0, 3, 1, 3, 2, //正
        2, 3, 7, 2, 7, 6, //右
        3, 0, 4, 3, 4, 7, //底
        6, 5, 1, 6, 1, 2, //顶
        4, 5, 6, 4, 6, 7, //背
        5, 4, 0, 5, 0, 1  //左
    ];

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);   
    
    for (var i=0;i<faces.length;i++) {
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index + i), new Float32Array(glMatrix.vec4.fromValues(verticesCube[faces[i]][0], verticesCube[faces[i]][1], verticesCube[faces[i]][2], 1.0)));
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    var add = 0;
    for(var i=0;i<6;i++){
        add+=0.1;
        for(var j=0;j<6;j++){
            gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index + i*6+j), new Float32Array(glMatrix.vec4.fromValues((colorU[0]+add)%1.0,(colorU[1]+add+0.1)%1.0,(colorU[2]+add+0.1)%1.0,1.0)));
        }
    }
    // for(var i=0;i<faces.length;i++){
    //     gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index + i), new Float32Array(vertexColors[Math.floor(i / 6)]));
    // }
	
    index+=36;
    drawShapes.push(2);
}

function mouseCircle(event){
    circleD = 3*document.getElementById("circle").value;
	var rect = canvas.getBoundingClientRect();
	var cx = event.clientX - rect.left;
	var cy = event.clientY - rect.top; // offset
    // t = glMatrix.vec2.fromValues( 2 * cx / canvas.width - 1, 2 * ( canvas.height - cy ) / canvas.height - 1 );
    posRec.push(2 * cx / canvas.width - 1);
    posRec.push(2 * ( canvas.height - cy ) / canvas.height - 1);

    var alpha = 2 * Math.PI / circleD;
    circlePoints = [0.0,0.0,0.0];
    for(var i=0;i<=circleD;i++){
        circlePoints.push(0.2 * Math.cos(Math.PI-alpha*i), 0.2 * Math.sin(Math.PI-alpha*i), 0.0);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    for(var i=0;i<circlePoints.length/3;i++){
        // console.log(circlePoints[i*3], circlePoints[i*3+1], circlePoints[i*3+2]);
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index + i), new Float32Array(glMatrix.vec4.fromValues(circlePoints[i*3], circlePoints[i*3+1], circlePoints[i*3+2], 1.0)));
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    for(var i=0;i<circlePoints.length/3;i++){
        gl.bufferSubData(gl.ARRAY_BUFFER, 16 * (index + i), new Float32Array(colorU));
    }
	
    index+=90;
    drawShapes.push(3);
}


function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var rec = 0;
    
    for(var i=0;i<drawShapes.length;i++){
        if(drawShapes[i]==3){
            move += moveDig;
            if(move>0.1) moveDig*=-1;
            else if(move<-0.1) moveDig*=-1;
            gl.uniform3fv(posLoc,[posRec[i*2]+move,posRec[i*2+1]+move,0.0]);
        }
        else gl.uniform3fv(posLoc,[posRec[i*2],posRec[i*2+1],0.0]);
        if(drawShapes[i]==0){
            scale[0] = scale[1] = scale[2] += scaleNum;
            if(scale[0]>1.1) scaleNum*=-1;
            else if(scale[0]<0.55) scaleNum*=-1;
            
            gl.uniform3fv(scaleLoc,scale);
            gl.uniform3fv(thetaLoc,[0.0,0.0,0.0]);
            gl.uniform4fv(colorLoc, colorU);
            gl.drawArrays(gl.TRIANGLES,rec,rec+=3);
            rec += 3;
            sleep(100);
            //console.log(scale[0]);
        }else if(drawShapes[i]==1){
            thetaSquareZ += 0.1;
            if(thetaSquareZ>2*Math.PI) thetaSquareZ-=2*Math.PI;

            gl.uniform3fv(scaleLoc,[1.0,1.0,1.0]);
            gl.uniform3fv(thetaLoc,[0.0,0.0,thetaSquareZ]);
            gl.uniform4fv(colorLoc, colorU);
            gl.drawArrays(gl.TRIANGLES,rec,rec+=6);
            rec += 6;
            sleep(100);
        }else if(drawShapes[i]==2){
            thetaCube += 0.1;
            if(thetaCube>2*Math.PI) thetaCube-=2*Math.PI;
            gl.uniform3fv(scaleLoc,[1.0,1.0,1.0]);
            gl.uniform3fv(thetaLoc,[0.0,thetaCube,thetaCube]);
            gl.uniform4fv(colorLoc, colorU);
            gl.drawArrays(gl.TRIANGLES,rec,rec+=36);
            rec += 36;
            sleep(100);
        }else if(drawShapes[i]==3){
            gl.uniform3fv(scaleLoc,[1.0,1.0,1.0]);
            gl.uniform3fv(thetaLoc,[0.0,0.0,0.0]);
            gl.uniform4fv(colorLoc, colorU);
            gl.drawArrays(gl.TRIANGLE_FAN, rec, rec+circleD+2);
            rec += 90;
            sleep(100);
        }
    }
    
	requestAnimFrame( render);
}

function sleep(delay) {   //delay:传入等待秒数
    var start = (new Date()).getTime();  //获取函数刚开始秒数
    while ((new Date()).getTime() - start < delay) {   //当当前时间减去函数刚开始时间小于等待秒数时，循环一直进行
    continue;
}}