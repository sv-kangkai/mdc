"use strict";

exports.Export = void 0;

var _type = require("../../core/utils/type");

var _message = _interopRequireDefault(require("../../localization/message"));

var _export_format = require("./export_format");

var _export_merged_ranges_manager = require("./export_merged_ranges_manager");

var _extend = require("../../core/utils/extend");

var _window = require("../../core/utils/window");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// docs.microsoft.com/en-us/office/troubleshoot/excel/determine-column-widths - "Description of how column widths are determined in Excel"
var MAX_DIGIT_WIDTH_IN_PIXELS = 7; // Calibri font with 11pt size
// support.office.com/en-us/article/change-the-column-width-and-row-height-72f5e3cc-994d-43e8-ae58-9774a0905f46 - "Column.Max - 255"
// support.office.com/en-us/article/excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3 - "Column width limit - 255 characters"

var MAX_EXCEL_COLUMN_WIDTH = 255;
var Export = {
  getFullOptions: function getFullOptions(options) {
    var fullOptions = (0, _extend.extend)({}, options);

    if (!((0, _type.isDefined)(fullOptions.worksheet) && (0, _type.isObject)(fullOptions.worksheet))) {
      throw Error('The "worksheet" field must contain an object.');
    }

    if (!(0, _type.isDefined)(fullOptions.topLeftCell)) {
      fullOptions.topLeftCell = {
        row: 1,
        column: 1
      };
    } else if ((0, _type.isString)(fullOptions.topLeftCell)) {
      var _fullOptions$workshee = fullOptions.worksheet.getCell(fullOptions.topLeftCell),
          row = _fullOptions$workshee.row,
          col = _fullOptions$workshee.col;

      fullOptions.topLeftCell = {
        row: row,
        column: col
      };
    }

    if (!(0, _type.isDefined)(fullOptions.keepColumnWidths)) {
      fullOptions.keepColumnWidths = true;
    }

    if (!(0, _type.isDefined)(fullOptions.loadPanel)) {
      fullOptions.loadPanel = {};
    }

    if (!(0, _type.isDefined)(fullOptions.loadPanel.enabled)) {
      fullOptions.loadPanel.enabled = true;
    }

    if (!(0, _type.isDefined)(fullOptions.loadPanel.text)) {
      fullOptions.loadPanel.text = _message.default.format('dxDataGrid-exporting');
    }

    return fullOptions;
  },
  convertDateForExcelJS: function convertDateForExcelJS(date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
  },
  setNumberFormat: function setNumberFormat(excelCell, numberFormat) {
    excelCell.numFmt = numberFormat;
  },
  getCellStyles: function getCellStyles(dataProvider) {
    var _this = this;

    var styles = dataProvider.getStyles();
    styles.forEach(function (style) {
      var numberFormat = _this.tryConvertToExcelNumberFormat(style.format, style.dataType);

      if ((0, _type.isDefined)(numberFormat)) {
        numberFormat = numberFormat.replace(/&quot;/g, '"');
      }

      style.numberFormat = numberFormat;
    });
    return styles;
  },
  tryConvertToExcelNumberFormat: function tryConvertToExcelNumberFormat(format, dataType) {
    var newFormat = _export_format.ExportFormat.formatObjectConverter(format, dataType);

    var currency = newFormat.currency;
    format = newFormat.format;
    dataType = newFormat.dataType;
    return _export_format.ExportFormat.convertFormat(format, newFormat.precision, dataType, currency);
  },
  setAlignment: function setAlignment(excelCell, wrapText, horizontalAlignment) {
    excelCell.alignment = excelCell.alignment || {};

    if ((0, _type.isDefined)(wrapText)) {
      excelCell.alignment.wrapText = wrapText;
    }

    if ((0, _type.isDefined)(horizontalAlignment)) {
      excelCell.alignment.horizontal = horizontalAlignment;
    }

    excelCell.alignment.vertical = 'top';
  },
  setColumnsWidth: function setColumnsWidth(worksheet, widths, startColumnIndex) {
    if (!(0, _type.isDefined)(widths)) {
      return;
    }

    for (var i = 0; i < widths.length; i++) {
      var columnWidth = widths[i];

      if (typeof columnWidth === 'number' && isFinite(columnWidth)) {
        worksheet.getColumn(startColumnIndex + i).width = Math.min(MAX_EXCEL_COLUMN_WIDTH, Math.floor(columnWidth / MAX_DIGIT_WIDTH_IN_PIXELS * 100) / 100);
      }
    }
  },
  setLoadPanelOptions: function setLoadPanelOptions(component, options, renderLoadPanel) {
    if (!(0, _window.hasWindow)()) {
      return;
    }

    component._setOptionWithoutOptionChange('loadPanel', options);

    renderLoadPanel(component);
  },
  export: function _export(options, helpers) {
    var _this2 = this;

    var customizeCell = options.customizeCell,
        component = options.component,
        worksheet = options.worksheet,
        topLeftCell = options.topLeftCell,
        autoFilterEnabled = options.autoFilterEnabled,
        keepColumnWidths = options.keepColumnWidths,
        selectedRowsOnly = options.selectedRowsOnly,
        loadPanel = options.loadPanel,
        mergeRowFieldValues = options.mergeRowFieldValues,
        mergeColumnFieldValues = options.mergeColumnFieldValues;
    var initialLoadPanelOptions = (0, _extend.extend)({}, component.option('loadPanel'));

    if ('animation' in component.option('loadPanel')) {
      loadPanel.animation = null;
    }

    this.setLoadPanelOptions(component, loadPanel, helpers._renderLoadPanel);
    var wrapText = !!component.option('wordWrapEnabled');
    worksheet.properties.outlineProperties = {
      summaryBelow: false,
      summaryRight: false
    };
    var cellRange = {
      from: {
        row: topLeftCell.row,
        column: topLeftCell.column
      },
      to: {
        row: topLeftCell.row,
        column: topLeftCell.column
      }
    };
    var dataProvider = component.getDataProvider(selectedRowsOnly);
    return new Promise(function (resolve) {
      dataProvider.ready().done(function () {
        var columns = dataProvider.getColumns();
        var dataRowsCount = dataProvider.getRowsCount();

        if (keepColumnWidths) {
          _this2.setColumnsWidth(worksheet, dataProvider.getColumnsWidths(), cellRange.from.column);
        }

        var mergedRangesManager = new _export_merged_ranges_manager.MergedRangesManager(dataProvider, helpers, mergeRowFieldValues, mergeColumnFieldValues);

        var styles = _this2.getCellStyles(dataProvider);

        for (var rowIndex = 0; rowIndex < dataRowsCount; rowIndex++) {
          var row = worksheet.getRow(cellRange.from.row + rowIndex);

          helpers._trySetOutlineLevel(dataProvider, row, rowIndex);

          _this2.exportRow(dataProvider, helpers, mergedRangesManager, rowIndex, columns.length, row, cellRange.from.column, customizeCell, wrapText, styles);

          if (rowIndex >= 1) {
            cellRange.to.row++;
          }
        }

        mergedRangesManager.applyMergedRages(worksheet);
        cellRange.to.column += columns.length > 0 ? columns.length - 1 : 0;
        var worksheetViewSettings = worksheet.views[0] || {};

        if (component.option('rtlEnabled')) {
          worksheetViewSettings.rightToLeft = true;
        }

        if (helpers._isFrozenZone(dataProvider)) {
          if (Object.keys(worksheetViewSettings).indexOf('state') === -1) {
            (0, _extend.extend)(worksheetViewSettings, helpers._getWorksheetFrozenState(dataProvider, cellRange));
          }

          helpers._trySetAutoFilter(dataProvider, worksheet, cellRange, autoFilterEnabled);
        }

        if (Object.keys(worksheetViewSettings).length > 0) {
          worksheet.views = [worksheetViewSettings];
        }

        resolve(cellRange);
      }).always(function () {
        _this2.setLoadPanelOptions(component, initialLoadPanelOptions, helpers._renderLoadPanel);
      });
    });
  },
  exportRow: function exportRow(dataProvider, helpers, mergedRangesManager, rowIndex, cellCount, row, startColumnIndex, customizeCell, wrapText, styles) {
    for (var cellIndex = 0; cellIndex < cellCount; cellIndex++) {
      var cellData = dataProvider.getCellData(rowIndex, cellIndex, true);
      var excelCell = row.getCell(startColumnIndex + cellIndex);
      mergedRangesManager.updateMergedRanges(excelCell, rowIndex, cellIndex);
      var cellInfo = mergedRangesManager.findMergedCellInfo(rowIndex, cellIndex);

      if ((0, _type.isDefined)(cellInfo) && excelCell !== cellInfo.masterCell) {
        excelCell.style = cellInfo.masterCell.style;
        excelCell.value = cellInfo.masterCell.value;
      } else {
        if ((0, _type.isDate)(cellData.value)) {
          excelCell.value = this.convertDateForExcelJS(cellData.value);
        } else {
          excelCell.value = cellData.value;
        }

        if ((0, _type.isDefined)(excelCell.value)) {
          var _styles$dataProvider$ = styles[dataProvider.getStyleId(rowIndex, cellIndex)],
              bold = _styles$dataProvider$.bold,
              horizontalAlignment = _styles$dataProvider$.alignment,
              numberFormat = _styles$dataProvider$.numberFormat;

          if ((0, _type.isDefined)(numberFormat)) {
            this.setNumberFormat(excelCell, numberFormat);
          } else if ((0, _type.isString)(excelCell.value) && /^[@=+-]/.test(excelCell.value)) {
            this.setNumberFormat(excelCell, '@');
          }

          helpers._trySetFont(excelCell, bold);

          this.setAlignment(excelCell, wrapText, horizontalAlignment);
        }
      }

      if ((0, _type.isFunction)(customizeCell)) {
        customizeCell(helpers._getCustomizeCellOptions(excelCell, cellData.cellSourceData));
      }
    }
  }
};
exports.Export = Export;