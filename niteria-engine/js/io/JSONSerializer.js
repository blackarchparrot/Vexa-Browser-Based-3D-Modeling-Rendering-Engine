import * as THREE from 'three';

export class JSONSerializer {
    /**
     * Serializes scene objects and metadata to a JSON string.
     */
    static serialize(objectsArray, navGraph = null, extraMetadata = {}) {
        const serializedObjects = objectsArray.map(item => {
            const mesh = item.mesh;
            const geoParams = mesh.geometry.parameters || {};

            const record = {
                id: item.id,
                name: item.name,
                type: item.type,
                transform: {
                    position: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z },
                    rotation: { x: mesh.rotation.x, y: mesh.rotation.y, z: mesh.rotation.z },
                    scale: { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z }
                },
                geometry: {
                    type: mesh.geometry.type,
                    parameters: geoParams
                },
                material: mesh.material ? {
                    color: '#' + mesh.material.color.getHexString(),
                    roughness: mesh.material.roughness ?? 0.5,
                    metalness: mesh.material.metalness ?? 0.1,
                    opacity: mesh.material.opacity ?? 1.0,
                    transparent: mesh.material.transparent ?? false
                } : null,
                metadata: item.metadata || {}
            };

            return record;
        });

        const payload = {
            project: "Niteria Campus Twin",
            version: "2.0",
            exportedAt: new Date().toISOString(),
            metadata: extraMetadata,
            objects: serializedObjects,
            navGraph: navGraph ? navGraph.exportGraphJSON() : []
        };

        return JSON.stringify(payload, null, 2);
    }

    /**
     * Deserializes project JSON data into raw object specifications.
     */
    static parse(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (!data.objects || !Array.isArray(data.objects)) {
                throw new Error("Invalid project file structure.");
            }
            return data;
        } catch (err) {
            console.error("JSONSerializer parse error:", err);
            return null;
        }
    }
}