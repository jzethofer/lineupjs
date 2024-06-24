import { EventColumn } from '../../model';
import { ADialog, type IDialogContext } from '.';
export default class EventReferenceDialog extends ADialog {
    private readonly column;
    private readonly before;
    private static readonly BOXPLOT_REFERENCE_HEADER_TEXT;
    private static readonly BOXPLOT_REFERENCE_COLUMN_NAME;
    private static readonly REFERENCE_COLUMN_HEADER_TEXT;
    private static readonly REFERENCE_COLUMN_NAME;
    constructor(column: EventColumn, dialog: IDialogContext);
    protected build(node: HTMLElement): boolean | void;
    private livePreviews;
    private boxplotReferenceSettings;
    private referenceEventSettings;
    protected reset(): void;
    protected submit(): boolean | undefined;
    protected cancel(): void;
}
//# sourceMappingURL=EventReferenceDialog.d.ts.map