import ngraph from 'ngraph.graph';
import forcelayout3d from 'ngraph.forcelayout3d';

const CAMERA_DISTANCE2NODES_FACTOR = 150;

export default {
    name: 'network',
    apply: function (state) {
        // Setup graph
        const graph = ngraph();
        state.graphData.forEach(node => {
            graph.addNode(node[state.idField]);
            if (node[state.relField]) {
                node[state.relField].forEach(rel => {
                    graph.addLink(node[state.idField], rel);
                });
            }
        });
        const layout = forcelayout3d(graph);
        layout.graph = graph; // Attach graph reference to layout

        // Create nodes
        // Create links

        if (state.camera.position.x === 0 && state.camera.position.y === 0) {
            // If camera still in default position (not user modified)
            state.camera.lookAt(state.webglScene.position);
            state.camera.position.z = Math.cbrt(state.graphData.length) * CAMERA_DISTANCE2NODES_FACTOR;
        }

        // Start rendering
        state.onFrame = layoutTick;
        this.inUse = true;

        function layoutTick() {
            layout.step();

            // Update nodes position
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