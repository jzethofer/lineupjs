import Column, { dirty, dirtyCaches, dirtyHeader, dirtyValues, groupRendererChanged, labelChanged, metaDataChanged, rendererTypeChanged, summaryRendererChanged, visibilityChanged, widthChanged } from './Column';
import { ZoomTransform } from 'd3-zoom';
import type { EAdvancedSortMethod, IColorMappingFunction, IMappingFunction, INumberFilter } from './INumberColumn';
import type { IMapColumnDesc } from './MapColumn';
import type { ICategoricalColorMappingFunction, ICategory } from './ICategoricalColumn';
import MapColumn from './MapColumn';
import { ECompareValueType, type IDataRow, type ITypeFactory } from './interfaces';
import type { IKeyValue } from './IArrayColumn';
import type { dataLoaded } from './ValueColumn';
import type ValueColumn from './ValueColumn';
import type { IBoxPlotData, IEventListener, ISequence } from '../internal';
import { type ScaleLinear } from 'd3-scale';
export declare enum EBoxplotDataKeys {
    min = "min",
    q1 = "q1",
    median = "median",
    q3 = "q3",
    max = "max"
}
export declare enum ETimeUnit {
    ms = "ms",
    s = "s",
    min = "min",
    h = "h",
    D = "D",
    W = "W",
    M = "M",
    Y = "Y",
    custom = "custom"
}
export interface ITooltipRow {
    eventName: string;
    value: string;
    color: string;
    date?: Date;
}
/**
 * Callback function to update a legend outside of LineUp.
 * It is called whenever the color mapping changes.
 * @param categories - The categories of the legend.
 * @param colorMapping - Color mapping function to obtain a color for each category.
 * @param boxPlotlabel - The label for the boxplot legend.
 * @param boxPlotColor - The color for the boxplot legend.
 */
export type TEventLegendUpdateCallback = (categories: ICategory[], colorMapping: ICategoricalColorMappingFunction, boxPlotlabel?: string, boxPlotColor?: string) => void;
/**
 * emitted when the mapping property changes
 * @asMemberOf NumberMapColumn
 * @event
 */
export declare function mappingChangedNMC(previous: IMappingFunction, current: IMappingFunction): void;
/**
 * emitted when the color mapping property changes
 * @asMemberOf NumberMapColumn
 * @event
 */
export declare function colorMappingChangedNMC(previous: IColorMappingFunction, current: IColorMappingFunction): void;
/**
 * emitted when the sort method property changes
 * @asMemberOf NumberMapColumn
 * @event
 */
export declare function sortMethodChangedNMC(previous: EAdvancedSortMethod, current: EAdvancedSortMethod): void;
/**
 * emitted when the filter property changes
 * @asMemberOf NumberMapColumn
 * @event
 */
