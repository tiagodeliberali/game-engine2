export class AnimationEntity {
    animations: Map<string, AnimationData>;

    private constructor(data: [AnimationData]) {
      this.animations = new Map<string, AnimationData>();
      data.forEach((item) => this.animations.set(item.name, item));
    }

    public static async load<AnimationEntity>(name: string) {
      const file = await fetch(`./textures/${name}.json`);
      const data = await file.json();
      return new AnimationEntity(data);
    }
    public get(name: string): AnimationData {
      return this.animations.get(name)!;
    }
}

export class AnimationData {
    name!: string;
    start!: number;
    duration!: number;
    ticksPerFrame!: number;
}