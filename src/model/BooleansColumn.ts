import ArrayColumn, { type IArrayColumnDesc } from './ArrayColumn';
import type { ISetColumn, ICategoricalColorMappingFunction } from './ICategoricalColumn';
import type { IDataRow, ITypeFactory, ECompareValueType, IColumnDump } from './interfaces';
import CategoricalColumn from './CategoricalColumn';
import { DEFAULT_CATEGORICAL_COLOR_FUNCTION } from './CategoricalColorMappingFunction';
import type ValueColumn from './ValueColumn';
import type { dataLoaded } from './ValueColumn';
import {
  DEFAULT_COLOR,
  labelChanged,
  metaDataChanged,
  dirty,
  dirtyHeader,
  dirtyValues,
  rendererTypeChanged,
  groupRendererChanged,
  summaryRendererChanged,
  visibilityChanged,
  widthChanged,
  dirtyCaches,
} from './Column';
import Column from './Column';
import type { IEventListener } from '../internal';
import { chooseUIntByDataLength, integrateDefaults } from './internal';
import { toCategory } from './internalCategorical';
import { toolbar } from './annotations';
import { restoreTypedValue } from './diff';

export declare type IBooleansColumnDesc = IArrayColumnDesc<boolean>;

/**
 * emitted when the color mapping property changes
 * @asMemberOf BooleansColumn
 * @event
 */
export declare function colorMappingChanged_BCS(
  previous: ICategoricalColorMappingFunction,
  current: ICategoricalColorMappingFunction
): void;

@toolbar('rename', 'clone', 'sort', 'sortBy')
export default class BooleansColumn extends ArrayColumn<boolean> implements ISetColumn {
  static readonly EVENT_COLOR_MAPPING_CHANGED = CategoricalColumn.EVENT_COLOR_MAPPING_CHANGED;

  private colorMapping: ICategoricalColorMappingFunction;

  constructor(id: string, desc: Readonly<IBooleansColumnDesc>) {
    super(
      id,
      integrateDefaults(desc, {
        renderer: 'upset',
      })
    );
    this.colorMapping = DEFAULT_CATEGORICAL_COLOR_FUNCTION;
  }

  get categories() {
    return this.labels.map((d, i) => toCategory(d, i));
  }

  getSet(row: IDataRow) {
    const vs = this.getValues(row);
    return new Set(this.categories.filter((_, i) => vs[i]));
  }

  override toCompareValue(row: IDataRow) {
    const v = this.getValue(row);
    if (v == null) {
      return NaN;
    }
    return v.reduce((a, b) => a + (b ? 1 : 0), 0);
  }

  override toCompareValueType(): ECompareValueType {
    return chooseUIntByDataLength(this.dataLength);
  }

  getCategories(row: IDataRow) {
    const categories = this.categories;
    return super.getValues(row).map((v, i) => {
      return v ? categories[i]! : null;
    });
  }

  iterCategory(row: IDataRow) {
    return this.getCategories(row);
  }

  getColors(row: IDataRow) {
    return this.getCategories(row).map((d) => (d ? this.colorMapping.apply(d) : DEFAULT_COLOR));
  }

  protected override createEventList() {
    return super.createEventList().concat([BooleansColumn.EVENT_COLOR_MAPPING_CHANGED]);
  }

  override on(
    type: typeof BooleansColumn.EVENT_COLOR_MAPPING_CHANGED,
    listener: typeof colorMappingChanged_BCS | null
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

  getColorMapping() {
    return this.colorMapping.clone();
  }

  setColorMapping(mapping: ICategoricalColorMappingFunction) {
    return CategoricalColumn.prototype.setColorMapping.call(this, mapping);
  }

  override toJSON() {
    const r = super.toJSON();
    r.colorMapping = this.colorMapping.toJSON();
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
        BooleansColumn.EVENT_COLOR_MAPPING_CHANGED,
        Column.EVENT_DIRTY_HEADER,
        Column.EVENT_DIRTY_VALUES,
        Column.EVENT_DIRTY_CACHES,
        Column.EVENT_DIRTY,
      ]
    );
    return changed;
  }
}
