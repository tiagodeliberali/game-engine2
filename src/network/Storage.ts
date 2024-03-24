import { GameObject } from "../core/GameObject";
import { Queue } from "../core/Queue";
import { UserActionData } from "./Core";

export class OnlineUser {
    queue: Queue<UserActionData>;
    gameObject: GameObject;

    constructor(gameObject: GameObject, queue: Queue<UserActionData>) {
        this.queue = queue;
        this.gameObject = gameObject;
    }
}

const userStorage = new Map<string, OnlineUser>();

export class OnlineUserStorage {

    get size() : number {
        return userStorage.size;
    }

    has(userName: string) : boolean {
        return userStorage.has(userName);
    }

    add(userName: string, gameObject: GameObject, queue: Queue<UserActionData>) {
        userStorage.set(userName, new OnlineUser(gameObject, queue));
    }

    enqueue(userName: string, userData: UserActionData) {
        const user = userStorage.get(userName);
        if (user != undefined) {
            user.queue.enqueue(userData);
        }
    }

    remove(userName: string) {
        userStorage.get(userName)?.gameObject.destroy();
        userStorage.delete(userName);
    }
}