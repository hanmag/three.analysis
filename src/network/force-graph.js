import nodeVertexShaderSource from '../shaders/node.vertex.glsl';
import nodeFragmentShaderSource from '../shaders/node.fragment.glsl';

import * as THREE from 'three';
import ngraph from 'ngraph.graph';
import forcelayout3d from 'ngraph.forcelayout3d';

const CAMERA_DISTANCE2NODES_FACTOR = 100;
const NODE_BASE_SIZE = 5;

export default {
    name: 'network',
    apply: function (state) {
        // Setup graph
        const graph = ngraph();
        state.graphData.forEach(item => {
            graph.addNode(item[state.idField]);
            if (Array.isArray(item[state.linkField])) {
                item[state.linkField].forEach(link => {
                    graph.addLink(item[state.idField], link);
                });
            }
        });
        const layout = forcelayout3d(graph);
        layout.graph = graph; // Attach graph reference to layout

        // Create nodes
        state.graphData.forEach(item => {
            let nodeRadius = NODE_BASE_SIZE * item._size;
            let material = new THREE.ShaderMaterial({
                uniforms: {
                    uColor: {
                        value: new THREE.Color(item._color)
                    },
                    uCenter: {
                        value: new THREE.Vector3(0, 0, 0)
                    }
                },
                vertexShader: nodeVertexShaderSource,
                fragmentShader: nodeFragmentShaderSource,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                transparent: true
            });
            let sprite = new THREE.Mesh(new THREE.SphereGeometry(nodeRadius, 16, 16), material);
            state.webglScene.add(item._sprite = sprite);
        });

        // Create links

        if (state.camera.position.x === 0 && state.camera.position.y === 0) {
            // If camera still in default position (not user modified)
            state.camera.position.z = Math.cbrt(state.graphData.length) * CAMERA_DISTANCE2NODES_FACTOR;
            state.camera.lookAt(state.webglScene.position);
        }

        // Start rendering
        state.onFrame = layoutTick;
        this.inUse = true;

        function layoutTick() {
            layout.step();

            // Update nodes position
            state.graphData.forEach(item => {
                const sprite = item._sprite;
                if (!sprite) return;
                const pos = layout.getNodePosition(item[state.idField]);
                sprite.position.x = pos.x;
                sprite.position.y = pos.y;
                sprite.position.z = pos.z;
                sprite.material.uniforms.uCenter.value = pos;
            });
            // Update links position
        }
    },
    cancel: function (state) {
        this.inUse = false;
    },
    reset: function (state) {
        while (state.webglScene.children.length) {
            state.webglScene.remove(state.webglScene.children[0])
        } // Clear the place
    }
};