import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Engine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);

    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.cameraPerspective = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    this.cameraPerspective.position.set(20, 30, 40);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;

    this.controls = new OrbitControls(this.cameraPerspective, this.renderer.domElement);
    this.controls.enableDamping = true;

    this.setupLighting();
    this.setupHelpers();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 100, 50);
    dirLight.castShadow = true;
    this.scene.add(dirLight);
  }

  setupHelpers() {
    this.gridHelper = new THREE.GridHelper(200, 200, 0x00d2ff, 0x334155);
    this.scene.add(this.gridHelper);
  }

  onWindowResize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.cameraPerspective.aspect = w / h;
    this.cameraPerspective.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  render(callback) {
    const animate = () => {
      requestAnimationFrame(animate);
      this.controls.update();
      if (callback) callback();
      this.renderer.render(this.scene, this.cameraPerspective);
    };
    animate();
  }
}