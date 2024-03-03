export type OnEvent<T> = (entity: T) => void;

export class EventHandler<T> {
    private events: Array<OnEvent<T>> = [];

    public subscribe(action: OnEvent<T>) {
        this.events.push(action);
    }

    public unsubscribe(action: OnEvent<T>) {
        this.events = this.events.filter(h => h !== action);
    }

    public fire(entity: T) {
        this.events.forEach((action) => action(entity));
    }
}