import { Component } from "../core/Component";
import { GameObject } from "../core/GameObject";
import { IVec2, Vec2 } from "../core/Math";
import { GraphicEntityManager } from "../graphics/EntityManager";
import { DebugData } from "../graphics/GraphicDebugger";

export class RigidBox {
    readonly isStatic: boolean;
    readonly offset: Vec2;
    readonly size: Vec2;
    velocity: Vec2;
    aceleration: Vec2;

    private constructor(size: Vec2, offset: Vec2, isStatic: boolean) {
        this.size = size;
        this.offset = offset;
        this.velocity = Vec2.zero();
        this.aceleration = Vec2.zero();
        this.isStatic = isStatic;
    }

    static StaticBox(size: Vec2, offset: Vec2) {
        return new RigidBox(size, offset, true);
    }

    static MovingBox(size: Vec2, offset: Vec2) {
        return new RigidBox(size, offset, false);
    }
}

export class RigidBoxComponent extends Component {
    public static readonly Name: string = "RigidBoxComponent";
    gameObject: GameObject | undefined;
    debugData: DebugData;
    box: RigidBox;
    entityManager: GraphicEntityManager<DebugData> | undefined;
    private bottomLeft: Vec2;
    private topRight: Vec2;

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


    constructor(box: RigidBox) {
        super();
        this.box = box;
        this.debugData = new DebugData(Vec2.zero(), box.offset, box.size);
        this.bottomLeft = box.offset;
        this.topRight = Vec2.sum(box.offset, box.size);
    }

    setReferece(gameObject: GameObject): void {
        this.gameObject = gameObject;
        this.bottomLeft = Vec2.sum(this.box.offset, this.gameObject.position);
        this.topRight = Vec2.sum(Vec2.sum(this.box.offset, this.box.size), this.gameObject.position);

        this.gameObject.subscribeOnChangePosition(() => this.updateGameObjectPosition());
    }

    get typeName(): string {
        return RigidBoxComponent.Name;
    }

    updateVelocity(updateAction: (velocity: Vec2) => void) {
        updateAction(this.box.velocity);
    }

    updatePosition(updateAction: (position: IVec2) => IVec2) {
        if (this.gameObject != undefined) {
            const result = updateAction(this.gameObject.position);
            this.gameObject.setPosition(result);
            this.bottomLeft = Vec2.sum(this.box.offset, this.gameObject.position);
            this.topRight = Vec2.sum(Vec2.sum(this.box.offset, this.box.size), this.gameObject.position);
        }
    }

    updateGameObjectPosition() {
        if (this.gameObject != undefined) {
            this.debugData.updatePosition(this.gameObject.position);
            this.entityManager?.set(this.gameObject.id, this.debugData);

            this.bottomLeft = Vec2.sum(this.box.offset, this.gameObject.position);
            this.topRight = Vec2.sum(Vec2.sum(this.box.offset, this.box.size), this.gameObject.position);
        }
    }

    setDebuggerManager(entityManager: GraphicEntityManager<DebugData>) {
        this.entityManager = entityManager;
    }
}
