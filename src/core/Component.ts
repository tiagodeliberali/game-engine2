import { GameObject } from "./GameObject";

export abstract class Component {
    abstract setReferece(gameObject: GameObject): void;
    abstract is(name: string): boolean;
}