#version 300 es
#pragma vscode_glsllint_stage: vert

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec4 aColor;

uniform vec2 canvas;

out vec4 vColor;

void main()
{
    vColor = aColor;
    gl_Position = vec4(aPosition.xyz * vec3(1.0 / canvas.x, 1.0 / canvas.y, 1.0) - vec3(1, 1, 0), 1.0);
}