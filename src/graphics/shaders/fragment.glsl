#version 300 es
#pragma vscode_glsllint_stage: frag

precision mediump float;

in vec2 vTextCoord;
in float vDepth;
uniform mediump sampler2DArray uSampler;

out vec4 fragColor;

void main()
{
    fragColor = texture(uSampler, vec3(vTextCoord, vDepth));
}