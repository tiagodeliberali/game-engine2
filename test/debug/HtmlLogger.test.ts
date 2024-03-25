import { HtmlLogger } from "../../src/debug/HtmlLogger";

// Create a mock HTML element for the tests
document.body.innerHTML = '<span id="log"></span>';

test('HtmlLogger sets and retrieves key-value pairs', () => {
    // Arrange
    const logger = new HtmlLogger('log');

    // Act
    logger.set('key', 'value');

    // Assert
    expect(document.getElementById('log')?.innerHTML).toContain('key: value');
});

test('HtmlLogger starts and ends sessions', () => {
    // Arrange
    const logger = new HtmlLogger('log');

    // Act
    logger.startSessions();
    logger.set('key', 'value');
    logger.endSessions();

    // Assert
    expect(document.getElementById('log')?.innerHTML).toContain('started:\nkey: value\n\nended');
});

test('HtmlLogger writes session data to console', () => {
    // Arrange
    const logger = new HtmlLogger('log', true);
    const consoleSpy = jest.spyOn(console, 'log');

    // Act
    logger.startSessions();
    logger.set('key', 'value');
    logger.endSessions();

    // Assert
    expect(consoleSpy).toHaveBeenCalledWith('started:\nkey: value\n\nended');
});