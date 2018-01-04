/**
 * Created by sam on 04.11.2016.
 */

import {toolbar} from './annotations';
import Column from './Column';
import {IDataRow} from './interfaces';
import {FIRST_IS_NAN} from './missing';
import ValueColumn, {IValueColumnDesc} from './ValueColumn';

export enum EAlignment {
  left = 'left',
  center = 'center',
  right = 'right'
}

export interface IStringDesc {
  /**
   * column alignment: left, center, right
   * @default left
   */
  readonly alignment?: EAlignment;

  /**
   * escape html tags
   */
  readonly escape?: boolean;

  /**
   * replacement pattern, use $1 for the input string
   */
  readonly pattern?: string;

  /**
   * optional list of pattern templates
   */
  readonly patternTemplates?: string[];
}


export declare type IStringColumnDesc = IStringDesc & IValueColumnDesc<string>;

/**
 * a string column with optional alignment
 */
@toolbar('search', 'filterString', 'editPattern')
export default class StringColumn extends ValueColumn<string> {
  static readonly EVENT_PATTERN_CHANGED = 'patternChanged';
  //magic key for filtering missing ones
  static readonly FILTER_MISSING = '__FILTER_MISSING';
  private currentFilter: string | RegExp | null = null;

  readonly alignment: EAlignment;
  readonly escape: boolean;
  private pattern: string;
  readonly patternTemplates: string[];

  constructor(id: string, desc: Readonly<IStringColumnDesc>) {
    super(id, desc);
    this.setDefaultWidth(200); //by default 200
    this.alignment = <any>desc.alignment || EAlignment.left;
    this.escape = desc.escape !== false;
    this.pattern = desc.pattern || '';
    this.patternTemplates = desc.patternTemplates || [];
  }


  setPattern(pattern: string) {
    if (pattern === this.pattern) { /*== on purpose*/
      return;
    }
    this.fire([StringColumn.EVENT_PATTERN_CHANGED, Column.EVENT_DIRTY_HEADER, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.pattern, this.pattern = pattern);
  }

  getPattern() {
    return this.pattern;
  }

  protected createEventList() {
    return super.createEventList().concat([StringColumn.EVENT_PATTERN_CHANGED]);
  }

  getValue(row: IDataRow) {
    const v: any = super.getValue(row);
    return this.replacePattern(typeof(v) === 'undefined' || v == null ? '' : String(v));
  }

  getLabel(row: IDataRow) {
    const v: any = super.getValue(row);
    return String(v);
  }

  replacePattern(s: string) {
    return this.pattern ? this.pattern.replace(/\$1/g, s || '') : s;
  }

  dump(toDescRef: (desc: any) => any): any {
    const r = super.dump(toDescRef);
    if (this.currentFilter instanceof RegExp) {
      r.filter = `REGEX:${(<RegExp>this.currentFilter).source}`;
    } else {
      r.filter = this.currentFilter;
    }
    if (this.pattern !== (<any>this.desc).pattern) {
      r.pattern = this.pattern;
    }
    return r;
  }

  restore(dump: any, factory: (dump: any) => Column | null) {
    super.restore(dump, factory);
    if (dump.filter && dump.filter.slice(0, 6) === 'REGEX:') {
      this.currentFilter = new RegExp(dump.filter.slice(6));
    } else {
      this.currentFilter = dump.filter || null;
    }
    if (dump.pattern) {
      this.pattern = dump.pattern;
    }
  }

  isFiltered() {
    return this.currentFilter != null;
  }

  filter(row: IDataRow) {
    if (!this.isFiltered()) {
      return true;
    }
    const r = this.getLabel(row);
    const filter = this.currentFilter;

    if (filter === StringColumn.FILTER_MISSING) { //filter empty
      return r != null && r.trim() !== '';
    }
    if (typeof filter === 'string' && filter.length > 0) {
      return r !== '' && r.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
    }
    if (filter instanceof RegExp) {
      return r !== '' && filter.test(r);
    }
    return true;
  }

  getFilter() {
    return this.currentFilter;
  }

  setFilter(filter: string | RegExp | null) {
    if (filter === '') {
      filter = null;
    }
    if (this.currentFilter === filter) {
      return;
    }
    this.fire([Column.EVENT_FILTER_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.currentFilter, this.currentFilter = filter);
  }

  compare(a: IDataRow, b: IDataRow) {
    const aValue = this.getValue(a);
    const bValue = this.getValue(b);
    if (aValue === '') {
      return bValue === '' ? 0 : FIRST_IS_NAN; //same = 0
    }
    if (bValue === '') {
      return - FIRST_IS_NAN;
    }
    return aValue.toLowerCase().localeCompare(bValue.toLowerCase());
  }
}
