import nodeVertexShaderSource from '../shaders/node.vertex.glsl';
import nodeFragmentShaderSource from '../shaders/node.fragment.glsl';

import * as THREE from 'three';
import ngraph from 'ngraph.graph';
import forcelayout3d from 'ngraph.forcelayout3d';

const CAMERA_DISTANCE2NODES_FACTOR = 120;
const NODE_BASE_SIZE = 7;
const COOLDOWNTICKS = 70;

export default {
    name: 'network',
    apply: function (state) {
        // Setup graph
        const graph = ngraph();
        state.network = { nodes : [], links : [] };
        state.graphData.forEach(item => {
            graph.addNode(item[state.idField]);
            state.network.nodes.push({id : item[state.idField], name : item[state.nameField], color : item._color, size : item._size, data: item});
            if (Array.isArray(item[state.linkField])) {
                item[state.linkField].forEach(tid => {
                    if(state.network.links.find(link => 
                        (link.sid === item[state.idField] && link.tid === tid)
                        || (link.tid === item[state.idField] && link.sid === tid)))
                        return;
                    graph.addLink(item[state.idField], tid);
                    state.network.links.push({ sid : item[state.idField], tid : tid });
                });
            }
        });
        const layout = forcelayout3d(graph);
        layout.graph = graph; // Attach graph reference to layout

        // Create nodes
        let nodeMaterials = {}; // indexed by color
        state.network.nodes.forEach(node => {
            let nodeRadius = NODE_BASE_SIZE * node.size;
            if (!nodeMaterials.hasOwnProperty(node.color)) {
                nodeMaterials[node.color] = new THREE.ShaderMaterial({
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
            }
            let sprite = new THREE.Mesh(new THREE.SphereGeometry(nodeRadius, 32, 32), nodeMaterials[node.color]);
            sprite.vid = node.id;
            sprite.name = node.name;
            sprite.vdata = node.data;
            state.webglScene.add(node.sprite = sprite);
        });

        // Create links
        let lineMaterial = new THREE.LineBasicMaterial({
            color: 0xbbbbbb,
            transparent: true,
            opacity: 0.2
        });
        state.network.links.forEach(link => {
            const geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(2 * 3), 3));
            const line = new THREE.Line(geometry, lineMaterial);
            line.renderOrder = 10; // Prevent visual glitches of dark lines on top of spheres by rendering them last
            state.webglScene.add(link.line = line);
        });

        if (state.camera.position.x === 0 && state.camera.position.y === 0) {
            // If camera still in default position (not user modified)
            state.camera.position.z = Math.cbrt(state.graphData.length) * CAMERA_DISTANCE2NODES_FACTOR;
            state.camera.lookAt(state.webglScene.position);
        }

        // Setup render DOM
        state.webglRenderer.domElement.style.display = 'block';
        state.css3dRenderer.domElement.style.display = 'none';

        // Start rendering
        let cntTicks = 0;
        state.onFrame = layoutTick;
        this.inUse = true;

        function layoutTick() {
            if (cntTicks++ > COOLDOWNTICKS) {
                state.onFrame = null; // Stop ticking graph
            }

            layout.step();

            // Update nodes position
            state.network.nodes.forEach(node => {
                const sprite = node.sprite;
                if (!sprite) return;
                const pos = layout.getNodePosition(node.id);
                sprite.position.x = pos.x;
                sprite.position.y = pos.y;
                sprite.position.z = pos.z;
            });
            // Update links position
            state.network.links.forEach(link => {
                const line = link.line;
                if (!line) return;

                const pos = layout.getLinkPosition(layout.graph.getLink(link.sid, link.tid).id),
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
    },
    cancel: function (state) {
        this.inUse = false;
        state.network = { nodes : [], links : [] };
    },
    reset: function (state) {
        state.network = { nodes : [], links : [] };
        while (state.webglScene.children.length) {
            state.webglScene.remove(state.webglScene.children[0])
        } // Clear the place
    }
};