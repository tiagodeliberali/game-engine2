import { Atlas } from "./Atlas";
import { Position } from "./Position";

const vertexShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: vert

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTextCoord;

uniform vec2 canvas;

out vec2 vTextCoord;

void main()
{
    vTextCoord = aTextCoord;
    gl_Position = vec4(aPosition, 1.0) * vec4(1.0 / canvas.x, 1.0 / canvas.y, 1.0, 1.0);
}`;

const fragmentShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: frag

precision mediump float;

in vec2 vTextCoord;
uniform sampler2D uSampler;

out vec4 fragColor;

void main()
{
    fragColor = texture(uSampler, vTextCoord);
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

  gl.enableVertexAttribArray(aPositionLoc);
  gl.enableVertexAttribArray(aTextCoordLoc);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const dungeonAtlas = await Atlas.load("dungeon");

  const textureTree = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, textureTree);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, dungeonAtlas.image.width, dungeonAtlas.image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, dungeonAtlas.image);

  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  const bufferData = new Float32Array([
    ...dungeonAtlas.buildSliceAt("L", new Position(-48, 16)),
    ...dungeonAtlas.buildSliceAt("_", new Position(-32, 16)),
    ...dungeonAtlas.buildSliceAt("J", new Position(-16, 16)),
    ...dungeonAtlas.buildSliceAt("BG5", new Position(0, 16)),
    ...dungeonAtlas.buildSliceAt("BG0", new Position(16, 16)),
    ...dungeonAtlas.buildSliceAt("BG4", new Position(32, 16)),

    ...dungeonAtlas.buildSliceAt("BG0", new Position(-16, 0)),
    ...dungeonAtlas.buildSliceAt("BG1", new Position(0, 0)),
    ...dungeonAtlas.buildSliceAt("BG2", new Position(16, 0)),
    ...dungeonAtlas.buildSliceAt("BG3", new Position(32, 0)),

    ...dungeonAtlas.buildSliceAt("hole", new Position(-48, -16)),
    ...dungeonAtlas.buildSliceAt("BG1", new Position(-16, -16)),
    ...dungeonAtlas.buildSliceAt("/", new Position(0, -16)),
    ...dungeonAtlas.buildSliceAt("-", new Position(16, -16)),
    ...dungeonAtlas.buildSliceAt("-", new Position(32, -16)),

    ...dungeonAtlas.buildSliceAt("F", new Position(-48, -32)),
    ...dungeonAtlas.buildSliceAt("-", new Position(-32, -32)),
    ...dungeonAtlas.buildSliceAt("-", new Position(-16, -32)),
    ...dungeonAtlas.buildSliceAt(".", new Position(0, -32)),
    ...dungeonAtlas.buildSliceAt("BG1", new Position(16, -32)),
    ...dungeonAtlas.buildSliceAt("BG0", new Position(32, -32)),
  ]);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);

  gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 4 * 4, 0);
  gl.vertexAttribPointer(aTextCoordLoc, 2, gl.FLOAT, false, 4 * 4, 2 * 4);

  gl.drawArrays(gl.TRIANGLES, 0, bufferData.length);
};

run();
