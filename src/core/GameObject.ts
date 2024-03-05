import { Component } from "./Component";
import { EventHandler, OnEvent } from "./EventHandler";
import { Vec2 } from "./Math";

var id = 1;

export class GameObject {
    private onChangePosition: EventHandler<GameObject> = new EventHandler<GameObject>();
    readonly id: string
    components: Array<Component>
    position: Vec2;

    constructor(position: Vec2) {
        this.position = position;

        this.components = [];
        this.id = (id++).toString();
    }

    public setPosition(position: Vec2) {
        this.position = position;
        this.onChangePosition.fire(this);
    }

    public updatePosition(updateAction: (position: Vec2) => void) {
        updateAction(this.position);
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