import { Params } from "../../src/inputs/Params";

test('getQueryParam returns the value of the specified query parameter', () => {
    // Arrange
    const mockLocation = { href: 'http://test.com?test=value' } as Location;
    const params = new Params(mockLocation);

    // Act
    const value = params.getQueryParam('test');

    // Assert
    expect(value).toBe('value');
});

test('getQueryParam returns null if the specified query parameter does not exist', () => {
    // Arrange
    const mockLocation = { href: 'http://test.com?test=value' } as Location;
    const params = new Params(mockLocation);

    // Act
    const value = params.getQueryParam('nonexistent');

    // Assert
    expect(value).toBe(null);
});