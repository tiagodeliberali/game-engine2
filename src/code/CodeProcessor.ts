import { CodeComponent } from "./CodeComponent";

export class CodeProcessor {
    private initComponents: Array<CodeComponent> = new Array<CodeComponent>();
    private updateComponents: Array<CodeComponent> = new Array<CodeComponent>();
    private fixedUpdateComponents: Array<CodeComponent> = new Array<CodeComponent>();

    configureCodeComponent(codeComponent: CodeComponent) {
        if (codeComponent.updateAction) {
            this.updateComponents.push(codeComponent);
            this.updateComponents.sort((a, b) => a.priority - b.priority);
        }
        if (codeComponent.fixedUpdateAction) {
            this.fixedUpdateComponents.push(codeComponent);
            this.fixedUpdateComponents.sort((a, b) => a.priority - b.priority);
        }
        if (codeComponent.initAction) {
            this.initComponents.push(codeComponent);
            this.initComponents.sort((a, b) => a.priority - b.priority);
        }
    }

    init() {
        for (let i = 0; i < this.initComponents.length; i++) {
            this.initComponents[i].init();
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