import { EventHandler } from "../../src/core/EventHandler";

test('Subscribe to event should be called when fire', () => {
    // arrange
    const handler = new EventHandler<void>();

    let called = false;
    handler.subscribe(() => called = true);

    // act
    handler.fire();

    // assert
    expect(called).toBeTruthy();
});

test('After unsubscribe, should not be called when fire', () => {
    // arrange
    const handler = new EventHandler<void>();

    let called = false;
    const action = () => called = true;
    handler.subscribe(action);

    // act
    handler.unsubscribe(action);
    handler.fire();

    // assert
    expect(called).toBeFalsy();
});