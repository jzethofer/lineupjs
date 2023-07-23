import { format } from 'd3-format';
import { boxplotBuilder, type IAdvancedBoxPlotData, type IEventListener, type ISequence } from '../internal';
import { dialogAddons, SortByDefault, toolbar } from './annotations';
import ArrayColumn, { type IArrayColumnDesc } from './ArrayColumn';
import Column, {
  dirty,
  dirtyCaches,
  dirtyHeader,
  dirtyValues,
  groupRendererChanged,
  labelChanged,
  metaDataChanged,
  rendererTypeChanged,
  summaryRendererChanged,
  visibilityChanged,
  widthChanged,
} from './Column';
import type { IArrayDesc } from './IArrayColumn';
import { type IDataRow, ECompareValueType, type ITypeFactory, type IColumnDump } from './interfaces';
import {
  DEFAULT_FORMATTER,
  getBoxPlotNumber,
  noNumberFilter,
  restoreNumberFilter,
  toCompareBoxPlotValue,
} from './internalNumber';
import {
  EAdvancedSortMethod,
  type IColorMappingFunction,
  type IMapAbleDesc,
  type IMappingFunction,
  type INumberDesc,
  type INumberFilter,
  type INumbersColumn,
} from './INumberColumn';
import { restoreMapping } from './MappingFunction';
import { isMissingValue } from './missing';
import NumberColumn from './NumberColumn';
import type { dataLoaded } from './ValueColumn';
import type ValueColumn from './ValueColumn';
import { integrateDefaults } from './internal';
import { restoreTypedValue, restoreValue } from './diff';

export interface INumbersDesc extends IArrayDesc, INumberDesc {
  readonly sort?: EAdvancedSortMethod;
}

export declare type INumbersColumnDesc = INumbersDesc & IArrayColumnDesc<number>;

/**
 * emitted when the mapping property changes
 * @asMemberOf NumbersColumn
 * @event
 */
export declare function mappingChanged_NCS(previous: IMappingFunction, current: IMappingFunction): void;
/**
 * emitted when the color mapping property changes
 * @asMemberOf NumbersColumn
 * @event
 */
export declare function colorMappingChanged_NCS(previous: IColorMappingFunction, current: IColorMappingFunction): void;

/**
 * emitted when the sort method property changes
 * @asMemberOf NumbersColumn
 * @event
 */
export declare function sortMethodChanged_NCS(previous: EAdvancedSortMethod, current: EAdvancedSortMethod): void;

/**
 * emitted when the filter property changes
 * @asMemberOf NumbersColumn
 * @event
 */
export declare function filterChanged_NCS(previous: INumberFilter | null, current: INumberFilter | null): void;

@toolbar('rename', 'clone', 'sort', 'sortBy', 'filterNumber', 'colorMapped', 'editMapping')
@dialogAddons('sort', 'sortNumbers')
@SortByDefault('descending')
export default class NumbersColumn extends ArrayColumn<number> implements INumbersColumn {
  static readonly EVENT_MAPPING_CHANGED = NumberColumn.EVENT_MAPPING_CHANGED;
  static readonly EVENT_COLOR_MAPPING_CHANGED = NumberColumn.EVENT_COLOR_MAPPING_CHANGED;
  static readonly EVENT_SORTMETHOD_CHANGED = NumberColumn.EVENT_SORTMETHOD_CHANGED;
  static readonly EVENT_FILTER_CHANGED = NumberColumn.EVENT_FILTER_CHANGED;

  static readonly CENTER = 0;

  private readonly numberFormat: (n: number) => string = DEFAULT_FORMATTER;

  private sort: EAdvancedSortMethod;
  private mapping: IMappingFunction;
  private original: IMappingFunction;
  private colorMapping: IColorMappingFunction;
  private deriveMapping: readonly boolean[];
  /**
   * currently active filter
   * @type {{min: number, max: number}}
   * @private
   */
  private currentFilter: INumberFilter = noNumberFilter();

  constructor(id: string, desc: Readonly<INumbersColumnDesc>, factory: ITypeFactory) {
    super(
      id,
      integrateDefaults(
        desc,
        Object.assign(
          {
            renderer: 'heatmap',
            groupRenderer: 'heatmap',
            summaryRenderer: 'histogram',
          },
          desc.dataLength != null && !Number.isNaN(desc.dataLength)
            ? {
                // better initialize the default with based on the data length
                width: Math.min(Math.max(100, desc.dataLength! * 10), 500),
              }
            : {}
        )
      )
    );
    this.mapping = restoreMapping(desc, factory);
    this.original = this.mapping.clone();
    this.deriveMapping = this.mapping.domain.map((d) => d == null || Number.isNaN(d));
    this.colorMapping = factory.colorMappingFunction(desc.colorMapping || desc.color);

    if (desc.numberFormat) {
      this.numberFormat = format(desc.numberFormat);
    }

    this.sort = desc.sort || EAdvancedSortMethod.median;
  }

