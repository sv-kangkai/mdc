import gridCore from './ui.data_grid.core';
import errors from '../widget/ui.errors';
import dataSourceAdapterProvider from './ui.data_grid.data_source_adapter';
import { dataControllerModule } from '../grid_core/ui.grid_core.data_controller';
export var DataController = dataControllerModule.controllers.data.inherit(function () {
  return {
    _getDataSourceAdapter: function _getDataSourceAdapter() {
      return dataSourceAdapterProvider;
    },
    _getSpecificDataSourceOption: function _getSpecificDataSourceOption() {
      var dataSource = this.option('dataSource');

      if (dataSource && !Array.isArray(dataSource) && this.option('keyExpr')) {
        errors.log('W1011');
      }

      return this.callBase();
    }
  };
}());
gridCore.registerModule('data', {
  defaultOptions: dataControllerModule.defaultOptions,
  controllers: {
    data: DataController
  }
});