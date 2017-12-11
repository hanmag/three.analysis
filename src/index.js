import './assets/css/graph.css';

import Kapsule from 'kapsule';
import * as TWEEN from 'es6-tween';
import * as THREE from 'three';
import trackballControls from 'three-trackballcontrols';
import { autoColorItems } from './utils/color-utils';
import { linearSizeItems } from './utils/math-utils';

import network from './network/3d-force-graph';
import scatter from './scatter/3d-scatter-graph';

const visualizes = [network, scatter];

export default Kapsule({
    props: {
        graphData: {
            default: [],
            onChange(_, state) {
                state.onFrame = null;
                state.resetData = true;
            }
        },
        graphType: {
            default: 'network'
        },
        idField: {
            default: 'id',
            onChange(_, state) {
                state.onFrame = null;
                state.resetData = true;
            }
        },
        nameField: {
            default: 'name'
        },
        linkField: {
            default: 'link',
            onChange(_, state) {
                state.resetRel = true;
            }
        },
        colorField: {
            default: 'color'
        },
        sizeField: {
            default: 'size'
        },
        onNodeClick: {}
    },
    init: function (domNode, state) {
        state.domNode = domNode;

        // Wipe DOM
        domNode.innerHTML = '';

        // Add info space
        domNode.appendChild(state.infoElem = document.createElement('div'));
        state.infoElem.className = 'graph-info-msg';

        // Setup tooltip
        const toolTipElem = document.createElement('div');
        toolTipElem.className = 'graph-tooltip';
        domNode.appendChild(toolTipElem);

        // Capture mouse coords on move
        const raycaster = new THREE.Raycaster();
        const mousePos = new THREE.Vector2();
        mousePos.x = -2; // Initialize off canvas
        mousePos.y = -2;
        domNode.addEventListener("mousemove", ev => {
            // update the mouse pos
            const offset = getOffset(domNode),
                relPos = {
                    x: ev.pageX - offset.left,
                    y: ev.pageY - offset.top
                };
            mousePos.x = (relPos.x / state.width) * 2 - 1;
            mousePos.y = -(relPos.y / state.height) * 2 + 1;

            // Move tooltip
            toolTipElem.style.top = (relPos.y - 40) + 'px';
            toolTipElem.style.left = (relPos.x - 50) + 'px';

            function getOffset(el) {
                const rect = el.getBoundingClientRect(),
                    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
                    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                return {
                    top: rect.top + scrollTop,
                    left: rect.left + scrollLeft
                };
            }
        }, false);

        // Setup webgl renderer
        state.webglRenderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        domNode.appendChild(state.webglRenderer.domElement);
        // Handle click events on nodes
        state.webglRenderer.domElement.addEventListener("click", ev => {
            if (state.onNodeClick) {
                raycaster.setFromCamera(mousePos, state.camera);
                const intersects = raycaster.intersectObjects(state.webglScene.children)
                    .filter(o => o.object.vdata); // Check only objects with data (nodes)
                if (intersects.length) {
                    state.onNodeClick(intersects[0].object.vdata);
                }
            }
        }, false);

        // Setup scenes
        const scene = new THREE.Scene();
        scene.add(state.webglScene = new THREE.Group());

        // Add lights
        scene.add(new THREE.AmbientLight(0xcccccc));
        scene.add(new THREE.DirectionalLight(0xffffff, 0.6));

        // Setup camera
        state.camera = new THREE.PerspectiveCamera();
        state.camera.far = 20000;

        // Add camera interaction
        const tbControls_webgl = new trackballControls(state.camera, state.webglRenderer.domElement);

        // Kick-off renderer
        (function animate() {
            if (state.onFrame) state.onFrame();
            // Update tooltip
            raycaster.setFromCamera(mousePos, state.camera);
            const intersects = raycaster.intersectObjects(state.webglScene.children)
                .filter(o => o.object.name); // Check only objects with labels
            toolTipElem.textContent = intersects.length ? intersects[0].object.name : '';

            // tween update
            TWEEN.update();

            // Frame cycle
            tbControls_webgl.update();
            state.webglRenderer.render(scene, state.camera);
            requestAnimationFrame(animate);
        })();
    },
    update: function (state) {
        // update layput
        this.resizeDom();

        state.infoElem.innerHTML = '<div class="loading-pulse"></div>';

        if (!Array.isArray(state.graphData) || state.graphData.length == 0) return;
        if (state.resetData) validate();

        // set color
        autoColorItems(state.graphData, state.colorField);
        // set size
        linearSizeItems(state.graphData, state.sizeField)

        visualizes.forEach(visualize => {
            if (visualize.inUse && visualize.name !== state.graphType) {
                // fade out aniamtion
                visualize.cancel(state);
            } else if (visualize.inUse && visualize.name === state.graphType) {
                // reset current layout
                visualize.reset(state);
            } else if (visualize.name === state.graphType) {
                // apply new visualize
                visualize.apply(state);
            } else if (state.resetData) {
                visualize.layout(state);
            }
        });

        // update complete
        state.resetData = state.resetRel = false;
        state.infoElem.innerHTML = '';

        function validate() {
            console.info('Graph loading', state.graphData.length, 'records');
            if (state.graphData.length > 1) {
                for (let i = 0; i < state.graphData.length; i++) {
                    const el1 = state.graphData[i];
                    for (let j = i + 1; j < state.graphData.length; j++) {
                        const el2 = state.graphData[j];
                        if (el1[state.idField] === el2[state.idField]) {
                            throw 'Error: records contains duplicated idFields \'' + el1[state.idField] + '\'';
                        }
                    }
                }
            }
        }
    },
    methods: {
        resizeDom: function (state) {
            if (state.domNode.offsetWidth && state.domNode.offsetHeight) {
                state.width = state.domNode.offsetWidth;
                state.height = state.domNode.offsetHeight;
            }
            if (state.width && state.height) {
                state.webglRenderer.setSize(state.width, state.height);
                state.camera.aspect = state.width / state.height;
                state.camera.updateProjectionMatrix();
            }
        }
    }
});