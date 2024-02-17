const vertexShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: vert

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTextCoord;

uniform vec2 canvas;

out vec2 vTextCoord;

void main()
{
    vTextCoord = aTextCoord;
    gl_Position = vec4(aPosition, 1.0) * vec4(1.0 / canvas.x, 1.0 / canvas.y, 1.0, 1.0);
}`;

const fragmentShaderSource = `#version 300 es
#pragma vscode_glsllint_stage: frag

precision mediump float;

in vec2 vTextCoord;
uniform sampler2D uSampler;

out vec4 fragColor;

void main()
{
    fragColor = texture(uSampler, vTextCoord);
}`;

const loadShader = (
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    type: number,
    source: string,
): WebGLShader => {
    const shader = gl.createShader(type)!;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);

    return shader;
};

const buildProgram = (gl: WebGL2RenderingContext): WebGLProgram => {
    const program = gl.createProgram()!;

    const vertexShader = loadShader(gl, program, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = loadShader(gl, program, gl.FRAGMENT_SHADER, fragmentShaderSource);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(gl.getShaderInfoLog(vertexShader));
        console.log(gl.getShaderInfoLog(fragmentShader));
    }

    gl.useProgram(program);

    return program;
}

const loadImage = (name: string) => new Promise<HTMLImageElement>(resolve => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.src = `./textures/${name}.png`;
});

const loadAtlas = async (name: string): Promise<Atlas> => {
    const file = await fetch(`./textures/${name}.json`);
    const data = await file.json();
    
    const image = await loadImage(name);;

    return new Atlas(image, data);
}

class Atlas {
    image: HTMLImageElement;
    tileWidth: number;
    tileHeight: number;
    uvs: any;

    constructor(image: HTMLImageElement, data: any)
    {
        this.image = image;

        this.tileHeight = data.tileHeight;
        this.tileWidth = data.tileWidth;
        this.uvs = data.uvs;
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

class Position {
    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

const run = async () => {
    const gl = document.querySelector("canvas")!.getContext("webgl2")!;
    const program = buildProgram(gl);

    gl.uniform2fv(gl.getUniformLocation(program, "canvas"), [48, 32]);
    
    const aPositionLoc = 0;
    const aTextCoordLoc = 1;
    
    gl.enableVertexAttribArray(aPositionLoc);
    gl.enableVertexAttribArray(aTextCoordLoc);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const dungeonAtlas = await loadAtlas('dungeon');

    const textureTree = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureTree);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, dungeonAtlas.image.width, dungeonAtlas.image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, dungeonAtlas.image);

    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);


    const bufferData = new Float32Array([
        ...dungeonAtlas.buildSliceAt("L", new Position(-48,     16)),
        ...dungeonAtlas.buildSliceAt("_", new Position(-32,     16)),
        ...dungeonAtlas.buildSliceAt("J", new Position(-16,     16)),
        ...dungeonAtlas.buildSliceAt("BG5", new Position(0,     16)),
        ...dungeonAtlas.buildSliceAt("BG0", new Position(16,    16)),
        ...dungeonAtlas.buildSliceAt("BG4", new Position(32,    16)),

        ...dungeonAtlas.buildSliceAt("BG0", new Position(-16,   0)),
        ...dungeonAtlas.buildSliceAt("BG1", new Position(0,     0)),
        ...dungeonAtlas.buildSliceAt("BG2", new Position(16,    0)),
        ...dungeonAtlas.buildSliceAt("BG3", new Position(32,    0)),

        ...dungeonAtlas.buildSliceAt("role", new Position(-48,   -16)),
        ...dungeonAtlas.buildSliceAt("BG1", new Position(-16,   -16)),
        ...dungeonAtlas.buildSliceAt("/", new Position(0,     -16)),
        ...dungeonAtlas.buildSliceAt("-", new Position(16,      -16)),
        ...dungeonAtlas.buildSliceAt("-", new Position(32,      -16)),

        ...dungeonAtlas.buildSliceAt("F", new Position(-48,     -32)),
        ...dungeonAtlas.buildSliceAt("-", new Position(-32,     -32)),
        ...dungeonAtlas.buildSliceAt("-", new Position(-16,     -32)),
        ...dungeonAtlas.buildSliceAt(".", new Position(0,       -32)),
        ...dungeonAtlas.buildSliceAt("BG1", new Position(16,      -32)),
        ...dungeonAtlas.buildSliceAt("BG0", new Position(32,      -32)),
    ]);
    
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false,  4 * 4, 0);
    gl.vertexAttribPointer(aTextCoordLoc, 2, gl.FLOAT, false, 4 * 4, 2 * 4);
    
    gl.drawArrays(gl.TRIANGLES, 0, bufferData.length);
}

run();

