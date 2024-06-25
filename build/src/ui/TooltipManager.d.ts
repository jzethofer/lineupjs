import { type Modifier, type OptionsGeneric } from '@popperjs/core';
import AEventDispatcher from '../internal/AEventDispatcher';
export default class TooltipManager extends AEventDispatcher {
    static readonly EVENT_TOOLTIP_OPENED = "tooltipOpened";
    static readonly EVENT_TOOLTIP_CLOSED = "tooltipClosed";
    readonly node: HTMLElement;
    private contentNode;
    readonly tooltipArrow: HTMLElement;
    private popperInstance;
    private popperOptions;
    private targetElement;
    constructor(options: {
        doc: Document;
        idPrefix: string;
        defaultPopperOptions?: Partial<OptionsGeneric<Partial<Modifier<any, any>>>>;
    });
    updateTooltipContent(element: HTMLElement): void;
    showTooltip(targetElement: HTMLElement, contentUpdate?: HTMLElement): void;
    hideTooltip(): void;
    protected createEventList(): string[];
}
//# sourceMappingURL=TooltipManager.d.ts.map