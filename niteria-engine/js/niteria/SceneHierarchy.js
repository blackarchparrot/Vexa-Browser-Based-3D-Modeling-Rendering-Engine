export class SceneHierarchy {
  constructor(containerId, onSelectCallback) {
    this.container = document.getElementById(containerId);
    this.onSelectCallback = onSelectCallback;
  }

  update(objects, selectedObj) {
    this.container.innerHTML = '';
    
    objects.forEach(obj => {
      const item = document.createElement('div');
      item.className = 'tree-item' + (selectedObj === obj.mesh ? ' selected' : '');
      
      item.innerHTML = `
        <span>${obj.name}</span>
        <span class="type-tag">${obj.type}</span>
      `;

      item.addEventListener('click', () => {
        if (this.onSelectCallback) this.onSelectCallback(obj.mesh);
      });

      this.container.appendChild(item);
    });
  }
}