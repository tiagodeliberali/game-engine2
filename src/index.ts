import { Atlas, AtlasBuilder } from "./graphics/Atlas";
import { Keys, isKeyPressed, subscribeOnKeyDown } from "./inputs/Keyboard";
import { Engine } from "./core/Engine";
import { GameObject } from "./core/GameObject";
import { SpriteComponent } from "./graphics/Sprite";
import { Vec2 } from "./core/Math";
import { RigidBox, RigidBoxComponent, removeWhenTouch } from "./physics/RigidBox";
import { HtmlLogger } from "./debug/HtmlLogger";
import { CodeComponent } from "./code/CodeComponent";
import { Queue } from "./core/Queue";
import { ServerConector } from "./network/Connector";
import { Action, UserActionData } from "./network/Core";
import { Params } from "./inputs/Params";

const basicBlocks = (atlas: Atlas, scene: Engine) => {
  const coin1 = new GameObject(new Vec2(7 * 16, 4 * 16), "coin1");
  const coin1Box = new RigidBoxComponent(RigidBox.StaticArea("coin", new Vec2(8, 15), new Vec2(4, 0)));
  coin1Box.onCollision = removeWhenTouch("player", coin1);
  coin1.add(new SpriteComponent(atlas.getSprite("coin_spinning")!));
  coin1.add(coin1Box);

  const coin2 = new GameObject(new Vec2(7 * 16, 5 * 16), "coin2");
  const coin2Box = new RigidBoxComponent(RigidBox.StaticArea("coin", new Vec2(8, 15), new Vec2(4, 0)));
  coin2Box.onCollision = removeWhenTouch("player", coin2);
  coin2.add(new SpriteComponent(atlas.getSprite("coin_spinning")!));
  coin2.add(coin2Box);

  const key = new GameObject(new Vec2(9 * 16, 3 * 16), "key");
  key.add(new SpriteComponent(atlas.getSprite("key")!));

  scene.add([coin1, coin2, key]);
}

const buildCharacter = (atlas: Atlas, logger: HtmlLogger, queue: Queue<UserActionData>, scene: Engine, debugName: string) => {
  const characterSpeed = 80;
  const character = new GameObject(new Vec2(4 * 16, 9 * 16), debugName);
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
  characterCode.updateAction = (delta) => {
    // the concept is based on one action per update. So, whenever we have more than one action per update, like in jump, we need to consume multiple actions at once.
    // also, even the local player produces and consumes from queues
    const userData = queue.dequeue();
    
    if (userData != undefined) {  
      character.setPosition(new Vec2(userData.x, userData.y));
    }

    const input = userData?.action;

    // if it is undefined, it means that no event was generated, so we can left physics engine to act.
    // since we have no position data, we can have mismatches between players, but it will be fixed in the next action received.
    if (input == undefined) {
      characterBox.velocity.x = 0;
      if (lastMove == Keys.ArrowLeft) {
        characterSprite.updateSprite(atlas.getSprite("character_idle_left")!);
        lastMove = "";
      } else if (lastMove == Keys.ArrowRight) {
        characterSprite.updateSprite(atlas.getSprite("character_idle_right")!);
        lastMove = "";
      }
      return;
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

          // jump need to call updateAction again because it happens in parallel to movement.
          // Without this extra call we have a crazy desalignemnt on positions causing a glitch on the UI
          characterCode.updateAction!(delta);
        }
        break;
    }

    // TODO: we need to have a more elegant way to define borders of the world
    if (characterBox.leftX < 0) {
      characterBox.x = 0;
    }
  };

  character.add(characterSprite);
  character.add(characterBox)
  character.add(characterCode);

  scene.add([character]);

  return { character, characterBox };
}

const run = async () => {
  // debug
  const logger = new HtmlLogger('logElementId');

  const atlas = await AtlasBuilder.load("mario");
  const camera: Array<number> = [0, 0];

  const scene = await Engine.build(logger, true, camera);
  scene.loadAtlas(atlas);

  basicBlocks(atlas, scene);

  // get unique id
  const params = new Params(window.location);
  const username = params.getQueryParam("id");

  // Socket.IO
  const connector = new ServerConector(logger, (queue: Queue<UserActionData>, debugname: string) => buildCharacter(atlas, logger, queue, scene, debugname).character);
  
  // main character code
  const { characterBox } = buildCharacter(atlas, logger, connector.localQueue, scene, username ?? "locaPlayer");

  const localCharacterCodeGameObject = new GameObject(new Vec2(0, 0), "localCharacterCodeGameObject");
  const localCharacterCode = new CodeComponent(100);
  localCharacterCodeGameObject.add(localCharacterCode);

  localCharacterCode.updateAction = () => {
    camera[0] = Math.max(0, characterBox.leftX - 64);
    
    if (isKeyPressed(Keys.ArrowLeft)) {
      logger.set("index: run", "emit is ArrowLeft: x=" + characterBox.position.x);
      connector.emitLocalAction(Action.WalkLeft, characterBox.position);
    }
    else if (isKeyPressed(Keys.ArrowRight)) {
      logger.set("index: run", "emit is WalkRight: x=" + characterBox.position.x);
      connector.emitLocalAction(Action.WalkRight, characterBox.position);
    }
  };

  localCharacterCode.initAction = () => {
    subscribeOnKeyDown(Keys.Space, () => {
      connector.emitLocalAction(Action.Jump, characterBox.position);
    });
  };

  scene.add([localCharacterCodeGameObject]);
  scene.start();

  if (username != null) {
    connector.connect(username);
  }
};

run();


