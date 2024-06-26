import { EventColumn } from '../../model';
import { ADialog, type IDialogContext } from '.';

export default class EventReferenceDialog extends ADialog {
  private readonly before: { boxplotReferenceEvent: string; referenceEvent: string };

  private static readonly BOXPLOT_REFERENCE_HEADER_TEXT = 'Boxplot Reference Event';
  private static readonly BOXPLOT_REFERENCE_COLUMN_NAME = 'boxplotReferenceEvent';
  private static readonly REFERENCE_COLUMN_HEADER_TEXT = 'Reference Event';
  private static readonly REFERENCE_COLUMN_NAME: string = 'referenceEvent';

  constructor(
    private readonly column: EventColumn,
    dialog: IDialogContext
  ) {
    super(dialog, {
      livePreview: 'dataMapping',
    });
    this.before = {
      boxplotReferenceEvent: column.getBoxplotReferenceEvent(),
      referenceEvent: column.getReferenceEvent(),
    };
  }

  protected build(node: HTMLElement): boolean | void {
    this.referenceEventSettings(node);
    if (this.column.getBoxplotPossible()) {
      this.boxplotReferenceSettings(node);
    }
    this.livePreviews(node);
  }

  private livePreviews(node: HTMLElement) {
    node.querySelectorAll('.lu-checkbox').forEach((d) =>
      d.addEventListener('click', () => {
        if (this.showLivePreviews) {
          this.submit();
        }
      })
    );
    this.enableLivePreviews('input');
  }

  private boxplotReferenceSettings(node: HTMLElement) {
    const columns = [EventColumn.CURRENT_DATE_REFERENCE];
    const currentReference = this.column.getBoxplotReferenceEvent();
    columns.push(...this.column.getEventList());
    node.insertAdjacentHTML(
      'beforeend',
      `
      <strong>${EventReferenceDialog.BOXPLOT_REFERENCE_HEADER_TEXT}</strong>
      ${columns
        .map(
          (d) => ` <label class="lu-checkbox boxplot-reference-checkbox"><input type="radio" name="${
            EventReferenceDialog.BOXPLOT_REFERENCE_COLUMN_NAME
          }" value="${d}" 
      ${currentReference === d ? 'checked' : ''}><span>${d}</span></label>`
        )
        .join('')}
       `
    );
  }

  private referenceEventSettings(node: HTMLElement) {
    const columns = [EventColumn.CURRENT_DATE_REFERENCE];
    const currentReference = this.column.getReferenceEvent();
    columns.push(...this.column.getEventList());
    node.insertAdjacentHTML(
      'beforeend',
      `
      <strong>${EventReferenceDialog.REFERENCE_COLUMN_HEADER_TEXT}</strong>
      ${columns
        .map(
          (d) => ` <label class="lu-checkbox boxplot-reference-checkbox"><input type="radio" name="${
            EventReferenceDialog.REFERENCE_COLUMN_NAME
          }" value="${d}" 
      ${currentReference === d ? 'checked' : ''}><span>${d}</span></label>`
        )
        .join('')}
       `
    );
  }

  protected reset(): void {
    if (this.column.getBoxplotPossible()) {
      this.findInput('input[name=' + EventReferenceDialog.BOXPLOT_REFERENCE_COLUMN_NAME + ']:checked').checked = false;

      this.findInput(
        'input[name=' +
          EventReferenceDialog.BOXPLOT_REFERENCE_COLUMN_NAME +
          '][value="' +
          this.before.boxplotReferenceEvent +
          '"]'
      ).checked = true;
    }
    this.findInput('input[name=' + EventReferenceDialog.REFERENCE_COLUMN_NAME + ']:checked').checked = false;

    this.findInput(
      'input[name=' + EventReferenceDialog.REFERENCE_COLUMN_NAME + '][value="' + this.before.referenceEvent + '"]'
    ).checked = true;

    this.submit();
  }

  protected submit(): boolean | undefined {
    if (this.column.getBoxplotPossible()) {
      const boxplotReferenceEvent = this.findInput(
        'input[name=' + EventReferenceDialog.BOXPLOT_REFERENCE_COLUMN_NAME + ']:checked'
      ).value;
      this.column.setBoxplotReferenceEvent(boxplotReferenceEvent);
    }

    const referenceEvent = this.findInput(
      'input[name=' + EventReferenceDialog.REFERENCE_COLUMN_NAME + ']:checked'
    ).value;
    this.column.setReferenceEvent(referenceEvent);
    return true;
  }
  protected cancel(): void {
    this.column.setReferenceEvent(this.before.referenceEvent);
    this.column.setBoxplotReferenceEvent(this.before.boxplotReferenceEvent);
  }
}
