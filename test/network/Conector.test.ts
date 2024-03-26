/**
 * @jest-environment node
 */

// references:
// - https://socket.io/docs/v4/testing/
// - https://github.com/socketio/socket.io/issues/4180

import { GameObject } from "../../src/core/GameObject";
import { IVec2, Vec2 } from "../../src/core/Math";
import { BuildCharacterFunc, ServerConector } from "../../src/network/Connector";
import { Action } from "../../src/network/Core";

import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import { Server } from "socket.io";


const buildCharacterFunc: BuildCharacterFunc = jest.fn(() => new GameObject(Vec2.zero(), 'test'));
const logger = {
    set: jest.fn(),             //(key: string, value: string): void;
    startSessions: jest.fn(),   //(): void;
    endSessions: jest.fn()      //(): void;
}


let io: Server;
let clientSocket: ClientSocket;

beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
        const port = (httpServer.address() as AddressInfo).port;
        clientSocket = ioc(`http://localhost:${port}`);
        clientSocket.on("connect", done);
    });
});

afterAll(() => {
    io.close();
    clientSocket.disconnect();
});

test('ServerConnector connects to the server', () => {
    // Arrange
    const connector = new ServerConector(logger, buildCharacterFunc);

    // Act
    connector.connect('test');

    // Assert
    expect(connector.localUsername).toBe('test');
});

test('ServerConnector emits local actions', () => {
    // Arrange
    const connector = new ServerConector(logger, buildCharacterFunc);
    const action: Action = Action.WalkLeft;
    const position: IVec2 = { x: 1, y: 2 };

    // Act
    connector.emitLocalAction(action, position);

    // Assert
    expect(connector.localQueue.peek()?.action).toBe(action);
    expect(connector.localQueue.peek()?.x).toEqual(position.x);
    expect(connector.localQueue.peek()?.y).toEqual(position.y);
});



