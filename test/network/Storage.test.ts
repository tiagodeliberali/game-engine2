import { GameObject } from "../../src/core/GameObject";
import { Vec2 } from "../../src/core/Math";
import { Queue } from "../../src/core/Queue";
import { Action, UserActionData } from "../../src/network/Core";
import { OnlineUserStorage } from "../../src/network/Storage";

test('OnlineUserStorage adds and retrieves users', () => {
    // Arrange
    const storage = new OnlineUserStorage();
    const gameObject = new GameObject(Vec2.zero(), "gameObject");
    const queue = new Queue<UserActionData>();

    // Act
    storage.add('test', gameObject, queue);
    const hasUser = storage.has('test');

    // Assert
    expect(hasUser).toBe(true);
});

test('OnlineUserStorage enqueues user data', () => {
    // Arrange
    const storage = new OnlineUserStorage();
    const gameObject = new GameObject(Vec2.zero(), "gameObject");
    const queue = new Queue<UserActionData>();
    storage.add('test', gameObject, queue);

    // Act
    storage.enqueue('test', { action: Action.WalkRight, user: 'test', x: 0, y: 0});

    // Assert
    expect(queue.peek()?.action).toBe(Action.WalkRight);
});

test('OnlineUserStorage removes users', () => {
    // Arrange
    const storage = new OnlineUserStorage();
    const gameObject = new GameObject(Vec2.zero(), "gameObject");
    const queue = new Queue<UserActionData>();
    storage.add('test', gameObject, queue);

    // Act
    storage.remove('test');
    const hasUser = storage.has('test');

    // Assert
    expect(hasUser).toBe(false);
});