import nodeVertexShaderSource from '../shaders/node.vertex.glsl';
import nodeFragmentShaderSource from '../shaders/node.fragment.glsl';

import * as TWEEN from 'es6-tween';
import * as THREE from 'three';

const PI = 3.1415926;
const CAMERA_DISTANCE2NODES_FACTOR = 100;
const NODE_BASE_SIZE = 4;
// 3d cords plane
const PLANEMATERIAL = new THREE.MeshBasicMaterial({
    color: 0x808080,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9
});
const LEFT_PLANE = new THREE.Mesh(new THREE.PlaneGeometry(120, 120, 1), PLANEMATERIAL);
LEFT_PLANE.rotation.set(0, PI / 2, 0);
LEFT_PLANE.position.x -= 150;
const BOTTOM_PLANE = new THREE.Mesh(new THREE.PlaneGeometry(300, 120, 1), PLANEMATERIAL);
BOTTOM_PLANE.rotation.set(PI / 2, 0, 0);
BOTTOM_PLANE.position.y -= 60;
const BACK_PLANE = new THREE.Mesh(new THREE.PlaneGeometry(300, 120, 1), PLANEMATERIAL);
BACK_PLANE.position.z -= 60;
const PLANES = [LEFT_PLANE, BOTTOM_PLANE, BACK_PLANE];

// 3d cords line
const LINEMATERIAL = new THREE.LineBasicMaterial({
    color: 0xa4a4a4
});
const BACK_LINEGEOMETRY = new THREE.Geometry();
BACK_LINEGEOMETRY.vertices.push(new THREE.Vector3(-150, -60, -60));
BACK_LINEGEOMETRY.vertices.push(new THREE.Vector3(150, -60, -60));
BACK_LINEGEOMETRY.vertices.push(new THREE.Vector3(150, 60, -60));
BACK_LINEGEOMETRY.vertices.push(new THREE.Vector3(-150, 60, -60));
BACK_LINEGEOMETRY.vertices.push(new THREE.Vector3(-150, -60, -60));
const BACK_CORDS = new THREE.Line(BACK_LINEGEOMETRY, LINEMATERIAL);
const LEFT_LINEGEOMETRY = new THREE.Geometry();
LEFT_LINEGEOMETRY.vertices.push(new THREE.Vector3(-150, -60, -60));
LEFT_LINEGEOMETRY.vertices.push(new THREE.Vector3(-150, -60, 60));
LEFT_LINEGEOMETRY.vertices.push(new THREE.Vector3(-150, 60, 60));
LEFT_LINEGEOMETRY.vertices.push(new THREE.Vector3(-150, 60, -60));
LEFT_LINEGEOMETRY.vertices.push(new THREE.Vector3(-150, -60, -60));
const LEFT_CORDS = new THREE.Line(LEFT_LINEGEOMETRY, LINEMATERIAL);
const BOTTOM_LINEGEOMETRY = new THREE.Geometry();
BOTTOM_LINEGEOMETRY.vertices.push(new THREE.Vector3(-150, -60, -60));
BOTTOM_LINEGEOMETRY.vertices.push(new THREE.Vector3(150, -60, -60));
BOTTOM_LINEGEOMETRY.vertices.push(new THREE.Vector3(150, -60, 60));
BOTTOM_LINEGEOMETRY.vertices.push(new THREE.Vector3(-150, -60, 60));
BOTTOM_LINEGEOMETRY.vertices.push(new THREE.Vector3(-150, -60, -60));
const BOTTOM_CORDS = new THREE.Line(BOTTOM_LINEGEOMETRY, LINEMATERIAL);

const BACK_HOR_LINEGEOMETRY1 = new THREE.Geometry();
BACK_HOR_LINEGEOMETRY1.vertices.push(new THREE.Vector3(-150, 0, -60));
BACK_HOR_LINEGEOMETRY1.vertices.push(new THREE.Vector3(150, 0, -60));
const BACK_HOR_LINE1 = new THREE.Line(BACK_HOR_LINEGEOMETRY1, LINEMATERIAL);
const BACK_VER_LINEGEOMETRY1 = new THREE.Geometry();
BACK_VER_LINEGEOMETRY1.vertices.push(new THREE.Vector3(-90, 60, -60));
BACK_VER_LINEGEOMETRY1.vertices.push(new THREE.Vector3(-90, -60, -60));
const BACK_VER_LINE1 = new THREE.Line(BACK_VER_LINEGEOMETRY1, LINEMATERIAL);
const BACK_VER_LINEGEOMETRY2 = new THREE.Geometry();
BACK_VER_LINEGEOMETRY2.vertices.push(new THREE.Vector3(-30, 60, -60));
BACK_VER_LINEGEOMETRY2.vertices.push(new THREE.Vector3(-30, -60, -60));
const BACK_VER_LINE2 = new THREE.Line(BACK_VER_LINEGEOMETRY2, LINEMATERIAL);
const BACK_VER_LINEGEOMETRY3 = new THREE.Geometry();
BACK_VER_LINEGEOMETRY3.vertices.push(new THREE.Vector3(30, 60, -60));
BACK_VER_LINEGEOMETRY3.vertices.push(new THREE.Vector3(30, -60, -60));
const BACK_VER_LINE3 = new THREE.Line(BACK_VER_LINEGEOMETRY3, LINEMATERIAL);
const BACK_VER_LINEGEOMETRY4 = new THREE.Geometry();
BACK_VER_LINEGEOMETRY4.vertices.push(new THREE.Vector3(90, 60, -60));
BACK_VER_LINEGEOMETRY4.vertices.push(new THREE.Vector3(90, -60, -60));
const BACK_VER_LINE4 = new THREE.Line(BACK_VER_LINEGEOMETRY4, LINEMATERIAL);

