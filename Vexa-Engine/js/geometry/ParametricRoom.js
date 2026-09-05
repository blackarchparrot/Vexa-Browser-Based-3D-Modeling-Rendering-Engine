import * as THREE from 'three';

export class ParametricRoom {
    constructor(scene, materialManager) {
        this.scene = scene;
        this.materialManager = materialManager;
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.dimensions = {
            width: 8,     
            length: 10,   
            height: 3,    
            thickness: 0.2
        };

        this.openings = []; 
        this.build();
    }

    setDimensions(newDims) {
        this.dimensions = { ...this.dimensions, ...newDims };
        this.rebuild();
    }

    addOpening(wall, offset, bottom, width, height) {
        this.openings.push({ wall, offset, bottom, width, height });
        this.rebuild();
    }

    rebuild() {
        
        while (this.group.children.length > 0) {
            const obj = this.group.children[0];
            if (obj.geometry) obj.geometry.dispose();
            this.group.remove(obj);
        }
        this.build();
    }

    build() {
        const { width, length, height, thickness } = this.dimensions;

        const wallMat = this.materialManager
            ? this.materialManager.createPBRMaterial('wallMat', { color: 0xF5F5F5, roughness: 0.8 })
            : new THREE.MeshStandardMaterial({ color: 0xF5F5F5 });

        const floorMat = this.materialManager
            ? this.materialManager.createPBRMaterial('floorMat', { color: 0xD1D5DB, roughness: 0.4 })
            : new THREE.MeshStandardMaterial({ color: 0xD1D5DB });

        
        const floorGeo = new THREE.BoxGeometry(width, thickness, length);
        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.position.set(0, -thickness / 2, 0);
        floorMesh.receiveShadow = true;
        floorMesh.userData = { isFloor: true };
        this.group.add(floorMesh);

        
        const ceilingGeo = new THREE.BoxGeometry(width, thickness, length);
        const ceilingMesh = new THREE.Mesh(ceilingGeo, wallMat);
        ceilingMesh.position.set(0, height + thickness / 2, 0);
        this.group.add(ceilingMesh);

        
        const createWall = (w, h, d, px, py, pz, name) => {
            const geo = new THREE.BoxGeometry(w, h, d);
            const mesh = new THREE.Mesh(geo, wallMat);
            mesh.position.set(px, py, pz);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData = { isWall: true, wallName: name };
            this.group.add(mesh);
        };

        const halfW = width / 2;
        const halfL = length / 2;
        const halfH = height / 2;

        
        createWall(width, height, thickness, 0, halfH, -halfL - thickness / 2, 'north');
        
        createWall(width, height, thickness, 0, halfH, halfL + thickness / 2, 'south');
        
        createWall(thickness, height, length, halfW + thickness / 2, halfH, 0, 'east');
        
        createWall(thickness, height, length, -halfW - thickness / 2, halfH, 0, 'west');
    }

    getMeshGroup() {
        return this.group;
    }
}