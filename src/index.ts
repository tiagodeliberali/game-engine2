import { AtlasBuilder } from "./graphics/Atlas";
import { Keys, isKeyPressed } from "./inputs/Keyboard";
import { Engine } from "./core/Engine";
import { GameObject } from "./core/GameObject";
import { SpriteComponent } from "./graphics/Sprite";
import { Vec2 } from "./core/Math";
import { RigidBox, RigidBoxComponent } from "./physics/RigidBox";

const run = async () => {
  const atlas = await AtlasBuilder.load("mario");
  const camera: Array<number> = [0, 0];
  
  const scene = await Engine.build(true, camera);
  scene.loadAtlas(atlas);

  const coin1 = new GameObject(new Vec2(7 * 16, 4 * 16));
  coin1.add(new SpriteComponent(atlas.getSprite("coin_spinning")!));

  const coin2 = new GameObject(new Vec2(7 * 16, 5 * 16));
  coin2.add(new SpriteComponent(atlas.getSprite("coin_spinning")!));

  const key = new GameObject(new Vec2(9 * 16, 3 * 16));
  key.add(new SpriteComponent(atlas.getSprite("key")!));

  const characterSpeed = 80;
  const character = new GameObject(new Vec2(4 * 16, 9 * 16));
  const characterSprite = new SpriteComponent(atlas.getSprite("character_idle_right")!);
  const characterBox = new RigidBoxComponent(RigidBox.MovingBox(new Vec2(8, 15), new Vec2(4,0)));
  character.add(characterSprite);
  character.add(characterBox)

  scene.add([coin1, coin2, key, character])
  
  let lastMove: string;
  const update = () => {
    if (isKeyPressed(Keys.ArrowLeft)) {
      characterBox.velocity.x = -characterSpeed;
      characterSprite.updateSprite(atlas.getSprite("character_walk_left")!);
      lastMove = Keys.ArrowLeft;
    } else if (isKeyPressed(Keys.ArrowRight)) {
      characterBox.velocity.x = characterSpeed;
      characterSprite.updateSprite(atlas.getSprite("character_walk_right")!);
      lastMove = Keys.ArrowRight;
    } else {
      characterBox.velocity.x = 0;
      if (lastMove == Keys.ArrowLeft) {
        characterSprite.updateSprite(atlas.getSprite("character_idle_left")!);
        lastMove = "";
      } else if (lastMove == Keys.ArrowRight) {
        characterSprite.updateSprite(atlas.getSprite("character_idle_right")!);
        lastMove = "";
      }
    }

    if (isKeyPressed(Keys.Space)) {
      characterBox.velocity.y = 100;  
    }

    camera[0] = Math.max(0, characterBox.leftX - 64);
    if (characterBox.leftX < 0) {
      characterBox.x = 0;
    }
 
    scene.update();
    requestAnimationFrame(update);
  }

  update();
};

run();
