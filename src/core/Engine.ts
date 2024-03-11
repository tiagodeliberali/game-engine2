import { initKeyboard } from "../inputs/Keyboard";
import { Atlas } from "../graphics/Atlas";
import { GraphicDebugger } from "../graphics/GraphicDebugger";
import { GraphicProcessor } from "../graphics/GraphicProcessor";
import { SpriteComponent } from "../graphics/Sprite";
import { PhysicProcessor } from "../physics/PhysicProcessor";
import { RigidBoxComponent } from "../physics/RigidBox";
import { GameObject } from "./GameObject";

export class Engine {
    private graphicProcessor: GraphicProcessor;
    private physicProcessor: PhysicProcessor;
    private debugGraphicProcessor: GraphicDebugger | undefined;
    private gameObjects: GameObject[] = [];

    private constructor(graphicProcessor: GraphicProcessor, physicProcessor: PhysicProcessor) {
        this.graphicProcessor = graphicProcessor;
        this.physicProcessor = physicProcessor;
        initKeyboard();
    }

    public static async build(enableDebugtger: boolean) {
        const graphicProcessor = await GraphicProcessor.build();
        const debugGraphicProcessor = await GraphicDebugger.build();
        const engine = new Engine(graphicProcessor, new PhysicProcessor());
        
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
        this.physicProcessor.loadAtlas(atlasData);
        this.debugGraphicProcessor?.loadAtlas(atlasData);
    }

    public add(gameObjects: GameObject[]) {
        for (const gameObject of gameObjects) {
            this.processComponents(gameObject);
        }
    }

    private processComponents(gameObject: GameObject) {
        for (const component of gameObject.componentsIterable) {
            if (component.typeName == SpriteComponent.Name) {
                this.graphicProcessor.configureSpriteComponent(component as SpriteComponent);                
            } 
            else if (component.typeName == RigidBoxComponent.Name) {
                this.physicProcessor.configureRigidBoxComponent(component as RigidBoxComponent);                
                this.debugGraphicProcessor?.configureRigidBoxComponent(component as RigidBoxComponent);                
            } 
            else {
                this.gameObjects.push(gameObject);
            }
        }
    }

    public update() {
        const camera = [100, 10];
        this.graphicProcessor.draw(camera);
        this.debugGraphicProcessor?.draw(camera);
        this.physicProcessor.update();
    }
}