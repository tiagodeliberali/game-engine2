import { EventHandler, OnEvent } from "../core/EventHandler";

const pressedKey: Map<string, boolean> = new Map<string, boolean>();
const onKeyDownEventHandler: Map<string, EventHandler<void>> = new Map<string, EventHandler<void>>();

function onKeyDown(event: KeyboardEvent) {
    pressedKey.set(event.key, true);
 
    if (!event.repeat && onKeyDownEventHandler.has(event.key)) {
        onKeyDownEventHandler.get(event.key)!.fire();
    }
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

export function subscribeOnKeyDown(key: string, action: OnEvent<void>) {
    if (!onKeyDownEventHandler.has(key)) {
        onKeyDownEventHandler.set(key, new EventHandler());
    }
    onKeyDownEventHandler.get(key)!.subscribe(action);
}

export class Keys {
    static readonly ArrowRight: string = "ArrowRight";
    static readonly ArrowLeft: string = "ArrowLeft";
    static readonly ArrowUp: string = "ArrowUp";
    static readonly Space: string = " ";
}