
/**
 * Only works with integer numbers and round to integer to keep everything pixel size
 */
export class Vec2 {
    private _x: number;
    private _y: number;

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = Math.round(value);
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = Math.round(value);
    }

    constructor(x: number, y: number) {
        this._x = Math.round(x);
        this._y = Math.round(y);
    }

    static zero() {
        return new Vec2(0, 0);
    }

    static sum(v1: Vec2, v2: Vec2) {
        return new Vec2(v1.x + v2.x, v1.y + v2.y);
    }

    static subtrac(v1: Vec2, v2: Vec2) {
        return new Vec2(v1.x - v2.x, v1.y - v2.y);
    }

    update(anotherVec: Vec2) {
        // doesn't need to run Math.round since it is coming from another Vec2 and the value needs to be an integer
        this._x = anotherVec.x;
        this._y = anotherVec.y;
    }

    clone() {
        return new Vec2(this.x, this.y);
    }
}