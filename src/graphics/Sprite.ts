import { Component } from "../core/Component";
import { GameObject } from "../core/GameObject";
import { EntityData, GraphicEntityManager } from "./EntityManager";

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
  entityManager: GraphicEntityManager | undefined;

  constructor(data: SpriteData) {
    super();
    this.data = data;
  }

  public setReferece(gameObject: GameObject): void {
    this.entityData = new EntityData(gameObject.x, gameObject.y, this.data);
    gameObject.subscribeOnChangePosition((gameObject) => this.updateDataOnManager(gameObject));
  }

  public setManager(entityManager: GraphicEntityManager) {
    this.entityManager = entityManager;
  }

  updateDataOnManager(gameObject: GameObject) {
    this.entityData!.x = gameObject.x;
    this.entityData!.y = gameObject.y;
    this.entityManager?.set(gameObject.id, this.entityData!);
  }

  public is(name: string): boolean {
    return name == SpriteComponent.Name;
  }
}