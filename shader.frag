precision mediump float;

uniform vec4 uMaterialColor;
uniform vec4 uTint;
uniform sampler2D uSampler;
uniform bool isTexture;

varying vec2 vTexCoord;
varying vec3 objPos;

void main(void) {
	gl_FragColor = isTexture ? texture2D(uSampler, vTexCoord) * (uTint / vec4(255, 255, 255, 255)) : uMaterialColor;
	gl_FragColor.a = (objPos.z < -100.0) ? 0.4 : 1.0;
}
