import { CodeComponent } from "./CodeComponent";

export class CodeProcessor {
    private updateComponents: Array<CodeComponent> = new Array<CodeComponent>();
    private fixedUpdateComponents: Array<CodeComponent> = new Array<CodeComponent>();

    configureCodeComponent(codeComponent: CodeComponent) {
        if (codeComponent.updateAction) {
            this.updateComponents.push(codeComponent);
        }
        if (codeComponent.fixedUpdateAction) {
            this.fixedUpdateComponents.push(codeComponent);
        }
    }

    update(delta: number) {
        for (let i = 0; i < this.updateComponents.length; i++) {
            this.updateComponents[i].update(delta);
        }
    }

    fixedUpdate(delta: number) {
        for (let i = 0; i < this.fixedUpdateComponents.length; i++) {
            this.fixedUpdateComponents[i].fixedUpdate(delta);
        }
    }
}