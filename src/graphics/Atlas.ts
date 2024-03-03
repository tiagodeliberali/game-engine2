/*
# importer for https://www.spritefusion.com/editor


build vertical atlas with:
    magick mario_original.png -crop 16x16  +repage  +adjoin  mario_tiles_%010d.png
    magick montage -mode concatenate -tile 1x  mario_tiles_*.png -background none mario.png
*/

import { SpriteComponent, SpriteEntity } from "./Sprite";

const zUnity = 0.00001;

const loadImage = (name: string) =>
    new Promise<HTMLImageElement>((resolve) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.src = `./textures/${name}.png`;
    });

const loadData = async (name: string): Promise<AtlasData> => {
    const file = await fetch(`./textures/${name}_map.json`);
    return await file.json();
}

class AtlasData {
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

export class Atlas {
    public static ITEMS_PER_MODEL_BUFFER: number = 4;
    public static ITEMS_PER_TRANSFORM_BUFFER: number = 4;

    image: HTMLImageElement;
    data: AtlasData;
    sprites: SpriteEntity;

    constructor(image: HTMLImageElement, data: AtlasData, sprites: SpriteEntity) {
        this.image = image;
        this.data = data;
        this.sprites = sprites;
    }

    public static async load(name: string) {
        const data = await loadData(name);
        const image = await loadImage(name);
        const sprites = await SpriteEntity.load(name);

        const atlas = new Atlas(image, data, sprites);

        return atlas.build();
    }

    public build(): AtlasVertexBuffer {
        const totalTiles = this.data.layers.reduce<number>((prev, elem) => prev + elem.tiles.length, 0);

        const transformBuffer = new Float32Array(totalTiles * Atlas.ITEMS_PER_TRANSFORM_BUFFER);

        // avoid memory allocation on each iteration
        var layer = new Layer();
        var tile = new Tile();
        var offset = 0;

        const modelBuffer = new Float32Array([
            0,                     0,                       0, 1,
            this.data.tileSize,    this.data.tileSize,      1, 0,
            0,                     this.data.tileSize,      0, 0,
            0,                     0,                       0, 1,
            this.data.tileSize,    0,                       1, 1,
            this.data.tileSize,    this.data.tileSize,      1, 0,
        ]);
        
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
                ], (offset++) * Atlas.ITEMS_PER_TRANSFORM_BUFFER);
            }
        }
        return new AtlasVertexBuffer(modelBuffer, transformBuffer, this.image, this.sprites);
    }
}

export class AtlasVertexBuffer {
    private sprites: SpriteEntity;

    modelBuffer: Float32Array;
    transformBuffer: Float32Array;
    image: HTMLImageElement;
    modelBufferVertexLength: number;
    transformBufferVertexLength: number;
    modelBufferReference: WebGLBuffer | undefined;

    constructor(modelBuffer: Float32Array, transformBuffer: Float32Array, image: HTMLImageElement, sprites: SpriteEntity) {
        this.modelBuffer = modelBuffer;
        this.transformBuffer = transformBuffer;
        this.image = image;
        this.sprites = sprites;

        this.modelBufferVertexLength = this.modelBuffer.length / Atlas.ITEMS_PER_MODEL_BUFFER;
        this.transformBufferVertexLength = this.transformBuffer.length / Atlas.ITEMS_PER_TRANSFORM_BUFFER;
    }

    public getSprite(name: string): SpriteComponent {
        return this.sprites.get(name);
    }
}