import { Component } from "./Component";
import { EventHandler, OnEvent } from "./EventHandler";
import { IVec2, ReadOnlyVec2, Vec2 } from "./Math";

let id = 1;

export class GameObject {
    private onChangePosition: EventHandler<void> = new EventHandler<void>();
    private onDestroy: EventHandler<void> = new EventHandler<void>();
    private readonly components: Array<Component>
    private readonly _position: Vec2;
    private readonly _readOnlyPosition: ReadOnlyVec2;
    readonly id: string;
    debugName: string;

    constructor(position: IVec2, debugName: string) {
        this._position = Vec2.clone(position);
        this._readOnlyPosition = new ReadOnlyVec2(this._position);

        this.components = [];
        this.id = (id++).toString();
        this.debugName = debugName;
    }

    get componentsIterable(): Iterable<Component> {
        return this.components;
    }

    get position(): ReadOnlyVec2 {
        return this._readOnlyPosition;
    }

    setPosition(position: IVec2) {
        this._position.update(position);
        this.onChangePosition.fire();
    }

    updatePosition(updateAction: (position: IVec2) => IVec2) {
        this._position.update(updateAction(this._readOnlyPosition));
        this.onChangePosition.fire();
    }

    subscribeOnChangePosition(action: OnEvent<void>) {
        this.onChangePosition.subscribe(action);
    }

    subscribeOnDestroy(action: OnEvent<void>) {
        this.onDestroy.subscribe(action);
    }

    add(component: Component) {
        component.setReferece(this);
        this.components.push(component);
    }

    destroy() {
        this.onDestroy.fire();
    }
}