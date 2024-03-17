class QueueNode<T> {
    value: T;
    next: QueueNode<T> | null;

    constructor(value: T) {
        this.value = value;
        this.next = null;
    }
}

export class Queue<T> {
    private head: QueueNode<T> | null;
    private tail: QueueNode<T> | null;

    constructor() {
        this.head = null;
        this.tail = null;
    }

    enqueue(value: T): void {
        const newQueueNode = new QueueNode(value);

        if (this.tail === null) {
            this.head = newQueueNode;
            this.tail = newQueueNode;
        } else {
            this.tail.next = newQueueNode;
            this.tail = newQueueNode;
        }
    }

    dequeue(): T | null {
        if (this.head === null) {
            return null;
        }

        const value = this.head.value;
        this.head = this.head.next;

        if (this.head === null) {
            this.tail = null;
        }

        return value;
    }

    isEmpty(): boolean {
        return this.head === null;
    }

    peek(): T | null {
        return this.head !== null ? this.head.value : null;
    }

    size(): number {
        let count = 0;
        let current = this.head;

        while (current !== null) {
            count++;
            current = current.next;
        }

        return count;
    }
}