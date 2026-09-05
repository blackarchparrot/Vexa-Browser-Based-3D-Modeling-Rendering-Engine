import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export class MeshEditor {
    constructor(camera, domElement, scene) {
        this.camera = camera;
        this.domElement = domElement;
        this.scene = scene;

        this.transformControls = new TransformControls(this.camera, this.domElement);
        this.scene.add(this.transformControls.getHelper());

        this.selectedObject = null;
        this.snapGridSize = 0.25;
        this.snapEnabled = false;

        this.onSelectionChange = null;
        this.onTransformChange = null;

        this.setupListeners();
    }

    setupListeners() {
        this.transformControls.addEventListener('change', () => {
            if (this.onTransformChange && this.selectedObject) {
                this.onTransformChange(this.selectedObject);
            }
        });

        
        this.transformControls.addEventListener('dragging-changed', (event) => {
            if (this.cameraController && this.cameraController.controls) {
                this.cameraController.controls.enabled = !event.value;
            }
        });
    }

    attachCameraController(cameraController) {
        this.cameraController = cameraController;
    }

    select(object) {
        if (!object || object === this.selectedObject) return;

        this.selectedObject = object;
        this.transformControls.attach(object);

        if (this.onSelectionChange) {
            this.onSelectionChange(object);
        }
    }

    deselect() {
        this.transformControls.detach();
        this.selectedObject = null;

        if (this.onSelectionChange) {
            this.onSelectionChange(null);
        }
    }

    setMode(mode) { 
        if (['translate', 'rotate', 'scale'].includes(mode)) {
            this.transformControls.setMode(mode);
        }
    }

    toggleSnap(enabled, gridSize = 0.25) {
        this.snapEnabled = enabled;
        this.snapGridSize = gridSize;

        if (this.snapEnabled) {
            this.transformControls.setTranslationSnap(this.snapGridSize);
            this.transformControls.setRotationSnap(THREE.MathUtils.degToRad(15));
            this.transformControls.setScaleSnap(0.1);
        } else {
            this.transformControls.setTranslationSnap(null);
            this.transformControls.setRotationSnap(null);
            this.transformControls.setScaleSnap(null);
        }
    }

    getSelectedObject() {
        return this.selectedObject;
    }

    update() {
        
    }
}