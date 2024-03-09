import { GameObject } from "../core/GameObject";
import { Vec2 } from "../core/Math";
import { Atlas } from "../graphics/Atlas";
import { RigidBox, RigidBoxComponent } from "./RigidBox";

export class PhysicProcessor {
    movingBoxes: Array<RigidBoxComponent> = new Array<RigidBoxComponent>();
    staticBoxes: Array<RigidBoxComponent> = new Array<RigidBoxComponent>();
    lastTime: number = 0;

    constructor() {
    }

    configureRigidBoxComponent(rigidBox: RigidBoxComponent) {
        rigidBox.box.isStatic
            ? this.staticBoxes.push(rigidBox)
            : this.movingBoxes.push(rigidBox);

        // set global aceleration
        rigidBox.box.aceleration.y = -400;
    }

    update() {
        var currentTime = performance.now();
        var diff = (currentTime - this.lastTime) / 1000; // seconds
        this.lastTime = currentTime;

        this.movingBoxes.forEach(box => this.applyMoviment(box, diff))

        for (var i = 0; i < this.movingBoxes.length - 1; i++) {
            for (var j = i + 1; j < this.movingBoxes.length; j++) {
                this.checkColisionBetweenMovingBoxes(this.movingBoxes[i], this.movingBoxes[j]);
            }
        }

        for (var i = 0; i < this.movingBoxes.length; i++) {
            for (var j = 0; j < this.staticBoxes.length; j++) {
                this.checkColisionBetweenMovingBoxAndStaticBox(this.movingBoxes[i], this.staticBoxes[j]);
            }
        }
    }

    loadAtlas(atlas: Atlas) {
        atlas.rigidBoxes.forEach((boxPosition) => {
            const component = new RigidBoxComponent(RigidBox.StaticBox(new Vec2(atlas.tileSize, atlas.tileSize), Vec2.Zero()));
            component.debugData.updatePosition(boxPosition);
            component.setReferece(new GameObject(boxPosition));
            this.staticBoxes.push(component);
        });
    }

    checkColisionBetweenMovingBoxes(box1: RigidBoxComponent, box2: RigidBoxComponent) {

    }

    checkColisionBetweenMovingBoxAndStaticBox(movingBox: RigidBoxComponent, staticBox: RigidBoxComponent) {
        // base of moving objecty collides with static top
        if (movingBox.bottomY <= staticBox.topY && movingBox.topY >= staticBox.topY
            && movingBox.rightX >= staticBox.leftX && movingBox.leftX <= staticBox.rightX) {
            movingBox.updateVelocity((velocity) => velocity.y = 0);
            movingBox.updatePosition((position) => position.y = staticBox.topY);
        }

        // right of moving objecty collides with static left
        if (movingBox.rightX >= staticBox.leftX && movingBox.leftX <= staticBox.leftX
            && movingBox.bottomY <= staticBox.topY && movingBox.topY >= staticBox.bottomY) {
            movingBox.updateVelocity((velocity) => velocity.x = 0);
            movingBox.updatePosition((position) => position.x = staticBox.leftX - movingBox.box.offset.x - movingBox.box.size.x);
        }
    }

    applyMoviment(component: RigidBoxComponent, timeSpan: number): void {
        // apply force to velocity
        component.box.velocity.x += component.box.aceleration.x * timeSpan;
        component.box.velocity.y += component.box.aceleration.y * timeSpan;

        // apply velocity to position
        component.gameObject?.updatePosition((position) => {
            position.x += component.box.velocity.x * timeSpan;
            position.y += component.box.velocity.y * timeSpan;
        });
    }
}