import nodeVertexShaderSource from '../shaders/node.vertex.glsl';
import nodeFragmentShaderSource from '../shaders/node.fragment.glsl';

import * as TWEEN from 'es6-tween';
import * as THREE from 'three';

const PI = 3.1415926;
const CAMERA_DISTANCE2NODES_FACTOR = 100;
const NODE_BASE_SIZE = 4;
const PLANEMATERIAL = new THREE.MeshBasicMaterial({
    color: 0xf1f1f1,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.3
});
const LEFT_PLANE = new THREE.Mesh(new THREE.PlaneGeometry(120, 120, 1), PLANEMATERIAL);
LEFT_PLANE.rotation.set(0, PI / 2, 0);
LEFT_PLANE.position.x -= 120;
const BOTTOM_PLANE = new THREE.Mesh(new THREE.PlaneGeometry(240, 120, 1), PLANEMATERIAL);
BOTTOM_PLANE.rotation.set(PI / 2, 0, 0);
BOTTOM_PLANE.position.y -= 60;
const BACK_PLANE = new THREE.Mesh(new THREE.PlaneGeometry(240, 120, 1), PLANEMATERIAL);
BACK_PLANE.position.z -= 60;
const PLANES = [LEFT_PLANE, BOTTOM_PLANE, BACK_PLANE];

function drawCords(state) {
    // Re-drawing 3d-plane
    for (let i = 0; i < state.webglScene.children.length; i++) {
        if (state.webglScene.children[i] && state.webglScene.children[i].type === 'Plane')
            state.webglScene.remove(state.webglScene.children[i--])
    }

    state.webglScene.add.apply(state.webglScene, PLANES);

    new TWEEN.Tween(state.camera.position).to({
        x: CAMERA_DISTANCE2NODES_FACTOR,
        y: CAMERA_DISTANCE2NODES_FACTOR,
        z: Math.cbrt(state.graphData.length) * CAMERA_DISTANCE2NODES_FACTOR
    }, 600).easing(TWEEN.Easing.Quadratic.InOut).on(() => {
        state.camera.lookAt(state.webglScene.position);
    }).start();
}

export default {
    name: 'scatter',
    apply: function (state) {
        // draw coordinate system
        drawCords(state);

        if (state.resetData) {
            this.layout(state);
        } else {

        }

        this.inUse = true;
    },
    cancel: function (state) {},
    reset: function (state) {},
    layout: function (state) {

    }
};