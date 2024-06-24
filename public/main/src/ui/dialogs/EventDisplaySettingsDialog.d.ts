import { EventColumn } from '../../model';
import { ADialog, type IDialogContext } from '.';
export default class EventDisplaySettingsDialog extends ADialog {
    private readonly column;
    private readonly before;
    private static readonly EVENT_DISPLAY_COLUMN_HEADER_TEXT;
    private static readonly EVENT_DISPLAY_COLUMN_OVERVIEW_HEADER_TEXT;
    private static readonly EVENT_DISPLAY_COLUMN_NAME;
    private static readonly EVENT_DISPLAY_COLUMN_OVERVIEW_NAME;
    private static readonly SHOW_BOXPLOT_HEADER_TEXT;
    private static readonly SHOW_BOXPLOT_NAME;
    private static readonly SHOW_ZERO_LINE_HEADER_TEXT;
    private static readonly SHOW_ZERO_LINE_NAME;
    constructor(column: EventColumn, dialog: IDialogContext);
    protected build(node: HTMLElement): void;
    private buildEventCheckboxSettings;
    private livePreviews;
    private buildEventDisplaySettings;
    protected reset(): void;
    protected submit(): boolean;
    protected cancel(): void;
}
//# sourceMappingURL=EventDisplaySettingsDialog.d.ts.map