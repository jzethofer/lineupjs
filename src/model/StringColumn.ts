import { Category, toolbar, dialogAddons } from './annotations';
import Column, {
  widthChanged,
  labelChanged,
  metaDataChanged,
  dirty,
  dirtyHeader,
  dirtyValues,
  rendererTypeChanged,
  groupRendererChanged,
  summaryRendererChanged,
  visibilityChanged,
  dirtyCaches,
} from './Column';
import {
  defaultGroup,
  type IDataRow,
  type IGroup,
  ECompareValueType,
  type IValueColumnDesc,
  othersGroup,
  type ITypeFactory,
  type IColumnDump,
} from './interfaces';
import { missingGroup, isMissingValue } from './missing';
import type { dataLoaded } from './ValueColumn';
import ValueColumn from './ValueColumn';
import { equal, type IEventListener, type ISequence, isSeqEmpty } from '../internal';
import { integrateDefaults } from './internal';
import { restoreValue } from './diff';

export enum EAlignment {
  left = 'left',
  center = 'center',
  right = 'right',
}

export enum EStringGroupCriteriaType {
  value = 'value',
  startsWith = 'startsWith',
  regex = 'regex',
}

export interface IStringGroupCriteria {
  type: EStringGroupCriteriaType;
  values: (string | RegExp)[];
}

export interface IStringDesc {
  /**
   * column alignment: left, center, right
   * @default left
   */
  alignment?: EAlignment;

  /**
   * escape html tags
   */
  escape?: boolean;
}

export declare type IStringColumnDesc = IStringDesc & IValueColumnDesc<string>;

export interface IStringFilter {
  filter: string | RegExp | null;
  filterMissing: boolean;
}

/**
 * emitted when the filter property changes
 * @asMemberOf StringColumn
 * @event
 */
export declare function filterChanged_SC(previous: string | RegExp | null, current: string | RegExp | null): void;

/**
 * emitted when the grouping property changes
 * @asMemberOf StringColumn
 * @event
 */
export declare function groupingChanged_SC(previous: (RegExp | string)[][], current: (RegExp | string)[][]): void;

/**
 * a string column with optional alignment
 */
@toolbar('rename', 'clone', 'sort', 'sortBy', 'search', 'groupBy', 'sortGroupBy', 'filterString')
@dialogAddons('group', 'groupString')
@Category('string')
export default class StringColumn extends ValueColumn<string> {
  static readonly EVENT_FILTER_CHANGED = 'filterChanged';
  static readonly EVENT_GROUPING_CHANGED = 'groupingChanged';

  //magic key for filtering missing ones
  private static readonly FILTER_MISSING = '__FILTER_MISSING';
  private currentFilter: IStringFilter | null = null;

  readonly alignment: EAlignment;
  readonly escape: boolean;

  private currentGroupCriteria: IStringGroupCriteria = {
    type: EStringGroupCriteriaType.startsWith,
    values: [],
  };

  constructor(id: string, desc: Readonly<IStringColumnDesc>) {
    super(
      id,
      integrateDefaults(desc, {
        width: 200,
      })
    );
    this.alignment = desc.alignment ?? EAlignment.left;
    this.escape = desc.escape !== false;
  }

  protected override createEventList() {
    return super.createEventList().concat([StringColumn.EVENT_GROUPING_CHANGED, StringColumn.EVENT_FILTER_CHANGED]);
  }

  override on(type: typeof StringColumn.EVENT_FILTER_CHANGED, listener: typeof filterChanged_SC | null): this;
  override on(type: typeof ValueColumn.EVENT_DATA_LOADED, listener: typeof dataLoaded | null): this;
  override on(type: typeof StringColumn.EVENT_GROUPING_CHANGED, listener: typeof groupingChanged_SC | null): this;
  override on(type: typeof Column.EVENT_WIDTH_CHANGED, listener: typeof widthChanged | null): this;
  override on(type: typeof Column.EVENT_LABEL_CHANGED, listener: typeof labelChanged | null): this;
  override on(type: typeof Column.EVENT_METADATA_CHANGED, listener: typeof metaDataChanged | null): this;
  override on(type: typeof Column.EVENT_DIRTY, listener: typeof dirty | null): this;
  override on(type: typeof Column.EVENT_DIRTY_HEADER, listener: typeof dirtyHeader | null): this;
  override on(type: typeof Column.EVENT_DIRTY_VALUES, listener: typeof dirtyValues | null): this;
  override on(type: typeof Column.EVENT_DIRTY_CACHES, listener: typeof dirtyCaches | null): this;
  override on(type: typeof Column.EVENT_RENDERER_TYPE_CHANGED, listener: typeof rendererTypeChanged | null): this;
  override on(
    type: typeof Column.EVENT_GROUP_RENDERER_TYPE_CHANGED,
    listener: typeof groupRendererChanged | null
  ): this;
  override on(
    type: typeof Column.EVENT_SUMMARY_RENDERER_TYPE_CHANGED,
    listener: typeof summaryRendererChanged | null
  ): this;
  override on(type: typeof Column.EVENT_VISIBILITY_CHANGED, listener: typeof visibilityChanged | null): this;
  override on(type: string | string[], listener: IEventListener | null): this; // required for correct typings in *.d.ts
  override on(type: string | string[], listener: IEventListener | null): this {
    return super.on(type as any, listener);
  }

  override getValue(row: IDataRow): string | null {
    const v: any = super.getValue(row);
    return isMissingValue(v) ? null : String(v);
  }

  override getLabel(row: IDataRow) {
    return this.getValue(row) || '';
  }

