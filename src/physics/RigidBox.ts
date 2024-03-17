import { Component } from "../core/Component";
import { OnEvent } from "../core/EventHandler";
import { GameObject } from "../core/GameObject";
import { IVec2, ReadOnlyVec2, Vec2 } from "../core/Math";
import { GraphicEntityManager } from "../graphics/EntityManager";
import { DebugData } from "../graphics/GraphicDebugger";

export class RigidBox {
    readonly isStatic: boolean;
    readonly offset: ReadOnlyVec2;
    readonly size: ReadOnlyVec2;
    readonly tag: string;

    private constructor(tag: string, size: IVec2, offset: IVec2, isStatic: boolean) {
        this.isStatic = isStatic;
        this.tag = tag;
        this.size = new ReadOnlyVec2(Vec2.clone(size));
        this.offset = new ReadOnlyVec2(Vec2.clone(offset));
    }

    static StaticBox(tag: string, size: IVec2, offset: IVec2) {
        return new RigidBox(tag, size, offset, true);
    }

    static MovingBox(tag: string, size: IVec2, offset: IVec2) {
        return new RigidBox(tag, size, offset, false);
    }
}

export class RigidBoxComponent extends Component {
    public static readonly Name: string = "RigidBoxComponent";
    private _gameObject: GameObject | undefined;
    private box: RigidBox;
    private bottomLeft: Vec2;
    private topRight: Vec2;
    private debugData: DebugData;
    private entityManager: GraphicEntityManager<DebugData> | undefined;
    velocity: Vec2;
    aceleration: Vec2;
    onCollision: (tag: string) => void | undefined;

    get isStatic() {
        return this.box.isStatic;
    }

    get bottomY(): number {
        return this.bottomLeft.y;
    }

    get topY(): number {
        return this.topRight.y - 1;
    }

    get leftX(): number {
        return this.bottomLeft.x;
    }

    get rightX(): number {
        return this.topRight.x - 1;
    }

    get position(): IVec2 {
        return this._gameObject!.position;
    }

    set position(pos: IVec2) {
        this.setPosition(pos);
    }

    set x(value: number) {
        this.setPosition(new Vec2(value - this.box.offset.x, this.position.y));
    }

    get width() {
        return this.box.size.x;
    }

    set y(value: number) {
        this.setPosition(new Vec2(this.position.x, value - this.box.offset.y));
    }

    get height() {
        return this.box.size.y;
    }

    get tag(): string {
        return this.box.tag;
    }

    constructor(box: RigidBox) {
        super();
        this.box = box;
        this.debugData = new DebugData(Vec2.zero(), box.offset, box.size);
        this.bottomLeft = Vec2.clone(box.offset);
        this.topRight = Vec2.sum(box.offset, box.size);
        this.velocity = Vec2.zero();
        this.aceleration = Vec2.zero();
    }

    get typeName(): string {
        return RigidBoxComponent.Name;
    }

    setReferece(gameObject: GameObject): void {
        this._gameObject = gameObject;
        this._gameObject.subscribeOnChangePosition(() => this.updateGameObjectPosition());
        this.updateGameObjectPosition();
    }

    collidedWith(tag: string){ 
        this.onCollision && this.onCollision(tag);
    }

    private setPosition(vec: IVec2) {
        this._gameObject!.setPosition(vec);
    }

    updateGameObjectPosition() {
        this.debugData.updatePosition(this.position);
        this.entityManager?.set(this._gameObject!.id, this.debugData);

        this.bottomLeft = Vec2.sum(this.box.offset, this.position);
        this.topRight = Vec2.sum(Vec2.sum(this.box.offset, this.box.size), this.position);
    }

    setDebuggerManager(entityManager: GraphicEntityManager<DebugData>) {
        this.entityManager = entityManager;
    }
}
