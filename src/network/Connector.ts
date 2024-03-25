import { Socket, io } from "socket.io-client";
import { HtmlLogger } from "../debug/HtmlLogger";
import { Queue } from "../core/Queue";
import { GameObject } from "../core/GameObject";
import { OnlineUserStorage } from "./Storage";
import { Action, UserActionData, UserManagementAction, UserManagementData } from "./Core";
import { IVec2 } from "../core/Math";

enum Channel {
    Users = "users",
    Action = "action",
    Error = "connect_error"
}

export type BuildCharacterFunc = (queue: Queue<UserActionData>, debugName: string) => GameObject;

export class ServerConector {
    private socket: Socket;
    private buildCharacterFunc: BuildCharacterFunc;
    private storage: OnlineUserStorage;
    private localusername: string | undefined;
    private localUserQueue: Queue<UserActionData>;

    constructor(logger: HtmlLogger, buildCharacterFunc: BuildCharacterFunc) {
        this.buildCharacterFunc = buildCharacterFunc;
        this.storage = new OnlineUserStorage();
        this.localUserQueue = new Queue<UserActionData>();

        this.socket = io(process.env.AZURE_SOCKETIO_URL!, {
            path: process.env.AZURE_SOCKETIO_PATH,
            autoConnect: false,
        });

        this.socket.on(Channel.Error, (err) => {
            logger.set("error", err.message);
        });

        this.socket.on(Channel.Users, (userManagementData: UserManagementData) => {
            if (this.localusername == undefined) {
                throw Error("SHould not receive events if user is not set");
            }

            switch (userManagementData.action) {
              case UserManagementAction.Init:
                userManagementData.users.forEach((username: string) => {
                    this.createUserIfNew(username);
                });
                break;
              case UserManagementAction.Add:
                this.createUserIfNew(userManagementData.id);
                break;
              case UserManagementAction.Remove:
                this.removeUser(userManagementData.id);
                break;
            }
            logger.set("users", this.storage.size.toString());
          });

          this.socket.on(Channel.Action, (userData: UserActionData) => {
            this.storage.enqueue(userData.user, userData);
          });
    }

    get localQueue() {
        return this.localUserQueue;
    }

    private createUserIfNew(username: string) {
        if (this.localusername != username && !this.storage.has(username)) {
            const queue = new Queue<UserActionData>();
            const gameObject = this.buildCharacterFunc(queue, "onlineCharacter:" + username);
            this.storage.add(username, gameObject, queue);
        }
    }

    private removeUser(username: string) {
        if (!this.storage.has(username)) {
            this.storage.remove(username);
        }
    }

    connect(username: string) {
        this.localusername = username;
        this.socket.auth = { username };
        this.socket.connect();
    }

    emitLocalAction(action: Action, position: IVec2) {
        const userData = new UserActionData(this.localusername ?? "_localUser", action, position)
        this.localUserQueue.enqueue(userData);
        this.socket.emit(Channel.Action, userData);
    }
}