export declare function filterChangedNMC(previous: INumberFilter | null, current: INumberFilter | null): void;
export declare type IEventColumnDesc = IMapColumnDesc<number> & {
    /**
     * indicates if the axis should be adapted to the current filters.
     * If set to true, the minimum and maximum axis value will adapt to data rows currently present in the table.
     * If set to false, the axis will always show global minimum and maximum event values.
     * @default false
     */
    adaptAxisToFilters?: boolean;
    /**
     * indicates if boxplots can be displayed. When set to false, settings related to boxplots are hidden.
     * @default false
     */
    boxplotPossible?: boolean;
    /**
     * The reference event for the boxplot visualization. All boxplots will be drawn relative to this event.
     * @default 'Current Date'
     */
    boxplotReferenceEvent?: string;
    /**
     * Callback function to create a tooltip outside of LineUp.
     * @param tooltipData - The data for the tooltip.
     */
    customTooltipCallback?: (tooltipData: ITooltipRow[]) => void;
    /**
     * The list of events to be displayed on initialization.
     * default are the events from {@link IEventColumnDesc.eventList}
     */
    displayEventList?: string[];
    /**
     * Displays a line at 0 on the event scale if set to true. The default is false.
     */
    displayZeroLine?: boolean;
    /**
     * The list of events used in the {@link EventColumn}. All other events in the data are ignored.
     * default are all events in the data.
     */
    eventList: string[];
    /**
     * Minimum number of the event scale. If events are smaller than this value, they will be cut off and only visible on zoom in.
     * @default -Infinity
     */
    eventScaleMin?: number;
    /**
     * Maximum number of the event scale. If events are larger than this value, they will be cut off and only visible on zoom out.
     * @default Infinity
     */
    eventScaleMax?: number;
    /**
     * The unit of the event data scale used for display in the header.
     * @default 'D'
     */
    eventScaleUnit?: ETimeUnit;
    /**
     * Bin count of the summary visualization heatmap.
     * @default 50
     */
    heatmapBinCount?: number;
    /**
     * Callback function to update a legend outside of LineUp.
     * It is called whenever the color mapping changes.
     * Its type is {@link TEventLegendUpdateCallback}.
     */
    legendUpdateCallback?: TEventLegendUpdateCallback;
    /**
     * The unit of the event scale in milliseconds.
     * @default 1000 * 60 * 60 * 24
     */
    msPerScaleUnit?: number;
    /**
     * The unit of the boxplot data in milliseconds.
     * @default 1
     */
    msPerBoxplotUnit?: number;
    /**
     * The reference event for the event scale. All events will be displayed relative to this event.
     * This means that the value on the event scale will be 0 for this event.
     * @default 'Current Date'
     */
    referenceEvent?: string;
    /**
     * The event used for sorting the column.
     *
     * Default is the first event in {@link IEventColumnDesc.eventList}
     */
    sortEvent?: string;
};
/**
 * Column storing events as map of numbers.
 * Each key of the map represents an event and the value represents the time of the event in milliseconds since 1.1.1970.
 * Keys can also be boxplotvalues defined in {@link EBoxplotDataKeys}.
 * All events values are displayed relative to the reference event.
 * @see {@link IEventColumnDesc} for a detailed description of the parameters.
 * @extends MapColumn<number>
 */
