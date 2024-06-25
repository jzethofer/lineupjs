import { EBoxplotDataKeys } from '../../model';
import { sortMethods } from './utils';
/** @internal */
export default function sortEventColumnNames(col, node) {
    var sortKeys = col.getEventList();
    if (col.getBoxplotPossible()) {
        for (var _i = 0, _a = Object.keys(EBoxplotDataKeys); _i < _a.length; _i++) {
            var key = _a[_i];
            sortKeys.push(key);
        }
    }
    return sortMethods(node, col, sortKeys);
}
//# sourceMappingURL=sortEventColumnNames.js.map