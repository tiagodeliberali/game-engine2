import { Component } from "../core/Component";
import { GameObject } from "../core/GameObject";


export class CodeComponent extends Component {
    static readonly Name = 'CodeComponent';
    private gameObject: GameObject | null = null;
    
    updateAction: ((delta: number) => void) | null = null;
    fixedUpdateAction: ((delta: number) => void) | null = null;

    constructor(updateAction?: (delta: number) => void, fixedUpdateAction?: (delta: number) => void) {
        super();
        this.updateAction = updateAction || null;
        this.fixedUpdateAction = fixedUpdateAction || null;
    }

    setReferece(gameObject: GameObject): void {
        this.gameObject = gameObject;
    }

    get typeName(): string {
        return CodeComponent.Name;
    }

    update(delta: number): void {
        if (this.updateAction) {
            this.updateAction(delta);
        }
    }

    fixedUpdate(delta: number): void {
        if (this.fixedUpdateAction) {
            this.fixedUpdateAction(delta);
        }
    }
}