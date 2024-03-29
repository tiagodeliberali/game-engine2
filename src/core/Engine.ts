import { initKeyboard } from "../inputs/Keyboard";
import { Atlas } from "../graphics/Atlas";
import { GraphicDebugger } from "../graphics/GraphicDebugger";
import { GraphicProcessor } from "../graphics/GraphicProcessor";
import { SpriteComponent } from "../graphics/Sprite";
import { PhysicProcessor } from "../physics/PhysicProcessor";
import { RigidBoxComponent } from "../physics/RigidBox";
import { GameObject } from "./GameObject";
import { CodeProcessor } from "../code/CodeProcessor";
import { CodeComponent } from "../code/CodeComponent";
import { ILogger } from "../debug/HtmlLogger";

const fixedUpdateDelta = 1.0 / 60;

export class Engine {
    private graphicProcessor: GraphicProcessor;
    private physicProcessor: PhysicProcessor;
    private debugGraphicProcessor: GraphicDebugger | undefined;
    private codeProcessor: CodeProcessor | undefined;
    private logger: ILogger;
    private camera: Array<number>;

    private constructor(graphicProcessor: GraphicProcessor, physicProcessor: PhysicProcessor, codeProcessor: CodeProcessor, logger: ILogger, camera: Array<number>) {
        this.graphicProcessor = graphicProcessor;
        this.physicProcessor = physicProcessor;
        this.codeProcessor = codeProcessor;
        this.logger = logger;
        this.camera = camera;
    }

    static async build(logger: ILogger, enableDebugger: boolean, camera: Array<number>) {
        const graphicProcessor = await GraphicProcessor.build();
        const debugGraphicProcessor = await GraphicDebugger.build();
        const engine = new Engine(graphicProcessor, new PhysicProcessor(logger), new CodeProcessor(), logger, camera);

        if (enableDebugger) {
            engine.enableGraphicDebugger(debugGraphicProcessor);
        }

        return engine;
    }

    enableGraphicDebugger(debugGraphicProcessor: GraphicDebugger) {
        this.debugGraphicProcessor = debugGraphicProcessor;
    }

    loadAtlas(atlasData: Atlas) {
        this.graphicProcessor.loadAtlas(atlasData);
        this.physicProcessor.loadAtlas(atlasData);
        this.debugGraphicProcessor?.loadAtlas(atlasData);
    }

    add(gameObjects: GameObject[]) {
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
            else if (component.typeName == CodeComponent.Name) {
                this.codeProcessor?.configureCodeComponent(component as CodeComponent);
            }
            else {
                throw new Error(`Unknown component type: ${component.typeName}`);
            }
        }
    }

    init() {
        initKeyboard();
        this.codeProcessor?.init();
    }

    update(delta: number) {
        this.graphicProcessor.draw(this.camera);
        this.debugGraphicProcessor?.draw(this.camera);
        this.codeProcessor?.update(delta);
    }


    fixedUpdate(delta: number) {
        while (delta > fixedUpdateDelta) {
            this.fixedUpdateSequence(fixedUpdateDelta);
            delta -= fixedUpdateDelta;
        }

        if (delta > 0.0001) {
            this.fixedUpdateSequence(delta);
        }
    }

    private fixedUpdateSequence(delta: number) {
        this.codeProcessor?.fixedUpdate(delta);
        this.physicProcessor.fixedUpdate(delta);
    }

    start() {
        this.init();
        
        let time = performance.now();
        
        const update = () => {
            const newTime = performance.now();
            const delta = (newTime - time) / 1000;
            time = newTime;

            // this.logger.startSessions();
            this.fixedUpdate(delta)
            this.update(delta);
            // this.logger.endSessions();

            // debug
            this.logger.set("Engine: delta", `${Math.round(delta)}`);
            

            requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
    }
}