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
    static readonly Enter: string = "Enter";
    static readonly Escape: string = "Escape";
    static readonly Shift: string = "Shift";
    static readonly Control: string = "Control";
    static readonly Alt: string = "Alt";
    static readonly Tab: string = "Tab";
    static readonly Backspace: string = "Backspace";
    static readonly Delete: string = "Delete";
    static readonly KeyA: string = "a";
    static readonly KeyB: string = "b";
    static readonly KeyC: string = "c";
    static readonly KeyD: string = "d";
    static readonly KeyE: string = "e";
    static readonly KeyF: string = "f";
    static readonly KeyG: string = "g";
    static readonly KeyH: string = "h";
    static readonly KeyI: string = "i";
    static readonly KeyJ: string = "j";
    static readonly KeyK: string = "k";
    static readonly KeyL: string = "l";
    static readonly KeyM: string = "m";
    static readonly KeyN: string = "n";
    static readonly KeyO: string = "o";
    static readonly KeyP: string = "p";
    static readonly KeyQ: string = "q";
    static readonly KeyR: string = "r";
    static readonly KeyS: string = "s";
    static readonly KeyT: string = "t";
    static readonly KeyU: string = "u";
    static readonly KeyV: string = "v";
    static readonly KeyW: string = "w";
    static readonly KeyX: string = "x";
    static readonly KeyY: string = "y";
    static readonly KeyZ: string = "z";
    static readonly Key0: string = "0";
    static readonly Key1: string = "1";
    static readonly Key2: string = "2";
    static readonly Key3: string = "3";
    static readonly Key4: string = "4";
    static readonly Key5: string = "5";
    static readonly Key6: string = "6";
    static readonly Key7: string = "7";
    static readonly Key8: string = "8";
    static readonly Key9: string = "9";
}