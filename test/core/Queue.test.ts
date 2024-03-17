import { Queue } from "../../src/core/Queue";

test('enqueue adds elements to the queue', () => {
    // Arrange
    const queue = new Queue<number>();

    // Act
    queue.enqueue(1);

    // Assert
    expect(queue.size()).toBe(1);
});

test('dequeue removes and returns the first element from the queue', () => {
    // Arrange
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);

    // Act
    const dequeued = queue.dequeue();

    // Assert
    expect(dequeued).toBe(1);
    expect(queue.size()).toBe(1);
});

test('dequeue returns null if the queue is empty', () => {
    // Arrange
    const queue = new Queue<number>();

    // Act
    const dequeued = queue.dequeue();

    // Assert
    expect(dequeued).toBe(null);
});

test('isEmpty returns true if the queue is empty', () => {
    // Arrange
    const queue = new Queue<number>();

    // Act
    const isEmpty = queue.isEmpty();

    // Assert
    expect(isEmpty).toBe(true);
});

test('isEmpty returns false if the queue is not empty', () => {
    // Arrange
    const queue = new Queue<number>();
    queue.enqueue(1);

    // Act
    const isEmpty = queue.isEmpty();

    // Assert
    expect(isEmpty).toBe(false);
});

test('peek returns the first element from the queue without removing it', () => {
    // Arrange
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);

    // Act
    const peeked = queue.peek();

    // Assert
    expect(peeked).toBe(1);
    expect(queue.size()).toBe(2);
});

test('peek returns null if the queue is empty', () => {
    // Arrange
    const queue = new Queue<number>();

    // Act
    const peeked = queue.peek();

    // Assert
    expect(peeked).toBe(null);
});

test('size returns the number of elements in the queue', () => {
    // Arrange
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);

    // Act
    const size = queue.size();

    // Assert
    expect(size).toBe(3);
});