import { TransformControls } from 'three/addons/controls/TransformControls.js';

export class TransformManager {
  constructor(engine, historyManager, onTransformEnd) {
    this.engine = engine;
    this.historyManager = historyManager;
    this.onTransformEnd = onTransformEnd;

    this.controls = new TransformControls(engine.cameraPerspective, engine.renderer.domElement);
    this.engine.scene.add(this.controls);

    this.snapEnabled = true;
    this.snapSize = 1.0;

    this.controls.addEventListener('dragging-changed', (e) => {
      this.engine.controls.enabled = !e.value;
      if (!e.value && this.onTransformEnd) {
        this.onTransformEnd();
      }
    });

    this.updateSnapSettings();
  }

  attach(mesh) {
    this.controls.attach(mesh);
  }

  detach() {
    this.controls.detach();
  }

  setMode(mode) {
    this.controls.setMode(mode); 
  }

  setSnap(enabled, size) {
    this.snapEnabled = enabled;
    this.snapSize = parseFloat(size);
    this.updateSnapSettings();
  }

  updateSnapSettings() {
    if (this.snapEnabled) {
      this.controls.setTranslationSnap(this.snapSize);
      this.controls.setRotationSnap(Math.PI / 12); 
      this.controls.setScaleSnap(0.25);
    } else {
      this.controls.setTranslationSnap(null);
      this.controls.setRotationSnap(null);
      this.controls.setScaleSnap(null);
    }
  }
}