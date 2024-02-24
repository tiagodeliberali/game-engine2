import { Position } from "./Position";

/*
build vertical atlas with:
    magick mario_original.png -crop 16x16  +repage  +adjoin  mario_tiles_%010d.png
    magick montage -mode concatenate -tile 1x  mario_tiles_*.png -background none mario.png
*/

const loadImage = (name: string) =>
    new Promise<HTMLImageElement>((resolve) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.src = `./textures/${name}.png`;
    });

const loadData = async (name: string): Promise<AtlasData> => {
    const file = await fetch(`./textures/${name}.json`);
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

// importer for https://www.spritefusion.com/editor
export class Atlas {
    image: HTMLImageElement;
    data: AtlasData;
  
    constructor(image: HTMLImageElement, data: AtlasData) {
      this.image = image;
      this.data = data;
    }
  
    public static async load(name: string)
    {
      const data = await loadData(name);    
      const image = await loadImage(name);
    
      return new Atlas(image, data);
    }

    public build(): Float32Array {
        const totalTiles = this.data.layers.reduce<number>((prev, elem) => prev + elem.tiles.length, 0);
        const minX = this.data.layers.reduce<number>((prev, elem) => Math.min(prev, elem.tiles.reduce((a, b) => Math.min(a, b.x), 10000)), 10000);
        const minY = this.data.layers.reduce<number>((prev, elem) => Math.min(prev, elem.tiles.reduce((a, b) => Math.min(a, b.y), 10000)), 10000);
        const maxY = this.data.layers.reduce<number>((prev, elem) => Math.max(prev, elem.tiles.reduce((a, b) => Math.max(a, b.y), -10000)), -10000);

        // each tile is represented by 6 vertices. 
        // Each vertice contains positions (x, y) uv mapping (u, v) and index representing the position
        const infoPerTile = 6 * 5;
        const result = new Float32Array(totalTiles * infoPerTile);

        // avoid memory allocation on each iteration
        var layer = new Layer();
        var tile = new Tile();
        var position = new Position(0, 0);
        var offset = 0;
        
        for (var layerIndex = this.data.layers.length - 1; layerIndex >= 0; layerIndex--)
        {
            layer = this.data.layers[layerIndex];

            for (var tileIndex = 0; tileIndex < layer.tiles.length; tileIndex++)
            {
                tile = layer.tiles[tileIndex];
                position.set(tile.x * this.data.tileSize - minX, maxY - minY - tile.y * this.data.tileSize);

                result.set([
                    position.x,                         position.y,                          0, 1,       Number.parseFloat(tile.id),
                    position.x + this.data.tileSize,    position.y + this.data.tileSize,     1, 0,       Number.parseFloat(tile.id),
                    position.x,                         position.y + this.data.tileSize,     0, 0,       Number.parseFloat(tile.id),
                    position.x,                         position.y,                          0, 1,       Number.parseFloat(tile.id),
                    position.x + this.data.tileSize,    position.y,                          1, 1,       Number.parseFloat(tile.id),
                    position.x + this.data.tileSize,    position.y + this.data.tileSize,     1, 0,       Number.parseFloat(tile.id)
                ], (offset++) * infoPerTile);
            }
        }
        return result;
    }
  }