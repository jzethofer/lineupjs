import { ERenderMode, } from './interfaces';
import { EventColumn } from '../model';
import { scaleLinear, scaleSequential } from 'd3-scale';
import { select } from 'd3-selection';
import { bin, max } from 'd3-array';
import { format } from 'd3-format';
import { interpolateRgbBasis } from 'd3-interpolate';
import { zoom, zoomIdentity, ZoomTransform } from 'd3-zoom';
import { axisTop } from 'd3-axis';
import { cssClass } from '../styles';
var EventCellRenderer = /** @class */ (function () {
    function EventCellRenderer() {
        this.title = 'EventCellRenderer';
        this.group = 'advanced';
    }
    EventCellRenderer.prototype.canRender = function (col, mode) {
        if (col instanceof EventColumn) {
            return mode === ERenderMode.CELL || mode === ERenderMode.GROUP || mode === ERenderMode.SUMMARY;
        }
        return false;
    };
    EventCellRenderer.prototype.create = function (col, context) {
        var _this = this;
        if (col.getAdaptAxisToFilters()) {
            context.tasks
                .groupRows(col, { color: 'black', name: 'eventGrouping', order: col.findMyRanker().getOrder() }, 'minMax', function (rows) {
                var eventData = rows.map(function (r) { return col.getMap(r); });
                var rowIndices = eventData['it'];
                return col.computeMinMax(eventData, rowIndices);
            })
                .then(function (data) {
                if (typeof data === 'symbol') {
                    return;
                }
                col.setScaleDimensions(data[0], data[1]);
            });
        }
        return {
            template: "<div class=\"svg-container\" >\n                    <svg class=\"svg-content\">\n                    </svg>\n                </div>",
            update: function (n, dataRow) {
                var div = select(n);
                var svg = div.select('svg');
                var eventData = col.getMap(dataRow);
                _this.addTooltipListeners(context, col, n, dataRow);
                var X = col.getXScale();
                _this.updateBoxPlot(svg, eventData, X, col);
                if (col.getDisplayZeroLine()) {
                    svg
                        .selectAll('.zeroLine')
                        .join(function (enter) { return enter.append('line').attr('class', 'zeroLine'); })
                        .attr('x1', X(0))
                        .attr('x2', X(0))
                        .attr('y1', '0%')
                        .attr('y2', '100%')
                        .attr('stroke', 'lightgrey')
                        .attr('stroke-width', '1px');
                }
                svg
                    .selectAll('.eventCircle')
                    .data(col.getEventValues(eventData))
                    .join(function (enter) { return enter.append('circle').attr('class', 'eventCircle'); })
                    .attr('cx', function (x) { return X(x.value); })
                    .attr('cy', '50%')
                    .attr('r', EventCellRenderer.CIRCLE_RADIUS)
                    .attr('fill', function (x) { return col.getCategoryColor(x.key); });
            },
            render: function (ctx, d) {
                var eventData = col.getMap(d);
                var X = col.getXScale();
                var _loop_1 = function (eventKey) {
                    eventData
                        .filter(function (x) { return x.key === eventKey; })
                        .forEach(function (event) {
                        ctx.fillStyle = col.getCategoryColor(event.key);
                        var eventVal = col.getEventValue(eventData, event.key);
                        var xVal = X(eventVal) - EventCellRenderer.OVERVIEW_RECT_SIZE / 2;
                        if (xVal < 0)
                            return;
                        ctx.fillRect(xVal, 0, EventCellRenderer.OVERVIEW_RECT_SIZE, EventCellRenderer.OVERVIEW_RECT_SIZE);
                    });
                };
                for (var _i = 0, _a = col.getDisplayEventList(true); _i < _a.length; _i++) {
                    var eventKey = _a[_i];
                    _loop_1(eventKey);
                }
            },
        };
    };
    EventCellRenderer.prototype.addTooltipListeners = function (context, col, n, dataRow) {
        var _this = this;
        var showTooltip = function () {
            var tooltipList = col.getTooltipContent(dataRow);
            if (tooltipList === null)
                return;
            context.tooltipManager.updateTooltipContent(_this.createTooltipTable(tooltipList));
            context.tooltipManager.showTooltip(n);
        };
        var hideTooltip = function () {
            context.tooltipManager.hideTooltip();
        };
        for (var _i = 0, _a = ['mouseenter']; _i < _a.length; _i++) {
            var event_1 = _a[_i];
            n.addEventListener(event_1, showTooltip);
        }
        for (var _b = 0, _c = ['mouseleave', 'blur']; _b < _c.length; _b++) {
            var event_2 = _c[_b];
            n.addEventListener(event_2, hideTooltip);
        }
    };
    EventCellRenderer.prototype.updateBoxPlot = function (svg, eventData, X, col) {
        var showBoxplot = col.getShowBoxplot();
        var data = showBoxplot ? col.getBoxplotData(eventData) : null;
        if (showBoxplot && (!data || isNaN(data.median)))
            return;
        var yCenter = 50;
        var boxHeight = 50;
        // vertical lines
        svg
            .selectAll('.mainLines')
            .data(showBoxplot
            ? [
                [data.min, data.q1],
                [data.q3, data.max],
            ]
            : [])
            .join(function (enter) { return enter.append('line').attr('class', 'mainLines'); })
            .attr('y1', yCenter + '%')
            .attr('y2', yCenter + '%')
            .attr('x1', function (d) { return X(d[0]); })
            .attr('x2', function (d) { return X(d[1]); })
            .attr('stroke', 'black');
        // box
        svg
            .selectAll('.boxplotBox')
            .data(showBoxplot ? [data] : [])
            .join(function (enter) { return enter.append('rect').attr('class', 'boxplotBox'); })
            .attr('y', yCenter - boxHeight / 2 + '%')
            .attr('x', function (d) { return X(d.q1); })
            .attr('width', function (d) { return X(d.q3) - X(d.q1); })
            .attr('height', boxHeight + '%')
            .attr('stroke', 'black')
            .style('fill', col.getCategoryColor(EventColumn.BOXPLOT_COLOR_NAME))
            .style('opacity', EventCellRenderer.BOXPLOT_OPACITY);
        // horizontal lines
        svg
            .selectAll('.boxPlotVerticalLines')
            .data(showBoxplot ? [data.min, data.median, data.max] : [])
            .join(function (enter) { return enter.append('line').attr('class', 'boxPlotVerticalLines'); })
            .attr('y1', yCenter - boxHeight / 2 + '%')
            .attr('y2', yCenter + boxHeight / 2 + '%')
            .attr('x1', function (d) { return X(d); })
            .attr('x2', function (d) { return X(d); })
            .attr('stroke', 'black');
    };
    EventCellRenderer.prototype.createGroup = function (col, context) {
        var _this = this;
        return {
            template: "<div class=\"svg-container\">\n                    <svg class=\"svg-content\">\n                    </svg>\n                </div>",
            update: function (n, group) {
                var keyList = col.getDisplayEventList();
                _this.drawHeatmap(context, col, group, keyList, n);
            },
        };
    };
    EventCellRenderer.prototype.drawHeatmap = function (context, col, group, keyList, n, isSummary) {
        var _this = this;
        if (isSummary === void 0) { isSummary = false; }
        context.tasks
            .groupRows(col, group, 'identity', function (rows) {
            return _this.groupByKey(rows.map(function (r) { return col.getMap(r); }), keyList, col);
        })
            .then(function (data) {
            if (typeof data === 'symbol') {
                return;
            }
            var Y = scaleLinear().domain([0, keyList.length]).range([0, 100]);
            var div = select(n);
            var svg = div.select('svg');
            var formatter = format('.5f');
            var X = col.getXScale();
            var range = X.domain();
            if (typeof range[0] === 'undefined' || typeof range[1] === 'undefined' || range[0] > range[1])
                return;
            if (isSummary) {
                X = X.copy().range([0.01, 0.99]);
                formatter = format('.5%');
            }
            var heatmapContentG = svg
                .selectAll('.heatmapContentG')
                .data(['heatmapContentG'])
                .join(function (enter) { return enter.append('g').attr('class', function (d) { return d; }); });
            var binning = bin().domain([range[0], range[1]]).thresholds(col.getHeatmapBinCount());
            var _loop_2 = function (i) {
                var currentKey = keyList[i];
                var filtered = data.filter(function (x) { return x.key === currentKey; });
                if (filtered.length === 0)
                    return "continue";
                var values = filtered[0].values;
                var binnedData = binning(values);
                if (binnedData.length < 2)
                    return "continue";
                var color = col.getCategoryColor(currentKey);
                var maxVal = max(binnedData, function (d) { return d.length; });
                var colorScale = scaleSequential()
                    .domain([0, maxVal])
                    .interpolator(interpolateRgbBasis(['white', color]));
                if (maxVal === 0)
                    colorScale.interpolator(interpolateRgbBasis(['white', 'white']));
                heatmapContentG
                    .selectAll('.heatmapRect' + i)
                    .data(binnedData.filter(function (d) { return X(d.x1) > 0; }))
                    .join(function (enter) { return enter.append('rect').attr('class', 'heatmapRect' + i); })
                    .attr('x', function (d) {
                    return isSummary ? formatter(X(d.x0)) : X(d.x0);
                })
                    .attr('y', Y(i) + 1 + '%')
                    .attr('width', function (d) { return formatter(X(d.x1) - X(d.x0)); })
                    .attr('height', Y(i + 1) - Y(i) - 2 + '%')
                    .attr('fill', function (d) { return colorScale(d.length); })
                    .attr('stroke', function (d) { return colorScale(d.length); })
                    .attr('title', function (d) { return "[".concat(d.x0, ";").concat(d.x1, "]: ").concat(d.length); })
                    .append('title')
                    .text(function (d) { return "[".concat(d.x0, "; ").concat(d.x1, "]: ").concat(d.length); });
                svg
                    .selectAll('.heatmapRectOutline' + i)
                    .data([{ first: binnedData[0], last: binnedData[binnedData.length - 1] }])
                    .join(function (enter) { return enter.append('rect').attr('class', 'heatmapRectOutline' + i); })
                    .attr('x', function (d) { return formatter(X(d.first.x0)); })
                    .attr('y', Y(i) + 1 + '%')
                    .attr('width', function (d) { return formatter(X(d.last.x1) - X(d.first.x0)); })
                    .attr('height', Y(i + 1) - Y(i) - 2 + '%')
                    .attr('stroke', color)
                    .attr('fill', 'none')
                    .attr('stroke-width', isSummary ? '1%' : 1);
            };
            for (var i = 0; i < keyList.length; i++) {
                _loop_2(i);
            }
        });
    };
    EventCellRenderer.prototype.groupByKey = function (arr, keyList, col) {
        var m = new Map();
        arr.forEach(function (a) {
            return col.getEventValues(a, false, keyList).forEach(function (d) {
                if (d.value === undefined)
                    return;
                if (!m.has(d.key)) {
                    m.set(d.key, [d.value]);
                }
                else {
                    m.get(d.key).push(d.value);
                }
            });
        });
        return Array.from(m)
            .sort(function (a, b) { return a[0].localeCompare(b[0]); })
            .map(function (_a) {
            var key = _a[0], values = _a[1];
            return ({ key: key, values: values });
        });
    };
    EventCellRenderer.prototype.createSummary = function (col, context, interactive) {
        var _this = this;
        return {
            template: "<div class=\"svg-container\">\n                    <svg class=\"svg-content\">\n                    </svg>\n                </div>",
            update: function (n) {
                var div = select(n);
                var svg = div.select('svg');
                svg.selectAll('*').remove();
                if (interactive) {
                    var order = col.findMyRanker().getOrder();
                    var group = { color: 'black', name: 'mygroup', order: order };
                    var keyList = col.getDisplayEventList();
                    _this.drawHeatmap(context, col, group, keyList, n, true);
                    return;
                }
                var g = svg
                    .selectAll('.xAxisG')
                    .data(['xAxisG'])
                    .join(function (enter) { return enter.append('g').attr('class', function (d) { return d; }); })
                    .attr('transform', 'translate(0,' + EventCellRenderer.SUMMARY_HEIGHT + ')');
                var zoomElement = zoom()
                    .scaleExtent([0.001, 1000])
                    .extent([
                    [0, 0],
                    [col.getWidth(), EventCellRenderer.SUMMARY_HEIGHT],
                ])
                    .on('zoom', function (event) {
                    var transform = event.transform;
                    var xScale = col.getXScale(false);
                    g.call(axisTop(transform.rescaleX(xScale)).ticks(EventCellRenderer.getTickNumberForXAxis(context.colWidth(col))));
                    if (!event.sourceEvent)
                        return;
                    if (event.sourceEvent && event.sourceEvent.constructor.name === 'MouseEvent') {
                        return;
                    }
                })
                    .on('end', function (event) {
                    var transform = event.transform;
                    if (col.getScaleTransform() === transform)
                        return;
                    col.setScaleTransform(transform);
                });
                svg.call(zoomElement);
                svg.on('dblclick.zoom', function () {
                    col.setScaleTransform(zoomIdentity);
                });
                svg.call(zoomElement.transform, col.getScaleTransform());
            },
        };
    };
    EventCellRenderer.getTickNumberForXAxis = function (width) {
        if (width < 100)
            return 2;
        if (width < 200)
            return 4;
        if (width < 500)
            return 6;
        if (width < 800)
            return 8;
        return 10;
    };
    EventCellRenderer.prototype.createTooltipTable = function (tooltipList) {
        var node = document.createElement('div');
        var table = select(node).append('table').attr('class', cssClass('event-tooltip-table'));
        table
            .append('thead')
            .selectAll('th')
            .data(['', 'Event', 'Value', 'Date'])
            .join('th')
            .text(function (d) { return d; });
        var rows = table.append('tbody').selectAll('tr').data(tooltipList).join('tr');
        rows
            .append('td')
            .append('div')
            .style('background-color', function (d) { return d.color; })
            .attr('class', cssClass('event-tooltip') + ' circle');
        rows
            .append('td')
            .attr('class', 'event-name')
            .text(function (d) { return d.eventName; });
        rows.append('td').text(function (d) { return d.value; });
        rows.append('td').text(function (d) { return (d.date ? d.date.toLocaleString() : ''); });
        return node;
    };
    //Layout constants
    EventCellRenderer.CIRCLE_RADIUS = 4;
    EventCellRenderer.OVERVIEW_RECT_SIZE = 4;
    EventCellRenderer.BOXPLOT_OPACITY = 0.7;
    EventCellRenderer.SUMMARY_HEIGHT = 20;
    return EventCellRenderer;
}());
export default EventCellRenderer;
//# sourceMappingURL=EventCellRenderer.js.map