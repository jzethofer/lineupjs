/**
 * Created by Samuel Gratzl on 25.07.2017.
 */
import Column from '../../model/Column';
import {IRankingContext} from './RenderColumn';
import {isSupportType, createStackDesc} from '../../model';
import NumbersColumn from '../../model/NumbersColumn';
import BoxPlotColumn from '../../model/BoxPlotColumn';
import SortDialog from '../../dialogs/SortDialog';
import {select, Selection} from 'd3';
import RenameDialog from '../../dialogs/RenameDialog';
import RendererTypeDialog from '../../dialogs/RendererTypeDialog';
import LinkColumn from '../../model/LinkColumn';
import ADialog from '../../dialogs/ADialog';
import ScriptColumn from '../../model/ScriptColumn';
import ScriptEditDialog from '../../dialogs/ScriptEditDialog';
import EditLinkDialog from '../../dialogs/EditLinkDialog';
import {IMultiLevelColumn, isMultiLevelColumn} from '../../model/CompositeColumn';
import RankColumn from '../../model/RankColumn';
import WeightsEditDialog from '../../dialogs/WeightsEditDialog';
import StackColumn from '../../model/StackColumn';
import CutOffHierarchyDialog from '../../dialogs/CutOffHierarchyDialog';
import SearchDialog from '../../dialogs/SearchDialog';
import HierarchyColumn from '../../model/HierarchyColumn';
import {dragAble, dropAble, IDropResult} from './dnd';
import {isNumberColumn} from '../../model/NumberColumn';
import Ranking from '../../model/Ranking';

export {default as createSummary} from './summary';

export function createToolbar(node: HTMLElement, col: Column, ctx: IRankingContext) {
  const isSupportColumn = isSupportType(col.desc);

  const addIcon = (title: string, dialogClass?: { new(col: any, header: Selection<any>, ...args: any[]): ADialog }, ...dialogArgs: any[]) => {
    node.insertAdjacentHTML('beforeend', `<i title="${title}"><span aria-hidden="true">${title}</span> </i>`);
    const i = <HTMLElement>node.lastElementChild;
    if (!dialogClass) {
      return i;
    }
    i.onclick = (evt) => {
      evt.stopPropagation();
      const dialog = new dialogClass(col, select(node.parentElement!), ...dialogArgs);
      dialog.openDialog();
    };
    return i;
  };

  if (!isSupportColumn) {
    //rename
    addIcon('Rename', RenameDialog);
    //clone
    addIcon('Generate Snapshot').onclick = (evt) => {
      evt.stopPropagation();
      ctx.provider.takeSnapshot(col);
    };
  }

  if (col instanceof NumbersColumn || col instanceof BoxPlotColumn) {
    //Numbers Sort
    addIcon('Sort By', SortDialog);
  }

  if (col.getRendererList().length > 1) {
    //Renderer Change
    addIcon('Change Visualization', RendererTypeDialog);
  }

  if (col instanceof LinkColumn) {
    //edit link
    addIcon('Edit Link Pattern', EditLinkDialog, ctx.options.idPrefix, (<string[]>[]).concat((<any>col.desc).templates || [], ctx.options.linkTemplates));
  }

  if (col instanceof ScriptColumn) {
    //edit script
    addIcon('Edit Combine Script', ScriptEditDialog);
  }

  //filter
  if (ctx.options.filters.hasOwnProperty(col.desc.type)) {
    addIcon('Filter', ctx.options.filters[col.desc.type], '', ctx.provider, ctx.options.idPrefix);
  }

  if (col instanceof HierarchyColumn) {
    //cutoff
    addIcon('Set Cut Off', CutOffHierarchyDialog, ctx.options.idPrefix);
  }

  if (ctx.options.searchAble(col)) {
    //search
    addIcon('Search', SearchDialog, ctx.provider);
  }

  if (col instanceof StackColumn) {
    //edit weights
    addIcon('Edit Weights', WeightsEditDialog);
  }

  if (!isSupportColumn) {
    addIcon(col.getCompressed() ? 'UnCollapse' : 'Collapse').onclick = (evt) => {
      evt.stopPropagation();
      col.setCompressed(!col.getCompressed());
      const i = <HTMLElement>evt.currentTarget;
      i.title = col.getCompressed() ? 'UnCollapse' : 'Collapse';
    };
  }

  if (isMultiLevelColumn(col)) {
    const mcol = <IMultiLevelColumn>col;
    addIcon(mcol.getCollapsed() ? 'Expand' : 'Compress').onclick = (evt) => {
      evt.stopPropagation();
      mcol.setCollapsed(!mcol.getCollapsed());
      const i = <HTMLElement>evt.currentTarget;
      i.title = mcol.getCollapsed() ? 'Expand' : 'Compress';
    };
  }

  addIcon('Hide').onclick = (evt) => {
    evt.stopPropagation();
    if (!(col instanceof RankColumn)) {
      col.removeMe();
      return;
    }
    ctx.provider.removeRanking(col.findMyRanker()!);
    if (ctx.provider.getRankings().length === 0) { //create at least one
      ctx.provider.pushRanking();
    }
  };
}

