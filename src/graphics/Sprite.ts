import { Component } from "../core/Component";
import { EntityData } from "./EntityManager";

export class SpriteEntity {
  sprites: Map<string, SpriteData>;

  private constructor(data: [SpriteData]) {
    this.sprites = new Map<string, SpriteData>();
    data.forEach((item) => this.sprites.set(item.name, item));
  }

  public static async load<AnimationEntity>(name: string) {
    const file = await fetch(`./textures/${name}_sprites.json`);
    const data = await file.json();
    return new SpriteEntity(data);
  }
  public get(name: string): SpriteComponent {
    const data = this.sprites.get(name)!;

    return new SpriteComponent(data);
  }
}

export class SpriteData {
  name!: string;
  start!: number;
  duration: number | undefined;
  ticksPerFrame: number | undefined;
}

export class SpriteComponent extends Component {
  public static readonly Name: string = "SpriteComponent";
  private data: SpriteData;
  entityData: EntityData | undefined;

  constructor(data: SpriteData) {
    super();
    this.data = data;
  }

  public setReferenceInternal(): void {
    this.entityData = new EntityData(this.gameObject!.x, this.gameObject!.y, this.data)
  }

  public is(name: string): boolean {
    return name == SpriteComponent.Name;
  }
}