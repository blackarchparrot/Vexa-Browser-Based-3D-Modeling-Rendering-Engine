import * as THREE from 'three';

export class Primitives {
  static createCube() {
    return new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshStandardMaterial({ color: 0x2563eb })
    );
  }

  static createCylinder() {
    return new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 3, 32),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8 })
    );
  }

  static createSphere() {
    return new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 32, 16),
      new THREE.MeshStandardMaterial({ color: 0xe11d48 })
    );
  }

  static createPlane() {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({ color: 0x64748b, side: THREE.DoubleSide })
    );
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  }

  static createWall() {
    return new THREE.Mesh(
      new THREE.BoxGeometry(6, 3, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8 })
    );
  }

  static createRoof() {
    
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(2, 2);
    shape.lineTo(4, 0);
    shape.lineTo(0, 0);

    const extrudeSettings = { depth: 6, bevelEnabled: false };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xb91c1c }));
  }

  static createStairs() {
    const group = new THREE.Group();
    const stepCount = 8;
    const width = 3, stepDepth = 0.4, stepHeight = 0.25;

    for (let i = 0; i < stepCount; i++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(width, stepHeight, stepDepth),
        new THREE.MeshStandardMaterial({ color: 0x475569 })
      );
      step.position.set(0, i * stepHeight + stepHeight / 2, i * stepDepth);
      group.add(step);
    }
    return group;
  }
}