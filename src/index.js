import './assets/css/graph.css';

import Kapsule from 'kapsule';
import * as THREE from 'three';
import trackballControls from 'three-trackballcontrols';



export default Kapsule({
    props: {
        graphData: {
            default: [],
            onChange(_, state) {
                state.onFrame = null;
            }
        },
        graphType: {
            default: 'network'
        },
        idField: {
            default: 'id'
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
            toolTipElem.style.left = (relPos.x - 20) + 'px';

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

        // Handle click events on nodes
        domNode.addEventListener("click", ev => {
            if (state.onNodeClick) {
                raycaster.setFromCamera(mousePos, state.camera);
                const intersects = raycaster.intersectObjects(state.graphScene.children)
                    .filter(o => o.object.__data); // Check only objects with data (nodes)
                if (intersects.length) {
                    state.onNodeClick(intersects[0].object.__data);
                }
            }
        }, false);

        // Setup renderer
        state.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        domNode.appendChild(state.renderer.domElement);

        // Setup scene
        const scene = new THREE.Scene();
        scene.add(state.graphScene = new THREE.Group());

        // Add lights
        scene.add(new THREE.AmbientLight(0xbbbbbb));
        scene.add(new THREE.DirectionalLight(0xffffff, 0.6));

        // Setup camera
        state.camera = new THREE.PerspectiveCamera();
        state.camera.far = 20000;

        // Add camera interaction
        const tbControls = new trackballControls(state.camera, state.renderer.domElement);

        // Kick-off renderer
        (function animate() {
            if (state.onFrame) state.onFrame();
            // Update tooltip
            raycaster.setFromCamera(mousePos, state.camera);
            const intersects = raycaster.intersectObjects(state.graphScene.children)
                .filter(o => o.object.name); // Check only objects with labels
            toolTipElem.textContent = intersects.length ? intersects[0].object.name : '';

            // Frame cycle
            tbControls.update();
            state.renderer.render(scene, state.camera);
            requestAnimationFrame(animate);
        })();
    },
    update: function (state) {
        // update layput
        this.resizeCanvas();

        state.onFrame = null; // Pause simulation
        state.infoElem.textContent = 'Loading...';

        // preprocess data
        preprocess();

        state.infoElem.textContent = '';

        function preprocess() {
            if (!Array.isArray(state.graphData)) return;
            console.info('Graph loading', state.graphData.length, 'records');

            // init records' dimensions
            state.dimensions = [];
            state.graphData.forEach(object => {
                for (const key in object) {
                    if (object.hasOwnProperty(key)) {
                        const element = object[key];
                        if (!isNaN(element)) {
                            // is a Number, can sizeby / rankby / ycord

                        } else if (Array.isArray(element)) {
                            // is a Array, can relationby

                        } else {
                            // is a Enum, can colorby / xcord
                        }
                    }
                }
            });
        }
    },
    methods: {
        resizeCanvas: function (state) {
            if (state.domNode.offsetWidth && state.domNode.offsetHeight) {
                state.width = state.domNode.offsetWidth;
                state.height = state.domNode.offsetHeight;
            }
            if (state.width && state.height) {
                state.renderer.setSize(state.width, state.height);
                state.camera.aspect = state.width / state.height;
                state.camera.updateProjectionMatrix();
            }
        }
    }
});