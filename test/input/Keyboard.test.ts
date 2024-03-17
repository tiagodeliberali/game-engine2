import { initKeyboard, isKeyPressed, subscribeOnKeyDown } from "../../src/inputs/Keyboard";

test('initKeyboard initializes keyboard listeners', () => {
    global.window = Object.create(window);
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

    // Act
    initKeyboard();

    // Assert
    expect(addEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
});

test('isKeyPressed returns false if key is not pressed', () => {
    // Arrange
    global.window = Object.create(window);
    initKeyboard();

    // Act
    const result = isKeyPressed('a');

    // Assert
    expect(result).toBe(false);
});

test('isKeyPressed returns true if key is pressed', () => {
    // Arrange
    global.window = Object.create(window);
    initKeyboard();

    const keyEvent = new KeyboardEvent('keydown', { key: 'a' });
    window.dispatchEvent(keyEvent);

    // Act
    const result = isKeyPressed('a');

    // Assert
    expect(result).toBe(true);
});

test('subscribeOnKeyDown calls action when key is pressed', () => {
    // Arrange
    global.window = Object.create(window);
    initKeyboard();
    const action = jest.fn();
    
    // Act
    subscribeOnKeyDown('a', action);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));

    // Assert
    expect(action).toHaveBeenCalled();
});