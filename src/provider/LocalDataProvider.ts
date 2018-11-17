import {computeHist, computeStats} from '../internal';
import Column, {
  defaultGroup, ICategoricalColumn, IColumnDesc, IDataRow, IGroup, INumberColumn,
  IOrderedGroup, ICompareValue,
  NumberColumn,
  chooseByLength,
  IndicesArray,
  mapIndices
} from '../model';
import Ranking from '../model/Ranking';
import ACommonDataProvider from './ACommonDataProvider';
import {IDataProviderOptions, IStatsBuilder} from './interfaces';
import {sortComplex} from './sort';


export interface ILocalDataProviderOptions {
  /**
   * whether the filter should be applied to all rankings regardless where they are
   * default: false
   */
  filterGlobally: boolean;
  /**
   * jump to search results such that they are visible
   * default: false
   */
  jumpToSearchResult: boolean;

  /**
   * the maximum number of nested sorting criteria
   */
  maxNestedSortingCriteria: number;
  maxGroupColumns: number;
}

/**
 * a data provider based on an local array
 */
export default class LocalDataProvider extends ACommonDataProvider {
  private options: ILocalDataProviderOptions = {
    /**
     * whether the filter should be applied to all rankings regardless where they are
     */
    filterGlobally: false,

    jumpToSearchResult: false,

    maxNestedSortingCriteria: Infinity,
    maxGroupColumns: Infinity
  };

  private readonly reorderAll: () => void;

  private _dataRows: IDataRow[];
  private filter: ((row: IDataRow) => boolean) | null = null;

  constructor(private _data: any[], columns: IColumnDesc[] = [], options: Partial<ILocalDataProviderOptions & IDataProviderOptions> = {}) {
    super(columns, options);
    Object.assign(this.options, options);
    this._dataRows = toRows(_data);


    const that = this;
    this.reorderAll = function (this: {source: Ranking}) {
      //fire for all other rankings a dirty order event, too
      const ranking = this.source;
      that.getRankings().forEach((r) => {
        if (r !== ranking) {
          r.dirtyOrder();
        }
      });
    };
  }

  /**
   * set a globally applied filter to all data without changing the data source itself
   * @param {((row: IDataRow) => boolean) | null} filter
   */
  setFilter(filter: ((row: IDataRow) => boolean) | null) {
    this.filter = filter;
    this.reorderAll();
  }

  getFilter() {
    return this.filter;
  }

  getTotalNumberOfRows() {
    return this.data.length;
  }

  protected getMaxGroupColumns() {
    return this.options.maxGroupColumns;
  }

  protected getMaxNestedSortingCriteria() {
    return this.options.maxNestedSortingCriteria;
  }

  get data() {
    return this._data;
  }

  /**
   * replaces the dataset rows with a new one
   * @param data
   */
  setData(data: any[]) {
    this._data = data;
    this._dataRows = toRows(data);
    this.reorderAll();
  }

  clearData() {
    this.setData([]);
  }

  /**
   * append rows to the dataset
   * @param data
   */
  appendData(data: any[]) {
    this._data.push(...data);
    this._dataRows.push(...toRows(data));
    this.reorderAll();
  }

  cloneRanking(existing?: Ranking) {
    const clone = super.cloneRanking(existing);

    if (this.options.filterGlobally) {
      clone.on(`${NumberColumn.EVENT_FILTER_CHANGED}.reorderAll`, this.reorderAll);
    }

    return clone;
  }

  cleanUpRanking(ranking: Ranking) {
    if (this.options.filterGlobally) {
      ranking.on(`${NumberColumn.EVENT_FILTER_CHANGED}.reorderAll`, null);
    }
    super.cleanUpRanking(ranking);
  }