  override onDataUpdate(rows: ISequence<IDataRow>): void {
    super.onDataUpdate(rows);
    if (!this.deriveMapping.some(Boolean)) {
      return;
    }
    // hook for listening to data updates
    const minMax = rows
      .map((row) => this.getRawValue(row))
      .reduce(
        (acc, v) => {
          if (v == null || !Array.isArray(v)) {
            return acc;
          }
          for (const vi of v) {
            if (vi == null || Number.isNaN(vi)) {
              continue;
            }
            if (vi < acc.min) {
              acc.min = vi;
            }
            if (vi > acc.max) {
              acc.max = vi;
            }
          }
          return acc;
        },
        { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY }
      );

    const domain = this.mapping.domain.slice();
    if (this.deriveMapping[0]) {
      domain[0] = minMax.min;
    }
    if (this.deriveMapping[this.deriveMapping.length - 1]) {
      domain[domain.length - 1] = minMax.max;
    }
    this.mapping.domain = domain;
    (this.original as IMappingFunction).domain = domain;
  }

  getNumberFormat() {
    return this.numberFormat;
  }

  override toCompareValue(row: IDataRow): number {
    return toCompareBoxPlotValue(this, row);
  }

  override toCompareValueType() {
    return ECompareValueType.FLOAT;
  }

  getRawNumbers(row: IDataRow) {
    return this.getRawValue(row);
  }

  getBoxPlotData(row: IDataRow): IAdvancedBoxPlotData | null {
    const data = this.getRawValue(row);
    if (data == null) {
      return null;
    }
    const b = boxplotBuilder();
    for (const d of data) {
      b.push(isMissingValue(d) ? NaN : this.mapping.apply(d));
    }
    return b.build();
  }

  getRange() {
    return this.mapping.getRange(this.numberFormat);
  }

  getRawBoxPlotData(row: IDataRow): IAdvancedBoxPlotData | null {
    const data = this.getRawValue(row);
    if (data == null) {
      return null;
    }
    const b = boxplotBuilder();
    for (const d of data) {
      b.push(isMissingValue(d) ? NaN : d);
    }
    return b.build();
  }

  getNumbers(row: IDataRow) {
    return this.getValues(row);
  }

  getNumber(row: IDataRow): number {
    return getBoxPlotNumber(this, row, 'normalized');
  }

  getRawNumber(row: IDataRow): number {
    return getBoxPlotNumber(this, row, 'raw');
  }

  override getValue(row: IDataRow) {
    const v = this.getValues(row);
    return v.every(Number.isNaN) ? null : v;
  }

  override getValues(row: IDataRow) {
    return this.getRawValue(row).map((d) => (Number.isNaN(d) ? NaN : this.mapping.apply(d)));
  }

  iterNumber(row: IDataRow) {
    const v = this.getNumbers(row);
    if (v.every(Number.isNaN)) {
      // missing row
      return [NaN];
    }
    return v;
  }

  iterRawNumber(row: IDataRow) {
    const v = this.getRawNumbers(row);
    if (v.every(Number.isNaN)) {
      // missing row
      return [NaN];
    }
    return v;
  }

  getRawValue(row: IDataRow) {
    const r = super.getRaw(row);
    return r == null ? [] : r.map((d) => (isMissingValue(d) ? NaN : +d));
  }

  override getExportValue(row: IDataRow, format: 'text' | 'json'): any {
    return format === 'json' ? this.getRawValue(row) : super.getExportValue(row, format);
  }

  override getLabels(row: IDataRow) {
    return this.getRawValue(row).map(this.numberFormat);
  }

  getSortMethod() {
    return this.sort;
  }

  setSortMethod(sort: EAdvancedSortMethod) {
    if (this.sort === sort) {
      return;
    }
    this.fire(
      [
        NumbersColumn.EVENT_SORTMETHOD_CHANGED,
        NumberColumn.EVENT_DIRTY_HEADER,
        NumberColumn.EVENT_DIRTY_VALUES,
        NumbersColumn.EVENT_DIRTY_CACHES,
        NumberColumn.EVENT_DIRTY,
      ],
      this.sort,
      (this.sort = sort)
    );
    // sort by me if not already sorted by me
    if (!this.isSortedByMe().asc) {
      this.sortByMe();
    }
  }

  override toJSON() {
    const r = super.toJSON();
    r.map = this.mapping.toJSON();
    r.colorMapping = this.colorMapping.toJSON();
    r.filter = this.getFilter();
    r.sortMethod = this.sort;
    r.colorMapping = this.colorMapping.toJSON();
    return r;
  }

