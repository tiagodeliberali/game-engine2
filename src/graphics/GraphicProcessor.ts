import { Vec2 } from "../core/Math";
import { AtlasBuilder, Atlas } from "./Atlas";
import { buildProgram } from "./GraphicCore";
import { GraphicEntityManager, IEntityType } from "./EntityManager";
import { SpriteComponent, SpriteData } from "./Sprite";

export class EntityData implements IEntityType {
    static ENTITY_ROW_SIZE: number = 6;
    
    position: Vec2;
    animation: SpriteData;

    constructor(position: Vec2, animation: SpriteData) {
        this.position = position;
        this.animation = animation;
    }

    get entityRowSize() {
        return EntityData.ENTITY_ROW_SIZE;
    }

    buildEntityDataRow() {
        return [
            this.position.x, this.position.y, 0.001, this.animation.start, this.animation.ticksPerFrame ?? 1, this.animation.duration ?? 0
        ]
    }
}

// Shaders addresses
const aPositionLoc = 0;
const aTextCoordLoc = 1;
const aOffset = 2;
const aDepth = 3;
const aAnimation = 4;

let modelBufferReference: WebGLVertexArrayObject | undefined;
const bindModelBuffer = (gl: WebGL2RenderingContext) => {
    if (modelBufferReference == undefined) {
        modelBufferReference = gl.createBuffer()!;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, modelBufferReference);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, AtlasBuilder.ITEMS_PER_MODEL_BUFFER * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(aTextCoordLoc, 2, gl.FLOAT, false, AtlasBuilder.ITEMS_PER_MODEL_BUFFER * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(aPositionLoc);
    gl.enableVertexAttribArray(aTextCoordLoc);
}

const loadAtlas = (gl: WebGL2RenderingContext, atlas: Atlas): WebGLVertexArrayObject => {
    const atlasTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, atlasTexture);
    gl.texImage3D(
        gl.TEXTURE_2D_ARRAY,
        0,
        gl.RGBA,
        atlas.image.width, // width of the image
        atlas.image.width, // height of the image: since we are using a vertical atlas with squared tiles, we will consider that each tile height == tile width
        atlas.image.height / atlas.image.width, // the number of tiles is height / width
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        atlas.image);

    gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    const atlasVAO = gl.createVertexArray();
    gl.bindVertexArray(atlasVAO);

    // loading data to model buffer
    bindModelBuffer(gl);
    gl.bufferData(gl.ARRAY_BUFFER, atlas.modelBuffer, gl.STATIC_DRAW);

    const transformBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, transformBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, atlas.transformBuffer, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aOffset, 3, gl.FLOAT, false, AtlasBuilder.ITEMS_PER_TRANSFORM_BUFFER * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(aDepth, 1, gl.FLOAT, false, AtlasBuilder.ITEMS_PER_TRANSFORM_BUFFER * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(aOffset);
    gl.enableVertexAttribArray(aDepth);

    gl.vertexAttribDivisor(aOffset, 1);
    gl.vertexAttribDivisor(aDepth, 1);

    gl.bindVertexArray(null);

    return atlasVAO!;
}

const loadEntities = (gl: WebGL2RenderingContext, entityTransformBufferData: Float32Array): [WebGLVertexArrayObject, WebGLBuffer] => {
    const entitiesVAO = gl.createVertexArray();
    gl.bindVertexArray(entitiesVAO);

    // assumes that data was loaded previously
    bindModelBuffer(gl);

    const entityTransformBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, entityTransformBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, entityTransformBufferData, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aOffset, 3, gl.FLOAT, false, EntityData.ENTITY_ROW_SIZE * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(aDepth, 1, gl.FLOAT, false, EntityData.ENTITY_ROW_SIZE * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.vertexAttribPointer(aAnimation, 2, gl.FLOAT, false, EntityData.ENTITY_ROW_SIZE * Float32Array.BYTES_PER_ELEMENT, 4 * Float32Array.BYTES_PER_ELEMENT);
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
    private uCamera: WebGLUniformLocation;
    private uTickValue: number = 0;

    private atlasVAO: WebGLVertexArrayObject | undefined;
    private atlas: Atlas | undefined;

    private entitiesVAO: WebGLVertexArrayObject | undefined;
    private entityTransformBuffer: WebGLBuffer | undefined;
    private entityManager: GraphicEntityManager<EntityData> | undefined;

    private constructor(gl: WebGL2RenderingContext, program: WebGLProgram) {
        this.gl = gl;
        this.program = program;

        this.uTick = gl.getUniformLocation(program, "uTick")!;
        this.uCamera = gl.getUniformLocation(program, "uCamera")!;
    }

    public static async build() {
        const [gl, program] = await buildProgram("canvas", "vertex", "fragment");
        return new GraphicProcessor(gl, program);
    }

    public loadAtlas(atlas: Atlas) {
        this.atlasVAO = loadAtlas(this.gl, atlas);
        this.atlas = atlas;

        this.loadEntities(new GraphicEntityManager<EntityData>());
    }

    private loadEntities(entityManager: GraphicEntityManager<EntityData>) {
        const entityTransformBufferData = entityManager.build();
        const [entitiesVAO, entityTransformBuffer] = loadEntities(this.gl, entityTransformBufferData);
        this.entitiesVAO = entitiesVAO;
        this.entityTransformBuffer = entityTransformBuffer;
        this.entityManager = entityManager;
    }

    public configureSpriteComponent(component: SpriteComponent) {
        component.setManager(this.entityManager!);
        component.updateEntityManagerData();
    }

    public draw(camera: Array<number>) {
        this.gl.useProgram(this.program);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.uniform1f(this.uTick, this.uTickValue++);
        this.gl.uniform2fv(this.uCamera, camera);

        if (this.atlasVAO != undefined) {
            this.gl.bindVertexArray(this.atlasVAO);
            this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, this.atlas!.modelBufferVertexLength, this.atlas!.transformBufferVertexLength);
        }

        if (this.entitiesVAO != undefined) {
            const entityDiff = this.entityManager!.diff();

            if (entityDiff.type == "full") {
                console.info("Diff full");
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.entityTransformBuffer!);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, entityDiff.data as Float32Array, this.gl.STATIC_DRAW);
            }

            if (entityDiff.type == "diff") {
                console.info("Diff partial");
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.entityTransformBuffer!);
                (entityDiff.data as [number, EntityData][]).forEach(([offset, data]) => {
                    this.gl.bufferSubData(
                        this.gl.ARRAY_BUFFER,
                        offset * Float32Array.BYTES_PER_ELEMENT * data.entityRowSize,
                        new Float32Array(data.buildEntityDataRow()));
                });
            }

            this.gl.bindVertexArray(this.entitiesVAO);
            this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, this.atlas!.modelBufferVertexLength, this.entityManager!.numberOfEntities());
        }

        this.gl.bindVertexArray(null);

        if (this.uTickValue > 10000) {
            this.uTickValue = 1;
        }
    }
}