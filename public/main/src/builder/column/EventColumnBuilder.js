var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { EBoxplotDataKeys, ETimeUnit, EventColumn, } from '../../model';
import ColumnBuilder from './ColumnBuilder';
/**
 * Builder class for creating event columns.
 */
var EventColumnBuilder = /** @class */ (function (_super) {
    __extends(EventColumnBuilder, _super);
    function EventColumnBuilder(column) {
        return _super.call(this, 'event', column) || this;
    }
    /**
     * Sets whether the event column should adapt to the filters.
     * The default is false.
     * @param adaptAxisToFilters - A boolean indicating if the event column axis adapts to rows currently included in the filtered table or uses the global minimum and maximum.
     * @default false
     * @returns The updated EventColumnBuilder instance.
     */
    EventColumnBuilder.prototype.adaptAxisToFilters = function (adaptAxisToFilters) {
        this.desc.adaptAxisToFilters = adaptAxisToFilters;
        return this;
    };
    /**
     * Sets whether the event data supports boxplot visualization.
     * The default is false. If set to true, the boxplot visualization and related settings will be available in the LineUp UI.
     * @param boxplotPossible - A boolean indicating if boxplot visualization is possible.
     * @returns The updated EventColumnBuilder instance.
     */
    EventColumnBuilder.prototype.boxplotPossible = function (boxplotPossible) {
        this.desc.boxplotPossible = boxplotPossible;
        return this;
    };
    /**
     * Sets the reference event for the boxplot visualization.
     * All boxplots will be drawn relative to this event.
     * The default is to use the first event in the event list.
     * @param boxPlotReferenceEvent - The reference event to set.
     * @returns The updated EventColumnBuilder instance.
     */
    EventColumnBuilder.prototype.boxPlotReferenceEvent = function (boxPlotReferenceEvent) {
        this.desc.boxplotReferenceEvent = boxPlotReferenceEvent;
        return this;
    };
    /**
     * Sets the unit of the boxplot data as {@link ETimeUnit}.
     * If the unit is set to {@link ETimeUnit.custom}, the milliseconds per unit can be specified.
     * The default is {@link ETimeUnit.D}.
     * @param boxplotUnit - The unit of the boxplot data.
     * @param msPerUnit - The milliseconds per unit for a custom time unit.
     * @returns The updated EventColumnBuilder instance.
     */
    EventColumnBuilder.prototype.boxplotUnit = function (boxplotUnit, msPerUnit) {
        if (boxplotUnit === ETimeUnit.custom) {
            this.desc.msPerBoxplotUnit = msPerUnit;
        }
        else {
            this.desc.msPerBoxplotUnit = EventColumn.TIME_UNITS_IN_MS[boxplotUnit];
        }
        return this;
    };
    /**
     * Sets the callback function for custom tooltips.
     * The callback function will be called when hovering over an event cell receives an array of {@link ITooltipRow} objects.
     * When no callback function is specified, the default tooltip with popperjs will be displayed.
     * @param tooltipCallback - callback function.
     * @returns The updated EventColumnBuilder instance.
     */
    EventColumnBuilder.prototype.customTooltip = function (tooltipCallback) {
        this.desc.customTooltipCallback = tooltipCallback;
        return this;
    };
    /**
     * Sets the list of event for that should be displayed on initialization.
     * The default is to display all events specified in {@link eventList}.
     * @param displayEventList - The list of display events.
     *        It should be an array of strings representing the events to be displayed.
     * @returns The updated EventColumnBuilder instance.
     */
    EventColumnBuilder.prototype.displayEventList = function (displayEventList) {
        this.desc.displayEventList = displayEventList;
        return this;
    };
    /**
     * Displays a zero line in the event column if set to true.
     * The default is false.
     * @param displayZeroLine - A boolean indicating if the zero line should be displayed.
     * @returns The updated EventColumnBuilder instance.
     */
    EventColumnBuilder.prototype.displayZeroLine = function (displayZeroLine) {
        this.desc.displayZeroLine = displayZeroLine;
        return this;
    };
    /**
     * Sets the list of events for the event column. Other events will be ignored.
     * The default is to display all events of the data.
     * @param eventList - String array representing the events.
     * @returns The updated EventColumnBuilder instance.
     */
    EventColumnBuilder.prototype.eventList = function (eventList) {
        this.desc.eventList = eventList;
        return this;
    };
    /**
     * Sets the minimum and maximum values for the event column scale.
     * Values outside the bounds will only be visible when zooming.
     * The default is to use the minimum and maximum values of the data.
     * @param min - The minimum value.
     * @param max - The maximum value.
     * @returns The updated EventColumnBuilder instance.
     */
    EventColumnBuilder.prototype.eventScaleBounds = function (min, max) {
        this.desc.eventScaleMin = min;
        this.desc.eventScaleMax = max;
        return this;
    };
    /**
     * Sets the number of bins for the heatmap summary visualization.
     * The default is 50.
     * @param heatmapBinCount - The number of bins.
     * @returns The updated EventColumnBuilder instance.
     */
    EventColumnBuilder.prototype.heatmapBinCount = function (heatmapBinCount) {
        this.desc.heatmapBinCount = heatmapBinCount;
        return this;
    };
    /**
     * Sets the legend update callback function for displaying a legend outside of LineUp.
     * @param legendUpdateCallback - The callback function getting the new Categories on color mapping changes.
     * @returns The updated EventColumnBuilder instance.
     */
    EventColumnBuilder.prototype.legendUpdateCallback = function (legendUpdateCallback) {
        this.desc.legendUpdateCallback = legendUpdateCallback;
        return this;
    };
    /**
     * Sets the milliseconds per unit of the event scale.
     * @param eventScaleUnit - The unit of the event scale as {@link ETimeUnit}.
     * @param msPerUnit - The milliseconds per unit for a custom time unit ({@link ETimeUnit.custom}).
     * @returns The updated EventColumnBuilder instance.
     */
    EventColumnBuilder.prototype.eventScaleUnit = function (eventScaleUnit, msPerUnit) {
        this.desc.eventScaleUnit = eventScaleUnit;
        if (eventScaleUnit === ETimeUnit.custom) {
            this.desc.msPerScaleUnit = msPerUnit;
        }
        else {
            this.desc.msPerScaleUnit = EventColumn.TIME_UNITS_IN_MS[eventScaleUnit];
        }
        return this;
    };
    /**
     * Sets the reference event for all other events.
     * The default is to use the current date from {@link Date.now()}.
     * @param referenceEvent - The reference event to set.
     * @returns The EventColumnBuilder instance.
     */
    EventColumnBuilder.prototype.referenceEvent = function (referenceEvent) {
        this.desc.referenceEvent = referenceEvent;
        return this;
    };
    /**
     * Sets the sort event for the event column.
     * The default is to use the first event in the event list.
     * @param sortEvent - The event to sort by.
     * @returns The updated EventColumnBuilder instance.
     */
    EventColumnBuilder.prototype.sortEvent = function (sortEvent) {
        this.desc.sortEvent = sortEvent;
        return this;
    };
    EventColumnBuilder.prototype.deriveEvents = function (data) {
        var events = new Set();
        var col = this.desc.column;
        data.forEach(function (d) {
            var v = Object.keys(d[col]);
            v.forEach(function (vi) {
                if (!Object.keys(EBoxplotDataKeys).includes(vi))
                    events.add(vi);
            });
        });
        this.desc.eventList = Array.from(events);
    };
    /**
     * Builds the event column and derives all events from the data if no event list is specified.
     * The scale unit will be added to the column label.
     */
    EventColumnBuilder.prototype.build = function (data) {
        if (!this.desc.eventList) {
            this.deriveEvents(data);
        }
        var eventScaleUnit = this.desc.eventScaleUnit || ETimeUnit.D;
        this.label(this.desc.column + ' [' + eventScaleUnit + ']');
        return _super.prototype.build.call(this, data);
    };
    return EventColumnBuilder;
}(ColumnBuilder));
export default EventColumnBuilder;
/**
 * builds a date column builder
 * @param {string} column column which contains the associated data
 * @returns {DateColumnBuilder}
 */
export function buildEventColumn(column, displayEventList) {
    return new EventColumnBuilder(column).displayEventList(displayEventList);
}
//# sourceMappingURL=EventColumnBuilder.js.map