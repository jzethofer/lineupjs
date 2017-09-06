/**
 * Created by Samuel Gratzl on 05.09.2017.
 */
import Column from '../../model/Column';
import {createToolbar, dragAbleColumn, resortDropAble, updateHeader} from '../engine/header';
import {IRankingHeaderContext} from '../engine/interfaces';


export default class SidePanelEntryVis {
  readonly node: HTMLElement;

  constructor(public readonly column: Column, private ctx: IRankingHeaderContext, document: Document) {
    this.node = document.createElement('article');
    this.node.dataset.type = column.desc.type;

    this.column.on(`${Column.EVENT_FILTER_CHANGED}.panel, ${Column.EVENT_DIRTY_HEADER}.panel`, () => {
      this.update();
    });
    this.init();
    this.update();
  }

  private init() {
    this.node.innerHTML = `
      <div class="lu-sort-handle"></div><header><i class="lu-sort"></i><div class="lu-label"></div><div class="lu-toolbar"></div></header>
      <main class="lu-summary"></main>`;
    createToolbar(<HTMLElement>this.node.querySelector('.lu-toolbar'), this.column, this.ctx);
    this.node.querySelector('.lu-label')!.addEventListener('click', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      this.column.toggleMySorting();
    });

    dragAbleColumn(this.node, this.column, this.ctx);
    resortDropAble(<HTMLElement>this.node.querySelector('.lu-sort-handle')!, this.column, this.ctx, 'before', true);
  }

  update(ctx: IRankingHeaderContext = this.ctx) {
    this.ctx = ctx;
    updateHeader(this.node, this.column, this.ctx, true);
  }

  destroy() {
    this.column.on(`${Column.EVENT_FILTER_CHANGED}.panel, ${Column.EVENT_DIRTY_HEADER}.panel`, null);
    this.node.remove();
  }
}