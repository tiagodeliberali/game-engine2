import { AtlasBuilder } from "./graphics/Atlas";
import { Keys, isKeyPressed, subscribeOnKeyDown } from "./inputs/Keyboard";
import { Engine } from "./core/Engine";
import { GameObject } from "./core/GameObject";
import { SpriteComponent } from "./graphics/Sprite";
import { Vec2 } from "./core/Math";
import { RigidBox, RigidBoxComponent, removeWhenTouch } from "./physics/RigidBox";
import { HtmlLogger } from "./debug/HtmlLogger";
import { CodeComponent } from "./code/CodeComponent";
import { Queue } from "./core/Queue";

const run = async () => {
  // debug
  const logger = new HtmlLogger('logElementId');

  const atlas = await AtlasBuilder.load("mario");
  const camera: Array<number> = [0, 0];

  const scene = await Engine.build(logger, true, camera);
  scene.loadAtlas(atlas);

  const coin1 = new GameObject(new Vec2(7 * 16, 4 * 16));
  const coin1Box = new RigidBoxComponent(RigidBox.StaticArea("coin", new Vec2(8, 15), new Vec2(4, 0)));
  coin1Box.onCollision = removeWhenTouch("player", coin1);
  coin1.add(new SpriteComponent(atlas.getSprite("coin_spinning")!));
  coin1.add(coin1Box);

  const coin2 = new GameObject(new Vec2(7 * 16, 5 * 16));
  const coin2Box = new RigidBoxComponent(RigidBox.StaticArea("coin", new Vec2(8, 15), new Vec2(4, 0)));
  coin2Box.onCollision = removeWhenTouch("player", coin2);
  coin2.add(new SpriteComponent(atlas.getSprite("coin_spinning")!));
  coin2.add(coin2Box);

  const key = new GameObject(new Vec2(9 * 16, 3 * 16));
  key.add(new SpriteComponent(atlas.getSprite("key")!));

  // character code
  const characterSpeed = 80;
  const character = new GameObject(new Vec2(4 * 16, 9 * 16));
  const characterSprite = new SpriteComponent(atlas.getSprite("character_idle_right")!);
  const characterBox = new RigidBoxComponent(RigidBox.MovingBox("player", new Vec2(8, 15), new Vec2(4, 0)));

  let lastMove: string;
  let jump = 2;

  let collectedCoins = 0;
  characterBox.onCollision = (tag: string) => {
    if (tag == "Ground" || tag == "Blocks" || tag == "Bridge") {
      logger.set("jump key down", `${jump}`);
      jump = 2;
    }

    if (tag == "coin") {
      collectedCoins++;
      logger.set("coin", `${collectedCoins}`);
    }
  };

  const characterCode = new CodeComponent();

  enum Action {
    WalkRight,
    WalkLeft,
    Jump,
    Idle
  }

  const sourceOfInputs = new Queue<Action>();

  const keyboadrInput = new GameObject(new Vec2(0, 0));
  const keyboardCode = new CodeComponent();
  keyboadrInput.add(keyboardCode);

  keyboardCode.updateAction = () => {
    if (isKeyPressed(Keys.ArrowLeft)) {
      sourceOfInputs.enqueue(Action.WalkLeft);
    }
    else if (isKeyPressed(Keys.ArrowRight)) {
      sourceOfInputs.enqueue(Action.WalkRight);
    }
  };

  keyboardCode.initAction = () => {
    subscribeOnKeyDown(Keys.Space, () => {
      sourceOfInputs.enqueue(Action.Jump);
    });
  };

  characterCode.updateAction = () => {
    const input = sourceOfInputs.dequeue();

    // no actions from input
    if (input == undefined) {
      characterBox.velocity.x = 0;
      if (lastMove == Keys.ArrowLeft) {
        characterSprite.updateSprite(atlas.getSprite("character_idle_left")!);
        lastMove = "";
      } else if (lastMove == Keys.ArrowRight) {
        characterSprite.updateSprite(atlas.getSprite("character_idle_right")!);
        lastMove = "";
      }
    }

    switch (input) {
      case Action.WalkRight:
        characterBox.velocity.x = characterSpeed;
        characterSprite.updateSprite(atlas.getSprite("character_walk_right")!);
        lastMove = Keys.ArrowRight;
        break;
      case Action.WalkLeft:
        characterBox.velocity.x = -characterSpeed;
        characterSprite.updateSprite(atlas.getSprite("character_walk_left")!);
        lastMove = Keys.ArrowLeft;
        break;
      case Action.Jump:
        if (jump > 0) {
          characterBox.velocity.y = 200;
          jump--;
          logger.set("jump key down", `${jump}`);
        }
        break;
    }

    camera[0] = Math.max(0, characterBox.leftX - 64);
    if (characterBox.leftX < 0) {
      characterBox.x = 0;
    }

    logger.set("character position", `${characterBox.position.x},${characterBox.position.y}`);
  };

  character.add(characterSprite);
  character.add(characterBox)
  character.add(characterCode);

  scene.add([coin1, coin2, key, character, keyboadrInput])
  scene.start();
};

run();


