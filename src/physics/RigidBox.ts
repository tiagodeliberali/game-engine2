import { Component } from "../core/Component";
import { GameObject } from "../core/GameObject";
import { Vec2 } from "../core/Math";
import { GraphicEntityManager } from "../graphics/EntityManager";
import { DebugData } from "../graphics/GraphicDebugger";

export class RigidBox {
    offset: Vec2;
    size: Vec2;

    constructor(size: Vec2, offset: Vec2) {
        this.size = size;
        this.offset = offset;
    }
}

export class RigidBoxComponent extends Component {
    public static readonly Name: string = "RigidBoxComponent";
    private gameObject: GameObject | undefined;
    private velocity: Vec2 = Vec2.Zero();
    box: DebugData;
    entityManager: GraphicEntityManager<DebugData> | undefined;


    constructor(box: RigidBox) {
        super();
        this.box = new DebugData(Vec2.Zero(), box.offset, box.size);
    }

    setReferece(gameObject: GameObject): void {
        this.gameObject = gameObject;
        gameObject.subscribeOnChangePosition((gameObject) => this.updateEntityManagerData(gameObject));
    }

    get typeName(): string {
        return RigidBoxComponent.Name;
    }

    setVelocity(velocity: Vec2) {
        this.velocity = velocity;
    }

    updateEntityManagerData(gameObject: GameObject) {
        this.box.updatePosition(gameObject.position);
        this.entityManager?.set(gameObject.id, this.box);
    }

    setDebuggerManager(entityManager: GraphicEntityManager<DebugData>) {
        this.entityManager = entityManager;
    }
}