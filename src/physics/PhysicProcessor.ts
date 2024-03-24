import { GameObject } from "../core/GameObject";
import { IVec2, Vec2 } from "../core/Math";
import { HtmlLogger } from "../debug/HtmlLogger";
import { Atlas } from "../graphics/Atlas";
import { RigidBox, RigidBoxComponent } from "./RigidBox";

export class PhysicProcessor {
    movingBoxes: Array<RigidBoxComponent> = new Array<RigidBoxComponent>();
    staticBoxes: Array<RigidBoxComponent> = new Array<RigidBoxComponent>();
    lastTime: number = 0;
    logger: HtmlLogger;

    constructor(logger: HtmlLogger) {
        this.logger = logger;
    }

    configureRigidBoxComponent(rigidBox: RigidBoxComponent) {
        rigidBox.isStatic
            ? this.staticBoxes.push(rigidBox)
            : this.movingBoxes.push(rigidBox);

        // set global aceleration
        rigidBox.aceleration.y = -400;
    }

    loadAtlas(atlas: Atlas) {
        atlas.rigidBoxes.forEach((boxPosition) => {
            const component = new RigidBoxComponent(RigidBox.StaticBox(boxPosition.tag, new Vec2(atlas.tileSize, atlas.tileSize), Vec2.zero()));
            component.setReferece(new GameObject(boxPosition.position, `atlas:${boxPosition.tag}:${boxPosition.position.x}:${boxPosition.position.y}`));
            this.staticBoxes.push(component);
        });
    }

    fixedUpdate(delta: number) {
        const movingBoxToRemove = new Set<number>();
        const staticBoxToRemove = new Set<number>();

        for (let i = 0; i < this.movingBoxes.length; i++) {
            if (this.movingBoxes[i].isDestroyed) {
                movingBoxToRemove.add(this.movingBoxes[i].id);
                continue;
            }

            // check moviment
            const originalPosition = Vec2.clone(this.movingBoxes[i].position);

            this.applyMoviment(this.movingBoxes[i], delta);

            // check against all moving entities
            for (let j = i + 1; j < this.movingBoxes.length; j++) {
                this.checkColisionBetweenMovingBoxes(this.movingBoxes[i], this.movingBoxes[j]);
            }

            // check against all static entities
            for (let j = 0; j < this.staticBoxes.length; j++) {
                if (this.staticBoxes[j].isDestroyed) {
                    staticBoxToRemove.add(this.staticBoxes[j].id);
                    continue;
                }
                PhysicProcessor.checkColisionBetweenMovingBoxAndStaticBox(originalPosition, this.movingBoxes[i], this.staticBoxes[j]);
            }
        }

        if (movingBoxToRemove.size > 0) {
            this.movingBoxes = this.movingBoxes.filter(x => !movingBoxToRemove.has(x.id));
        }

        if (staticBoxToRemove.size > 0) {
            this.staticBoxes = this.staticBoxes.filter(x => !staticBoxToRemove.has(x.id));
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    checkColisionBetweenMovingBoxes(box1: RigidBoxComponent, box2: RigidBoxComponent) {

    }

    static colided(box: RigidBoxComponent, anotherBox: RigidBoxComponent) {
        return box.rightX >= anotherBox.leftX && box.leftX <= anotherBox.rightX
            && box.bottomY <= anotherBox.topY && box.topY >= anotherBox.bottomY;
    }

    static checkColisionBetweenMovingBoxAndStaticBox(originalPosition: IVec2, movingBox: RigidBoxComponent, staticBox: RigidBoxComponent) {
        if (PhysicProcessor.colided(movingBox, staticBox)) {
            movingBox.collidedWith(staticBox.tag);

            if (!staticBox.isSolid) {
                staticBox.collidedWith(movingBox.tag);
                return;
            }

            const diff = Vec2.subtrac(movingBox.position, originalPosition);

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