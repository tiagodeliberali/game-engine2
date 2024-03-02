import { Atlas, AtlasVertexBuffer } from "./Atlas";
import { GraphicEntityManager } from "./EntityManager";

const loadShader = async (
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    type: number,
    name: string,
): Promise<WebGLShader> => {
    const file = await fetch(`./shaders/${name}.glsl`);
    const source = await file.text();

    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);

    return shader;
};

const buildProgram = async (canvasName: string): Promise<[WebGL2RenderingContext, WebGLProgram]> => {
    const canvas = document.querySelector<HTMLCanvasElement>(canvasName)!;
    const gl = canvas.getContext("webgl2")!;
    const program = gl.createProgram()!;

    const vertexShader = await loadShader(gl, program, gl.VERTEX_SHADER, "vertex");
    const fragmentShader = await loadShader(gl, program, gl.FRAGMENT_SHADER, "fragment");

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(gl.getShaderInfoLog(vertexShader));
        console.log(gl.getShaderInfoLog(fragmentShader));
    }

    gl.useProgram(program);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform2fv(gl.getUniformLocation(program, "canvas"), [canvas.width / 2, canvas.height / 2]);

    return [gl!, program!];
};

// Shaders addresses
const aPositionLoc = 0;
const aTextCoordLoc = 1;
const aOffset = 2;
const aDepth = 3;
const aAnimation = 4;

const loadAtlas = (gl: WebGL2RenderingContext, atlasData: AtlasVertexBuffer): WebGLVertexArrayObject => {
    const atlasTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, atlasTexture);
    gl.texImage3D(
        gl.TEXTURE_2D_ARRAY,
        0,
        gl.RGBA,
        atlasData.image.width, // width of the image
        atlasData.image.width, // height of the image: since we are using a vertical atlas with squared tiles, we will consider that each tile height == tile width
        atlasData.image.height / atlasData.image.width, // the number of tiles is height / width
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        atlasData.image);

    gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    const atlasVAO = gl.createVertexArray();
    gl.bindVertexArray(atlasVAO);

    const modelBuffer = gl.createBuffer();
    atlasData.modelBufferReference = modelBuffer!;
    gl.bindBuffer(gl.ARRAY_BUFFER, modelBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, atlasData.modelBuffer, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, Atlas.ITEMS_PER_MODEL_BUFFER * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(aTextCoordLoc, 2, gl.FLOAT, false, Atlas.ITEMS_PER_MODEL_BUFFER * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(aPositionLoc);
    gl.enableVertexAttribArray(aTextCoordLoc);

    const transformBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, transformBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, atlasData.transformBuffer, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aOffset, 3, gl.FLOAT, false, Atlas.ITEMS_PER_TRANSFORM_BUFFER * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(aDepth, 1, gl.FLOAT, false, Atlas.ITEMS_PER_TRANSFORM_BUFFER * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(aOffset);
    gl.enableVertexAttribArray(aDepth);

    gl.vertexAttribDivisor(aOffset, 1);
    gl.vertexAttribDivisor(aDepth, 1);

    gl.bindVertexArray(null);

    return atlasVAO!;
}

const loadEntities = (gl: WebGL2RenderingContext, modelBuffer: WebGLVertexArrayObject, entityTransformBufferData: Float32Array): [WebGLVertexArrayObject, WebGLBuffer] => {
    const entitiesVAO = gl.createVertexArray();
    gl.bindVertexArray(entitiesVAO);

    gl.bindBuffer(gl.ARRAY_BUFFER, modelBuffer);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, Atlas.ITEMS_PER_MODEL_BUFFER * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(aTextCoordLoc, 2, gl.FLOAT, false, Atlas.ITEMS_PER_MODEL_BUFFER * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(aPositionLoc);
    gl.enableVertexAttribArray(aTextCoordLoc);

    const entityTransformBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, entityTransformBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, entityTransformBufferData, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aOffset, 3, gl.FLOAT, false, GraphicEntityManager.ITEMS_PER_TRANSFORM_BUFFER * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(aDepth, 1, gl.FLOAT, false, GraphicEntityManager.ITEMS_PER_TRANSFORM_BUFFER * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.vertexAttribPointer(aAnimation, 2, gl.FLOAT, false, GraphicEntityManager.ITEMS_PER_TRANSFORM_BUFFER * Float32Array.BYTES_PER_ELEMENT, 4 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(aOffset);
    gl.enableVertexAttribArray(aDepth);
    gl.enableVertexAttribArray(aAnimation);

    gl.vertexAttribDivisor(aOffset, 1);
    gl.vertexAttribDivisor(aDepth, 1);
    gl.vertexAttribDivisor(aAnimation, 1);

    gl.bindVertexArray(null);

    return [entitiesVAO!, entityTransformBuffer!];
}

export class GraphicProcessor {
    private gl: WebGL2RenderingContext;
    private program: WebGLProgram;

    private uTick: WebGLUniformLocation;
    private uTickValue: number = 0;

    private atlasVAO: WebGLVertexArrayObject | undefined;
    private atlasData: AtlasVertexBuffer | undefined;

    private entitiesVAO: WebGLVertexArrayObject | undefined;
    private entityTransformBuffer: WebGLBuffer | undefined;
    private entityManager: GraphicEntityManager | undefined;
    
    private constructor(gl: WebGL2RenderingContext, program: WebGLProgram) {
        this.gl = gl;
        this.program = program;

        this.uTick = gl.getUniformLocation(program, "uTick")!;
    }

    public static async build() {
        const [gl, program] = await buildProgram("canvas");
        return new GraphicProcessor(gl, program);
    }

    public loadAtlas(atlasData: AtlasVertexBuffer) {
        const atlasVAO = loadAtlas(this.gl, atlasData);
        this.atlasVAO = atlasVAO;
        this.atlasData = atlasData;
    }

    public loadEntities(entityManager: GraphicEntityManager) {
        const [entityTransformBufferData, atlasModelBuffer] = entityManager.build();
        const [entitiesVAO, entityTransformBuffer] = loadEntities(this.gl, atlasModelBuffer, entityTransformBufferData);
        this.entitiesVAO = entitiesVAO;
        this.entityTransformBuffer = entityTransformBuffer;
        this.entityManager = entityManager;
    }


    public draw() {
        this.gl.uniform1f(this.uTick, this.uTickValue++);

        if (this.atlasVAO != undefined)
        {
            this.gl.bindVertexArray(this.atlasVAO);
            this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, this.atlasData!.modelBufferVertexLength, this.atlasData!.transformBufferVertexLength);
        }
        
        if (this.entitiesVAO != undefined)
        {
            const [entityTransformBufferData, _] = this.entityManager!.build();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.entityTransformBuffer!);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, entityTransformBufferData, this.gl.STATIC_DRAW);

            this.gl.bindVertexArray(this.entitiesVAO);
            this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, this.atlasData!.modelBufferVertexLength, entityTransformBufferData!.length / GraphicEntityManager.ITEMS_PER_TRANSFORM_BUFFER);
        }

        this.gl.bindVertexArray(null);

        if (this.uTickValue > 10000)
        {
            this.uTickValue = 0;
        }
    }
}