import * as THREE from 'three';

export class NavMeshGraph {
    constructor(scene) {
        this.scene = scene;
        this.nodes = new Map(); 
        this.nodeGroup = new THREE.Group();
        this.edgeGroup = new THREE.Group();
        
        this.scene.add(this.nodeGroup);
        this.scene.add(this.edgeGroup);

        this.nodeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        this.nodeMaterials = {
            room: new THREE.MeshBasicMaterial({ color: 0x22c55e }),       
            door: new THREE.MeshBasicMaterial({ color: 0xeab308 }),       
            corridor: new THREE.MeshBasicMaterial({ color: 0x3b82f6 }),   
            stair: new THREE.MeshBasicMaterial({ color: 0xa855f7 })       
        };
        
        this.lineMaterial = new THREE.LineBasicMaterial({ color: 0x00d2ff, linewidth: 2 });
    }

    addNode(id, label, type, position) {
        if (this.nodes.has(id)) return this.nodes.get(id);

        const pos = position instanceof THREE.Vector3 ? position : new THREE.Vector3(position.x, position.y, position.z);
        
        const mat = this.nodeMaterials[type] || this.nodeMaterials.corridor;
        const mesh = new THREE.Mesh(this.nodeGeometry, mat);
        mesh.position.copy(pos);
        mesh.userData = { nodeId: id, isNavNode: true };
        
        this.nodeGroup.add(mesh);

        const nodeData = {
            id,
            label,
            type,
            position: pos,
            connections: new Set(),
            mesh
        };

        this.nodes.set(id, nodeData);
        return nodeData;
    }

    connectNodes(idA, idB) {
        const nodeA = this.nodes.get(idA);
        const nodeB = this.nodes.get(idB);

        if (!nodeA || !nodeB) return false;

        nodeA.connections.add(idB);
        nodeB.connections.add(idA);

        this.rebuildEdges();
        return true;
    }

    disconnectNodes(idA, idB) {
        const nodeA = this.nodes.get(idA);
        const nodeB = this.nodes.get(idB);

        if (nodeA) nodeA.connections.delete(idB);
        if (nodeB) nodeB.connections.delete(idA);

        this.rebuildEdges();
    }

    removeNode(id) {
        const node = this.nodes.get(id);
        if (!node) return;

        
        node.connections.forEach(connId => {
            const neighbor = this.nodes.get(connId);
            if (neighbor) neighbor.connections.delete(id);
        });

        this.nodeGroup.remove(node.mesh);
        node.mesh.geometry.dispose();
        
        this.nodes.delete(id);
        this.rebuildEdges();
    }

    rebuildEdges() {
        
        while (this.edgeGroup.children.length > 0) {
            const line = this.edgeGroup.children[0];
            line.geometry.dispose();
            this.edgeGroup.remove(line);
        }

        const drawnPairs = new Set();

        this.nodes.forEach(nodeA => {
            nodeA.connections.forEach(targetId => {
                const pairKey = [nodeA.id, targetId].sort().join('--');
                if (!drawnPairs.has(pairKey)) {
                    drawnPairs.add(pairKey);
                    const nodeB = this.nodes.get(targetId);
                    if (nodeB) {
                        const points = [nodeA.position, nodeB.position];
                        const geometry = new THREE.BufferGeometry().setFromPoints(points);
                        const line = new THREE.Line(geometry, this.lineMaterial);
                        this.edgeGroup.add(line);
                    }
                }
            });
        });
    }

    exportGraphJSON() {
        const output = [];
        this.nodes.forEach(node => {
            output.push({
                id: node.id,
                label: node.label,
                type: node.type,
                position: { x: node.position.x, y: node.position.y, z: node.position.z },
                neighbors: Array.from(node.connections)
            });
        });
        return output;
    }

    toggleVisibility(visible) {
        this.nodeGroup.visible = visible;
        this.edgeGroup.visible = visible;
    }
}