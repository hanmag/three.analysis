uniform vec3 uColor;
uniform vec3 uCenter;
varying vec3 vPosition;

void main () {

  gl_FragColor = vec4(uColor, 1.0 /  pow(length(vPosition), 1.0));
}