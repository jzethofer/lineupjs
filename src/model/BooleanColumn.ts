import { Category, toolbar } from './annotations';
import CategoricalColumn from './CategoricalColumn';
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
import type { dataLoaded } from './ValueColumn';
import ValueColumn from './ValueColumn';
import type {
  ICategoricalColumn,
  ICategory,
  ICategoricalColorMappingFunction,
  ICategoricalFilter,
} from './ICategoricalColumn';
import {
  type IDataRow,
  ECompareValueType,
  type IValueColumnDesc,
  type ITypeFactory,
  type IColumnDump,
} from './interfaces';
import type { IEventListener } from '../internal';
import { DEFAULT_CATEGORICAL_COLOR_FUNCTION } from './CategoricalColorMappingFunction';
import { integrateDefaults } from './internal';
import { missingGroup } from './missing';
import { isCategoryIncluded, isEqualCategoricalFilter } from './internalCategorical';
import { restoreTypedValue, restoreValue } from './diff';

export interface IBooleanDesc {
  /**
   * string to show for true
   * @default ✓
   */
  trueMarker?: string;
  /**
   * string to show for false
   * @default (empty)
   */
  falseMarker?: string;

  /**
   * list of values that indicate true values (case insensitive)
   * @default 'y', 'yes', 'true', true, '1','1.0', 1, 1.0, 'on'
   */
  trueValues?: readonly any[];
}

export declare type IBooleanColumnDesc = IValueColumnDesc<boolean> & IBooleanDesc;

/**
 * emitted when the color mapping property changes
 * @asMemberOf BooleanColumn
 * @event
 */
export declare function colorMappingChanged_BC(
  previous: ICategoricalColorMappingFunction,
  current: ICategoricalColorMappingFunction
): void;

/**
 * emitted when the filter property changes
 * @asMemberOf BooleanColumn
 * @event
 */
export declare function filterChanged_BC(previous: ICategoricalFilter | null, current: ICategoricalFilter | null): void;

/**
 * a string column with optional alignment
 */
@toolbar('rename', 'clone', 'sort', 'sortBy', 'group', 'groupBy', 'filterCategorical', 'colorMappedCategorical')
@Category('categorical')
export default class BooleanColumn extends ValueColumn<boolean> implements ICategoricalColumn {
  static readonly EVENT_FILTER_CHANGED = 'filterChanged';
  static readonly EVENT_COLOR_MAPPING_CHANGED = 'colorMappingChanged';

  static readonly GROUP_TRUE = { name: 'True', color: '#444444' };
  static readonly GROUP_FALSE = { name: 'False', color: '#dddddd' };
  static readonly DEFAULT_TRUE_VALUES: any[] = ['y', 'yes', 'true', true, '1', '1.0', 1, 1.0, 'on'];

  private currentFilter: ICategoricalFilter | null = null;

  private colorMapping: ICategoricalColorMappingFunction;
  readonly categories: ICategory[];

  constructor(id: string, desc: Readonly<IBooleanColumnDesc>) {
    super(
      id,
      integrateDefaults(desc, {
        width: 30,
        renderer: 'categorical',
        groupRenderer: 'categorical',
        summaryRenderer: 'categorical',
      })
    );
    this.categories = [
      {
        name: desc.trueMarker ?? '✓',
        color: BooleanColumn.GROUP_TRUE.color,
        label: BooleanColumn.GROUP_TRUE.name,
        value: 0,
      },
      {
        name: desc.falseMarker ?? '',
        color: BooleanColumn.GROUP_FALSE.color,
        label: BooleanColumn.GROUP_FALSE.name,
        value: 1,
      },
    ];
    this.colorMapping = DEFAULT_CATEGORICAL_COLOR_FUNCTION;
  }

  protected override createEventList() {
    return super
      .createEventList()
      .concat([BooleanColumn.EVENT_COLOR_MAPPING_CHANGED, BooleanColumn.EVENT_FILTER_CHANGED]);
  }

  override on(type: typeof BooleanColumn.EVENT_FILTER_CHANGED, listener: typeof filterChanged_BC | null): this;
  override on(
    type: typeof BooleanColumn.EVENT_COLOR_MAPPING_CHANGED,
    listener: typeof colorMappingChanged_BC | null
  ): this;
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

  get dataLength() {
    return this.categories.length;
  }

  get labels() {
    return this.categories.map((d) => d.label);
  }

  override getValue(row: IDataRow) {
    const v: any = super.getValue(row);
    if (typeof v === 'undefined' || v == null) {
      return null;
    }
    const trueValues = (this.desc as IBooleanDesc).trueValues ?? BooleanColumn.DEFAULT_TRUE_VALUES;
    const vs = String(v).toLowerCase();
    return trueValues.some((d) => d === v || d === vs);
  }