  override restore(dump: IColumnDump, factory: ITypeFactory): Set<string> {
    const changed = super.restore(dump, factory);
    if (dump.map || dump.domain) {
      const v = restoreMapping(dump as unknown as IMapAbleDesc, factory);
      const current = this.mapping.toJSON();
      const target = restoreValue(v.toJSON(), current, changed, [
        NumbersColumn.EVENT_MAPPING_CHANGED,
        Column.EVENT_DIRTY_HEADER,
        Column.EVENT_DIRTY_VALUES,
        Column.EVENT_DIRTY_CACHES,
        Column.EVENT_DIRTY,
      ]);
      if (target !== current) {
        this.mapping = v;
      }
    }
    this.colorMapping = restoreTypedValue(
      dump.colorMapping,
      this.colorMapping,
      factory.colorMappingFunction.bind(factory),
      changed,
      [
        NumbersColumn.EVENT_COLOR_MAPPING_CHANGED,
        Column.EVENT_DIRTY_HEADER,
        Column.EVENT_DIRTY_VALUES,
        Column.EVENT_DIRTY_CACHES,
        Column.EVENT_DIRTY,
      ]
    );
    this.sort = restoreValue(dump.sortMethod, this.sort, changed, NumbersColumn.EVENT_SORTMETHOD_CHANGED);
    this.currentFilter = restoreValue(
      dump.filter ? restoreNumberFilter(dump.filter) : undefined,
      this.currentFilter,
      changed,
      [NumberColumn.EVENT_FILTER_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY]
    );
    return changed;
  }

  protected override createEventList() {
    return super
      .createEventList()
      .concat([
        NumbersColumn.EVENT_COLOR_MAPPING_CHANGED,
        NumbersColumn.EVENT_MAPPING_CHANGED,
        NumbersColumn.EVENT_SORTMETHOD_CHANGED,
        NumbersColumn.EVENT_FILTER_CHANGED,
      ]);
  }

  override on(
    type: typeof NumbersColumn.EVENT_COLOR_MAPPING_CHANGED,
    listener: typeof colorMappingChanged_NCS | null
  ): this;
  override on(type: typeof NumbersColumn.EVENT_MAPPING_CHANGED, listener: typeof mappingChanged_NCS | null): this;
  override on(type: typeof NumbersColumn.EVENT_SORTMETHOD_CHANGED, listener: typeof sortMethodChanged_NCS | null): this;
  override on(type: typeof NumbersColumn.EVENT_FILTER_CHANGED, listener: typeof filterChanged_NCS | null): this;
  override on(type: typeof ValueColumn.EVENT_DATA_LOADED, listener: typeof dataLoaded | null): this;
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

  getOriginalMapping() {
    return this.original.clone();
  }

  getMapping() {
    return this.mapping.clone();
  }

  setMapping(mapping: IMappingFunction) {
    if (this.mapping.eq(mapping)) {
      return;
    }
    this.deriveMapping = [];
    this.fire(
      [
        NumbersColumn.EVENT_MAPPING_CHANGED,
        Column.EVENT_DIRTY_HEADER,
        Column.EVENT_DIRTY_VALUES,
        Column.EVENT_DIRTY_CACHES,
        Column.EVENT_DIRTY,
      ],
      this.mapping.clone(),
      (this.mapping = mapping)
    );
  }

  override getColor(row: IDataRow) {
    return NumberColumn.prototype.getColor.call(this, row);
  }

  getColorMapping() {
    return this.colorMapping.clone();
  }

  setColorMapping(mapping: IColorMappingFunction) {
    if (this.colorMapping.eq(mapping)) {
      return;
    }
    this.fire(
      [
        NumbersColumn.EVENT_COLOR_MAPPING_CHANGED,
        Column.EVENT_DIRTY_HEADER,
        Column.EVENT_DIRTY_VALUES,
        Column.EVENT_DIRTY_CACHES,
        Column.EVENT_DIRTY,
      ],
      this.colorMapping.clone(),
      (this.colorMapping = mapping)
    );
  }

  override isFiltered() {
    return NumberColumn.prototype.isFiltered.call(this);
  }

  getFilter(): INumberFilter {
    return NumberColumn.prototype.getFilter.call(this);
  }

  setFilter(value: INumberFilter | null) {
    NumberColumn.prototype.setFilter.call(this, value);
  }

  override filter(row: IDataRow) {
    return NumberColumn.prototype.filter.call(this, row);
  }

  override clearFilter() {
    return NumberColumn.prototype.clearFilter.call(this);
  }
}
