import { Position } from "./Position";

const loadImage = (name: string) =>
    new Promise<HTMLImageElement>((resolve) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.src = `./textures/${name}.png`;
    });

// importer for https://www.spritefusion.com/editor
export class Atlas {
    image: HTMLImageElement;
    tileWidth: number;
    tileHeight: number;
    uvs: any;
  
    constructor(image: HTMLImageElement, data: any) {
      this.image = image;
  
      this.tileHeight = data.tileHeight;
      this.tileWidth = data.tileWidth;
      this.uvs = data.uvs;
    }
  
    public static async load(name: string)
    {
      const file = await fetch(`./textures/${name}.json`);
      const data = await file.json();
    
      const image = await loadImage(name);
    
      return new Atlas(image, data);
    }
  
    public buildSliceAt(name: string, position: Position): Float32Array {
      const slice = this.uvs[name];
  
      const y1 = (this.tileHeight * slice.row) / this.image.height;
      const y2 = y1 + slice.height / this.image.height;
  
      const x1 = (this.tileWidth * slice.column) / this.image.width;
      const x2 = x1 + slice.width / this.image.width;
  
      return new Float32Array([
        position.x,                  position.y,                          x1, y1,
        position.x + slice.width,    position.y + slice.height,           x2, y2,
        position.x,                  position.y + slice.height,           x1, y2,
        position.x,                  position.y,                          x1, y1,
        position.x + slice.width,    position.y + slice.height,           x2, y2,
        position.x + slice.width,    position.y,                          x2, y1,
    ]);
    }
  }