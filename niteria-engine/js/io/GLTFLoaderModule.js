import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export class GLTFLoaderModule {
    constructor(dracoDecoderPath = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/') {
        this.loader = new GLTFLoader();
        
        
        if (dracoDecoderPath) {
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath(dracoDecoderPath);
            this.loader.setDRACOLoader(dracoLoader);
        }
    }

    /**
     * Loads a GLTF/GLB asset from URL or blob.
     * @param {string} url - Target asset path
     * @param {Object} options - Custom options (centerModel, castShadow, receiveShadow)
     * @param {Function} onProgress - Progress reporting callback (0-100%)
     * @returns {Promise<THREE.Group>}
     */
    loadModel(url, options = {}, onProgress = null) {
        const settings = {
            centerModel: true,
            castShadow: true,
            receiveShadow: true,
            ...options
        };

        return new Promise((resolve, reject) => {
            this.loader.load(
                url,
                (gltf) => {
                    const model = gltf.scene;

                    
                    model.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = settings.castShadow;
                            child.receiveShadow = settings.receiveShadow;

                            
                            if (child.material && child.material.map) {
                                child.material.map.colorSpace = THREE.SRGBColorSpace;
                            }
                        }
                    });

                    
                    if (settings.centerModel) {
                        const bbox = new THREE.Box3().setFromObject(model);
                        const center = bbox.getCenter(new THREE.Vector3());
                        model.position.sub(center); 
                    }

                    resolve({
                        model,
                        animations: gltf.animations || [],
                        assetData: gltf.parser ? gltf.parser.json : null
                    });
                },
                (event) => {
                    if (onProgress && event.lengthComputable) {
                        const percentComplete = (event.loaded / event.total) * 100;
                        onProgress(percentComplete);
                    }
                },
                (error) => {
                    console.error(`Error loading GLTF model from ${url}:`, error);
                    reject(error);
                }
            );
        });
    }
}