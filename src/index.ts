import { Atlas } from "./Atlas";

const vertexShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: vert

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTextCoord;
layout(location = 2) in vec3 aOffset;
layout(location = 3) in float aDepth;

uniform vec2 canvas;

out vec2 vTextCoord;
out float vDepth;

void main()
{
    vTextCoord = aTextCoord;
    vDepth = aDepth;
    gl_Position = vec4((aPosition.xyz + aOffset) * vec3(1.0 / canvas.x, 1.0 / canvas.y, 1.0) - vec3(1, 1, 0), 1.0);
}`;

const fragmentShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: frag

precision mediump float;

in vec2 vTextCoord;
in float vDepth;
uniform mediump sampler2DArray uSampler;

out vec4 fragColor;

void main()
{
    fragColor = texture(uSampler, vec3(vTextCoord, vDepth));
}`;

const loadShader = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  type: number,
  source: string,
): WebGLShader => {
  const shader = gl.createShader(type)!;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  gl.attachShader(program, shader);

  return shader;
};

const buildProgram = (gl: WebGL2RenderingContext): WebGLProgram => {
  const program = gl.createProgram()!;

  const vertexShader = loadShader(gl, program, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = loadShader(gl, program, gl.FRAGMENT_SHADER, fragmentShaderSource);

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader));
    console.log(gl.getShaderInfoLog(fragmentShader));
  }

  gl.useProgram(program);

  return program;
};

const run = async () => {
  const canvas = document.querySelector("canvas")!;
  const gl = canvas.getContext("webgl2")!;
  const program = buildProgram(gl);

  gl.uniform2fv(gl.getUniformLocation(program, "canvas"), [canvas.width / 2, canvas.height / 2]);

  const aPositionLoc = 0;
  const aTextCoordLoc = 1;
  const aOffset = 2;
  const aDepth = 3;

  const marioAtlas = await Atlas.load("mario");

  const marioTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, marioTexture);
  gl.texImage3D(
    gl.TEXTURE_2D_ARRAY, 
    0, 
    gl.RGBA, 
    marioAtlas.image.width, // width of the image
    marioAtlas.image.width, // height of the image: since we are using a vertical atlas with squared tiles, we will consider that each tile height == tile width
    marioAtlas.image.height / marioAtlas.image.width, // the number of tiles is height / width
    0, 
    gl.RGBA, 
    gl.UNSIGNED_BYTE, 
    marioAtlas.image);

  gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  const bufferData = marioAtlas.build();

  const modelBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, modelBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, bufferData.modelBuffer, gl.STATIC_DRAW);
  gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 4 * 4, 0);
  gl.vertexAttribPointer(aTextCoordLoc, 2, gl.FLOAT, false, 4 * 4, 2 * 4);
  gl.enableVertexAttribArray(aPositionLoc);
  gl.enableVertexAttribArray(aTextCoordLoc);

  const transformBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, transformBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, bufferData.transformBuffer, gl.STATIC_DRAW);
  gl.vertexAttribPointer(aOffset, 3, gl.FLOAT, false, 4 * 4, 0);
  gl.vertexAttribPointer(aDepth, 1, gl.FLOAT, false, 4 * 4, 4 * 3);
  gl.enableVertexAttribArray(aOffset);
  gl.enableVertexAttribArray(aDepth);

  gl.vertexAttribDivisor(aOffset, 1);
  gl.vertexAttribDivisor(aDepth, 1);

  gl.drawArraysInstanced(gl.TRIANGLES, 0, bufferData.modelBuffer.length / 4, bufferData.transformBuffer.length / 4);
};

run();
