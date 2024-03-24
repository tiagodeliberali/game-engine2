import { GameObject } from "../../src/core/GameObject";
import { Vec2 } from "../../src/core/Math";
import { RigidBox, RigidBoxComponent } from "../../src/physics/RigidBox";

test('RigidBox should not share references with input Vec2', () => {
    const vec = new Vec2(2, 4);

    const rigidBox = RigidBox.StaticBox("test", vec, vec);
    vec.x = 10;
    vec.y = 20;

    expect(rigidBox.offset.x).toBe(2);
    expect(rigidBox.offset.y).toBe(4);

    expect(rigidBox.size.x).toBe(2);
    expect(rigidBox.size.y).toBe(4);
});

test('Static rigid box should be marked as static', () => {
    const rigidBox = RigidBox.StaticBox("test", Vec2.zero(), Vec2.zero());

    expect(rigidBox.isStatic).toBeTruthy();
});

test('Moving rigid box should NOT be marked as static', () => {
    const rigidBox = RigidBox.MovingBox("test", Vec2.zero(), Vec2.zero());

    expect(rigidBox.isStatic).toBeFalsy();
});

/**
 *     40   43    50    55  -- x
 *  32 +-----------------+
 *  28 |     +-----+     |
 *     |     |     |     |
 *  22 |     +-----+     |
 *  20 +-----------------+
 *  |
 *  y
 */
test('RigidBox component get correct position values', () => {
    // arrange
    const gameObject = new GameObject(new Vec2(40, 20), "gameObject");
    const box = RigidBox.MovingBox("test", new Vec2(7, 6), new Vec2(3, 2));

    // act
    const component = new RigidBoxComponent(box);
    component.setReferece(gameObject);

    // assert
    expect(component.isStatic).toBeFalsy(); // moving object

    expect(component.height).toBe(6);
    expect(component.width).toBe(7);

    expect(component.bottomY).toBe(22);
    expect(component.topY).toBe(27);  // top == bottom + heigth - 1

    expect(component.leftX).toBe(43);
    expect(component.rightX).toBe(49);  // right = left + width - 1

    expect(component.position.x).toBe(40); // gameObject position
    expect(component.position.y).toBe(20);
});

test('Move game object should move component', () => {
    // arrange
    const gameObject = new GameObject(new Vec2(40, 20), "gameObject");
    const box = RigidBox.MovingBox("test", new Vec2(7, 6), new Vec2(3, 2));

    const component = new RigidBoxComponent(box);
    component.setReferece(gameObject);

    // act
    gameObject.setPosition(Vec2.zero());

    // assert
    expect(component.height).toBe(6);
    expect(component.width).toBe(7);

    expect(component.bottomY).toBe(2);
    expect(component.topY).toBe(7);

    expect(component.leftX).toBe(3);
    expect(component.rightX).toBe(9);

    expect(component.position.x).toBe(0);
    expect(component.position.y).toBe(0);
});

test('Update position should update all values', () => {
    // arrange
    const gameObject = new GameObject(new Vec2(40, 20), "gameObject");
    const box = RigidBox.MovingBox("test", new Vec2(7, 6), new Vec2(3, 2));

    const component = new RigidBoxComponent(box);
    component.setReferece(gameObject);

    // act
    component.position = Vec2.zero();

    // assert
    expect(component.height).toBe(6);
    expect(component.width).toBe(7);

    expect(component.bottomY).toBe(2);
    expect(component.topY).toBe(7);

    expect(component.leftX).toBe(3);
    expect(component.rightX).toBe(9);

    expect(component.position.x).toBe(0);
    expect(component.position.y).toBe(0);
});

test('Update x and y should update all values', () => {
    // arrange
    const gameObject = new GameObject(new Vec2(40, 20), "gameObject");
    const box = RigidBox.MovingBox("test", new Vec2(7, 6), new Vec2(3, 2));

    const component = new RigidBoxComponent(box);
    component.setReferece(gameObject);

    // act
    component.x = 10;
    component.y = 20;

    // assert
    expect(component.height).toBe(6);
    expect(component.width).toBe(7);

    expect(component.bottomY).toBe(20);  // y impacts the leftY value
    expect(component.topY).toBe(25);

    expect(component.leftX).toBe(10);  // x impacts the bottomX value
    expect(component.rightX).toBe(16);

    expect(component.position.x).toBe(7);
    expect(component.position.y).toBe(18);
});


test('Component name should be correctly set', () => {
    const component = new RigidBoxComponent(RigidBox.MovingBox("test", Vec2.zero(), Vec2.zero()));

    expect(component.typeName).toBe(RigidBoxComponent.Name);
});