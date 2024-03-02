import { initKeyboard } from "../Keyboard";
import { AtlasVertexBuffer } from "../graphics/Atlas";
import { GraphicEntityManager } from "../graphics/EntityManager";
import { GraphicProcessor } from "../graphics/GraphicProcessor";
import { SpriteComponent } from "../graphics/Sprite";
import { GameObject } from "./GameObject";

export class Engine {
    private graphicProcessor: GraphicProcessor;
    private gameObjects: GameObject[] = [];
    private entityManager: GraphicEntityManager | undefined;

    private constructor(graphicProcessor: GraphicProcessor) {
        this.graphicProcessor = graphicProcessor;
        initKeyboard();
    }

    public static async build() {
        const graphicProcessor = await GraphicProcessor.build();
        return new Engine(graphicProcessor);
    }

    public loadAtlas(atlasData: AtlasVertexBuffer) {
        this.entityManager = new GraphicEntityManager(atlasData);
        this.graphicProcessor.loadAtlas(atlasData);
        this.graphicProcessor.loadEntities(this.entityManager);
    }

    public add(gameObjects: GameObject[]) {
        for (const gameObject of gameObjects) {
            this.processComponents(gameObject);
        }
        this.gameObjects = this.gameObjects.concat(gameObjects);
    }

    private processComponents(gameObject: GameObject) {
        const em = this.entityManager!;
        for (const component of gameObject.components) {
            if (component.is(SpriteComponent.Name)) {
                em.set(gameObject.id, (component as SpriteComponent).entityData!);
            }
        }
    }

    public update() {
        this.graphicProcessor.draw();
    }
}