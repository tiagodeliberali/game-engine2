import { Atlas } from "./Atlas";

const vertexShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: vert

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTextCoord;
layout(location = 2) in vec3 aOffset;
layout(location = 3) in float aDepth;
layout(location = 4) in vec2 aAnimation; // x: tickPerFrame, y: number of frames

uniform vec2 canvas;
uniform float uTick;

out vec2 vTextCoord;
out float vDepth;

void main()
{
    vTextCoord = aTextCoord;
    vDepth = aDepth + mod(floor(uTick / max(aAnimation.x, 1.0)), max(aAnimation.y, 1.0));
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

class AnimationEntity {
    animations: Map<string, Animation>;

    private constructor(data: [Animation]) {
      this.animations = new Map<string, Animation>();
      data.forEach((item) => this.animations.set(item.name, item));
    }

    public static async load<AnimationEntity>(name: string) {
      const file = await fetch(`./textures/${name}.json`);
      const data = await file.json();
      return new AnimationEntity(data);
    }
    public get(name: string): Animation {
      return this.animations.get(name)!;
    }
}

class Animation {
    name!: string;
    start!: number;
    duration!: number;
    ticksPerFrame!: number;
}

class EntityManager {
  public static ITEMS_PER_TRANSFORM_BUFFER: number = 6;

  entities: Map<string, EntityData>;

  constructor() {
    this.entities = new Map<string, EntityData>();
  }

  public set(id: string, data: EntityData) {
    this.entities.set(id, data);
  }

  public build(): Float32Array {
    const transformBuffer = new Float32Array(this.entities.size * EntityManager.ITEMS_PER_TRANSFORM_BUFFER);

    var offset = 0;

    Array.from(this.entities.values()).forEach((item) => {
      transformBuffer.set([
        item.x, item.y, 0.001, item.animation.start, item.animation.ticksPerFrame, item.animation.duration
      ], (offset++) * EntityManager.ITEMS_PER_TRANSFORM_BUFFER);
    });

    return transformBuffer;
  }
}

class EntityData {
  x: number;
  y: number;
  animation: Animation;

  constructor(x: number, y: number, animation: Animation) {
    this.x = x;
    this.y = y;
    this.animation = animation;
  }
}

const run = async () => {
  const canvas = document.querySelector("canvas")!;
  const gl = canvas.getContext("webgl2")!;
  const program = buildProgram(gl);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

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

  const atlasVAO = gl.createVertexArray();
  gl.bindVertexArray(atlasVAO);

  const modelBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, modelBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, bufferData.modelBuffer, gl.STATIC_DRAW);
  gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, Atlas.ITEMS_PER_MODEL_BUFFER * Float32Array.BYTES_PER_ELEMENT, 0);
  gl.vertexAttribPointer(aTextCoordLoc, 2, gl.FLOAT, false, Atlas.ITEMS_PER_MODEL_BUFFER * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(aPositionLoc);
  gl.enableVertexAttribArray(aTextCoordLoc);

  const transformBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, transformBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, bufferData.transformBuffer, gl.STATIC_DRAW);
  gl.vertexAttribPointer(aOffset, 3, gl.FLOAT, false, Atlas.ITEMS_PER_TRANSFORM_BUFFER * Float32Array.BYTES_PER_ELEMENT, 0);
  gl.vertexAttribPointer(aDepth, 1, gl.FLOAT, false, Atlas.ITEMS_PER_TRANSFORM_BUFFER * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(aOffset);
  gl.enableVertexAttribArray(aDepth);

  gl.vertexAttribDivisor(aOffset, 1);
  gl.vertexAttribDivisor(aDepth, 1);

  gl.bindVertexArray(null);

  
  

  const aAnimation = 4;

  const animations = await AnimationEntity.load("animations");
  const entityManager = new EntityManager();

  entityManager.set("coin1", new EntityData(7 * 16, 4 * 16, animations.get("coin_spinning")));
  entityManager.set("coin2", new EntityData(7 * 16, 5 * 16, animations.get("coin_spinning")));

  const entityTransformBufferData = entityManager.build();



  const entitiesVAO = gl.createVertexArray();
  gl.bindVertexArray(entitiesVAO);

  gl.bindBuffer(gl.ARRAY_BUFFER, modelBuffer);
  // gl.bufferData(gl.ARRAY_BUFFER, bufferData.modelBuffer, gl.STATIC_DRAW); !!! NOT SENDING DATA AGAIN !!!
  gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, Atlas.ITEMS_PER_MODEL_BUFFER * Float32Array.BYTES_PER_ELEMENT, 0);
  gl.vertexAttribPointer(aTextCoordLoc, 2, gl.FLOAT, false, Atlas.ITEMS_PER_MODEL_BUFFER * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(aPositionLoc);
  gl.enableVertexAttribArray(aTextCoordLoc);

  const entityTransformBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, entityTransformBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, entityTransformBufferData, gl.STATIC_DRAW);
  gl.vertexAttribPointer(aOffset, 3, gl.FLOAT, false, EntityManager.ITEMS_PER_TRANSFORM_BUFFER * Float32Array.BYTES_PER_ELEMENT, 0);
  gl.vertexAttribPointer(aDepth, 1, gl.FLOAT, false, EntityManager.ITEMS_PER_TRANSFORM_BUFFER * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
  gl.vertexAttribPointer(aAnimation, 2, gl.FLOAT, false, EntityManager.ITEMS_PER_TRANSFORM_BUFFER * Float32Array.BYTES_PER_ELEMENT, 4 * Float32Array.BYTES_PER_ELEMENT);
  gl.enableVertexAttribArray(aOffset);
  gl.enableVertexAttribArray(aDepth);
  gl.enableVertexAttribArray(aAnimation);

  gl.vertexAttribDivisor(aOffset, 1);
  gl.vertexAttribDivisor(aDepth, 1);
  gl.vertexAttribDivisor(aAnimation, 1);

  gl.bindVertexArray(null);




  const uTick = gl.getUniformLocation(program, "uTick");
  var uTickValue = 0; 



    const draw = () => {
      gl.uniform1f(uTick, uTickValue++);

      gl.bindVertexArray(atlasVAO);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, bufferData.modelBuffer.length / Atlas.ITEMS_PER_MODEL_BUFFER, bufferData.transformBuffer.length / Atlas.ITEMS_PER_TRANSFORM_BUFFER);
      gl.bindVertexArray(entitiesVAO);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, bufferData.modelBuffer.length / Atlas.ITEMS_PER_MODEL_BUFFER, entityTransformBufferData.length / EntityManager.ITEMS_PER_TRANSFORM_BUFFER);
      gl.bindVertexArray(null);

      if (uTickValue > 10000)
      {
        uTickValue = 0;
      }

      requestAnimationFrame(draw);
    }

    draw();
};

run();
