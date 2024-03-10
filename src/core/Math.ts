
/**
 * Only works with integer numbers and round to integer to keep everything pixel size
 */
export class Vec2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = Math.round(x);
        this.y = Math.round(y);
    }

    static Zero() {
        return new Vec2(0, 0);
    }

    static sum(v1: Vec2, v2: Vec2) {
        return new Vec2(v1.x + v2.x, v1.y + v2.y);
    }

    static subtraction(v1: Vec2, v2: Vec2) {
        return new Vec2(v1.x - v2.x, v1.y - v2.y);
    }

    update(position: Vec2) {
        this.x = Math.round(position.x);
        this.y = Math.round(position.y);
    }

    clone() {
        return new Vec2(this.x, this.y);
    }
}