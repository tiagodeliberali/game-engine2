import { AnimationEntity } from "./graphics/Animation";
import { Atlas } from "./graphics/Atlas";
import { EntityData, GraphicEntityManager } from "./graphics/EntityManager";
import { Keys, initKeyboard, isKeyPressed } from "./Keyboard";
import { GraphicProcessor } from "./graphics/GraphicProcessor";

const run = async () => {
  const graphicProcessor = await GraphicProcessor.build();
  
  const atlasData = await Atlas.load("mario");
  graphicProcessor.loadAtlas(atlasData);

  // right now entity manager is tied to atlas, because the model buffer size depends on the tile size defined inside the atlas
  // need to think how to have multiples atlas, so we can have one atlas for each dimension size, like 16x16, 32x32, etc
  const entityManager = new GraphicEntityManager();
  graphicProcessor.loadEntities(entityManager);

  const animations = await AnimationEntity.load("animations");
  
  entityManager.set("coin1", new EntityData(7 * 16, 4 * 16, animations.get("coin_spinning")));
  entityManager.set("coin2", new EntityData(7 * 16, 5 * 16, animations.get("coin_spinning")));
  entityManager.set("character", new EntityData(4 * 16, 3 * 16, animations.get("character_walk_right")));

  initKeyboard();
  
  const update = () => {
      graphicProcessor.draw();

      requestAnimationFrame(update);
    }

    update();
};

run();
