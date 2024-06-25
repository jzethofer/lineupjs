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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Category, SortByDefault, dialogAddons, toolbar } from './annotations';
import Column, { dirty, dirtyCaches, dirtyHeader, dirtyValues, groupRendererChanged, labelChanged, metaDataChanged, rendererTypeChanged, summaryRendererChanged, visibilityChanged, widthChanged, } from './Column';
import { ZoomTransform, zoomIdentity } from 'd3-zoom';
import { schemeSet1 } from 'd3-scale-chromatic';
import MapColumn from './MapColumn';
import NumberColumn from './NumberColumn';
import CategoricalColumn from './CategoricalColumn';
import { DEFAULT_CATEGORICAL_COLOR_FUNCTION } from './CategoricalColorMappingFunction';
import { ECompareValueType } from './interfaces';
import { integrateDefaults } from './internal';
import { format } from 'd3-format';
import { scaleLinear } from 'd3-scale';
export var EBoxplotDataKeys;
(function (EBoxplotDataKeys) {
    EBoxplotDataKeys["min"] = "min";
    EBoxplotDataKeys["q1"] = "q1";
    EBoxplotDataKeys["median"] = "median";
    EBoxplotDataKeys["q3"] = "q3";
    EBoxplotDataKeys["max"] = "max";
})(EBoxplotDataKeys || (EBoxplotDataKeys = {}));
export var ETimeUnit;
(function (ETimeUnit) {
    ETimeUnit["ms"] = "ms";
    ETimeUnit["s"] = "s";
    ETimeUnit["min"] = "min";
    ETimeUnit["h"] = "h";
    ETimeUnit["D"] = "D";
    ETimeUnit["W"] = "W";
    ETimeUnit["M"] = "M";
    ETimeUnit["Y"] = "Y";
    ETimeUnit["custom"] = "custom";
})(ETimeUnit || (ETimeUnit = {}));
/**
 * Column storing events as map of numbers.
 * Each key of the map represents an event and the value represents the time of the event in milliseconds since 1.1.1970.
 * Keys can also be boxplotvalues defined in {@link EBoxplotDataKeys}.
 * All events values are displayed relative to the reference event.
 * @see {@link IEventColumnDesc} for a detailed description of the parameters.
 * @extends MapColumn<number>
 */
