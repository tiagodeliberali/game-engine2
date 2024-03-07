import { initKeyboard } from "../Keyboard";
import { Atlas } from "../graphics/Atlas";
import { GraphicDebugger } from "../graphics/GraphicDebugger";
import { GraphicProcessor } from "../graphics/GraphicProcessor";
import { SpriteComponent } from "../graphics/Sprite";
import { RigidBoxComponent } from "../physics/RigidBox";
import { GameObject } from "./GameObject";

export class Engine {
    private graphicProcessor: GraphicProcessor;
    private debugGraphicProcessor: GraphicDebugger | undefined;
    private gameObjects: GameObject[] = [];

    private constructor(graphicProcessor: GraphicProcessor) {
        this.graphicProcessor = graphicProcessor;
        initKeyboard();
    }

    public static async build(enableDebugtger: boolean) {
        const graphicProcessor = await GraphicProcessor.build();
        const debugGraphicProcessor = await GraphicDebugger.build();
        const engine = new Engine(graphicProcessor);
        
        if (enableDebugtger) {
            engine.enableGraphicDebugger(debugGraphicProcessor);
        }
        
        return engine;
    }
    
    enableGraphicDebugger(debugGraphicProcessor: GraphicDebugger) {
        this.debugGraphicProcessor = debugGraphicProcessor;
    }

    public loadAtlas(atlasData: Atlas) {
        this.graphicProcessor.loadAtlas(atlasData);
    }

    public add(gameObjects: GameObject[]) {
        for (const gameObject of gameObjects) {
            this.processComponents(gameObject);
        }
    }

    private processComponents(gameObject: GameObject) {
        for (const component of gameObject.components) {
            if (component.getType() == SpriteComponent.Name) {
                this.graphicProcessor.configureSpriteComponent(component as SpriteComponent, gameObject);                
            } else if (component.getType() == RigidBoxComponent.Name) {
                this.debugGraphicProcessor?.configureRigidBoxComponent(component as RigidBoxComponent, gameObject);                
            } else {
                this.gameObjects.push(gameObject);
            }
        }
    }

    public update() {
        this.graphicProcessor.draw();
        this.debugGraphicProcessor?.draw();
    }
}