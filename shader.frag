precision mediump float;

uniform vec4 uMaterialColor;
uniform vec4 uTint;
uniform sampler2D uSampler;
uniform bool isTexture;

varying vec2 vTexCoord;
varying vec3 objPos;

uniform float base;

void main(void) {
	gl_FragColor = isTexture ? texture2D(uSampler, vTexCoord) * (uTint / vec4(255, 255, 255, 255)) : uMaterialColor;
	gl_FragColor.z = objPos.z > base ? 1.0 : 0.0;
}
