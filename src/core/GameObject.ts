import { Component } from "./Component";
import { EventHandler, OnEvent } from "./EventHandler";

var id = 1;

export class GameObject {
    private onChangePosition: EventHandler<GameObject> = new EventHandler<GameObject>();
    readonly id: string
    components: Array<Component>
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.components = [];
        this.id = (id++).toString();
    }

    public setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.onChangePosition.fire(this);
    }

    public updatePosition(updateAction: (x: number, y: number) => [number, number]) {
        [this.x, this.y] = updateAction(this.x, this.y);
        this.onChangePosition.fire(this);
    }

    public subscribeOnChangePosition(action: OnEvent<GameObject>) {
        this.onChangePosition.subscribe(action);
    }

    public add(component: Component) {
        component.setReferece(this);
        this.components.push(component);
    }
}