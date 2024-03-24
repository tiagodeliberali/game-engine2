import { Component } from "../../src/core/Component";
import { GameObject } from "../../src/core/GameObject";
import { Vec2 } from "../../src/core/Math";

test('GameObjects instances have a outo increment id', () => {
    const g1 = new GameObject(Vec2.zero(), "g1");
    const g2 = new GameObject(Vec2.zero(), "g2");

    expect(g1.id).toBe("1");
    expect(g2.id).toBe("2");
});

test('GameObject fires event on set position', () => {
    const gameObject = new GameObject(Vec2.zero(), "gameObject");

    let isTriggered = false;
    gameObject.subscribeOnChangePosition(() => isTriggered = true);

    gameObject.setPosition(new Vec2(2, 3));

    expect(isTriggered).toBeTruthy();
    expect(gameObject.position.x).toBe(2);
    expect(gameObject.position.y).toBe(3);
});

test('GameObject fires event on update position', () => {
    const gameObject = new GameObject(new Vec2(2, 3), "gameObject");

    let isTriggered = false;
    gameObject.subscribeOnChangePosition(() => isTriggered = true);

    gameObject.updatePosition((position) => new Vec2(position.x * 2, position.y * 3));

    expect(isTriggered).toBeTruthy();
    expect(gameObject.position.x).toBe(4);
    expect(gameObject.position.y).toBe(9);
});

test('Add component sets reference to gameObject', () => {
    const gameObject = new GameObject(Vec2.zero(), "gameObject");
    const component = new TestComponent();

    gameObject.add(component);

    let totalItems = 0;
    const iterator = gameObject.componentsIterable[Symbol.iterator]();
    while (!iterator.next().done) {
        totalItems++;
    }

    expect(totalItems).toBe(1);
    expect(component.gameObject?.id).toBe(gameObject.id);
});

test('GameObject Vec2 reference is a new instance and doesnt share pointer', () => {
    const vec = new Vec2(2, 3);
    const gameObject = new GameObject(vec, "gameObject");

    vec.x = 10;
    vec.y = 20;

    expect(gameObject.position.x).toBe(2);
    expect(gameObject.position.y).toBe(3);
});

class TestComponent implements Component {
    gameObject: GameObject | undefined;

    setReferece(gameObject: GameObject): void {
        this.gameObject = gameObject;
    }
    get typeName(): string {
        throw new Error("Method not implemented.");
    }
}