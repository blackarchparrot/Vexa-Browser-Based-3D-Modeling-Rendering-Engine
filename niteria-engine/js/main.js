import * as THREE from 'three';
import { Engine } from './core/Engine.js';
import { Primitives } from './geometry/Primitives.js';
import { HistoryManager } from './core/HistoryManager.js';
import { TransformManager } from './selection/TransformManager.js';
import { SceneHierarchy } from './niteria/SceneHierarchy.js';

 
const engine = new Engine('three-canvas');
const objects = [];
let selectedObject = null;

const history = new HistoryManager((status) => {
  document.getElementById('btn-undo').disabled = !status.canUndo;
  document.getElementById('btn-redo').disabled = !status.canRedo;
});

const transform = new TransformManager(engine, history, () => {
  saveState();
  updateInspector();
});

const hierarchy = new SceneHierarchy('hierarchy-tree', (mesh) => {
  selectMesh(mesh);
});

 
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('pointerdown', (e) => {
  if (e.target.tagName !== 'CANVAS') return;

  const rect = engine.canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, engine.cameraPerspective);
  const intersects = raycaster.intersectObjects(objects.map(o => o.mesh), true);

  if (intersects.length > 0) {
    
    let hitMesh = intersects[0].object;
    while (hitMesh.parent && hitMesh.parent.type !== 'Scene' && !objects.some(o => o.mesh === hitMesh)) {
      hitMesh = hitMesh.parent;
    }
    selectMesh(hitMesh);
  } else if (!transform.controls.dragging) {
    deselect();
  }
});

 
function addObject(mesh, type, defaultName) {
  engine.scene.add(mesh);
  const objData = {
    id: type + '_' + Date.now(),
    name: defaultName,
    type: type,
    mesh: mesh
  };
  objects.push(objData);
  selectMesh(mesh);
  saveState();
  updateHierarchyAndStats();
}

function selectMesh(mesh) {
  const found = objects.find(o => o.mesh === mesh);
  if (!found) return;

  selectedObject = found;
  transform.attach(mesh);

  document.getElementById('inspector-fields').style.display = 'block';
  document.querySelector('.empty-msg').style.display = 'none';

  updateInspector();
  updateHierarchyAndStats();
}

function deselect() {
  selectedObject = null;
  transform.detach();
  document.getElementById('inspector-fields').style.display = 'none';
  document.querySelector('.empty-msg').style.display = 'block';
  updateHierarchyAndStats();
}

function updateHierarchyAndStats() {
  hierarchy.update(objects, selectedObject ? selectedObject.mesh : null);
  document.getElementById('stat-count').innerText = objects.length;
}

function updateInspector() {
  if (!selectedObject) return;
  const mesh = selectedObject.mesh;

  document.getElementById('inp-obj-name').value = selectedObject.name;
  if (mesh.material && mesh.material.color) {
    document.getElementById('inp-obj-color').value = '#' + mesh.material.color.getHexString();
  }

  document.getElementById('inp-pos-x').value = mesh.position.x.toFixed(2);
  document.getElementById('inp-pos-y').value = mesh.position.y.toFixed(2);
  document.getElementById('inp-pos-z').value = mesh.position.z.toFixed(2);

  document.getElementById('inp-size-x').value = mesh.scale.x.toFixed(2);
  document.getElementById('inp-size-y').value = mesh.scale.y.toFixed(2);
  document.getElementById('inp-size-z').value = mesh.scale.z.toFixed(2);

  document.getElementById('inp-rot-y').value = THREE.MathUtils.radToDeg(mesh.rotation.y).toFixed(0);
}

 
function getSceneSnapshot() {
  return objects.map(o => ({
    id: o.id, name: o.name, type: o.type,
    color: o.mesh.material ? '#' + o.mesh.material.color.getHexString() : '#ffffff',
    pos: [o.mesh.position.x, o.mesh.position.y, o.mesh.position.z],
    scale: [o.mesh.scale.x, o.mesh.scale.y, o.mesh.scale.z],
    rotY: o.mesh.rotation.y
  }));
}

function saveState() {
  history.pushState(getSceneSnapshot());
}

 
document.getElementById('add-cube').onclick = () => addObject(Primitives.createCube(), 'cube', 'Cube Building');
document.getElementById('add-cylinder').onclick = () => addObject(Primitives.createCylinder(), 'cylinder', 'Water Tank');
document.getElementById('add-sphere').onclick = () => addObject(Primitives.createSphere(), 'sphere', 'Dome Mesh');
document.getElementById('add-plane').onclick = () => addObject(Primitives.createPlane(), 'plane', 'Ground Plane');
document.getElementById('add-wall').onclick = () => addObject(Primitives.createWall(), 'wall', 'Exterior Wall');
document.getElementById('add-roof').onclick = () => addObject(Primitives.createRoof(), 'roof', 'Building Roof');
document.getElementById('add-stairs').onclick = () => addObject(Primitives.createStairs(), 'stairs', 'Staircase');

 
document.getElementById('snap-toggle').onchange = (e) => {
  transform.setSnap(e.target.checked, document.getElementById('snap-size').value);
};
document.getElementById('snap-size').onchange = (e) => {
  transform.setSnap(document.getElementById('snap-toggle').checked, e.target.value);
};

 
window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;

  if (e.key === 't' || e.key === 'T') { transform.setMode('translate'); document.getElementById('current-tool').innerText = 'TRANSLATE'; }
  if (e.key === 'r' || e.key === 'R') { transform.setMode('rotate'); document.getElementById('current-tool').innerText = 'ROTATE'; }
  if (e.key === 's' || e.key === 'S') { transform.setMode('scale'); document.getElementById('current-tool').innerText = 'SCALE'; }
  
  if (e.key === 'f' || e.key === 'F') {
    if (selectedObject) {
      engine.controls.target.copy(selectedObject.mesh.position);
    }
  }

  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    const prev = history.undo();
    if (prev) restoreFromSnapshot(prev);
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
    const next = history.redo();
    if (next) restoreFromSnapshot(next);
  }
});

function restoreFromSnapshot(snapshot) {
  
  objects.forEach(o => engine.scene.remove(o.mesh));
  objects.length = 0;
  deselect();

  
  snapshot.forEach(item => {
    let mesh;
    if (item.type === 'cube') mesh = Primitives.createCube();
    else if (item.type === 'cylinder') mesh = Primitives.createCylinder();
    else if (item.type === 'sphere') mesh = Primitives.createSphere();
    else if (item.type === 'plane') mesh = Primitives.createPlane();
    else if (item.type === 'wall') mesh = Primitives.createWall();
    else if (item.type === 'roof') mesh = Primitives.createRoof();
    else if (item.type === 'stairs') mesh = Primitives.createStairs();

    if (mesh) {
      mesh.position.set(...item.pos);
      mesh.scale.set(...item.scale);
      mesh.rotation.y = item.rotY;
      if (mesh.material) mesh.material.color.set(item.color);

      engine.scene.add(mesh);
      objects.push({ id: item.id, name: item.name, type: item.type, mesh: mesh });
    }
  });
  updateHierarchyAndStats();
}

 
saveState();

 
engine.render();



