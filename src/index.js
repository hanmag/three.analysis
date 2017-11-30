import './assets/css/graph.css';

import Kapsule from 'kapsule';
import * as THREE from 'three';
import { CSS3DRenderer } from 'three-renderer-css3d';
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
        linkField: {
            default: 'link'
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
                    .filter(o => o.object.__data); // Check only objects with data (nodes)
                if (intersects.length) {
                    state.onNodeClick(intersects[0].object.__data);
                }
            }
        }, false);

        // Setup css3 renderer
        state.css3dRenderer = new CSS3DRenderer();
        domNode.appendChild(state.css3dRenderer.domElement);

        // Setup scenes
        const scene = new THREE.Scene();
        scene.add(state.webglScene = new THREE.Group());
        scene.add(state.css3Scene = new THREE.Group());

        // Add lights
        scene.add(new THREE.AmbientLight(0xbbbbbb));
        scene.add(new THREE.DirectionalLight(0xffffff, 0.6));

        // Setup camera
        state.camera = new THREE.PerspectiveCamera();
        state.camera.far = 20000;

        // Add camera interaction
        const tbControls_webgl = new trackballControls(state.camera, state.webglRenderer.domElement);
        const tbControls_css3 = new trackballControls(state.camera, state.css3dRenderer.domElement);

        // Kick-off renderer
        (function animate() {
            if (state.onFrame) state.onFrame();
            // Update tooltip
            raycaster.setFromCamera(mousePos, state.camera);
            const intersects = raycaster.intersectObjects(state.webglScene.children)
                .filter(o => o.object.name); // Check only objects with labels
            toolTipElem.textContent = intersects.length ? intersects[0].object.name : '';

            // Frame cycle
            tbControls_webgl.update();
            tbControls_css3.update();
            state.webglRenderer.render(scene, state.camera);
            state.css3dRenderer.render(scene, state.camera);
            requestAnimationFrame(animate);
        })();
    },
    update: function (state) {
        // update layput
        this.resizeDom();

        state.onFrame = null; // Pause simulation
        state.infoElem.textContent = 'Loading...';

        if (!Array.isArray(state.graphData)) return;
        console.info('Graph loading', state.graphData.length, 'records');

        state.infoElem.textContent = '';
    },
    methods: {
        resizeDom: function (state) {
            if (state.domNode.offsetWidth && state.domNode.offsetHeight) {
                state.width = state.domNode.offsetWidth;
                state.height = state.domNode.offsetHeight;
            }
            if (state.width && state.height) {
                state.webglRenderer.setSize(state.width, state.height);
                state.css3dRenderer.setSize(state.width, state.height);
                state.css3dRenderer.domElement.style.marginTop = -state.height + "px";
                state.camera.aspect = state.width / state.height;
                state.camera.updateProjectionMatrix();
            }
        }
    }
});