  sortImpl(ranking: Ranking): IOrderedGroup[] {
    if (this._data.length === 0) {
      return [];
    }
    //do the optional filtering step
    let filter: ((d: IDataRow) => boolean) | null = null;
    if (this.options.filterGlobally) {
      const filtered = this.getRankings().filter((d) => d.isFiltered());
      if (filtered.length > 0) {
        filter = (d: IDataRow) => filtered.every((f) => f.filter(d));
      }
    } else if (ranking.isFiltered()) {
      filter = (d) => ranking.filter(d);
    }

    if (this.filter) {
      // insert the extra filter
      const bak = filter;
      filter = !filter ? this.filter : (d) => this.filter!(d) && bak!(d);
    }

    const groups = new Map<string, {group: IGroup, rows: {r: IDataRow, sort: ICompareValue[]}[]}>();

    for (const r of this._dataRows) {
      if (filter && !filter(r)) {
        continue;
      }
      const group = ranking.grouper(r) || defaultGroup;
      const groupKey = group.name.toLowerCase();
      const sort = ranking.toCompareValue(r);
      if (groups.has(groupKey)) {
        groups.get(groupKey)!.rows.push({r, sort});
      } else {
        groups.set(groupKey, {group, rows: [{r, sort}]});
      }
    }

    if (groups.size === 0) {
      return [];
    }

    const types = ranking.toCompareValueType();

    const ordered = Array.from(groups.values()).map((g) => {
      console.time('sort');
      sortComplex(g.rows, types);
      console.timeEnd('sort');

      //store the ranking index and create an argsort version, i.e. rank 0 -> index i
      const order = chooseByLength(g.rows.length);
      const index2pos = chooseByLength(this._data.length);

      for (let i = 0; i < g.rows.length; ++i) {
        const ri = g.rows[i].r.i;
        order[i] = ri;
        index2pos[ri] = i;
      }
      const groupData = Object.assign({rows: g.rows.map((d) => d.r)}, g.group);
      const orderedGroup = Object.assign({order, index2pos}, g.group);

      return {o: orderedGroup, sort: ranking.toGroupCompareValue(groupData)};
    });

    if (ordered.length === 1) {
      return [ordered[0].o];
    }

    // sort groups
    sortComplex(ordered, ranking.toGroupCompareValueType());

    return ordered.map((d) => d.o);
  }


  viewRaw(indices: IndicesArray) {
    //filter invalid indices
    return mapIndices(indices, (i) => this._data[i]);
  }

  viewRawRows(indices: IndicesArray) {
    //filter invalid indices
    return mapIndices(indices, (i) => this._dataRows[i]);
  }

  view(indices: IndicesArray) {
    return this.viewRaw(indices);
  }

  fetch(orders: IndicesArray[]): IDataRow[][] {
    return orders.map((order) => this.viewRawRows(order));
  }

  /**
   * helper for computing statistics
   * @param indices
   * @returns {{stats: (function(INumberColumn): *), hist: (function(ICategoricalColumn): *)}}
   */
  stats(indices?: IndicesArray): IStatsBuilder {
    let d: IDataRow[] | null = null;
    const getD = () => {
      if (d == null) {
        return d = indices && indices.length < this._dataRows.length ? this.viewRawRows(indices) : this._dataRows;
      }
      return d;
    };

    return {
      stats: (col: INumberColumn, numbrerOfBins?: number) => computeStats(getD(), (d) => col.getNumber(d), (d) => col.isMissing(d), [0, 1], numbrerOfBins),
      hist: (col: ICategoricalColumn) => computeHist(getD(), (d) => col.getCategory(d), col.categories)
    };
  }


  mappingSample(col: INumberColumn): number[] {
    const MAX_SAMPLE = 120; //at most 500 sample lines
    const l = this._dataRows.length;
    if (l <= MAX_SAMPLE) {
      return <number[]>this._dataRows.map(col.getRawNumber.bind(col));
    }
    //randomly select 500 elements
    const indices: number[] = [];
    for (let i = 0; i < MAX_SAMPLE; ++i) {
      let j = Math.floor(Math.random() * (l - 1));
      while (indices.indexOf(j) >= 0) {
        j = Math.floor(Math.random() * (l - 1));
      }
      indices.push(j);
    }
    return indices.map((i) => col.getRawNumber(this._dataRows[i]));
  }

  searchAndJump(search: string | RegExp, col: Column) {
    //case insensitive search
    search = typeof search === 'string' ? search.toLowerCase() : search;
    const f = typeof search === 'string' ? (v: string) => v.toLowerCase().indexOf((<string>search)) >= 0 : (<RegExp>search).test.bind(search);
    const indices = <number[]>[];
    for (let i = 0; i < this._dataRows.length; ++i) {
      if (f(col.getLabel(this._dataRows[i]))) {
        indices.push(i);
      }
    }
    this.jumpToNearest(indices);
  }

}

function toRows(data: any[]) {
  return data.map((v, i) => ({v, i}));
}
