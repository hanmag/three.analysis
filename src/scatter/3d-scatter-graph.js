import nodeVertexShaderSource from '../shaders/node.vertex.glsl';
import nodeFragmentShaderSource from '../shaders/node.fragment.glsl';

import * as TWEEN from 'es6-tween';
import * as THREE from 'three';

const CAMERA_DISTANCE2NODES_FACTOR = 140;
const NODE_BASE_SIZE = 4;
const LINEMATERIAL = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.15
});

export default {
    name: 'scatter',
    apply: function (state) {
        // Setup graph
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