const BOTTOM_HOR_LINEGEOMETRY1 = new THREE.Geometry();
BOTTOM_HOR_LINEGEOMETRY1.vertices.push(new THREE.Vector3(-150, -60, 0));
BOTTOM_HOR_LINEGEOMETRY1.vertices.push(new THREE.Vector3(150, -60, 0));
const BOTTOM_HOR_LINE1 = new THREE.Line(BOTTOM_HOR_LINEGEOMETRY1, LINEMATERIAL);
const BOTTOM_VER_LINEGEOMETRY1 = new THREE.Geometry();
BOTTOM_VER_LINEGEOMETRY1.vertices.push(new THREE.Vector3(-90, -60, -60));
BOTTOM_VER_LINEGEOMETRY1.vertices.push(new THREE.Vector3(-90, -60, 60));
const BOTTOM_VER_LINE1 = new THREE.Line(BOTTOM_VER_LINEGEOMETRY1, LINEMATERIAL);
const BOTTOM_VER_LINEGEOMETRY2 = new THREE.Geometry();
BOTTOM_VER_LINEGEOMETRY2.vertices.push(new THREE.Vector3(-30, -60, -60));
BOTTOM_VER_LINEGEOMETRY2.vertices.push(new THREE.Vector3(-30, -60, 60));
const BOTTOM_VER_LINE2 = new THREE.Line(BOTTOM_VER_LINEGEOMETRY2, LINEMATERIAL);
const BOTTOM_VER_LINEGEOMETRY3 = new THREE.Geometry();
BOTTOM_VER_LINEGEOMETRY3.vertices.push(new THREE.Vector3(30, -60, -60));
BOTTOM_VER_LINEGEOMETRY3.vertices.push(new THREE.Vector3(30, -60, 60));
const BOTTOM_VER_LINE3 = new THREE.Line(BOTTOM_VER_LINEGEOMETRY3, LINEMATERIAL);
const BOTTOM_VER_LINEGEOMETRY4 = new THREE.Geometry();
BOTTOM_VER_LINEGEOMETRY4.vertices.push(new THREE.Vector3(90, -60, -60));
BOTTOM_VER_LINEGEOMETRY4.vertices.push(new THREE.Vector3(90, -60, 60));
const BOTTOM_VER_LINE4 = new THREE.Line(BOTTOM_VER_LINEGEOMETRY4, LINEMATERIAL);

const LEFT_HOR_LINEGEOMETRY1 = new THREE.Geometry();
LEFT_HOR_LINEGEOMETRY1.vertices.push(new THREE.Vector3(-150, 0, 60));
LEFT_HOR_LINEGEOMETRY1.vertices.push(new THREE.Vector3(-150, 0, -60));
const LEFT_HOR_LINE1 = new THREE.Line(LEFT_HOR_LINEGEOMETRY1, LINEMATERIAL);
const LEFT_VER_LINEGEOMETRY1 = new THREE.Geometry();
LEFT_VER_LINEGEOMETRY1.vertices.push(new THREE.Vector3(-150, -60, 0));
LEFT_VER_LINEGEOMETRY1.vertices.push(new THREE.Vector3(-150, 60, 0));
const LEFT_VER_LINE1 = new THREE.Line(LEFT_VER_LINEGEOMETRY1, LINEMATERIAL);

const LINES = [BACK_CORDS, LEFT_CORDS, BOTTOM_CORDS, LEFT_HOR_LINE1, LEFT_VER_LINE1,
    BACK_HOR_LINE1, BACK_VER_LINE1, BACK_VER_LINE2, BACK_VER_LINE3, BACK_VER_LINE4,
    BOTTOM_HOR_LINE1, BOTTOM_VER_LINE1, BOTTOM_VER_LINE2, BOTTOM_VER_LINE3, BOTTOM_VER_LINE4
];

function drawCords(state) {
    // Re-drawing 3d-plane
    for (let i = 0; i < state.webglScene.children.length; i++) {
        if (state.webglScene.children[i] && state.webglScene.children[i].type === 'Plane')
            state.webglScene.remove(state.webglScene.children[i--])
    }

    state.webglScene.add.apply(state.webglScene, PLANES);
    state.webglScene.add.apply(state.webglScene, LINES);

    new TWEEN.Tween(state.camera.position).to({
        x: CAMERA_DISTANCE2NODES_FACTOR,
        y: 0.6 * CAMERA_DISTANCE2NODES_FACTOR,
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