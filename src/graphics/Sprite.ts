import { Component } from "../core/Component";
import { GameObject } from "../core/GameObject";
import { EntityData, GraphicEntityManager } from "./EntityManager";

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
  private data: SpriteData;
  private objectId: string;
  entityManager: GraphicEntityManager | undefined;

  constructor(data: SpriteData) {
    super();
    this.data = data;
  }

  public updateSprite(data: SpriteData) {
    this.data = data;
    this.entityManager?.setSprite(this.objectId, this.data);
  }

  public setReferece(gameObject: GameObject): void {
    this.objectId = gameObject.id;
    gameObject.subscribeOnChangePosition((gameObject) => this.updateEntityManagerData(gameObject));
  }

  public setManager(entityManager: GraphicEntityManager) {
    this.entityManager = entityManager;
  }

  public updateEntityManagerData(gameObject: GameObject) {
    this.entityManager?.set(gameObject.id, new EntityData(gameObject.x, gameObject.y, this.data));
  }

  public getType(): string {
    return SpriteComponent.Name;
  }
}