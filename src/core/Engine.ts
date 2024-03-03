import { initKeyboard } from "../Keyboard";
import { Atlas } from "../graphics/Atlas";
import { GraphicProcessor } from "../graphics/GraphicProcessor";
import { SpriteComponent } from "../graphics/Sprite";
import { GameObject } from "./GameObject";

export class Engine {
    private graphicProcessor: GraphicProcessor;
    private gameObjects: GameObject[] = [];

    private constructor(graphicProcessor: GraphicProcessor) {
        this.graphicProcessor = graphicProcessor;
        initKeyboard();
    }

    public static async build() {
        const graphicProcessor = await GraphicProcessor.build();
        return new Engine(graphicProcessor);
    }

    public loadAtlas(atlasData: Atlas) {
        this.graphicProcessor.loadAtlas(atlasData);
    }

    public add(gameObjects: GameObject[]) {
        for (const gameObject of gameObjects) {
            this.processComponents(gameObject);
            this.gameObjects.push(gameObject);
        }
    }

    private processComponents(gameObject: GameObject) {
        for (const component of gameObject.components) {
            if (component.is(SpriteComponent.Name)) {
                this.graphicProcessor.configureSpriteComponent(component as SpriteComponent, gameObject);                
            }
        }
    }

    public update() {
        this.graphicProcessor.draw();
    }
}