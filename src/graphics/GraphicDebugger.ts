import { GameObject } from "../core/GameObject";
import { IVec2, Vec2 } from "../core/Math";
import { RigidBoxComponent } from "../physics/RigidBox";
import { Atlas } from "./Atlas";
import { GraphicEntityManager, IEntityType } from "./EntityManager";
import { buildProgram } from "./GraphicCore";

export class DebugData implements IEntityType {
    static ENTITY_ROW_SIZE: number = 6 * 6;
    
    private position: Vec2;
    private offset: Vec2;
    private size: Vec2;

    constructor(position: Vec2, offset: Vec2, size: Vec2) {
        this.position = Vec2.sum(position, offset);
        this.offset = offset;
        this.size = size;
    }

    updatePosition(position: IVec2) {
        this.position = Vec2.sum(position, this.offset);
    }

    get entityRowSize() {
        return DebugData.ENTITY_ROW_SIZE
    }

    buildEntityDataRow() {
        return [
            this.position.x,                this.position.y,                1, 0, 0, 0.5,
            this.position.x + this.size.x,  this.position.y + this.size.y,  1, 0, 0, 0.5,
            this.position.x,                this.position.y + this.size.y,  1, 0, 0, 0.5,
            this.position.x,                this.position.y,                1, 0, 0, 0.5,
            this.position.x + this.size.x,  this.position.y,                1, 0, 0, 0.5,
            this.position.x + this.size.x,  this.position.y + this.size.y,  1, 0, 0, 0.5,
        ]
    }
}

const itemsPerBuffer = 6;
const aPositionLoc = 0;
const aColorLoc = 1;

const loadEntities = (gl: WebGL2RenderingContext, entityBufferData: Float32Array): [WebGLVertexArrayObject, WebGLBuffer] => {
    const entitiesVAO = gl.createVertexArray();
    gl.bindVertexArray(entitiesVAO);

    const modelBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, modelBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, entityBufferData, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, itemsPerBuffer * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(aColorLoc, 4, gl.FLOAT, false, itemsPerBuffer * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(aPositionLoc);
    gl.enableVertexAttribArray(aColorLoc);

    gl.bindVertexArray(null);

    return [entitiesVAO!, modelBuffer!];
}

export class GraphicDebugger {
    private gl: WebGL2RenderingContext;
    private program: WebGLProgram;
    
    private entitiesVAO: WebGLVertexArrayObject | undefined;
    private modelBuffer: WebGLBuffer | undefined;
    private entityManager: GraphicEntityManager<DebugData> | undefined;
    
    private constructor(gl: WebGL2RenderingContext, program: WebGLProgram) {
        this.gl = gl;
        this.program = program;
    }
    
    static async build() {
        const [gl, program] = await buildProgram("canvas", "debugVertex", "debugFragment");
        const graphicDebugger = new GraphicDebugger(gl, program);
        graphicDebugger.loadEntities(new GraphicEntityManager<DebugData>());
        return graphicDebugger;
    }
    
    loadEntities(entityManager: GraphicEntityManager<DebugData>) {
        const entityBufferData = entityManager.build();
        [this.entitiesVAO, this.modelBuffer] = loadEntities(this.gl, entityBufferData);
        this.entityManager = entityManager;
    }
    
    loadAtlas(atlasData: Atlas) {
        var i = 0;
        atlasData.rigidBoxes.forEach((box) => this.entityManager?.set(`rigid_box_${i++}`, new DebugData(box, Vec2.zero(), new Vec2(atlasData.tileSize, atlasData.tileSize))))
    }

    configureRigidBoxComponent(component: RigidBoxComponent) {
        component.setDebuggerManager(this.entityManager!);
        component.updateGameObjectPosition();
    }

    draw() {
        this.gl.useProgram(this.program);

        if (this.entitiesVAO != undefined) {
            const entityDiff = this.entityManager!.diff();

            if (entityDiff.type == "full") {
                console.info("Diff full");
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.modelBuffer!);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, entityDiff.data as Float32Array, this.gl.STATIC_DRAW);
            }

            if (entityDiff.type == "diff") {
                console.info("Diff partial");
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.modelBuffer!);
                (entityDiff.data as [number, DebugData][]).forEach(([offset, data]) => {
                    this.gl.bufferSubData(
                        this.gl.ARRAY_BUFFER,
                        offset * Float32Array.BYTES_PER_ELEMENT * data.entityRowSize,
                        new Float32Array(data.buildEntityDataRow()));
                });
            }

            this.gl.bindVertexArray(this.entitiesVAO);
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.entityManager!.numberOfEntities() * 6);
        }

        this.gl.bindVertexArray(null);
    }
}