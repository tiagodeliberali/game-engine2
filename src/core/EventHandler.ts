export type OnEvent<T> = (entity: T) => {};

export class EventHandler<T> {
    private events: Array<OnEvent<T>> = [];

    public subscribe(action: OnEvent<T>) {
        this.events.push(action);
    }

    public unsubscribe(action: OnEvent<T>) {
        this.events = this.events.filter(h => h !== action);
    }

    public on(entity: T) {
        this.events.forEach((action) => action(entity));
    }
}