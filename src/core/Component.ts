import { GameObject } from "./GameObject";

export abstract class Component {
    gameObject: GameObject | undefined;

    public setReferece(gameObject: GameObject) {
        this.gameObject = gameObject;
        this.setReferenceInternal();
    }

    public abstract is(name: string): boolean;

    abstract setReferenceInternal(): void;
}