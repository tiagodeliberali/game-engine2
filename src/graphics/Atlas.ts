/*
# importer for https://www.spritefusion.com/editor


build vertical atlas with:
    magick mario_original.png -crop 16x16  +repage  +adjoin  mario_tiles_%010d.png
    magick montage -mode concatenate -tile 1x  mario_tiles_*.png -background none mario.png
*/

import { SpriteData, SpriteManager } from "./Sprite";

const zUnity = 0.00001;

const loadImage = (name: string) =>
    new Promise<HTMLImageElement>((resolve) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.src = `./textures/${name}.png`;
    });

const loadTileMap = async (name: string): Promise<TileMap> => {
    const file = await fetch(`./textures/${name}_map.json`);
    return await file.json();
}

const buildModelBuffer = (tileSize: number) => {
    return new Float32Array([
        0,          0,          0, 1,
        tileSize,   tileSize,   1, 0,
        0,          tileSize,   0, 0,
        0,          0,          0, 1,
        tileSize,   0,          1, 1,
        tileSize,   tileSize,   1, 0,
    ]);
}

class TileMap {
    public tileSize!: number;
    public mapWidth!: number;
    public mapHeight!: number;
    public layers!: [Layer];
}

class Layer {
    public name!: string;
    public collider!: boolean;
    public tiles!: [Tile];
}

class Tile {
    public id!: string;
    public x!: number;
    public y!: number;
}

export class AtlasBuilder {
    public static ITEMS_PER_MODEL_BUFFER: number = 4;
    public static ITEMS_PER_TRANSFORM_BUFFER: number = 4;

    image: HTMLImageElement;
    data: TileMap;
    sprites: SpriteManager;

    constructor(image: HTMLImageElement, data: TileMap, sprites: SpriteManager) {
        this.image = image;
        this.data = data;
        this.sprites = sprites;
    }

    public static async load(name: string) {
        const data = await loadTileMap(name);
        const image = await loadImage(name);
        const sprites = await SpriteManager.load(name);

        const atlas = new AtlasBuilder(image, data, sprites);
        return atlas.build();
    }

    public build(): Atlas {
        const totalTiles = this.data.layers.reduce<number>((prev, elem) => prev + elem.tiles.length, 0);
        const transformBuffer = new Float32Array(totalTiles * AtlasBuilder.ITEMS_PER_TRANSFORM_BUFFER);

        // avoid memory allocation on each iteration
        var layer = new Layer();
        var tile = new Tile();
        
        var offset = 0;

        for (var layerIndex = this.data.layers.length - 1; layerIndex >= 0; layerIndex--)
        {
            layer = this.data.layers[layerIndex];

            for (var tileIndex = 0; tileIndex < layer.tiles.length; tileIndex++)
            {
                tile = layer.tiles[tileIndex];
                
                transformBuffer.set([
                    tile.x * this.data.tileSize,                                // x
                    (this.data.mapHeight - 1 - tile.y) * this.data.tileSize,    // y
                    zUnity * (this.data.layers.length - layerIndex),            // z
                    Number.parseFloat(tile.id),                                 // depth
                ], (offset++) * AtlasBuilder.ITEMS_PER_TRANSFORM_BUFFER);
            }
        }

        return new Atlas(
            buildModelBuffer(this.data.tileSize),
            transformBuffer,
            this.image,
            this.sprites);
    }
}

export class Atlas {
    private sprites: SpriteManager;

    modelBuffer: Float32Array;
    transformBuffer: Float32Array;
    image: HTMLImageElement;
    modelBufferVertexLength: number;
    transformBufferVertexLength: number;

    constructor(modelBuffer: Float32Array, transformBuffer: Float32Array, image: HTMLImageElement, sprites: SpriteManager) {
        this.modelBuffer = modelBuffer;
        this.transformBuffer = transformBuffer;
        this.image = image;
        this.sprites = sprites;

        this.modelBufferVertexLength = this.modelBuffer.length / AtlasBuilder.ITEMS_PER_MODEL_BUFFER;
        this.transformBufferVertexLength = this.transformBuffer.length / AtlasBuilder.ITEMS_PER_TRANSFORM_BUFFER;
    }

    public getSprite(name: string): SpriteData | undefined {
        return this.sprites.get(name);
    }
}