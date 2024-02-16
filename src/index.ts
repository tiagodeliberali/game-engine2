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
    image.src = './textures/' + name;
});

class Position {
    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

const buildCoordinates = (image: HTMLImageElement, bottonLeft: Position) => {
    return new Float32Array([
        bottonLeft.x,                   bottonLeft.y,                       0, 0,
        bottonLeft.x + image.width,     bottonLeft.y + image.height,        1, 1,
        bottonLeft.x,                   bottonLeft.y + image.height,        0, 1,
        bottonLeft.x,                   bottonLeft.y,                       0, 0,
        bottonLeft.x + image.width,     bottonLeft.y + image.height,        1, 1,
        bottonLeft.x + image.width,     bottonLeft.y,                       1, 0,
    ]);
}

const run = async () => {
    const gl = document.querySelector("canvas")!.getContext("webgl2")!;
    const program = buildProgram(gl);

    gl.uniform2fv(gl.getUniformLocation(program, "canvas"), [320, 180]);
    
    const aPositionLoc = 0;
    const aTextCoordLoc = 1;
    
    gl.enableVertexAttribArray(aPositionLoc);
    gl.enableVertexAttribArray(aTextCoordLoc);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const treeImage = await loadImage('tree.png');
    const characterImage = await loadImage('character.png');

    const textureTree = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureTree);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 96, 96, 0, gl.RGBA, gl.UNSIGNED_BYTE, treeImage);

    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);


    // slice sheet
    const x = 0;
    const y = 0;
    const y1 = (32 * y) / 256;
    const y2 = y1 + 31/256;
    const x1 = (32 * x) / 128;;
    const x2 = x1 + 31 / 128;
    
    const bufferData = new Float32Array([
        ...buildCoordinates(treeImage, new Position(0, 10)),
        ...buildCoordinates(treeImage, new Position(140, -20)),
        ...buildCoordinates(treeImage, new Position(-140, 0)),
        -.1, -.2,       x1, y1,
        .1, .2,         x2, y2,
        -.1, .2,        x1, y2,
        -.1, -.2,       x1, y1,
        .1, .2,         x2, y2,
        .1, -.2,        x2, y1,
    ]);
    
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false,  4 * 4, 0);
    gl.vertexAttribPointer(aTextCoordLoc, 2, gl.FLOAT, false, 4 * 4, 2 * 4);
    
    gl.drawArrays(gl.TRIANGLES, 0, 18);


    const textureCharacter = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureCharacter);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 128, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, characterImage);

    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.drawArrays(gl.TRIANGLES, 18, 24);
}

run();

