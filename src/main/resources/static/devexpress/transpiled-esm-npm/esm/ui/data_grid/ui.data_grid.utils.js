import gridCoreUtils from '../grid_core/ui.grid_core.utils';
import dataUtils from '../../data/utils';
export function createGroupFilter(path, storeLoadOptions) {
  var groups = dataUtils.normalizeSortingInfo(storeLoadOptions.group);
  var filter = [];

  for (var i = 0; i < path.length; i++) {
    filter.push([groups[i].selector, '=', path[i]]);
  }

  if (storeLoadOptions.filter) {
    filter.push(storeLoadOptions.filter);
  }

  return gridCoreUtils.combineFilters(filter);
}