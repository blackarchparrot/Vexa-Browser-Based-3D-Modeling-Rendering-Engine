import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class CameraController {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        
        this.controls = new OrbitControls(this.camera, this.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.01; 
        
        this.currentMode = '3D'; 
    }

    setMode(mode) {
        if (this.currentMode === mode) return;
        this.currentMode = mode;

        if (mode === '2D') {
            
            this.controls.maxPolarAngle = 0;
            this.controls.minPolarAngle = 0;
            this.camera.position.set(0, 15, 0);
            this.controls.target.set(0, 0, 0);
        } else {
            
            this.controls.maxPolarAngle = Math.PI / 2 - 0.01;
            this.controls.minPolarAngle = 0;
            this.camera.position.set(0, 5, 10);
            this.controls.target.set(0, 0, 0);
        }
        this.controls.update();
    }

    focusOn(targetPosition, distance = 5) {
        const offset = new THREE.Vector3(0, distance * 0.5, distance);
        this.camera.position.copy(targetPosition).add(offset);
        this.controls.target.copy(targetPosition);
        this.controls.update();
    }

    update() {
        this.controls.update();
    }
}