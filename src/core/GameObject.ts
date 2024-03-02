import { Component } from "./Component";
import { EventHandler, OnEvent } from "./EventHandler";

var id = 1;

export class GameObject {
    components: Array<Component>
    private onChangePosition: EventHandler<GameObject> = new EventHandler<GameObject>();
    x: number;
    y: number;
    readonly id: string

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.components = [];
        this.id = (id++).toString();
    }

    public setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.onChangePosition.on(this);
    }

    public updatePosition(updateAction: (x: number, y: number) => [number, number]) {
        const [x, y] = updateAction(this.x, this.y);
        this.x = x;
        this.y = y;
        this.onChangePosition.on(this);
    }

    public subscribeOnChangePosition(action: OnEvent<GameObject>) {
        this.onChangePosition.subscribe(action);
    }

    public add(component: Component) {
        component.setReferece(this);
        this.components.push(component);
    }
}