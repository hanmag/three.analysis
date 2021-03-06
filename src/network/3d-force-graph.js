import nodeVertexShaderSource from '../shaders/node.vertex.glsl';
import nodeFragmentShaderSource from '../shaders/node.fragment.glsl';

import * as TWEEN from 'es6-tween';
import * as THREE from 'three';
import ngraph from 'ngraph.graph';
import forcelayout3d from 'ngraph.forcelayout3d';

const CAMERA_DISTANCE2NODES_FACTOR = 140;
const NODE_BASE_SIZE = 4;
const COOLDOWNTICKS = 70;
const LINEMATERIAL = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.15
});
let cntTicks = 0;

function layoutTick(state) {
    if (cntTicks++ > COOLDOWNTICKS) {
        state.onFrame = null; // Stop ticking graph
    }

    state.network.layout.step();

    // Update nodes position
    state.network.nodes.forEach(node => {
        const sprite = node.sprite;
        if (!sprite) return;
        const pos = state.network.layout.getNodePosition(node.id);
        sprite.position.x = pos.x;
        sprite.position.y = pos.y;
        sprite.position.z = pos.z;
    });
    // Update links position
    state.network.links.forEach(link => {
        const line = link.line;
        if (!line) return;

        const pos = state.network.layout.getLinkPosition(state.network.layout.graph.getLink(link.sid, link.tid).id),
            start = pos['from'],
            end = pos['to'],
            linePos = line.geometry.attributes.position;

        linePos.array[0] = start.x;
        linePos.array[1] = start.y || 0;
        linePos.array[2] = start.z || 0;
        linePos.array[3] = end.x;
        linePos.array[4] = end.y || 0;
        linePos.array[5] = end.z || 0;

        linePos.needsUpdate = true;
        line.geometry.computeBoundingSphere();
    });
}

export default {
    name: 'network',
    apply: function (state) {
        state.onFrame = null;

        // Setup graph
        if (state.resetData) {
            this.layout(state);

            // Create nodes
            state.network.nodes.forEach(node => {
                let nodeRadius = NODE_BASE_SIZE * node.size;
                let material = new THREE.ShaderMaterial({
                    uniforms: {
                        uColor: {
                            value: new THREE.Color(node.color)
                        }
                    },
                    vertexShader: nodeVertexShaderSource,
                    fragmentShader: nodeFragmentShaderSource,
                    blending: THREE.AdditiveBlending,
                    depthTest: false,
                    transparent: true
                });
                let sprite = new THREE.Mesh(new THREE.SphereGeometry(nodeRadius, 32, 32), material);
                sprite.vid = node.id;
                sprite.name = node.name;
                sprite.vdata = node.data;
                state.webglScene.add(node.sprite = sprite);
            });

            // Create links
            state.network.links.forEach(link => {
                const geometry = new THREE.BufferGeometry();
                geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(2 * 3), 3));
                const line = new THREE.Line(geometry, LINEMATERIAL);
                line.renderOrder = 10; // Prevent visual glitches of dark lines on top of spheres by rendering them last
                state.webglScene.add(link.line = line);
            });

            new TWEEN.Tween(state.camera.position).to({
                x: 0,
                y: 0,
                z: Math.cbrt(state.graphData.length) * CAMERA_DISTANCE2NODES_FACTOR
            }, 800).easing(TWEEN.Easing.Quadratic.InOut).on(() => {
                state.camera.lookAt(state.webglScene.position);
            }).start();
        } else {
            // Update nodes field
            state.graphData.forEach((item, index) => {
                state.network.nodes[index].name = item[state.nameField];
                state.network.nodes[index].color = item._color;
                state.network.nodes[index].size = item._size;
            });

            // Set nodes position & Update nodes style
            state.network.nodes.forEach(node => {
                state.network.layout.setNodePosition(node.id, node.sprite.position.x, node.sprite.position.y, node.sprite.position.z);
                let nodeRadius = NODE_BASE_SIZE * node.size;
                let scaleRate = nodeRadius / node.sprite.geometry.parameters.radius;
                new TWEEN.Tween(node.sprite.scale).to({
                        x: scaleRate,
                        y: scaleRate,
                        z: scaleRate
                    }, 400)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();

                new TWEEN.Tween(node.sprite.material.uniforms.uColor.value)
                    .to(new THREE.Color(node.color), 400)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();

                node.sprite.vid = node.id;
                node.sprite.name = node.name;
            });
        }

        if (state.resetData || state.resetRel) {
            // (Re)Start rendering
            cntTicks = 0;
            state.onFrame = () => layoutTick(state);
        }

        this.inUse = true;
    },
    cancel: function (state) {
        if (state.resetData)
            this.layout(state);
        state.onFrame = null;
        this.inUse = false;
    },
    reset: function (state) {
        if (state.resetData) {
            // re-apply
            while (state.webglScene.children.length) {
                state.webglScene.remove(state.webglScene.children[0])
            } // Clear the place
        } else if (state.resetRel) {
            state.onFrame = null;
            // Update layout
            console.log('update relations');
            // clear links
            state.network.links = [];
            state.network.layout.graph.clear();
            for (let i = 0; i < state.webglScene.children.length; i++) {
                if (state.webglScene.children[i] && state.webglScene.children[i].type === 'Line')
                    state.webglScene.remove(state.webglScene.children[i--])
            }

            // Update force-graph
            state.graphData.forEach((item, index) => {
                let node = state.network.nodes[index];
                state.network.layout.graph.addNode(node.id);
                state.network.layout.setNodePosition(node.id, node.sprite.position.x, node.sprite.position.y, node.sprite.position.z);
                if (Array.isArray(item[state.linkField])) {
                    item[state.linkField].forEach(tid => {
                        if (state.network.links.find(link =>
                                (link.sid === node.id && link.tid === tid) ||
                                (link.tid === node.id && link.sid === tid)))
                            return;
                        state.network.layout.graph.addLink(node.id, tid);
                        state.network.links.push({
                            sid: node.id,
                            tid: tid
                        });
                    });
                }
            });

            // Add links to scene
            state.network.links.forEach(link => {
                const geometry = new THREE.BufferGeometry();
                geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(2 * 3), 3));
                const line = new THREE.Line(geometry, LINEMATERIAL);
                line.renderOrder = 10; // Prevent visual glitches of dark lines on top of spheres by rendering them last
                state.webglScene.add(link.line = line);
            });
        }

        this.apply(state);
    },
    layout: function (state) {
        // reset layout
        const graph = ngraph();
        state.network = {
            nodes: [],
            links: []
        };
        state.graphData.forEach(item => {
            graph.addNode(item[state.idField]);
            state.network.nodes.push({
                id: item[state.idField],
                name: item[state.nameField],
                color: item._color,
                size: item._size,
                data: item
            });
            if (Array.isArray(item[state.linkField])) {
                item[state.linkField].forEach(tid => {
                    if (state.network.links.find(link =>
                            (link.sid === item[state.idField] && link.tid === tid) ||
                            (link.tid === item[state.idField] && link.sid === tid)))
                        return;
                    graph.addLink(item[state.idField], tid);
                    state.network.links.push({
                        sid: item[state.idField],
                        tid: tid
                    });
                });
            }
        });
        const layout = forcelayout3d(graph);
        layout.graph = graph; // Attach graph reference to layout
        state.network.layout = layout;
    }
};