export default class EventColumn extends MapColumn<number> {
    static readonly CURRENT_DATE_REFERENCE = "Current Date";
    static readonly BOXPLOT_DEFAULT_COLOR = "#ff7f00";
    static readonly BOXPLOT_COLOR_NAME = "boxplotColor";
    static readonly EVENT_MAPPING_CHANGED = "mappingChanged";
    static readonly EVENT_COLOR_MAPPING_CHANGED = "colorMappingChanged";
    static readonly EVENT_SORTMETHOD_CHANGED = "sortMethodChanged";
    static readonly EVENT_FILTER_CHANGED = "filterChanged";
    static readonly TIME_UNITS_IN_MS: Record<ETimeUnit, number>;
    private sortEvent;
    private colorMapping;
    private boxplotReferenceEvent;
    private customTooltipCallback;
    private msPerBoxplotUnit;
    private displayEventList;
    private displayEventListOverview;
    private displayZeroLine;
    private eventListOverview;
    private eventList;
    private categories;
    private readonly boxplotPossible;
    private legendUpdateCallback;
    private scaleMin;
    private scaleMax;
    private scaleMinBound;
    private scaleMaxBound;
    private referenceEvent;
    private msPerUnit;
    private scaleTransform;
    private showBoxplot;
    private heatmapBinCount;
    private xScale;
    private xScaleZoomed;
    private minMaxCache;
    private minMaxPrecomputed;
    private adaptAxisToFilters;
    constructor(id: string, desc: Readonly<IEventColumnDesc>);
    private eventMappingChanged;
    private updateLegend;
    onDataUpdate(_rows: ISequence<IDataRow>): void;
    private loadMinMax;
    getTooltipContent(row: IDataRow): ITooltipRow[] | null;
    createXScale(): void;
    getXScale(zoomed?: boolean): ScaleLinear<number, number, never>;
    computeMinMax(dataRows: ISequence<IKeyValue<number>[]>, rowIndices?: number[]): [number, number];
    private getTooltipData;
    getHeatmapBinCount(): number;
    getColorMapping(): ICategoricalColorMappingFunction;
    setColorMapping(mapping: ICategoricalColorMappingFunction): void;
    getDisplayZeroLine(): boolean;
    getAdaptAxisToFilters(): boolean;
    setAdaptAxisToFilters(adaptAxisToFilters: boolean): void;
    setDisplayZeroLine(displayZeroLine: boolean): void;
    getCategoryColor(category: string): string;
    getEventList(overview?: boolean): string[];
    getDisplayEventList(overview?: boolean): string[];
    setDisplayEventList(eventList: string[], overview?: boolean): void;
    getBoxplotPossible(): boolean;
    getBoxplotReferenceEvent(): string;
    setBoxplotReferenceEvent(boxplotReferenceEvent: string): void;
    getShowBoxplot(): boolean;
    setShowBoxplot(showBoxplot: boolean): void;
    getBoxplotData(eventData: IKeyValue<number>[]): IBoxPlotData;
    private getBoxplotOffset;
    getEventValue(events: IKeyValue<number>[], valKey?: string): number;
    getEventValues(events: IKeyValue<number>[], overview?: boolean, eventKeys?: any[]): IKeyValue<number>[];
    toCompareValue(row: IDataRow): number;
    toCompareValueType(): ECompareValueType;
    getRange(): [number, number];
    getScaleTransform(): ZoomTransform;
    setScaleTransform(transform: ZoomTransform): void;
    getSortMethod(): string;
    getReferenceEvent(): string;
    setReferenceEvent(referenceEvent: string): void;
    setSortMethod(sort: string): void;
    setScaleDimensions(min: number, max: number): void;
    dump(toDescRef: (desc: any) => any): any;
    restore(dump: any, factory: ITypeFactory): void;
    protected createEventList(): string[];
    on(type: typeof EventColumn.EVENT_COLOR_MAPPING_CHANGED, listener: typeof colorMappingChangedNMC | null): this;
    on(type: typeof EventColumn.EVENT_MAPPING_CHANGED, listener: typeof mappingChangedNMC | null): this;
    on(type: typeof EventColumn.EVENT_SORTMETHOD_CHANGED, listener: typeof sortMethodChangedNMC | null): this;
    on(type: typeof EventColumn.EVENT_FILTER_CHANGED, listener: typeof filterChangedNMC | null): this;
    on(type: typeof ValueColumn.EVENT_DATA_LOADED, listener: typeof dataLoaded | null): this;
    on(type: typeof Column.EVENT_WIDTH_CHANGED, listener: typeof widthChanged | null): this;
    on(type: typeof Column.EVENT_LABEL_CHANGED, listener: typeof labelChanged | null): this;
    on(type: typeof Column.EVENT_METADATA_CHANGED, listener: typeof metaDataChanged | null): this;
    on(type: typeof Column.EVENT_DIRTY, listener: typeof dirty | null): this;
    on(type: typeof Column.EVENT_DIRTY_HEADER, listener: typeof dirtyHeader | null): this;
    on(type: typeof Column.EVENT_DIRTY_VALUES, listener: typeof dirtyValues | null): this;
    on(type: typeof Column.EVENT_DIRTY_CACHES, listener: typeof dirtyCaches | null): this;
    on(type: typeof Column.EVENT_RENDERER_TYPE_CHANGED, listener: typeof rendererTypeChanged | null): this;
    on(type: typeof Column.EVENT_GROUP_RENDERER_TYPE_CHANGED, listener: typeof groupRendererChanged | null): this;
    on(type: typeof Column.EVENT_SUMMARY_RENDERER_TYPE_CHANGED, listener: typeof summaryRendererChanged | null): this;
    on(type: typeof Column.EVENT_VISIBILITY_CHANGED, listener: typeof visibilityChanged | null): this;
    on(type: string | string[], listener: IEventListener | null): this;
}
//# sourceMappingURL=EventColumn.d.ts.map