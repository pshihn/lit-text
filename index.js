class Highlighter {
  constructor(root) {
    this._root = root;
    this._map = [];
    this._charCount = 0;
    this._reset();
  }

  _initializeOverlay() {
    if (!this._overlay) {
      this._overlay = this._root.ownerDocument.createElement('div');
      const style = this._overlay.style;
      style.position = 'absolute';
      style.top = 0;
      style.bottom = 0;
      style.left = 0;
      style.right = 0;
      style.pointerEvents = 'none';
      this._root.appendChild(this._overlay);
    }
  }

  _addInsStyles(node) {
    const style = node.style;
    style.textDecoration = 'none';
    style.color = 'var(--lumin-color, currentColor)';
    style.background = 'var(--lumin-background-color, yellow)';
  }

  _reset() {
    this._initializeOverlay();
    this._stop();
    this._map = [];
    this._charCount = 0;
    const children = this._root.childNodes;
    for (let i = 0; i < children.length; i++) {
      if (children[i] != this._overlay) {
        this._process(this._overlay, children[i]);
      }
    }
    console.log('map', this._map, this._charCount);
  }

  _process(parent, node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const newNode = node.cloneNode(false);
      newNode.textContent = '';
      const text = node.textContent;
      const ins = this._root.ownerDocument.createElement('ins');
      this._addInsStyles(ins);
      ins.appendChild(newNode);
      parent.appendChild(ins);
      this._map.push({
        node: newNode,
        text,
        current: ''
      });
      this._charCount += text.length ? Math.max(text.trim().length, 1) : 0;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const newNode = node.cloneNode(false);
      parent.appendChild(newNode);
      const children = node.childNodes;
      if (children && children.length) {
        for (let i = 0; i < children.length; i++) {
          this._process(newNode, children[i]);
        }
      }
    }
  }

  _stop() {
    if (this._timer) {
      clearTimeout(this._timer);
      delete this._timer;
    }
  }

  start(duration) {
    if (!this._charCount) {
      this._charCount = 1;
    }
    this._interval = duration / this._charCount;
    this._cursor = 0;
    this._nextTick();
  }

  _nextTick() {
    this._timer = setTimeout(() => this._tick(), this._interval);
  }

  _tick() {
    if (this._cursor >= this._map.length) {
      return;
    }
    let d = this._map[this._cursor];
    const diff = d.text.length - d.current.length;
    if (diff <= 0) {
      this._cursor++;
      this._tick();
    } else {
      if (!d.text.trim().length) {
        d.current = d.text
      } else {
        d.current = d.text.substring(0, d.current.length + 1);
      }
      d.node.textContent = d.current;
      this._nextTick();
    }
  }
}

export function lumin(node) {
  return new Highlighter(node);
}