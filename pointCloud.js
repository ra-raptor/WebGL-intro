const canvas = document.getElementById("box");
const gl = canvas.getContext("webgl");

if (!gl) {
  throw new Error("WebGL is not supported");
}

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
// CREATING DATA
// const colorData = [1, 0, 0, 0, 1, 0, 0, 0, 1];
// const vertexData = [0, 1, 0, 1, -1, 0, -1, -1, 0];

const points = {
  a: [-0.5, 0.5, 0.5],
  b: [0.5, 0.5, 0.5],
  c: [0.5, -0.5, 0.5],
  d: [-0.5, -0.5, 0.5],
  e: [-0.5, 0.5, -0.5],
  f: [0.5, 0.5, -0.5],
  g: [0.5, -0.5, -0.5],
  h: [-0.5, -0.5, -0.5],
};
const vec3 = glMatrix.vec3;
function spherePointCloud(pointCount) {
  let points = [];
  for (let i = 0; i < pointCount; i++) {
    const rand = () => Math.random() - 0.5;
    const inputPoint = [rand(), rand(), rand()];
    const outputPoints = vec3.normalize(vec3.create(), inputPoint);
    points.push(...outputPoints);
  }
  return points;
}
const vertexData = spherePointCloud(20000);
// const vertexData = [
//   //front
//   ...points["a"],
//   ...points["b"],
//   ...points["c"],
//   ...points["a"],
//   ...points["c"],
//   ...points["d"],
//   //back
//   ...points["e"],
//   ...points["f"],
//   ...points["g"],
//   ...points["e"],
//   ...points["g"],
//   ...points["h"],
//   //top
//   ...points["f"],
//   ...points["b"],
//   ...points["a"],
//   ...points["f"],
//   ...points["a"],
//   ...points["e"],
//   //bottom
//   ...points["g"],
//   ...points["c"],
//   ...points["d"],
//   ...points["g"],
//   ...points["d"],
//   ...points["h"],
//   //left
//   ...points["b"],
//   ...points["f"],
//   ...points["g"],
//   ...points["b"],
//   ...points["g"],
//   ...points["c"],
//   //right
//   ...points["a"],
//   ...points["e"],
//   ...points["h"],
//   ...points["a"],
//   ...points["h"],
//   ...points["d"],
// ];
// console.log(vertexData);

//random color gen
function randomColor() {
  return [Math.random(), Math.random(), Math.random()];
}
let colorData = [];
for (let face = 0; face < 6; face++) {
  let faceColor = randomColor();
  for (let vertex = 0; vertex < 6; vertex++) {
    colorData.push(...faceColor);
  }
}

//CREATING BUFFERS AND LINKING DATA
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

//vertex shader : CREATE : CODE : COMPILE
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(
  vertexShader,
  `
precision mediump float;
attribute vec3 position;
attribute vec3 color;
varying vec3 vColor;
uniform mat4 matrix;
void main(){
    // vColor = color;
    vColor = vec3(position.xy,1);
    gl_Position = matrix * vec4(position,1);
    gl_PointSize = 1.0;
}
`
);
gl.compileShader(vertexShader);

//fragment shader
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(
  fragmentShader,
  `
  precision mediump float;
varying vec3 vColor;
void main(){
    gl_FragColor = vec4(vColor,1);
}
`
);
gl.compileShader(fragmentShader);

//program
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

//enable vertex attribute
const positionLocation = gl.getAttribLocation(program, `position`);
gl.enableVertexAttribArray(positionLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
//enable vertex attribute
const colorLocation = gl.getAttribLocation(program, `color`);
gl.enableVertexAttribArray(colorLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

gl.useProgram(program);
//depth
gl.enable(gl.DEPTH_TEST);

const uniformLocations = {
  matrix: gl.getUniformLocation(program, `matrix`),
};

const mat4 = glMatrix.mat4;
const mvMatrix = mat4.create();
const projectionMatrix = mat4.create();
mat4.perspective(
  projectionMatrix,
  (75 * Math.PI) / 180, // vertical FOV
  canvas.width / canvas.height, // arpect ratio
  1e-4, // near cull distance
  1e4 // far cull distance
);
const finalMatrix = mat4.create();
const modelMatrix = mat4.create();
const viewMatrix = mat4.create();
mat4.translate(modelMatrix, modelMatrix, [0, 0, -1]);
mat4.scale(modelMatrix, modelMatrix, [0.5, 0.5, 0.5]);

//cam translate
mat4.translate(viewMatrix, viewMatrix, [0, 0, 0]);
mat4.invert(viewMatrix, viewMatrix);

function animate() {
  requestAnimationFrame(animate);

  //   mat4.rotateZ(modelMatrix, modelMatrix, Math.PI / 2 / 70);
  mat4.rotateX(modelMatrix, modelMatrix, Math.PI / 6 / 30);
  mat4.rotateY(modelMatrix, modelMatrix, Math.PI / 3 / 70);
  // console.log(matrix);
  mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
  mat4.multiply(finalMatrix, projectionMatrix, mvMatrix);
  gl.uniformMatrix4fv(uniformLocations.matrix, false, finalMatrix);
  gl.drawArrays(gl.POINTS, 0, vertexData.length / 3);
}

animate();
// gl.clearColor(0.0, 0.0, 0.0, 1.0);
// gl.clear(gl.COLOR_BUFFER_BIT);
