import { Atlas } from "./graphics/Atlas";
import { Keys, isKeyPressed } from "./Keyboard";
import { Engine } from "./core/Engine";
import { GameObject } from "./core/GameObject";

const run = async () => {
  const atlas = await Atlas.load("mario");
  
  const scene = await Engine.build();
  scene.loadAtlas(atlas);

  const coin1 = new GameObject(7 * 16, 4 * 16);
  coin1.add(atlas.getSprite("coin_spinning"));

  const coin2 = new GameObject(7 * 16, 5 * 16);
  coin2.add(atlas.getSprite("coin_spinning"));

  const key = new GameObject(9 * 16, 3 * 16);
  key.add(atlas.getSprite("key"));

  const character = new GameObject(4 * 16, 3 * 16);
  const characterSprite = atlas.getSprite("character_walk_right");
  character.add(characterSprite);

  scene.add([coin1, coin2, key, character])
  
  const update = () => {
    scene.update();
    requestAnimationFrame(update);
  }

  update();
};

run();
