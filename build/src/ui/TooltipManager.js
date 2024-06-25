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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
import { createPopper } from '@popperjs/core';
import AEventDispatcher from '../internal/AEventDispatcher';
import { TOOLTIP_CLASS, cssClass } from '../styles';
var TooltipManager = /** @class */ (function (_super) {
    __extends(TooltipManager, _super);
    function TooltipManager(options) {
        var _this = _super.call(this) || this;
        var doc = options.doc;
        _this.node = doc.createElement('div');
        _this.node.classList.add(TOOLTIP_CLASS);
        _this.contentNode = doc.createElement('div');
        _this.node.appendChild(_this.contentNode);
        _this.tooltipArrow = doc.createElement('div');
        _this.tooltipArrow.id = "".concat(options.idPrefix, "-tooltip-arrow");
        _this.tooltipArrow.classList.add(cssClass('tooltip-arrow'));
        _this.tooltipArrow.setAttribute('data-popper-arrow', '');
        _this.node.appendChild(_this.tooltipArrow);
        _this.popperOptions = options.defaultPopperOptions || {
            strategy: 'fixed',
            placement: 'auto-start',
            modifiers: [
                { name: 'arrow', options: { element: _this.tooltipArrow } },
                {
                    name: 'offset',
                    options: {
                        offset: [0, 4],
                    },
                },
            ],
        };
        _this.targetElement = {
            getBoundingClientRect: function () { return _this.node.getBoundingClientRect(); },
        };
        _this.popperInstance = createPopper(_this.targetElement, _this.node, _this.popperOptions);
        _this.hideTooltip();
        return _this;
    }
    TooltipManager.prototype.updateTooltipContent = function (element) {
        this.contentNode.replaceChildren(element);
    };
    TooltipManager.prototype.showTooltip = function (targetElement, contentUpdate) {
        if (contentUpdate) {
            this.updateTooltipContent(contentUpdate);
        }
        if (this.popperInstance) {
            this.popperInstance.setOptions(function (options) { return (__assign(__assign({}, options), { modifiers: __spreadArray(__spreadArray([], options.modifiers, true), [{ name: 'eventListeners', enabled: true }], false) })); });
            this.targetElement.getBoundingClientRect = function () { return targetElement.getBoundingClientRect(); };
        }
        this.node.style.display = 'block';
        this.fire(TooltipManager.EVENT_TOOLTIP_OPENED);
    };
    TooltipManager.prototype.hideTooltip = function () {
        if (this.popperInstance) {
            this.popperInstance.setOptions(function (options) { return (__assign(__assign({}, options), { modifiers: __spreadArray(__spreadArray([], options.modifiers, true), [{ name: 'eventListeners', enabled: false }], false) })); });
        }
        else {
            console.warn('No popper instance found');
        }
        this.node.style.display = 'none';
        this.fire(TooltipManager.EVENT_TOOLTIP_CLOSED);
    };
    TooltipManager.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat([TooltipManager.EVENT_TOOLTIP_CLOSED, TooltipManager.EVENT_TOOLTIP_OPENED]);
    };
    TooltipManager.EVENT_TOOLTIP_OPENED = 'tooltipOpened';
    TooltipManager.EVENT_TOOLTIP_CLOSED = 'tooltipClosed';
    return TooltipManager;
}(AEventDispatcher));
export default TooltipManager;
//# sourceMappingURL=TooltipManager.js.map