import { AtlasBuilder } from "./graphics/Atlas";
import { Keys, isKeyPressed } from "./Keyboard";
import { Engine } from "./core/Engine";
import { GameObject } from "./core/GameObject";
import { SpriteComponent } from "./graphics/Sprite";

const run = async () => {
  const atlas = await AtlasBuilder.load("mario");
  
  const scene = await Engine.build();
  scene.loadAtlas(atlas);

  const coin1 = new GameObject(7 * 16, 4 * 16);
  coin1.add(new SpriteComponent(atlas.getSprite("coin_spinning")!));

  const coin2 = new GameObject(7 * 16, 5 * 16);
  coin2.add(new SpriteComponent(atlas.getSprite("coin_spinning")!));

  const key = new GameObject(9 * 16, 3 * 16);
  key.add(new SpriteComponent(atlas.getSprite("key")!));

  const character = new GameObject(4 * 16, 3 * 16);
  const characterSprite = new SpriteComponent(atlas.getSprite("character_idle_right")!);
  character.add(characterSprite);

  scene.add([coin1, coin2, key, character])
  
  var lastMove: string;
  const update = () => {
    if (isKeyPressed(Keys.ArrowLeft)) {
      character.updatePosition((x, y) => [x - 1, y]);
      characterSprite.updateSprite(atlas.getSprite("character_walk_left")!);
      lastMove = Keys.ArrowLeft;
    } else if (isKeyPressed(Keys.ArrowRight)) {
      character.updatePosition((x, y) => [x + 1, y]);
      characterSprite.updateSprite(atlas.getSprite("character_walk_right")!);
      lastMove = Keys.ArrowRight;
    } else {
      if (lastMove == Keys.ArrowLeft) {
        characterSprite.updateSprite(atlas.getSprite("character_idle_left")!);
        lastMove = "";
      } else if (lastMove == Keys.ArrowRight) {
        characterSprite.updateSprite(atlas.getSprite("character_idle_right")!);
        lastMove = "";
      }
    }

    scene.update();
    requestAnimationFrame(update);
  }

  update();
};

run();
