import * as THREE from 'three';

export class MaterialManager {
    constructor() {
        this.textureLoader = new THREE.TextureLoader();
        this.materials = new Map();
        this.textures = new Map();
    }

    /**
     * Creates or updates a MeshStandardMaterial with PBR properties.
     */
    createPBRMaterial(name, options = {}) {
        const defaults = {
            color: 0xcccccc,
            roughness: 0.5,
            metalness: 0.1,
            wireframe: false,
            transparent: false,
            opacity: 1.0,
            side: THREE.FrontSide
        };

        const config = { ...defaults, ...options };
        let material = this.materials.get(name);

        if (!material) {
            material = new THREE.MeshStandardMaterial(config);
            this.materials.set(name, material);
        } else {
            material.color.set(config.color);
            material.roughness = config.roughness;
            material.metalness = config.metalness;
            material.wireframe = config.wireframe;
            material.transparent = config.transparent;
            material.opacity = config.opacity;
            material.side = config.side;
            material.needsUpdate = true;
        }

        return material;
    }

    /**
     * Loads a texture map onto a specific material slot.
     * @param {THREE.MeshStandardMaterial} material 
     * @param {string} mapType - 'map' (Albedo), 'normalMap', 'roughnessMap', 'aoMap'
     * @param {string} url - Texture image URL or file path
     * @param {Object} repeat - { u: number, v: number } texture tiling
     */
    loadTextureMap(material, mapType, url, repeat = { u: 1, v: 1 }) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                url,
                (texture) => {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.set(repeat.u, repeat.v);
                    
                    if (mapType === 'map') texture.colorSpace = THREE.SRGBColorSpace;

                    material[mapType] = texture;
                    material.needsUpdate = true;
                    this.textures.set(`${material.uuid}_${mapType}`, texture);
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.error(`Failed to load texture [${mapType}] from ${url}:`, error);
                    reject(error);
                }
            );
        });
    }

    /**
     * Removes and disposes texture from a material property slot.
     */
    removeTextureMap(material, mapType) {
        if (material[mapType]) {
            material[mapType].dispose();
            material[mapType] = null;
            material.needsUpdate = true;
        }
    }

    /**
     * Clean up unused material assets from WebGL memory.
     */
    disposeMaterial(material) {
        ['map', 'normalMap', 'roughnessMap', 'aoMap'].forEach(slot => {
            if (material[slot]) material[slot].dispose();
        });
        material.dispose();
    }
}