import * as THREE from 'three';
import { CameraController } from './CameraController.js';
import { RaycasterManager } from './RaycasterManager.js';
import { MeshEditor } from './MeshEditor.js';
import { ParametricRoom } from './ParametricRoom.js';
import { MaterialManager } from './MaterialManager.js';
import { MetadataStore } from './MetadataStore.js';
import { NavMeshGraph } from './NavMeshGraph.js';
import { GLTFLoaderModule } from './GLTFLoaderModule.js';
import { GLTFExporterModule } from './GLTFExporterModule.js';
import { JSONSerializer } from './JSONSerializer.js';

export class App {
    constructor(containerId) {
        this.container = document.getElementById(containerId);

        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);

        this.camera = new THREE.PerspectiveCamera(
            60, 
            this.container.clientWidth / this.container.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 8, 12);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.container.appendChild(this.renderer.domElement);

        
        this.setupLighting();

        
        this.store = new MetadataStore();
        this.materialManager = new MaterialManager();
        this.cameraController = new CameraController(this.camera, this.renderer.domElement);
        this.raycaster = new RaycasterManager(this.camera, this.scene);
        this.meshEditor = new MeshEditor(this.camera, this.renderer.domElement, this.scene);
        this.meshEditor.attachCameraController(this.cameraController);

        this.room = new ParametricRoom(this.scene, this.materialManager);
        this.navGraph = new NavMeshGraph(this.scene);
        this.gltfLoader = new GLTFLoaderModule();
        this.gltfExporter = new GLTFExporterModule();

        
        this.objects = [];
        this.setupEvents();

        
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        this.dirLight = dirLight;
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        this.scene.add(dirLight);
    }

    setupEvents() {
        window.addEventListener('resize', () => {
            const w = this.container.clientWidth;
            const h = this.container.clientHeight;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        });

        
        this.renderer.domElement.addEventListener('pointerdown', (e) => {
            this.raycaster.updateMousePosition(e, this.container);
            const intersects = this.raycaster.intersectObjects(this.objects);
            
            if (intersects.length > 0) {
                this.meshEditor.select(intersects[0].object);
            }
        });
    }

    async loadFurniture(url, position = { x: 0, y: 0, z: 0 }) {
        const { model } = await this.gltfLoader.loadModel(url);
        model.position.set(position.x, position.y, position.z);
        this.scene.add(model);
        this.objects.push(model);
        return model;
    }

    saveProject() {
        return JSONSerializer.serialize(this.objects, this.navGraph);
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.cameraController.update();
        this.meshEditor.update();
        this.renderer.render(this.scene, this.camera);
    }
}