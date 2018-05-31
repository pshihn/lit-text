import { LitElement, html } from '@polymer/lit-element/lit-element.js';

export class LitText extends LitElement {
  _render() {
    return html`
    <style>
      :host {
        display: block;
        position: relative;
      }
    
      #overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(200, 0, 0, 0.06);
      }
    
      #main {
        background: rgba(0, 0, 0, 0.06);
        box-sizing: content-box;
      }
    </style>
    <div id="main">
      <slot id="slot" on-slotchange="${() => this._reset()}"></slot>
    </div>
    <div id="overlay"></div>
    `;
  }

  constructor() {
    super();
    this._map = [];
    this._charCount = 0;
  }

  _reset() {
    const slot = this.shadowRoot.getElementById('slot');
    const nodes = slot.assignedNodes();
    const overlay = this.shadowRoot.getElementById('overlay');
    this.stop();

    this._map = [];
    this._charCount = 0;
    for (let i = 0; i < nodes.length; i++) {
      this._process(overlay, nodes[i]);
    }

    console.log(this._map, this._charCount);
  }

  _process(parent, node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const newNode = node.cloneNode(false);
      newNode.textContent = '';
      const text = node.textContent;
      parent.appendChild(newNode);
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

  stop() {
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
customElements.define('lit-text', LitText);