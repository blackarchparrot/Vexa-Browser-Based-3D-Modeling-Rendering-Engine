export class HistoryManager {
  constructor(onChange) {
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistory = 50;
    this.onChange = onChange;
  }

  pushState(snapshot) {
    this.undoStack.push(JSON.stringify(snapshot));
    if (this.undoStack.length > this.maxHistory) this.undoStack.shift();
    this.redoStack = [];
    this.notify();
  }

  undo(currentState) {
    if (this.undoStack.length <= 1) return null;
    const current = this.undoStack.pop();
    this.redoStack.push(current);
    const previous = this.undoStack[this.undoStack.length - 1];
    this.notify();
    return JSON.parse(previous);
  }

  redo() {
    if (this.redoStack.length === 0) return null;
    const state = this.redoStack.pop();
    this.undoStack.push(state);
    this.notify();
    return JSON.parse(state);
  }

  notify() {
    if (this.onChange) {
      this.onChange({
        canUndo: this.undoStack.length > 1,
        canRedo: this.redoStack.length > 0
      });
    }
  }
}