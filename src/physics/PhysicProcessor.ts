import { GameObject } from "../core/GameObject";
import { IVec2, Vec2 } from "../core/Math";
import { Atlas } from "../graphics/Atlas";
import { RigidBox, RigidBoxComponent } from "./RigidBox";

export class PhysicProcessor {
    movingBoxes: Array<RigidBoxComponent> = new Array<RigidBoxComponent>();
    staticBoxes: Array<RigidBoxComponent> = new Array<RigidBoxComponent>();
    lastTime: number = 0;

    configureRigidBoxComponent(rigidBox: RigidBoxComponent) {
        rigidBox.isStatic
            ? this.staticBoxes.push(rigidBox)
            : this.movingBoxes.push(rigidBox);

        // set global aceleration
        rigidBox.aceleration.y = -400;
    }

    loadAtlas(atlas: Atlas) {
        atlas.rigidBoxes.forEach((boxPosition) => {
            const component = new RigidBoxComponent(RigidBox.StaticBox(new Vec2(atlas.tileSize, atlas.tileSize), Vec2.zero()));
            component.setReferece(new GameObject(boxPosition));
            this.staticBoxes.push(component);
        });
    }

    update() {
        var currentTime = performance.now();
        var diff = (currentTime - this.lastTime) / 1000; // seconds
        this.lastTime = currentTime;

        for (var i = 0; i < this.movingBoxes.length; i++) {
            // check moviment
            var originalPosition = Vec2.clone(this.movingBoxes[i].position);

            this.applyMoviment(this.movingBoxes[i], diff);

            // check against all moving entities
            for (var j = i + 1; j < this.movingBoxes.length; j++) {
                this.checkColisionBetweenMovingBoxes(this.movingBoxes[i], this.movingBoxes[j]);
            }

            // check against all static entities
            for (var j = 0; j < this.staticBoxes.length; j++) {
                this.checkColisionBetweenMovingBoxAndStaticBox(originalPosition, this.movingBoxes[i], this.staticBoxes[j]);
            }
        }
    }

    checkColisionBetweenMovingBoxes(box1: RigidBoxComponent, box2: RigidBoxComponent) {

    }

    checkColisionBetweenMovingBoxAndStaticBox(originalPosition: IVec2, movingBox: RigidBoxComponent, staticBox: RigidBoxComponent) {
        // collision!
        if (movingBox.rightX >= staticBox.leftX && movingBox.leftX <= staticBox.rightX
            && movingBox.bottomY <= staticBox.topY && movingBox.topY >= staticBox.bottomY) {
            var diff = Vec2.subtrac(movingBox.position, originalPosition);

            // from top
            if (diff.y < 0 && -diff.y >= staticBox.topY - movingBox.bottomY) {
                movingBox.velocity.y = 0;
                movingBox.y = staticBox.topY + 1;
            }

            // from bottom
            else if (diff.y > 0 && diff.y >= movingBox.topY - staticBox.bottomY) {
                movingBox.velocity.y = 0;
                movingBox.y = staticBox.bottomY - movingBox.height;
            }

            //from right
            else if (diff.x < 0 && -diff.x >= staticBox.rightX - movingBox.leftX) {
                movingBox.velocity.x = 0;
                movingBox.x = staticBox.rightX + 1;
            }

            // from left
            else if (diff.x > 0 && diff.x >= movingBox.rightX - staticBox.leftX) {
                movingBox.velocity.x = 0;
                movingBox.x = staticBox.leftX - movingBox.width;
            }
        }
    }

    applyMoviment(component: RigidBoxComponent, timeSpan: number): void {
        // apply force to velocity
        component.velocity.x += component.aceleration.x * timeSpan;
        component.velocity.y += component.aceleration.y * timeSpan;

        // apply velocity to position
        component.position = new Vec2(
            component.position.x + component.velocity.x * timeSpan,
            component.position.y + component.velocity.y * timeSpan
        );
    }
}