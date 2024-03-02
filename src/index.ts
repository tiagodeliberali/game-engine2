import { AnimationEntity } from "./graphics/Animation";
import { Atlas } from "./graphics/Atlas";
import { EntityData, GraphicEntityManager } from "./graphics/EntityManager";
import { Keys, initKeyboard, isKeyPressed } from "./Keyboard";
import { GraphicProcessor } from "./graphics/GraphicProcessor";

const run = async () => {
  const graphicProcessor = await GraphicProcessor.build();
  
  const atlasData = await Atlas.load("mario");
  graphicProcessor.loadAtlas(atlasData);

  const entityManager = new GraphicEntityManager(atlasData);
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
