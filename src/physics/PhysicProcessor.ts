import { GameObject } from "../core/GameObject";
import { Vec2 } from "../core/Math";
import { Atlas } from "../graphics/Atlas";
import { RigidBox, RigidBoxComponent } from "./RigidBox";

export class PhysicProcessor {
    movingBoxes: Array<RigidBoxComponent> = new Array<RigidBoxComponent>();
    staticBoxes: Array<RigidBoxComponent> = new Array<RigidBoxComponent>();
    lastTime: number = 0;

    configureRigidBoxComponent(rigidBox: RigidBoxComponent) {
        rigidBox.box.isStatic
            ? this.staticBoxes.push(rigidBox)
            : this.movingBoxes.push(rigidBox);

        // set global aceleration
        rigidBox.box.aceleration.y = -400;
    }

    loadAtlas(atlas: Atlas) {
        atlas.rigidBoxes.forEach((boxPosition) => {
            const component = new RigidBoxComponent(RigidBox.StaticBox(new Vec2(atlas.tileSize, atlas.tileSize), Vec2.Zero()));
            component.debugData.updatePosition(boxPosition);
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
            var originalPosition = this.movingBoxes[i].gameObject!.position.clone();

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

        for (var i = 0; i < this.movingBoxes.length; i++) {
            
        }
    }

    checkColisionBetweenMovingBoxes(box1: RigidBoxComponent, box2: RigidBoxComponent) {

    }

    checkColisionBetweenMovingBoxAndStaticBox(originalPosition: Vec2, movingBox: RigidBoxComponent, staticBox: RigidBoxComponent) {
        const collisionDistance = 0.01;
        // collision!
        if (movingBox.rightX >= staticBox.leftX && movingBox.leftX <= staticBox.rightX
            && movingBox.bottomY <= staticBox.topY && movingBox.topY >= staticBox.bottomY) {
                var diff = Vec2.subtraction(movingBox.gameObject!.position, originalPosition);
                
                // going from top to botton
                if (diff.y < 0 && -diff.y >= staticBox.topY - movingBox.bottomY) {
                    movingBox.updateVelocity((velocity) => velocity.y = 0);
                    movingBox.updatePosition((position) => { position.y = staticBox.topY - movingBox.box.offset.y + 1; return position });
                }

                // going from botton to top
                else if (diff.y > 0 && diff.y >= movingBox.topY - staticBox.bottomY) {
                    movingBox.updateVelocity((velocity) => velocity.y = 0);
                    movingBox.updatePosition((position) => { position.y = staticBox.bottomY - movingBox.box.offset.y - movingBox.box.size.y; return position });
                }

                // going from right to left
                else if (diff.x < 0 && -diff.x >= staticBox.rightX - movingBox.leftX) {
                    movingBox.updateVelocity((velocity) => velocity.x = 0);
                    movingBox.updatePosition((position) => { position.x = staticBox.rightX - movingBox.box.offset.x + 1; return position });
                }

                // going from left to right
                else if (diff.x > 0 && diff.x >= movingBox.rightX - staticBox.leftX) {
                    movingBox.updateVelocity((velocity) => velocity.x = 0);
                    movingBox.updatePosition((position) => { position.x = staticBox.leftX - movingBox.box.offset.x - movingBox.box.size.x; return position });
                }
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