  override toJSON() {
    const r = super.toJSON();
    if (this.currentFilter instanceof RegExp) {
      r.filter = `REGEX:${(this.currentFilter as RegExp).source}`;
    } else {
      r.filter = this.currentFilter;
    }
    const { type, values } = this.currentGroupCriteria;
    r.groupCriteria = {
      type,
      values: values.map((value) =>
        value instanceof RegExp && type === EStringGroupCriteriaType.regex ? value.source : value
      ),
    };
    return r;
  }

  override restore(dump: IColumnDump, factory: ITypeFactory): Set<string> {
    const changed = super.restore(dump, factory);

    function restoreGroupCriteria(d: IStringGroupCriteria): IStringGroupCriteria {
      const { type, values } = d;
      return {
        type,
        values: values.map((value) =>
          type === EStringGroupCriteriaType.regex ? new RegExp(value as string, 'm') : value
        ),
      };
    }
    this.currentGroupCriteria = restoreValue(
      dump.groupCriteria ? restoreGroupCriteria(dump.groupCriteria) : null,
      this.currentGroupCriteria,
      changed,
      [StringColumn.EVENT_GROUPING_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY]
    );

    function restoreFilter(filter) {
      if (filter == null) {
        return null;
      }
      if (typeof filter === 'string') {
        // compatibility case
        if (filter.startsWith('REGEX:')) {
          return {
            filter: new RegExp(filter.slice(6), 'm'),
            filterMissing: false,
          };
        } else if (filter === StringColumn.FILTER_MISSING) {
          return {
            filter: null,
            filterMissing: true,
          };
        } else {
          return {
            filter,
            filterMissing: false,
          };
        }
      }
      return {
        filter:
          filter.filter && (filter.filter as string).startsWith('REGEX:')
            ? new RegExp(filter.slice(6), 'm')
            : filter.filter || '',
        filterMissing: filter.filterMissing === true,
      };
    }
    this.currentFilter = restoreValue(restoreFilter(dump.filter), this.currentFilter, changed, [
      StringColumn.EVENT_FILTER_CHANGED,
      Column.EVENT_DIRTY_VALUES,
      Column.EVENT_DIRTY,
    ]);
    return changed;
  }

  override isFiltered() {
    return this.currentFilter != null;
  }

  override filter(row: IDataRow) {
    const r = this.getLabel(row);
    const filter = this.currentFilter!;
    const ff = filter.filter;

    if (r == null || r.trim() === '') {
      return !filter.filterMissing;
    }
    if (!ff) {
      return true;
    }
    if (ff instanceof RegExp) {
      return r !== '' && r.match(ff) != null; // You can not use RegExp.test(), because of https://stackoverflow.com/a/6891667
    }
    return r !== '' && r.toLowerCase().includes(ff.toLowerCase());
  }

  getFilter() {
    return this.currentFilter;
  }

  setFilter(filter: IStringFilter | null) {
    if (filter === this.currentFilter) {
      return;
    }
    const current = this.currentFilter || { filter: null, filterMissing: false };
    const target = filter || { filter: null, filterMissing: false };
    if (
      current.filterMissing === target.filterMissing &&
      (current.filter === target.filter ||
        (current.filter instanceof RegExp &&
          target.filter instanceof RegExp &&
          current.filter.source === target.filter.source))
    ) {
      return;
    }
    this.fire(
      [StringColumn.EVENT_FILTER_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY],
      this.currentFilter,
      (this.currentFilter = filter)
    );
  }

  override clearFilter() {
    const was = this.isFiltered();
    this.setFilter(null);
    return was;
  }

  getGroupCriteria(): IStringGroupCriteria {
    return this.currentGroupCriteria;
  }

  setGroupCriteria(value: IStringGroupCriteria) {
    if (equal(this.currentGroupCriteria, value) || value == null) {
      return;
    }
    const bak = this.getGroupCriteria();
    this.currentGroupCriteria = value;
    this.fire([StringColumn.EVENT_GROUPING_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], bak, value);
  }

  override group(row: IDataRow): IGroup {
    if (this.getValue(row) == null) {
      return Object.assign({}, missingGroup);
    }

    if (!this.currentGroupCriteria) {
      return Object.assign({}, othersGroup);
    }
    const value = this.getLabel(row);

    if (!value) {
      return Object.assign({}, missingGroup);
    }

    const { type, values } = this.currentGroupCriteria;
    if (type === EStringGroupCriteriaType.value) {
      return {
        name: value,
        color: defaultGroup.color,
      };
    }
    if (type === EStringGroupCriteriaType.startsWith) {
      for (const groupValue of values) {
        if (typeof groupValue !== 'string' || !value.startsWith(groupValue)) {
          continue;
        }
        return {
          name: groupValue,
          color: defaultGroup.color,
        };
      }
      return Object.assign({}, othersGroup);
    }
    for (const groupValue of values) {
      if (!(groupValue instanceof RegExp) || !groupValue.test(value)) {
        continue;
      }
      return {
        name: groupValue.source,
        color: defaultGroup.color,
      };
    }
    return Object.assign({}, othersGroup);
  }

  override toCompareValue(row: IDataRow) {
    const v = this.getValue(row);
    return v === '' || v == null ? null : v.toLowerCase();
  }

  override toCompareValueType() {
    return ECompareValueType.STRING;
  }

  override toCompareGroupValue(rows: ISequence<IDataRow>, _group: IGroup, valueCache?: ISequence<any>) {
    if (isSeqEmpty(rows)) {
      return null;
    }
    // take the smallest one
    if (valueCache) {
      return valueCache.reduce((acc, v) => (acc == null || v < acc ? v : acc), null as null | string);
    }
    return rows.reduce((acc, d) => {
      const v = this.getValue(d);
      return acc == null || (v != null && v < acc) ? v : acc;
    }, null as null | string);
  }

  override toCompareGroupValueType() {
    return ECompareValueType.STRING;
  }
}
