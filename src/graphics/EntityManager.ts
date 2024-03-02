import { AnimationData } from "./Animation";
import { AtlasVertexBuffer } from "./Atlas";

export class GraphicEntityManager {
  public static ITEMS_PER_TRANSFORM_BUFFER: number = 6;

  private entities: Map<string, EntityData>;
  private pendingChange: boolean = true;
  private transformBuffer: Float32Array | undefined;
  private atlasData: AtlasVertexBuffer;

  constructor(atlasData: AtlasVertexBuffer) {
    this.entities = new Map<string, EntityData>();
    this.atlasData = atlasData;
  }

  public set(id: string, data: EntityData) {
    this.pendingChange = true;
    this.entities.set(id, data);
  }

  public update(name: string, updateFunction: (data: EntityData) => void) {
    const data = this.entities.get(name);

    if (data != undefined) {
      updateFunction(data);
    }
  }

  public build(): [Float32Array, WebGLBuffer] {
    if (!this.pendingChange) {
      return [this.transformBuffer!, this.atlasData.modelBufferReference!];
    }

    if (this.transformBuffer == undefined || this.transformBuffer.length != this.entities.size * GraphicEntityManager.ITEMS_PER_TRANSFORM_BUFFER) {
      this.transformBuffer = new Float32Array(this.entities.size * GraphicEntityManager.ITEMS_PER_TRANSFORM_BUFFER);
    }

    var offset = 0;

    Array.from(this.entities.values()).forEach((item) => {
      this.transformBuffer!.set([
        item.x, item.y, 0.001, item.animation.start, item.animation.ticksPerFrame, item.animation.duration
      ], (offset++) * GraphicEntityManager.ITEMS_PER_TRANSFORM_BUFFER);
    });

    this.pendingChange = false;
    return [this.transformBuffer!, this.atlasData.modelBufferReference!];
  }
}

export class EntityData {
  x: number;
  y: number;
  animation: AnimationData;

  constructor(x: number, y: number, animation: AnimationData) {
    this.x = x;
    this.y = y;
    this.animation = animation;
  }
}