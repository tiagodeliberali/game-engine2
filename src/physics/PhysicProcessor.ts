import { RigidBoxComponent } from "./RigidBox";

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
        rigidBox.box.aceleration.y = -100;
        
    }

    update() {
        var currentTime = performance.now();
        var diff = (currentTime - this.lastTime) / 1000; // seconds
        this.lastTime = currentTime;

        this.movingBoxes.forEach(box => this.applyMoviment(box, diff))

        for(var i = 0; i < this.movingBoxes.length - 1; i++) {
            for(var j = i + 1; j < this.movingBoxes.length; i++) {
                this.checkColisionBetweenMovingBoxes(this.movingBoxes[i], this.movingBoxes[j]);
            }   
        }

        for(var i = 0; i < this.movingBoxes.length; i++) {
            for(var j = 0; j < this.staticBoxes.length; i++) {
                this.checkColisionBetweenMovingBoxAndStaticBox(this.movingBoxes[i], this.staticBoxes[j]);
            }   
        }
    }

    checkColisionBetweenMovingBoxes(box1: RigidBoxComponent, box2: RigidBoxComponent) {
        
    }

    checkColisionBetweenMovingBoxAndStaticBox(movingBox: RigidBoxComponent, staticBox: RigidBoxComponent) {
        
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