var EventColumn = /** @class */ (function (_super) {
    __extends(EventColumn, _super);
    function EventColumn(id, desc) {
        var _this = _super.call(this, id, integrateDefaults(desc, {
            renderer: 'event',
            groupRenderer: 'event',
            summaryRenderer: 'event',
        })) || this;
        _this.displayEventList = [];
        _this.displayEventListOverview = [];
        _this.eventListOverview = [];
        _this.eventList = [];
        _this.scaleTransform = zoomIdentity;
        _this.heatmapBinCount = 50;
        _this.minMaxCache = new Map();
        _this.minMaxPrecomputed = new Map();
        _this.boxplotReferenceEvent = desc.boxplotReferenceEvent || EventColumn_1.CURRENT_DATE_REFERENCE;
        _this.scaleMinBound = typeof desc.eventScaleMin !== 'undefined' ? desc.eventScaleMin : -Infinity;
        _this.scaleMaxBound = typeof desc.eventScaleMax !== 'undefined' ? desc.eventScaleMax : Infinity;
        _this.heatmapBinCount = desc.heatmapBinCount || 50;
        _this.boxplotPossible = desc.boxplotPossible || false;
        _this.showBoxplot = _this.boxplotPossible;
        _this.eventList = desc.eventList || [];
        _this.displayZeroLine = desc.displayZeroLine || false;
        _this.displayEventList = desc.displayEventList || __spreadArray([], _this.eventList, true);
        _this.displayEventListOverview = __spreadArray([], _this.displayEventList, true);
        _this.eventListOverview = __spreadArray([], _this.eventList, true);
        _this.legendUpdateCallback = desc.legendUpdateCallback || null;
        _this.customTooltipCallback = desc.customTooltipCallback || null;
        _this.referenceEvent = desc.referenceEvent || EventColumn_1.CURRENT_DATE_REFERENCE;
        _this.msPerUnit = desc.msPerScaleUnit || 1000 * 60 * 60 * 24;
        _this.msPerBoxplotUnit = desc.msPerBoxplotUnit || 1;
        if (_this.boxplotPossible) {
            _this.displayEventListOverview.push(EBoxplotDataKeys.median);
            for (var _i = 0, _a = Object.keys(EBoxplotDataKeys); _i < _a.length; _i++) {
                var val = _a[_i];
                _this.eventListOverview.push(val);
            }
        }
        _this.sortEvent = desc.sortEvent || (_this.displayEventList.length > 0 ? _this.displayEventList[0] : undefined);
        _this.categories = _this.eventList.map(function (d, i) {
            return {
                name: d,
                label: d,
                color: schemeSet1[i % schemeSet1.length],
                value: i,
            };
        });
        _this.categories.push({
            name: EventColumn_1.BOXPLOT_COLOR_NAME,
            label: EventColumn_1.BOXPLOT_COLOR_NAME,
            color: EventColumn_1.BOXPLOT_DEFAULT_COLOR,
            value: 0,
        });
        _this.colorMapping = DEFAULT_CATEGORICAL_COLOR_FUNCTION;
        _this.adaptAxisToFilters = typeof desc.adaptAxisToFilters !== 'undefined' ? desc.adaptAxisToFilters : false;
        _this.updateLegend();
        return _this;
    }
    EventColumn_1 = EventColumn;
    EventColumn.prototype.eventMappingChanged = function () {
        if (this.adaptAxisToFilters) {
            this.minMaxCache.clear();
        }
        else {
            this.loadMinMax();
        }
        this.markDirty('values');
    };
    EventColumn.prototype.updateLegend = function () {
        if (!this.legendUpdateCallback)
            return;
        var boxPlotLabel = undefined;
        var boxPlotColor = undefined;
        if (this.showBoxplot) {
            var boxplotCategory = this.categories.filter(function (x) { return x.name === EventColumn_1.BOXPLOT_COLOR_NAME; })[0];
            boxPlotLabel = 'Deviation from ' + this.boxplotReferenceEvent;
            boxPlotColor = this.colorMapping.apply(boxplotCategory);
        }
        this.legendUpdateCallback(structuredClone(this.categories.filter(function (x) { return x.name !== EventColumn_1.BOXPLOT_COLOR_NAME; })), this.colorMapping, boxPlotLabel, boxPlotColor);
    };
    EventColumn.prototype.onDataUpdate = function (_rows) {
        var _this = this;
        _super.prototype.onDataUpdate.call(this, _rows);
        var currentState = {
            referenceEvent: this.referenceEvent,
            boxplotReferenceEvent: this.boxplotReferenceEvent,
            eventDisplayList: __spreadArray([], this.displayEventList, true),
            showBoxplot: this.showBoxplot,
        };
        this.minMaxPrecomputed.clear();
        var referenceEvents = this.eventList.slice();
        referenceEvents.push(EventColumn_1.CURRENT_DATE_REFERENCE);
        for (var _i = 0, referenceEvents_1 = referenceEvents; _i < referenceEvents_1.length; _i++) {
            var referenceEvent = referenceEvents_1[_i];
            this.referenceEvent = referenceEvent;
            for (var _a = 0, _b = this.eventList; _a < _b.length; _a++) {
                var displayEvent = _b[_a];
                this.displayEventList = [displayEvent];
                this.boxplotReferenceEvent = displayEvent;
                for (var _c = 0, _d = this.getBoxplotPossible() ? [true, false] : [false]; _c < _d.length; _c++) {
                    var showBoxplot = _d[_c];
                    this.showBoxplot = showBoxplot;
                    this.minMaxPrecomputed.set(referenceEvent + displayEvent + showBoxplot, this.computeMinMax(_rows.map(function (x) { return _this.getMap(x); })));
                }
            }
        }
        this.referenceEvent = currentState.referenceEvent;
        this.boxplotReferenceEvent = currentState.boxplotReferenceEvent;
        this.displayEventList = currentState.eventDisplayList;
        this.showBoxplot = currentState.showBoxplot;
        if (!this.adaptAxisToFilters) {
            this.loadMinMax();
        }
    };
    EventColumn.prototype.loadMinMax = function () {
        var _this = this;
        if (this.minMaxPrecomputed.size === 0) {
            return;
        }
        var _a = this.getDisplayEventList()
            .map(function (displayEvent) {
            var showBoxplot = _this.boxplotReferenceEvent === displayEvent && _this.getShowBoxplot();
            return _this.minMaxPrecomputed.get(_this.referenceEvent + displayEvent + showBoxplot);
        })
            .reduce(function (acc, val) {
            var _a, _b;
            return [
                Math.min(acc[0], (_a = val === null || val === void 0 ? void 0 : val[0]) !== null && _a !== void 0 ? _a : Number.POSITIVE_INFINITY),
                Math.max(acc[1], (_b = val === null || val === void 0 ? void 0 : val[1]) !== null && _b !== void 0 ? _b : Number.NEGATIVE_INFINITY),
            ];
        }, [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]), min = _a[0], max = _a[1];
        this.setScaleDimensions(min, max);
    };
    EventColumn.prototype.getTooltipContent = function (row) {
        var events = this.getMap(row);
        var tooltipList = this.getTooltipData(events);
        if (this.customTooltipCallback) {
            this.customTooltipCallback(tooltipList);
            return null;
        }
        return tooltipList;
    };
    EventColumn.prototype.createXScale = function () {
        this.xScale = scaleLinear().domain([this.scaleMin, this.scaleMax]).range([0, this.getWidth()]);
        this.xScaleZoomed = this.scaleTransform.rescaleX(this.xScale);
    };
    EventColumn.prototype.getXScale = function (zoomed) {
        if (zoomed === void 0) { zoomed = true; }
        if (!this.xScale)
            this.createXScale();
        return zoomed ? this.xScaleZoomed : this.xScale;
    };
    EventColumn.prototype.computeMinMax = function (dataRows, rowIndices) {
        var _this = this;
        var min = Number.POSITIVE_INFINITY;
        var max = Number.NEGATIVE_INFINITY;
        var eventKeys = this.getDisplayEventList();
        if (this.getBoxplotPossible() && this.getShowBoxplot()) {
            eventKeys.push(EBoxplotDataKeys.min);
            eventKeys.push(EBoxplotDataKeys.max);
        }
        var useCache = typeof rowIndices !== 'undefined' && rowIndices.length > 0;
        dataRows.forEach(function (row, i) {
            var rowIndex = useCache ? rowIndices[i] : -1;
            var rowMin = Number.POSITIVE_INFINITY;
            var rowMax = Number.NEGATIVE_INFINITY;
            if (!useCache || !_this.minMaxCache.has(rowIndex)) {
                _this.getEventValues(row, false, eventKeys).forEach(function (d) {
                    if (d.value === undefined)
                        return;
                    if (d.value < rowMin) {
                        rowMin = d.value;
                    }
                    if (d.value > rowMax) {
                        rowMax = d.value;
                    }
                });
                useCache && _this.minMaxCache.set(rowIndex, [rowMin, rowMax]);
            }
            else {
                var cached = _this.minMaxCache.get(rowIndex);
                rowMin = cached[0];
                rowMax = cached[1];
            }
            min = Math.min(min, rowMin);
            max = Math.max(max, rowMax);
        });
        return [min, max];
    };
    EventColumn.prototype.getTooltipData = function (events) {
        var _this = this;
        var formatter = format('.3f');
        var tooltipList = this.getDisplayEventList().map(function (x) {
            var _a, _b;
            var dateVal = (_b = (_a = events.filter(function (e) { return e.key === x; })[0]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : undefined;
            return {
                eventName: x,
                value: formatter(_this.getEventValue(events, x)),
                color: _this.getCategoryColor(x),
                date: dateVal ? new Date(dateVal) : undefined,
            };
        });
        if (this.boxplotPossible && this.showBoxplot) {
            this.getEventValues(events, false, Object.keys(EBoxplotDataKeys))
                .map(function (x) {
                return {
                    eventName: x.key,
                    value: formatter(x.value),
                    color: _this.getCategoryColor(EventColumn_1.BOXPLOT_COLOR_NAME),
                };
            })
                .filter(function (x) { return x.value !== 'NaN'; })
                .forEach(function (x) { return tooltipList.push(x); });
        }
        return tooltipList;
    };
    EventColumn.prototype.getHeatmapBinCount = function () {
        return this.heatmapBinCount;
    };
    EventColumn.prototype.getColorMapping = function () {
        return this.colorMapping.clone();
    };
    EventColumn.prototype.setColorMapping = function (mapping) {
        if (this.colorMapping.eq(mapping)) {
            return;
        }
        this.fire([
            CategoricalColumn.EVENT_COLOR_MAPPING_CHANGED,
            Column.EVENT_DIRTY_VALUES,
            Column.EVENT_DIRTY_HEADER,
            Column.EVENT_DIRTY,
        ], this.colorMapping.clone(), (this.colorMapping = mapping));
        this.updateLegend();
    };
    EventColumn.prototype.getDisplayZeroLine = function () {
        return this.displayZeroLine;
    };
    EventColumn.prototype.getAdaptAxisToFilters = function () {
        return this.adaptAxisToFilters;
    };
    EventColumn.prototype.setAdaptAxisToFilters = function (adaptAxisToFilters) {
        this.adaptAxisToFilters = adaptAxisToFilters;
        if (adaptAxisToFilters) {
            this.loadMinMax();
        }
        this.eventMappingChanged();
    };
    EventColumn.prototype.setDisplayZeroLine = function (displayZeroLine) {
        this.displayZeroLine = displayZeroLine;
        this.fire([Column.EVENT_DIRTY_VALUES]);
    };
    EventColumn.prototype.getCategoryColor = function (category) {
        category = Object.keys(EBoxplotDataKeys).includes(category) ? EventColumn_1.BOXPLOT_COLOR_NAME : category;
        var filtered = this.categories.filter(function (x) { return x.name === category; });
        if (filtered.length === 1) {
            return this.colorMapping.apply(filtered[0]);
        }
        return this.colorMapping.apply({ name: category, label: category, color: '#000000', value: 0 });
    };
    EventColumn.prototype.getEventList = function (overview) {
        if (overview === void 0) { overview = false; }
        if (overview) {
            return __spreadArray([], this.eventListOverview, true);
        }
        return __spreadArray([], this.eventList, true);
    };
    EventColumn.prototype.getDisplayEventList = function (overview) {
        if (overview === void 0) { overview = false; }
        if (overview) {
            return __spreadArray([], this.displayEventListOverview, true);
        }
        return __spreadArray([], this.displayEventList, true);
    };
    EventColumn.prototype.setDisplayEventList = function (eventList, overview) {
        if (overview === void 0) { overview = false; }
        if (overview) {
            this.displayEventListOverview = eventList;
            return;
        }
        this.displayEventList = eventList.slice();
        this.eventMappingChanged();
    };
    EventColumn.prototype.getBoxplotPossible = function () {
        return this.boxplotPossible;
    };
    EventColumn.prototype.getBoxplotReferenceEvent = function () {
        return this.boxplotReferenceEvent;
    };
    EventColumn.prototype.setBoxplotReferenceEvent = function (boxplotReferenceEvent) {
        this.boxplotReferenceEvent = boxplotReferenceEvent;
        this.updateLegend();
        this.eventMappingChanged();
    };
    EventColumn.prototype.getShowBoxplot = function () {
        return this.showBoxplot;
    };
    EventColumn.prototype.setShowBoxplot = function (showBoxplot) {
        this.showBoxplot = showBoxplot;
        this.eventMappingChanged();
        this.updateLegend();
    };
    EventColumn.prototype.getBoxplotData = function (eventData) {
        var BPkeys = Object.keys(EBoxplotDataKeys);
        var dataKeys = eventData.map(function (x) { return x.key; });
        if (!BPkeys.every(function (key) {
            return dataKeys.filter(function (x) { return x === key; }).length > 0;
        })) {
            return null;
        }
        return {
            min: this.getEventValue(eventData, EBoxplotDataKeys.min),
            max: this.getEventValue(eventData, EBoxplotDataKeys.max),
            median: this.getEventValue(eventData, EBoxplotDataKeys.median),
            q1: this.getEventValue(eventData, EBoxplotDataKeys.q1),
            q3: this.getEventValue(eventData, EBoxplotDataKeys.q3),
        };
    };
    EventColumn.prototype.getBoxplotOffset = function (eventData) {
        var _this = this;
        if (this.boxplotReferenceEvent === EventColumn_1.CURRENT_DATE_REFERENCE)
            return Date.now();
        var referenceValueFiltered = eventData.filter(function (x) { return x.key === _this.boxplotReferenceEvent; });
        var offset = referenceValueFiltered.length === 1 ? referenceValueFiltered[0].value : 0;
        return offset;
    };
    EventColumn.prototype.getEventValue = function (events, valKey) {
        var _this = this;
        var _a, _b;
        valKey = valKey || this.sortEvent;
        var eventVal = (_b = (_a = events.filter(function (x) { return x.key === valKey; })[0]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : NaN;
        var reference = Date.now();
        if (this.referenceEvent !== EventColumn_1.CURRENT_DATE_REFERENCE) {
            var referenceValueFiltered = events.filter(function (x) { return x.key === _this.referenceEvent; });
            reference = referenceValueFiltered.length === 1 ? referenceValueFiltered[0].value : 0;
        }
        if (Object.keys(EBoxplotDataKeys).includes(valKey)) {
            eventVal = eventVal * this.msPerBoxplotUnit + this.getBoxplotOffset(events);
        }
        return (eventVal - reference) / this.msPerUnit;
    };
    EventColumn.prototype.getEventValues = function (events, overview, eventKeys) {
        var _this = this;
        if (overview === void 0) { overview = false; }
        if (eventKeys === void 0) { eventKeys = []; }
        if (eventKeys.length === 0)
            eventKeys = this.getDisplayEventList(overview);
        var values = eventKeys.map(function (x) {
            return { key: x, value: _this.getEventValue(events, x) };
        });
        return values.filter(function (x) { return !isNaN(x.value); });
    };
    EventColumn.prototype.toCompareValue = function (row) {
        var eventData = this.getMap(row);
        return this.getEventValue(eventData);
    };
    EventColumn.prototype.toCompareValueType = function () {
        return ECompareValueType.FLOAT;
    };
    EventColumn.prototype.getRange = function () {
        return [this.scaleMin, this.scaleMax];
    };
    EventColumn.prototype.getScaleTransform = function () {
        return this.scaleTransform;
    };
    EventColumn.prototype.setScaleTransform = function (transform) {
        this.scaleTransform = transform;
        this.createXScale();
        this.markDirty('values');
    };
    EventColumn.prototype.getSortMethod = function () {
        return this.sortEvent;
    };
    EventColumn.prototype.getReferenceEvent = function () {
        return this.referenceEvent;
    };
    EventColumn.prototype.setReferenceEvent = function (referenceEvent) {
        this.referenceEvent = referenceEvent;
        this.eventMappingChanged();
    };
    EventColumn.prototype.setSortMethod = function (sort) {
        if (this.sortEvent === sort) {
            return;
        }
        this.fire([EventColumn_1.EVENT_SORTMETHOD_CHANGED], this.sortEvent, (this.sortEvent = sort));
        if (!this.isSortedByMe().asc) {
            this.sortByMe();
        }
        this.markDirty('values');
    };
    EventColumn.prototype.setScaleDimensions = function (min, max) {
        if (this.scaleMin === min && this.scaleMax === max)
            return;
        this.scaleMin = Math.max(min, this.scaleMinBound);
        this.scaleMax = Math.min(max, this.scaleMaxBound);
        this.createXScale();
    };
    EventColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        r.sortMethod = this.getSortMethod();
        r.boxplotReferenceEvent = this.boxplotReferenceEvent;
        r.displayEventList = this.displayEventList;
        r.displayEventListOverview = this.displayEventListOverview;
        r.showBoxplot = this.showBoxplot;
        r.colorMapping = this.colorMapping.toJSON();
        r.categories = this.categories;
        r.msPerUnit = this.msPerUnit;
        r.referenceEvent = this.referenceEvent;
        return r;
    };
    EventColumn.prototype.restore = function (dump, factory) {
        _super.prototype.restore.call(this, dump, factory);
        if (dump.sortMethod) {
            this.sortEvent = dump.sortMethod;
        }
        if (dump.boxplotReferenceEvent) {
            this.boxplotReferenceEvent = dump.boxplotReferenceEvent;
        }
        if (dump.displayEventList) {
            this.displayEventList = dump.displayEventList;
        }
        if (dump.displayEventListOverview) {
            this.displayEventListOverview = dump.displayEventListOverview;
        }
        if (dump.showBoxplot) {
            this.showBoxplot = dump.showBoxplot;
        }
        if (dump.categories) {
            this.categories = dump.categories;
        }
        if (dump.colorMapping) {
            this.colorMapping = factory.categoricalColorMappingFunction(dump.colorMapping, this.categories);
        }
        if (dump.msPerUnit) {
            this.msPerUnit = dump.msPerUnit;
        }
        if (dump.referenceEvent) {
            this.referenceEvent = dump.referenceEvent;
        }
        this.updateLegend();
    };
    EventColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this)
            .concat([
            EventColumn_1.EVENT_MAPPING_CHANGED,
            EventColumn_1.EVENT_SORTMETHOD_CHANGED,
            EventColumn_1.EVENT_FILTER_CHANGED,
            EventColumn_1.EVENT_COLOR_MAPPING_CHANGED,
        ]);
    };
    EventColumn.prototype.on = function (type, listener) {
        return _super.prototype.on.call(this, type, listener);
    };
    var EventColumn_1;
    EventColumn.CURRENT_DATE_REFERENCE = 'Current Date';
    EventColumn.BOXPLOT_DEFAULT_COLOR = '#ff7f00';
    EventColumn.BOXPLOT_COLOR_NAME = 'boxplotColor';
    EventColumn.EVENT_MAPPING_CHANGED = NumberColumn.EVENT_MAPPING_CHANGED;
    EventColumn.EVENT_COLOR_MAPPING_CHANGED = CategoricalColumn.EVENT_COLOR_MAPPING_CHANGED;
    EventColumn.EVENT_SORTMETHOD_CHANGED = NumberColumn.EVENT_SORTMETHOD_CHANGED;
    EventColumn.EVENT_FILTER_CHANGED = NumberColumn.EVENT_FILTER_CHANGED;
    EventColumn.TIME_UNITS_IN_MS = {
        ms: 1,
        s: 1000,
        min: 1000 * 60,
        h: 1000 * 60 * 60,
        D: 1000 * 60 * 60 * 24,
        W: 1000 * 60 * 60 * 24 * 7,
        M: 1000 * 60 * 60 * 24 * 30,
        Y: 1000 * 60 * 60 * 24 * 365,
        custom: -1,
    };
    EventColumn = EventColumn_1 = __decorate([
        toolbar('rename', 'clone', 'sort', 'sortBy', 'eventSettings', 'eventReferences', 'colorMappedCategorical'),
        dialogAddons('sort', 'eventSort'),
        Category('event'),
        SortByDefault('descending')
    ], EventColumn);
    return EventColumn;
}(MapColumn));
export default EventColumn;
//# sourceMappingURL=EventColumn.js.map