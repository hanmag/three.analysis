import nodeVertexShaderSource from '../shaders/node.vertex.glsl';
import nodeFragmentShaderSource from '../shaders/node.fragment.glsl';

import * as TWEEN from 'es6-tween';
import * as THREE from 'three';

const CAMERA_DISTANCE2NODES_FACTOR = 90;
const NODE_BASE_SIZE = 4;
const PLANEMATERIAL = new THREE.MeshBasicMaterial({
    color: 0xdddddd,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.2
});
const LEFT_PLANE = new THREE.Mesh(new THREE.PlaneGeometry(200, 120, 1), PLANEMATERIAL);

function drawCords(state) {
    // Re-drawing 3d-plane
    for (let i = 0; i < state.webglScene.children.length; i++) {
        if (state.webglScene.children[i] && state.webglScene.children[i].type === 'Plane')
            state.webglScene.remove(state.webglScene.children[i--])
    }

    state.webglScene.add(LEFT_PLANE);

    new TWEEN.Tween(state.camera.position).to({
        x: 0,
        y: 0,
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