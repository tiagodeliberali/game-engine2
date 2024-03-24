import { IVec2 } from "../core/Math";

export enum Action {
    WalkRight,
    WalkLeft,
    Jump,
    Idle
}

export class UserActionData {
    user: string;
    action: Action;
    x: number;
    y: number

    constructor(user: string, action: Action, position: IVec2) {
        this.user = user;
        this.action = action;
        this.x = position.x;
        this.y = position.y;
    }
}

export enum UserManagementAction {
    Init = "init",
    Add = "add",
    Remove = "remove"
}

export class UserManagementData {
    action: UserManagementAction;
    id: string;
    users: string[];

    constructor(action: UserManagementAction, id: string, users: string[]) {
        this.action = action;
        this.id = id;
        this.users = users;
    }
}