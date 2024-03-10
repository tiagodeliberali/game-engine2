const pressedKey: Map<string, boolean> = new Map<string, boolean>();

function onKeyDown(event: KeyboardEvent) {
    pressedKey.set(event.key, true);
}

function onKeyUp(event: KeyboardEvent) {
    pressedKey.set(event.key, false);
}

export function initKeyboard() {
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);
}

export function isKeyPressed(key: string) {
    return pressedKey.get(key) || false;
}

export class Keys {
    static readonly ArrowRight: string = "ArrowRight";
    static readonly ArrowLeft: string = "ArrowLeft";
    static readonly ArrowUp: string = "ArrowUp";
    static readonly Space: string = " ";
}