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
var EventReferenceDialog = /** @class */ (function (_super) {
    __extends(EventReferenceDialog, _super);
    function EventReferenceDialog(column, dialog) {
        var _this = _super.call(this, dialog, {
            livePreview: 'dataMapping',
        }) || this;
        _this.column = column;
        _this.before = {
            boxplotReferenceEvent: column.getBoxplotReferenceEvent(),
            referenceEvent: column.getReferenceEvent(),
        };
        return _this;
    }
    EventReferenceDialog.prototype.build = function (node) {
        this.referenceEventSettings(node);
        if (this.column.getBoxplotPossible()) {
            this.boxplotReferenceSettings(node);
        }
        this.livePreviews(node);
    };
    EventReferenceDialog.prototype.livePreviews = function (node) {
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
    EventReferenceDialog.prototype.boxplotReferenceSettings = function (node) {
        var columns = [EventColumn.CURRENT_DATE_REFERENCE];
        var currentReference = this.column.getBoxplotReferenceEvent();
        columns.push.apply(columns, this.column.getEventList());
        node.insertAdjacentHTML('beforeend', "\n      <strong>".concat(EventReferenceDialog.BOXPLOT_REFERENCE_HEADER_TEXT, "</strong>\n      ").concat(columns
            .map(function (d) { return " <label class=\"lu-checkbox boxplot-reference-checkbox\"><input type=\"radio\" name=\"".concat(EventReferenceDialog.BOXPLOT_REFERENCE_COLUMN_NAME, "\" value=\"").concat(d, "\" \n      ").concat(currentReference === d ? 'checked' : '', "><span>").concat(d, "</span></label>"); })
            .join(''), "\n       "));
    };
    EventReferenceDialog.prototype.referenceEventSettings = function (node) {
        var columns = [EventColumn.CURRENT_DATE_REFERENCE];
        var currentReference = this.column.getReferenceEvent();
        columns.push.apply(columns, this.column.getEventList());
        node.insertAdjacentHTML('beforeend', "\n      <strong>".concat(EventReferenceDialog.REFERENCE_COLUMN_HEADER_TEXT, "</strong>\n      ").concat(columns
            .map(function (d) { return " <label class=\"lu-checkbox boxplot-reference-checkbox\"><input type=\"radio\" name=\"".concat(EventReferenceDialog.REFERENCE_COLUMN_NAME, "\" value=\"").concat(d, "\" \n      ").concat(currentReference === d ? 'checked' : '', "><span>").concat(d, "</span></label>"); })
            .join(''), "\n       "));
    };
    EventReferenceDialog.prototype.reset = function () {
        if (this.column.getBoxplotPossible()) {
            this.findInput('input[name=' + EventReferenceDialog.BOXPLOT_REFERENCE_COLUMN_NAME + ']:checked').checked = false;
            this.findInput('input[name=' +
                EventReferenceDialog.BOXPLOT_REFERENCE_COLUMN_NAME +
                '][value="' +
                this.before.boxplotReferenceEvent +
                '"]').checked = true;
        }
        this.findInput('input[name=' + EventReferenceDialog.REFERENCE_COLUMN_NAME + ']:checked').checked = false;
        this.findInput('input[name=' + EventReferenceDialog.REFERENCE_COLUMN_NAME + '][value="' + this.before.referenceEvent + '"]').checked = true;
        this.submit();
    };
    EventReferenceDialog.prototype.submit = function () {
        if (this.column.getBoxplotPossible()) {
            var boxplotReferenceEvent = this.findInput('input[name=' + EventReferenceDialog.BOXPLOT_REFERENCE_COLUMN_NAME + ']:checked').value;
            this.column.setBoxplotReferenceEvent(boxplotReferenceEvent);
        }
        var referenceEvent = this.findInput('input[name=' + EventReferenceDialog.REFERENCE_COLUMN_NAME + ']:checked').value;
        this.column.setReferenceEvent(referenceEvent);
        return true;
    };
    EventReferenceDialog.prototype.cancel = function () {
        this.column.setReferenceEvent(this.before.referenceEvent);
        this.column.setBoxplotReferenceEvent(this.before.boxplotReferenceEvent);
    };
    EventReferenceDialog.BOXPLOT_REFERENCE_HEADER_TEXT = 'Boxplot Reference Event';
    EventReferenceDialog.BOXPLOT_REFERENCE_COLUMN_NAME = 'boxplotReferenceEvent';
    EventReferenceDialog.REFERENCE_COLUMN_HEADER_TEXT = 'Reference Event';
    EventReferenceDialog.REFERENCE_COLUMN_NAME = 'referenceEvent';
    return EventReferenceDialog;
}(ADialog));
export default EventReferenceDialog;
//# sourceMappingURL=EventReferenceDialog.js.map