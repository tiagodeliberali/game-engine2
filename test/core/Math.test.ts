import { Vec2 } from "../../src/core/Math";

test('Vec.Zero', () => {
    const vec = Vec2.zero();
    expect(vec.x).toBe(0);
    expect(vec.y).toBe(0);
});

test('Vec2 only works with integers using Math.round', () => {
    const vec = new Vec2(0.8, 2.3);
    expect(vec.x).toBe(1);
    expect(vec.y).toBe(2);
});

test('Update Vec2 fields turn then into integers', () => {
    const vec = Vec2.zero();
    vec.x = 3.1;
    vec.y = 1.9;
    expect(vec.x).toBe(3);
    expect(vec.y).toBe(2);
});

test('Update vec2 copy values from external Vec2', () => {
    const vec = Vec2.zero();
    const anotherVec = new Vec2(4, 5);

    vec.update(anotherVec);

    expect(vec.x).toBe(4);
    expect(vec.y).toBe(5);
});

test('Clone vec2 creates a new instance', () => {
    const vec = new Vec2(4, 5);

    const cloned = vec.clone();
    vec.x = 10;
    vec.y = 20;

    expect(vec.x).toBe(10);
    expect(vec.y).toBe(20);

    expect(cloned.x).toBe(4);
    expect(cloned.y).toBe(5);
});

test('Sum vecs into a new Vec2', () => {
    const vec1 = new Vec2(2, 3);
    const vec2 = new Vec2(4, 5);

    const result = Vec2.sum(vec1, vec2);

    expect(result.x).toBe(6);
    expect(result.y).toBe(8);
});

test('Subtract vecs into a new Vec2', () => {
    const vec1 = new Vec2(2, 3);
    const vec2 = new Vec2(4, 5);

    const result = Vec2.subtrac(vec2, vec1);

    expect(result.x).toBe(2);
    expect(result.y).toBe(2);
});