  getCategoryOfBoolean(v: boolean | null) {
    return v == null ? null : this.categories[v ? 0 : 1];
  }

  getCategory(row: IDataRow) {
    const v = this.getValue(row);
    return v == null ? null : this.categories[v ? 0 : 1];
  }

  getCategories(row: IDataRow) {
    return [this.getCategory(row)];
  }

  iterCategory(row: IDataRow) {
    return [this.getCategory(row)];
  }

  override getColor(row: IDataRow) {
    return CategoricalColumn.prototype.getColor.call(this, row);
  }

  override getLabel(row: IDataRow) {
    return CategoricalColumn.prototype.getLabel.call(this, row);
  }

  getLabels(row: IDataRow) {
    return CategoricalColumn.prototype.getLabels.call(this, row);
  }

  getValues(row: IDataRow) {
    return CategoricalColumn.prototype.getValues.call(this, row);
  }

  getMap(row: IDataRow) {
    return CategoricalColumn.prototype.getMap.call(this, row);
  }

  getMapLabel(row: IDataRow) {
    return CategoricalColumn.prototype.getMapLabel.call(this, row);
  }

  getSet(row: IDataRow) {
    const v = this.getValue(row);
    const r = new Set<ICategory>();
    if (v != null) {
      r.add(this.categories[v ? 0 : 1]);
    }
    return r;
  }

  override toJSON() {
    const r = super.toJSON();
    r.colorMapping = this.colorMapping.toJSON();
    r.filter = this.getFilter();
    return r;
  }

  override restore(dump: IColumnDump, factory: ITypeFactory): Set<string> {
    const changed = super.restore(dump, factory);
    this.colorMapping = restoreTypedValue(
      dump.colorMapping,
      this.colorMapping,
      (target) => factory.categoricalColorMappingFunction(target, this.categories),
      changed,
      [
        BooleanColumn.EVENT_COLOR_MAPPING_CHANGED,
        Column.EVENT_DIRTY_HEADER,
        Column.EVENT_DIRTY_VALUES,
        Column.EVENT_DIRTY_CACHES,
        Column.EVENT_DIRTY,
      ]
    );

    let dumped = dump.filter;
    if (typeof dumped === 'boolean') {
      dumped = {
        filter: [this.getCategoryOfBoolean(dump.filter)!.name],
        filterMissing: false,
      };
    }
    this.currentFilter = restoreValue(dump.filter, this.currentFilter, changed, [
      BooleanColumn.EVENT_FILTER_CHANGED,
      Column.EVENT_DIRTY_VALUES,
      Column.EVENT_DIRTY,
    ]);
    return changed;
  }

  getColorMapping() {
    return this.colorMapping.clone();
  }

  setColorMapping(mapping: ICategoricalColorMappingFunction) {
    if (this.colorMapping.eq(mapping)) {
      return;
    }
    this.fire(
      [
        CategoricalColumn.EVENT_COLOR_MAPPING_CHANGED,
        Column.EVENT_DIRTY_VALUES,
        Column.EVENT_DIRTY_CACHES,
        Column.EVENT_DIRTY_HEADER,
        Column.EVENT_DIRTY,
      ],
      this.colorMapping.clone(),
      (this.colorMapping = mapping)
    );
  }

  override isFiltered() {
    return this.currentFilter != null;
  }

  override filter(row: IDataRow) {
    return isCategoryIncluded(this.currentFilter, this.getCategory(row));
  }

  getFilter() {
    return this.currentFilter == null ? null : Object.assign({}, this.currentFilter);
  }

  setFilter(filter: boolean | null | ICategoricalFilter) {
    const f: ICategoricalFilter | null =
      typeof filter === 'boolean'
        ? { filter: [this.getCategoryOfBoolean(filter)!.name], filterMissing: false }
        : filter;
    if (isEqualCategoricalFilter(this.currentFilter, f)) {
      return;
    }
    this.fire(
      [BooleanColumn.EVENT_FILTER_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY],
      this.currentFilter,
      (this.currentFilter = f)
    );
  }

  override clearFilter() {
    const was = this.isFiltered();
    this.setFilter(null);
    return was;
  }

  override toCompareValue(row: IDataRow) {
    const v = this.getValue(row);
    if (v == null) {
      return NaN;
    }
    return v ? 1 : 0;
  }

  override toCompareValueType(): ECompareValueType {
    return ECompareValueType.BINARY;
  }

  override group(row: IDataRow) {
    const v = this.getValue(row);
    if (v == null) {
      return Object.assign({}, missingGroup);
    }
    return Object.assign({}, v ? BooleanColumn.GROUP_TRUE : BooleanColumn.GROUP_FALSE);
  }
}
