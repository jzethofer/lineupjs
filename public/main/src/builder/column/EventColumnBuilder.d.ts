import { ETimeUnit, type IEventColumnDesc, type ITooltipRow, type TEventLegendUpdateCallback } from '../../model';
import ColumnBuilder from './ColumnBuilder';
/**
 * Builder class for creating event columns.
 */
export default class EventColumnBuilder extends ColumnBuilder<IEventColumnDesc> {
    constructor(column: string);
    /**
     * Sets whether the event column should adapt to the filters.
     * The default is false.
     * @param adaptAxisToFilters - A boolean indicating if the event column axis adapts to rows currently included in the filtered table or uses the global minimum and maximum.
     * @default false
     * @returns The updated EventColumnBuilder instance.
     */
    adaptAxisToFilters(adaptAxisToFilters: boolean): this;
    /**
     * Sets whether the event data supports boxplot visualization.
     * The default is false. If set to true, the boxplot visualization and related settings will be available in the LineUp UI.
     * @param boxplotPossible - A boolean indicating if boxplot visualization is possible.
     * @returns The updated EventColumnBuilder instance.
     */
    boxplotPossible(boxplotPossible: boolean): this;
    /**
     * Sets the reference event for the boxplot visualization.
     * All boxplots will be drawn relative to this event.
     * The default is to use the first event in the event list.
     * @param boxPlotReferenceEvent - The reference event to set.
     * @returns The updated EventColumnBuilder instance.
     */
    boxPlotReferenceEvent(boxPlotReferenceEvent: string): this;
    /**
     * Sets the unit of the boxplot data as {@link ETimeUnit}.
     * If the unit is set to {@link ETimeUnit.custom}, the milliseconds per unit can be specified.
     * The default is {@link ETimeUnit.D}.
     * @param boxplotUnit - The unit of the boxplot data.
     * @param msPerUnit - The milliseconds per unit for a custom time unit.
     * @returns The updated EventColumnBuilder instance.
     */
    boxplotUnit(boxplotUnit: ETimeUnit, msPerUnit?: number): this;
    /**
     * Sets the callback function for custom tooltips.
     * The callback function will be called when hovering over an event cell receives an array of {@link ITooltipRow} objects.
     * When no callback function is specified, the default tooltip with popperjs will be displayed.
     * @param tooltipCallback - callback function.
     * @returns The updated EventColumnBuilder instance.
     */
    customTooltip(tooltipCallback: (tooltipData: ITooltipRow[]) => void): this;
    /**
     * Sets the list of event for that should be displayed on initialization.
     * The default is to display all events specified in {@link eventList}.
     * @param displayEventList - The list of display events.
     *        It should be an array of strings representing the events to be displayed.
     * @returns The updated EventColumnBuilder instance.
     */
    displayEventList(displayEventList: string[]): this;
    /**
     * Displays a zero line in the event column if set to true.
     * The default is false.
     * @param displayZeroLine - A boolean indicating if the zero line should be displayed.
     * @returns The updated EventColumnBuilder instance.
     */
    displayZeroLine(displayZeroLine: boolean): this;
    /**
     * Sets the list of events for the event column. Other events will be ignored.
     * The default is to display all events of the data.
     * @param eventList - String array representing the events.
     * @returns The updated EventColumnBuilder instance.
     */
    eventList(eventList: string[]): this;
    /**
     * Sets the minimum and maximum values for the event column scale.
     * Values outside the bounds will only be visible when zooming.
     * The default is to use the minimum and maximum values of the data.
     * @param min - The minimum value.
     * @param max - The maximum value.
     * @returns The updated EventColumnBuilder instance.
     */
    eventScaleBounds(min: number, max: number): this;
    /**
     * Sets the number of bins for the heatmap summary visualization.
     * The default is 50.
     * @param heatmapBinCount - The number of bins.
     * @returns The updated EventColumnBuilder instance.
     */
    heatmapBinCount(heatmapBinCount: number): this;
    /**
     * Sets the legend update callback function for displaying a legend outside of LineUp.
     * @param legendUpdateCallback - The callback function getting the new Categories on color mapping changes.
     * @returns The updated EventColumnBuilder instance.
     */
    legendUpdateCallback(legendUpdateCallback: TEventLegendUpdateCallback): this;
    /**
     * Sets the milliseconds per unit of the event scale.
     * @param eventScaleUnit - The unit of the event scale as {@link ETimeUnit}.
     * @param msPerUnit - The milliseconds per unit for a custom time unit ({@link ETimeUnit.custom}).
     * @returns The updated EventColumnBuilder instance.
     */
    eventScaleUnit(eventScaleUnit: ETimeUnit, msPerUnit?: number): this;
    /**
     * Sets the reference event for all other events.
     * The default is to use the current date from {@link Date.now()}.
     * @param referenceEvent - The reference event to set.
     * @returns The EventColumnBuilder instance.
     */
    referenceEvent(referenceEvent: string): this;
    /**
     * Sets the sort event for the event column.
     * The default is to use the first event in the event list.
     * @param sortEvent - The event to sort by.
     * @returns The updated EventColumnBuilder instance.
     */
    sortEvent(sortEvent: string): this;
    private deriveEvents;
    /**
     * Builds the event column and derives all events from the data if no event list is specified.
     * The scale unit will be added to the column label.
     */
    build(data: any[]): IEventColumnDesc;
}
/**
 * builds a date column builder
 * @param {string} column column which contains the associated data
 * @returns {DateColumnBuilder}
 */
export declare function buildEventColumn(column: string, displayEventList?: string[]): EventColumnBuilder;
//# sourceMappingURL=EventColumnBuilder.d.ts.map