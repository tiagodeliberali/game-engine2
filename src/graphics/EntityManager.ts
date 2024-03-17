export interface IEntityType {
  /**
   * Size of the array returned by buildEntityDataRow method
   */
  get entityRowSize(): number;

  /**
   * Converts the IEntityType data into data to be consumed by WebGL shaders
   * 
   * @returns The array of data used by the vertex shader to draw elements
   */
  buildEntityDataRow(): number[];
}

class InternalEntityData {
  data: IEntityType;
  offset: number;

  constructor(data: IEntityType) {
    this.data = data;
    this.offset = 0;
  }
}

export class GraphicEntityManager<Type extends IEntityType> {
  private entities: Map<string, InternalEntityData>;
  private pendingChange: Map<string, InternalEntityData>;
  private lastSize: number = 0;

  constructor() {
    this.entities = new Map<string, InternalEntityData>();
    this.pendingChange = new Map<string, InternalEntityData>();
  }

  set(id: string, data: Type) {
    if (this.entities.has(id)) {
      const internalData = this.entities.get(id)!;
      internalData.data = data;
      this.pendingChange.set(id, internalData);
    } else {
      this.entities.set(id, new InternalEntityData(data));
      this.pendingChange.clear();
    }
  }

  remove(id: string) {
    this.entities.delete(id);
  }

  update(id: string, updateFunction: (data: Type) => void) {
    const internalData = this.entities.get(id);

    if (internalData != undefined) {
      updateFunction(internalData.data as Type);
      this.pendingChange.set(id, internalData);
    } else {
      console.error(`Could execute GraphicEntityManager.update: could not find entity with id ${id}`)
    }
  }

  build(): Float32Array {
    if (this.entities.size == 0) {
      return new Float32Array();
    }

    const entityArray = Array.from(this.entities.values());
    const transformBuffer = new Float32Array(this.entities.size * entityArray.at(0)!.data.entityRowSize);

    let offset = 0;

    entityArray.forEach((item) => {
      item.offset = offset++;
      transformBuffer!.set(item.data.buildEntityDataRow(), item.offset * item.data.entityRowSize);
    });

    this.pendingChange.clear();
    this.lastSize = this.entities.size;

    return transformBuffer;
  }

  diff(): GraphicEntityDiff {
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

  numberOfEntities() {
    return this.entities.size;
  }
}

export class GraphicEntityDiff {
  data: Float32Array | [number, IEntityType][] | undefined;
  type: string;

  constructor(type: string, data: Float32Array | [number, IEntityType][] | undefined = undefined) {
    this.type = type;
    this.data = data;
  }

  static Empty(): GraphicEntityDiff {
    return new GraphicEntityDiff("empty");
  }

  static Full(data: Float32Array): GraphicEntityDiff {
    return new GraphicEntityDiff("full", data);
  }

  static Diff(data: [number, IEntityType][]) {
    return new GraphicEntityDiff("diff", data);
  }
}
