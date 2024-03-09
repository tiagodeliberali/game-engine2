import { Component } from "../core/Component";
import { GameObject } from "../core/GameObject";
import { Vec2 } from "../core/Math";
import { GraphicEntityManager } from "./EntityManager";
import { EntityData } from "./GraphicProcessor";

export class SpriteManager {
  sprites: Map<string, SpriteData>;

  private constructor(data: [SpriteData]) {
    this.sprites = new Map<string, SpriteData>();
    data.forEach((item) => this.sprites.set(item.name, item));
  }

  public static async load(name: string) {
    const file = await fetch(`./textures/${name}_sprites.json`);
    const data = await file.json();
    return new SpriteManager(data);
  }

  public get(name: string): SpriteData | undefined {
    return this.sprites.get(name);
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
  private entityData: EntityData;
  private gameObject: GameObject | undefined;
  entityManager: GraphicEntityManager<EntityData> | undefined;

  constructor(data: SpriteData) {
    super();
    this.entityData = new EntityData(Vec2.Zero(), data);
  }

  updateSprite(data: SpriteData) {
    this.entityData.animation = data;
    this.gameObject && this.entityManager?.update(this.gameObject.id, (entity) => entity.animation = this.entityData.animation);
  }

  setReferece(gameObject: GameObject): void {
    this.gameObject = gameObject;
    this.gameObject.subscribeOnChangePosition(() => this.updateEntityManagerData());
  }

  setManager(entityManager: GraphicEntityManager<EntityData>) {
    this.entityManager = entityManager;
  }

  updateEntityManagerData() {
    if (this.gameObject != undefined) {
      this.entityData.position.update(this.gameObject.position)
      this.entityManager?.set(this.gameObject.id, this.entityData);
    }
  }

  get typeName(): string {
    return SpriteComponent.Name;
  }
}