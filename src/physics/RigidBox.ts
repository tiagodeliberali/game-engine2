import { Component } from "../core/Component";
import { GameObject } from "../core/GameObject";
import { Vec2 } from "../core/Math";
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
        this.velocity = Vec2.Zero();
        this.aceleration = Vec2.Zero();
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


    constructor(box: RigidBox) {
        super();
        this.box = box;
        this.debugData = new DebugData(Vec2.Zero(), box.offset, box.size);
    }

    setReferece(gameObject: GameObject): void {
        this.gameObject = gameObject;
        this.gameObject.subscribeOnChangePosition(() => this.updateEntityManagerData());
    }

    get typeName(): string {
        return RigidBoxComponent.Name;
    }

    updateVelocity(updateAction: (velocity: Vec2) => void) {
        updateAction(this.box.velocity);
    }

    updateEntityManagerData() {
        if (this.gameObject != undefined) {
            this.debugData.updatePosition(this.gameObject.position);
            this.entityManager?.set(this.gameObject.id, this.debugData);
        }
    }

    setDebuggerManager(entityManager: GraphicEntityManager<DebugData>) {
        this.entityManager = entityManager;
    }
}