export function dragWidth(col: Column, node: HTMLElement) {
  let ueberElement: HTMLElement;
  const handle = <HTMLElement>node.querySelector('.lu-handle');

  let start = 0;
  const mouseMove = (evt: MouseEvent) => {
    const end = evt.clientX;
    if (Math.abs(start - end) < 2) {
      //ignore
      return;
    }
    const delta = end - start;
    start = end;
    col.setWidth(Math.max(0, col.getWidth() + delta));
  };

  const mouseUp = (evt: MouseEvent) => {
    const end = evt.clientX;

    ueberElement.removeEventListener('mousemove', mouseMove);
    ueberElement.removeEventListener('mouseup', mouseUp);
    ueberElement.removeEventListener('mouseleave', mouseUp);

    if (Math.abs(start - end) < 2) {
      //ignore
      return;
    }
    const delta = end - start;
    col.setWidth(Math.max(0, col.getWidth() + delta));
  };
  handle.onmousedown = (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    node.classList.add('lu-change-width');

    start = evt.clientX;
    ueberElement = <HTMLElement>node.closest('header')!;
    ueberElement.addEventListener('mousemove', mouseMove);
    ueberElement.addEventListener('mouseup', mouseUp);
    ueberElement.addEventListener('mouseleave', mouseUp);
  };

}

export const MIMETYPE_PREFIX = 'text/x-caleydo-lineup-column';

export function handleDnD(node: HTMLElement, column: Column, ctx: IRankingContext) {
  dragAble(node, () => {
    const ref = JSON.stringify(ctx.provider.toDescRef(this.c.desc));
    const data: any = {
      'text/plain': this.c.label,
      [`${MIMETYPE_PREFIX}-ref`]: this.c.id,
      [MIMETYPE_PREFIX]: ref
    };
    if (isNumberColumn(this.c)) {
      data[`${MIMETYPE_PREFIX}-number`] = ref;
      data[`${MIMETYPE_PREFIX}-number-ref`] = this.c.id;
    }
    return {
      effectAllowed: 'copyMove',
      data
    };
  }, true);

  const resolveDrop = (result: IDropResult) => {
    const data = result.data;
    const copy = result.effect === 'copy';
    if (`${MIMETYPE_PREFIX}-number-ref` in data) {
      const id = data[`${MIMETYPE_PREFIX}-number-ref`];
      let col = ctx.provider.find(id);
      if (!col) {
        return null;
      }
      if (copy) {
        col = this.data.clone(col);
      } else if (col) {
        col.removeMe();
      }
      return col;
    }
    const desc = JSON.parse(data[`${MIMETYPE_PREFIX}-number`]);
    return ctx.provider.create(ctx.provider.fromDescRef(desc));
  };

  if (isMultiLevelColumn(column)) {
    dropAble(node, [`${MIMETYPE_PREFIX}-number-ref`, `${MIMETYPE_PREFIX}-number`], (result) => {
      const col: Column|null = resolveDrop(result);
      return col != null && (<IMultiLevelColumn>column).push(col) != null;
    });
    return;
  }

  if (!(column.parent instanceof Ranking && isNumberColumn(column) && !isMultiLevelColumn(column))) {
    return;
  }
  dropAble(node, [`${MIMETYPE_PREFIX}-number-ref`, `${MIMETYPE_PREFIX}-number`], (result) => {
    const col: Column | null = resolveDrop(result);
    const ranking = column.findMyRanker();
    if (!ranking || !col) {
      return false;
    }
    const index = ranking.indexOf(column);
    const stack = <StackColumn>this.data.create(createStackDesc());
    column.removeMe();
    stack.push(column);
    stack.push(col);
    return ranking.insert(stack, index) != null;
  });
}
