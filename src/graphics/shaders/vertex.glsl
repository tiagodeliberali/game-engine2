#version 300 es
#pragma vscode_glsllint_stage: vert

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTextCoord;
layout(location = 2) in vec3 aOffset;
layout(location = 3) in float aDepth;
layout(location = 4) in vec2 aAnimation; // x: tickPerFrame, y: number of frames

uniform vec2 canvas;
uniform float uTick;
uniform vec2 uCamera;

out vec2 vTextCoord;
out float vDepth;

void main()
{
    vTextCoord = aTextCoord;
    vDepth = aDepth + mod(floor(uTick / max(aAnimation.x, 1.0)), max(aAnimation.y, 1.0));
    gl_Position = vec4((aPosition.xyz + aOffset - vec3(uCamera, 0)) * vec3(1.0 / canvas.x, 1.0 / canvas.y, 1.0) - vec3(1, 1, 0), 1.0);
}