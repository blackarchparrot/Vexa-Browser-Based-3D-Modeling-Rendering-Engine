import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

export class GLTFExporterModule {
    constructor() {
        this.exporter = new GLTFExporter();
    }

    /**
     * Exports input objects/scene to GLTF/GLB format.
     * @param {THREE.Object3D|THREE.Object3D[]} input - Objects or Scene to export
     * @param {string} filename - Desired output file name
     * @param {Object} options - Export settings (binary, embedImages, trs, etc.)
     */
    export(input, filename = 'scene-export', options = {}) {
        const config = {
            binary: true,            
            embedImages: true,       
            trs: true,               
            onlyVisible: true,       
            truncateDrawRange: true,
            ...options
        };

        return new Promise((resolve, reject) => {
            this.exporter.parse(
                input,
                (result) => {
                    const ext = config.binary ? 'glb' : 'gltf';
                    const fullFileName = `${filename}.${ext}`;

                    if (result instanceof ArrayBuffer) {
                        this._saveArrayBuffer(result, fullFileName);
                    } else {
                        const output = JSON.stringify(result, null, 2);
                        this._saveString(output, fullFileName);
                    }
                    resolve(result);
                },
                (error) => {
                    console.error('An error occurred during GLTF export:', error);
                    reject(error);
                },
                config
            );
        });
    }

    _saveArrayBuffer(buffer, fileName) {
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        this._triggerDownload(blob, fileName);
    }

    _saveString(text, fileName) {
        const blob = new Blob([text], { type: 'text/plain' });
        this._triggerDownload(blob, fileName);
    }

    _triggerDownload(blob, fileName) {
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }
}