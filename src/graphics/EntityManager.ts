import { Vec2 } from "../core/Math";
import { SpriteData } from "./Sprite";

export const buildEntityDataRow = (data: EntityData) => [
  data.position.x, data.position.y, 0.001, data.animation.start, data.animation.ticksPerFrame ?? 1, data.animation.duration ?? 0
];

export class GraphicEntityManager {
  public static ITEMS_PER_TRANSFORM_BUFFER: number = 6;

  private entities: Map<string, InternalEntityData>;
  private pendingChange: Map<string, InternalEntityData>;
  private lastSize: number = 0;

  constructor() {
    this.entities = new Map<string, InternalEntityData>();
    this.pendingChange = new Map<string, InternalEntityData>();
  }

  public set(id: string, data: EntityData) {
    if (this.entities.has(id)) {
      const internalData = this.entities.get(id)!;
      internalData.data = data;
      this.pendingChange.set(id, internalData);
    } else {
      this.entities.set(id, new InternalEntityData(data));
      this.pendingChange.clear();
    }
  }

  public setSprite(id: string, spriteData: SpriteData) {
    if (this.entities.has(id)) {
      const internalData = this.entities.get(id)!;
      internalData.data.animation = spriteData;
      this.pendingChange.set(id, internalData);
    } else {
      console.error(`Could execute GraphicEntityManager.setSprite: could not find entity with id ${id}`)
    }
  }

  public update(id: string, updateFunction: (data: EntityData) => void) {
    const internalData = this.entities.get(id);

    if (internalData != undefined) {
      updateFunction(internalData.data);
      this.pendingChange.set(id, internalData);
    } else {
      console.error(`Could execute GraphicEntityManager.update: could not find entity with id ${id}`)
    }
  }

  public build(): Float32Array {
    const transformBuffer = new Float32Array(this.entities.size * GraphicEntityManager.ITEMS_PER_TRANSFORM_BUFFER);

    var offset = 0;

    Array.from(this.entities.values()).forEach((item) => {
      item.offset = offset++;
      transformBuffer!.set(buildEntityDataRow(item.data), item.offset * GraphicEntityManager.ITEMS_PER_TRANSFORM_BUFFER);
    });

    this.pendingChange.clear();
    this.lastSize = this.entities.size;

    return transformBuffer;
  }

  public diff(): GraphicEntityDiff {
    if (this.lastSize != this.entities.size) {
      const transformBuffer = this.build();
      return GraphicEntityDiff.Full(transformBuffer);
    }

    if (this.pendingChange.size == 0) {
      return GraphicEntityDiff.Empty();
    }

    const diff = GraphicEntityDiff.Diff(Array.from(this.pendingChange.values()).map(x => [x.offset, x.data]));
    this.pendingChange.clear();
    return diff;
  }

  public numberOfEntities() {
    return this.entities.size;
  }
}

export class GraphicEntityDiff {
  data: Float32Array | [number, EntityData][] | undefined;
  type: string;

  constructor(type: string, data: Float32Array | [number, EntityData][] | undefined = undefined) {
    this.type = type;
    this.data = data;
  }

  static Empty(): GraphicEntityDiff {
    return new GraphicEntityDiff("empty");
  }

  static Full(data: Float32Array): GraphicEntityDiff {
    return new GraphicEntityDiff("full", data);
  }

  static Diff(data: [number, EntityData][]) {
    return new GraphicEntityDiff("diff", data);
  }
}

class InternalEntityData {
  data: EntityData;
  offset: number;

  constructor(data: EntityData) {
    this.data = data;
    this.offset = 0;
  }
}

export class EntityData {
  position: Vec2;
  animation: SpriteData;

  constructor(position: Vec2, animation: SpriteData) {
    this.position = position;
    this.animation = animation;
  }
}