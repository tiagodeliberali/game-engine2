export class Vec2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public static Zero() {
        return new Vec2(0, 0);
    }

    static sum(v1: Vec2, v2: Vec2) {
        return new Vec2(v1.x + v2.x, v1.y + v2.y);
    }

    update(position: Vec2) {
        this.x = position.x;
        this.y = position.y;
      }
}