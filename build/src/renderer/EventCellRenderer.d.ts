import type { ISequence } from 'src/internal';
import { ERenderMode, type ICellRendererFactory, type IGroupCellRenderer, type IRenderContext, type ISummaryRenderer } from './interfaces';
import { EventColumn, type IKeyValue } from '../model';
export default class EventCellRenderer implements ICellRendererFactory {
    readonly title: string;
    readonly group: string;
    private static readonly CIRCLE_RADIUS;
    private static readonly OVERVIEW_RECT_SIZE;
    private static readonly BOXPLOT_OPACITY;
    private static readonly SUMMARY_HEIGHT;
    canRender(col: any, mode: ERenderMode): boolean;
    create(col: EventColumn, context: IRenderContext): any;
    private addTooltipListeners;
    private updateBoxPlot;
    createGroup(col: EventColumn, context: IRenderContext): IGroupCellRenderer;
    private drawHeatmap;
    groupByKey(arr: ISequence<IKeyValue<number>[]>, keyList: string[], col: EventColumn): {
        key: string;
        values: number[];
    }[];
    createSummary(col: EventColumn, context: IRenderContext, interactive: boolean): ISummaryRenderer;
    private static getTickNumberForXAxis;
    private createTooltipTable;
}
//# sourceMappingURL=EventCellRenderer.d.ts.map