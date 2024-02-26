import { AnimationData } from "./Animation";

export class EntityManager {
    public static ITEMS_PER_TRANSFORM_BUFFER: number = 6;
  
    entities: Map<string, EntityData>;
  
    constructor() {
      this.entities = new Map<string, EntityData>();
    }
  
    public set(id: string, data: EntityData) {
      this.entities.set(id, data);
    }

    update(name: string, updateFunction: (data: EntityData) => void) {
        const data = this.entities.get(name);

        if (data != undefined)
        {
            updateFunction(data);
        }
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