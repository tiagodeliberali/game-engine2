import { GameObject } from "../../src/core/GameObject";
import { Vec2, IVec2 } from "../../src/core/Math";
import { PhysicProcessor } from "../../src/physics/PhysicProcessor";
import { RigidBox, RigidBoxComponent } from "../../src/physics/RigidBox";

test('colision should only consider rigid box, not whole game entity', () => {
    // arrange
    // box starting at 10, 10 with offset of 2, 2 and size of 6, 6. The box ends on pixel topY 17
    const box = buildRigidBoxComponent(new Vec2(10, 10), new Vec2(6, 6), new Vec2(2, 2));
    expect(box.topY).toBe(17);

    // anotherBox has same offset and size and its bottomY is on 18, should not colide
    const anotherBox = buildRigidBoxComponent(new Vec2(10, 16), new Vec2(6, 6), new Vec2(2, 2));
    expect(anotherBox.bottomY).toBe(18);

    // act
    const result = PhysicProcessor.colided(box, anotherBox);

    // assert
    expect(result).toBeFalsy();
});

test('colision should consider rigid box edges top/bottom', () => {
    // arrange
    // box starting at 10, 10 with offset of 2, 2 and size of 6, 6. The box ends on pixel topY 17
    const box = buildRigidBoxComponent(new Vec2(10, 10), new Vec2(6, 6), new Vec2(2, 2));
    expect(box.topY).toBe(17);

    // anotherBox has same offset and size and its bottomY is on 17, should not colide
    const anotherBox = buildRigidBoxComponent(new Vec2(10, 15), new Vec2(6, 6), new Vec2(2, 2));
    expect(anotherBox.bottomY).toBe(17);

    // act
    const result = PhysicProcessor.colided(box, anotherBox);

    // assert
    expect(result).toBeTruthy();
});

test('colision should consider rigid box edges left/right', () => {
    // arrange
    // box starting at 10, 10 with offset of 2, 2 and size of 6, 6. The box ends on pixel topY 17
    const box = buildRigidBoxComponent(new Vec2(10, 10), new Vec2(6, 6), new Vec2(2, 2));
    expect(box.rightX).toBe(17);

    // anotherBox has same offset and size and its bottomY is on 17, should not colide
    const anotherBox = buildRigidBoxComponent(new Vec2(15, 10), new Vec2(6, 6), new Vec2(2, 2));
    expect(anotherBox.leftX).toBe(17);

    // act
    const result = PhysicProcessor.colided(box, anotherBox);

    // assert
    expect(result).toBeTruthy();
});

const buildRigidBoxComponent = (position: IVec2, size: IVec2, offset: IVec2) => {
    const gameObject = new GameObject(position, "gameObject");
    const box = RigidBox.MovingBox("test", size, offset);
    const component = new RigidBoxComponent(box);
    component.setReferece(gameObject);

    return component;
}

test('should resolve collision from left', () => {
    const originalPosition = new Vec2(0, 0);

    const movingBox = buildRigidBoxComponent(new Vec2(2, 2), new Vec2(10, 10), new Vec2(0, 0));
    const staticBox = buildRigidBoxComponent(new Vec2(10, 0), new Vec2(10, 10), new Vec2(0, 0));
    
    movingBox.velocity = new Vec2(10, 10);

    PhysicProcessor.checkColisionBetweenMovingBoxAndStaticBox(originalPosition, movingBox, staticBox);

    expect(movingBox.velocity.x).toBe(0);
    expect(movingBox.velocity.y).toBe(10);
    expect(movingBox.position.x).toBe(staticBox.leftX - movingBox.width);
    expect(movingBox.position.y).toBe(2);
});

test('should resolve collision from right', () => {
    const originalPosition = new Vec2(22, 0);

    const movingBox = buildRigidBoxComponent(new Vec2(18, 4), new Vec2(10, 10), new Vec2(0, 0));
    const staticBox = buildRigidBoxComponent(new Vec2(10, 0), new Vec2(10, 10), new Vec2(0, 0));
    
    movingBox.velocity = new Vec2(-10, -10);

    PhysicProcessor.checkColisionBetweenMovingBoxAndStaticBox(originalPosition, movingBox, staticBox);

    expect(movingBox.velocity.x).toBe(0);
    expect(movingBox.velocity.y).toBe(-10);
    expect(movingBox.position.x).toBe(staticBox.leftX + staticBox.width);
    expect(movingBox.position.y).toBe(4);
});

test('should resolve collision from top', () => {
    const originalPosition = new Vec2(17, 12);

    const movingBox = buildRigidBoxComponent(new Vec2(13, 8), new Vec2(10, 10), new Vec2(0, 0));
    const staticBox = buildRigidBoxComponent(new Vec2(10, 0), new Vec2(10, 10), new Vec2(0, 0));
    
    movingBox.velocity = new Vec2(-10, -10);

    PhysicProcessor.checkColisionBetweenMovingBoxAndStaticBox(originalPosition, movingBox, staticBox);

    expect(movingBox.velocity.x).toBe(-10);
    expect(movingBox.velocity.y).toBe(0);
    expect(movingBox.position.x).toBe(13);
    expect(movingBox.position.y).toBe(staticBox.topY + 1);
});

test('should resolve collision from bottom', () => {
    const originalPosition = new Vec2(13, -12);

    const movingBox = buildRigidBoxComponent(new Vec2(17, -8), new Vec2(10, 10), new Vec2(0, 0));
    const staticBox = buildRigidBoxComponent(new Vec2(10, 0), new Vec2(10, 10), new Vec2(0, 0));
    
    movingBox.velocity = new Vec2(10, 10);

    PhysicProcessor.checkColisionBetweenMovingBoxAndStaticBox(originalPosition, movingBox, staticBox);

    expect(movingBox.velocity.x).toBe(10);
    expect(movingBox.velocity.y).toBe(0);
    expect(movingBox.position.x).toBe(17);
    expect(movingBox.position.y).toBe(staticBox.bottomY - movingBox.height);
});