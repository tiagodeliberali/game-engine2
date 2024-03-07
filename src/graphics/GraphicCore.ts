const loadShader = async (
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    type: number,
    name: string,
): Promise<WebGLShader> => {
    const file = await fetch(`./shaders/${name}.glsl`);
    const source = await file.text();

    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);

    return shader;
};

export const buildProgram = async (canvasName: string, vertex: string, fragment: string): Promise<[WebGL2RenderingContext, WebGLProgram]> => {
    const canvas = document.querySelector<HTMLCanvasElement>(canvasName)!;
    const gl = canvas.getContext("webgl2")!;
    const program = gl.createProgram()!;

    const vertexShader = await loadShader(gl, program, gl.VERTEX_SHADER, vertex);
    const fragmentShader = await loadShader(gl, program, gl.FRAGMENT_SHADER, fragment);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(gl.getShaderInfoLog(vertexShader));
        console.log(gl.getShaderInfoLog(fragmentShader));
    }

    gl.useProgram(program);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform2fv(gl.getUniformLocation(program, "canvas"), [canvas.width / 2, canvas.height / 2]);

    return [gl!, program!];
};
