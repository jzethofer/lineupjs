import {D3DragEvent, drag} from 'd3-drag';
import {event as d3event, select, Selection} from 'd3-selection';
import {round, similar} from '../../internal/math';
import ADialog from './ADialog';

function clamp(v: number) {
  return Math.max(Math.min(v, 100), 0);
}

export interface IMappingAdapter {
  destroyed(self: MappingLine): void;

  updated(self: MappingLine): void;

  domain(): number[];

  normalizeRaw(v: number): number;

  unnormalizeRaw(v: number): number;
}


export default class MappingLineDialog extends ADialog {
  constructor(private readonly line: { destroy(): void, domain: number, range: number, frozen: boolean, update(domain: number, range: number): void }, attachment: HTMLElement, private readonly adapter: IMappingAdapter) {
    super(attachment, {
      hideOnMoveOutside: true
    });
  }

  build(node: HTMLElement) {
    const domain = this.adapter.domain();
    node.insertAdjacentHTML('beforeend', `
        <h4>Input Domain Value (min ... max)</h4>
        <input type="number" value="${round(this.adapter.unnormalizeRaw(this.line.domain), 3)}" ${this.line.frozen ? 'readonly' : ''} autofocus required min="${domain[0]}" max="${domain[1]}" step="any">
        <h4>Output Normalized Value (0 ... 1)</h4>
        <input type="number" value="${round(this.line.range / 100, 3)}" required min="0" max="1" step="any">
        <button type="button" ${this.line.frozen ? 'disabled' : ''} >Remove Mapping Line</button>
      `);

    this.forEach('input', (d) => d.onchange = () => this.submit());
    this.find('button').addEventListener('click', () => {
      this.destroy();
      this.line.destroy();
    });
  }

  protected submit() {
    if (!this.node.checkValidity()) {
      return false;
    }
    const domain = this.adapter.normalizeRaw(parseFloat(this.findInput('input[type=number]').value));
    const range = parseFloat(this.findInput('input[type=number]:last-of-type').value) * 100;
    this.line.update(domain, range);
    return true;
  }
}


export class MappingLine {
  readonly node: SVGGElement;

  private readonly $select: Selection<SVGGElement, any, any, any>;

  constructor(g: SVGGElement, public domain: number, public range: number, private readonly adapter: IMappingAdapter) {
    g.insertAdjacentHTML('beforeend', `<g class="lu-mapping" transform="translate(${domain},0)">
      <line x1="0" x2="${range - domain}" y2="60"></line>
      <line x1="0" x2="${range - domain}" y2="60"></line>
      <circle r="3"></circle>
      <circle cx="${range - domain}" cy="60" r="3"></circle>
      <title>Drag the anchor circle to change the mapping, shift click to edit</title>
    </g>`);
    this.node = <SVGGElement>g.lastElementChild!;

    // freeze 0 and 100 domain = raw domain ones
    this.node.classList.toggle('lu-frozen', similar(0, domain) || similar(domain, 100));
    this.$select = select(this.node);
    {
      let beforeDomain: number;
      let beforeRange: number;
      let shiftDomain: number;
      let shiftRange: number;
      this.$select.selectAll('line:first-of-type, circle').call(drag()
        .container(function (this: SVGCircleElement) {
          return <any>this.parentNode!.parentNode;
        }).filter(() => d3event.button === 0 && !d3event.shiftKey)
        .on('start', () => {
          beforeDomain = this.domain;
          beforeRange = this.range;
          const evt = (<D3DragEvent<any, any, any>>d3event);
          shiftDomain = this.domain - evt.x;
          shiftRange = this.range - evt.x;
        }).on('drag', (_, i) => {
          const evt = (<D3DragEvent<any, any, any>>d3event);
          switch (i) {
            case 0: // line
              this.update(clamp(evt.x + shiftDomain), clamp(evt.x + shiftRange));
              break;
            case 1: // domain circle
              this.update(clamp(evt.x), this.range);
              break;
            case 2: // range circle
              this.update(this.domain, clamp(evt.x));
              break;
          }
        }).on('end', () => {
          if (!similar(beforeDomain, this.domain) || !similar(beforeRange, this.range)) {
            this.adapter.updated(this);
          }
        })
      );
    }

    this.node.onclick = (evt) => {
      if (!evt.shiftKey) {
        return;
      }
      const dialog = new MappingLineDialog(this, <any>this.node, this.adapter);
      dialog.open();
    };
  }

  get frozen() {
    return this.node.classList.contains('lu-frozen');
  }

  destroy() {
    this.node.remove();
    this.adapter.destroyed(this);
  }

  update(domain: number, range: number) {
    if (similar(domain, this.domain) && similar(range, this.range)) {
      return;
    }
    if (this.frozen) {
      domain = this.domain;
    }
    this.domain = domain;
    this.range = range;
    this.node.setAttribute('transform', `translate(${domain},0)`);
    const shift = range - domain;
    this.$select.selectAll('line')!.attr('x2', String(shift));
    this.$select.select('circle[cx]').attr('cx', String(shift));
  }
}
