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
import { EventColumn } from '../../model';
import { ADialog } from '.';
var EventDisplaySettingsDialog = /** @class */ (function (_super) {
    __extends(EventDisplaySettingsDialog, _super);
    function EventDisplaySettingsDialog(column, dialog) {
        var _this = _super.call(this, dialog, {
            livePreview: 'dataMapping',
        }) || this;
        _this.column = column;
        _this.before = {
            displayEventList: column.getDisplayEventList(),
            displayEventListOverview: column.getDisplayEventList(true),
            showBoxplot: column.getShowBoxplot(),
            displayZeroLine: column.getDisplayZeroLine(),
        };
        return _this;
    }
    EventDisplaySettingsDialog.prototype.build = function (node) {
        this.buildEventDisplaySettings(node, EventDisplaySettingsDialog.EVENT_DISPLAY_COLUMN_HEADER_TEXT, this.column.getEventList(), EventDisplaySettingsDialog.EVENT_DISPLAY_COLUMN_NAME, this.column.getDisplayEventList());
        this.buildEventDisplaySettings(node, EventDisplaySettingsDialog.EVENT_DISPLAY_COLUMN_OVERVIEW_HEADER_TEXT, this.column.getEventList(true), EventDisplaySettingsDialog.EVENT_DISPLAY_COLUMN_OVERVIEW_NAME, this.column.getDisplayEventList(true));
        if (this.column.getBoxplotPossible()) {
            this.buildEventCheckboxSettings(node, EventDisplaySettingsDialog.SHOW_BOXPLOT_NAME, EventDisplaySettingsDialog.SHOW_BOXPLOT_HEADER_TEXT, this.column.getShowBoxplot());
        }
        this.buildEventCheckboxSettings(node, EventDisplaySettingsDialog.SHOW_ZERO_LINE_NAME, EventDisplaySettingsDialog.SHOW_ZERO_LINE_HEADER_TEXT, this.column.getDisplayZeroLine());
        this.livePreviews(node);
    };
    EventDisplaySettingsDialog.prototype.buildEventCheckboxSettings = function (node, name, headerText, checked) {
        if (checked === void 0) { checked = false; }
        node.insertAdjacentHTML('beforeend', "\n      <label class=\"lu-checkbox \"><input type=\"checkbox\" name=\"".concat(name, "\" \n      ").concat(checked ? 'checked' : '', "><strong>").concat(headerText, "</strong></label>\n       "));
    };
    EventDisplaySettingsDialog.prototype.livePreviews = function (node) {
        var _this = this;
        node.querySelectorAll('.lu-checkbox').forEach(function (d) {
            return d.addEventListener('click', function () {
                if (_this.showLivePreviews) {
                    _this.submit();
                }
            });
        });
        this.enableLivePreviews('input');
    };
    EventDisplaySettingsDialog.prototype.buildEventDisplaySettings = function (node, headerText, allEventsList, inputName, displayEventList) {
        node.insertAdjacentHTML('beforeend', "\n      <strong>".concat(headerText, "</strong>\n      ").concat(allEventsList
            .map(function (d) { return " <label class=\"lu-checkbox \"><input type=\"checkbox\" name=\"".concat(inputName, "\" value=\"").concat(d, "\" \n      ").concat(displayEventList.includes(d) ? 'checked' : '', "><span>").concat(d, "</span></label>"); })
            .join(''), "\n       "));
    };
    EventDisplaySettingsDialog.prototype.reset = function () {
        var _this = this;
        if (this.column.getBoxplotPossible()) {
            this.findInput('input[name=' + EventDisplaySettingsDialog.SHOW_BOXPLOT_NAME + ']').checked =
                this.before.showBoxplot;
        }
        this.findInput('input[name=' + EventDisplaySettingsDialog.SHOW_ZERO_LINE_NAME + ']').checked =
            this.before.displayZeroLine;
        this.node
            .querySelectorAll("input[name=".concat(EventDisplaySettingsDialog.EVENT_DISPLAY_COLUMN_NAME, "]"))
            .forEach(function (d) {
            d.checked = _this.before.displayEventList.includes(d.value);
        });
        this.node
            .querySelectorAll("input[name=".concat(EventDisplaySettingsDialog.EVENT_DISPLAY_COLUMN_OVERVIEW_NAME, "]"))
            .forEach(function (d) {
            d.checked = _this.before.displayEventListOverview.includes(d.value);
        });
        this.submit();
    };
    EventDisplaySettingsDialog.prototype.submit = function () {
        if (this.column.getBoxplotPossible()) {
            var showBoxplot = this.findInput('input[name=' + EventDisplaySettingsDialog.SHOW_BOXPLOT_NAME + ']').checked;
            this.column.setShowBoxplot(showBoxplot);
        }
        var displayZeroLine = this.findInput('input[name=' + EventDisplaySettingsDialog.SHOW_ZERO_LINE_NAME + ']').checked;
        this.column.setDisplayZeroLine(displayZeroLine);
        var selectedEventsList = [];
        this.node
            .querySelectorAll("input[name=".concat(EventDisplaySettingsDialog.EVENT_DISPLAY_COLUMN_NAME, "]:checked"))
            .forEach(function (d) {
            selectedEventsList.push(d.value);
        });
        this.column.setDisplayEventList(selectedEventsList);
        var selectedEventsListOverview = [];
        this.node
            .querySelectorAll("input[name=".concat(EventDisplaySettingsDialog.EVENT_DISPLAY_COLUMN_OVERVIEW_NAME, "]:checked"))
            .forEach(function (d) {
            selectedEventsListOverview.push(d.value);
        });
        this.column.setDisplayEventList(selectedEventsListOverview, true);
        return true;
    };
    EventDisplaySettingsDialog.prototype.cancel = function () {
        this.column.setDisplayEventList(this.before.displayEventList);
        this.column.setDisplayEventList(this.before.displayEventListOverview, true);
        this.column.setShowBoxplot(this.before.showBoxplot);
        this.column.setDisplayZeroLine(this.before.displayZeroLine);
    };
    EventDisplaySettingsDialog.EVENT_DISPLAY_COLUMN_HEADER_TEXT = 'Show Events';
    EventDisplaySettingsDialog.EVENT_DISPLAY_COLUMN_OVERVIEW_HEADER_TEXT = 'Show Events in Overview';
    EventDisplaySettingsDialog.EVENT_DISPLAY_COLUMN_NAME = 'eventDisplayColumn';
    EventDisplaySettingsDialog.EVENT_DISPLAY_COLUMN_OVERVIEW_NAME = 'eventDisplayColumnOverview';
    EventDisplaySettingsDialog.SHOW_BOXPLOT_HEADER_TEXT = 'Show Boxplot';
    EventDisplaySettingsDialog.SHOW_BOXPLOT_NAME = 'showBoxplot';
    EventDisplaySettingsDialog.SHOW_ZERO_LINE_HEADER_TEXT = 'Show Zero Line';
    EventDisplaySettingsDialog.SHOW_ZERO_LINE_NAME = 'showZeroLine';
    return EventDisplaySettingsDialog;
}(ADialog));
export default EventDisplaySettingsDialog;
//# sourceMappingURL=EventDisplaySettingsDialog.js.map