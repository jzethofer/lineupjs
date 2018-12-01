import {IDataRow, IGroup, IGroupMeta} from '../model';
import AggregateGroupColumn from '../model/AggregateGroupColumn';
import Column from '../model/Column';
import {AGGREGATE, CANVAS_HEIGHT, cssClass} from '../styles';
import {default as IRenderContext, ICellRendererFactory} from './interfaces';

const AGGREGATE_TO_TOP = 0;

const SHIFT = 0;

/** @internal */
export default class AggregateGroupRenderer implements ICellRendererFactory {
  readonly title = 'Default';

  canRender(col: Column) {
    return col instanceof AggregateGroupColumn;
  }

  create(col: AggregateGroupColumn, context: IRenderContext) {
    const width = context.colWidth(col);
    return {
      template: `<div title="Collapse Group"></div>`,
      update(node: HTMLElement, _row: IDataRow, _i: number, group: IGroup, meta: IGroupMeta) {
        if (!meta) {
          delete node.dataset.meta;
        } else {
          node.dataset.meta = meta;
        }
        node.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          col.setAggregated(group, AGGREGATE_TO_TOP);
        };
      },
      render(ctx: CanvasRenderingContext2D, _row: IDataRow, _i: number, _group: IGroup, meta: IGroupMeta) {
        ctx.fillStyle = AGGREGATE.color;
        ctx.fillRect(width - AGGREGATE.width - SHIFT, 0, AGGREGATE.strokeWidth, CANVAS_HEIGHT);
        return Boolean(meta);
      }
    };
  }

  createGroup(col: AggregateGroupColumn) {
    return {
      template: `<div title="Expand Group"></div>`,
      update(node: HTMLElement, group: IGroup, _rows: IDataRow[], meta: IGroupMeta) {
        if (!meta) {
          delete node.dataset.meta;
        } else {
          node.dataset.meta = meta;
        }
        node.onclick = function (event) {
          event.preventDefault();
          event.stopPropagation();
          col.setAggregated(group, false);
        };
      }
    };
  }

  createSummary(col: AggregateGroupColumn, context: IRenderContext) {
    const cdown = cssClass('icon-caret-down');
    const cright = cssClass('icon-caret-right');
    return {
      template: `<div title="(Un)Aggregate All" class="${cdown}"></div>`,
      update: (node: HTMLElement) => {
        const ranking = col.findMyRanker();
        const right = Boolean(ranking && ranking.getGroups().every((g) => col.isAggregated(g) >= 0));

        node.classList.toggle(cdown, !right);
        node.classList.toggle(cright, right);

        node.onclick = (evt) => {
          evt.stopPropagation();
          const ranking = col.findMyRanker();
          if (!ranking || !context) {
            return;
          }
          const aggregate = node.classList.contains(cdown);
          node.classList.toggle(cdown, !aggregate);
          node.classList.toggle(cright, aggregate);
          context.provider.aggregateAllOf(ranking, aggregate ? AGGREGATE_TO_TOP : -1);
        };
      }
    };
  }
}
