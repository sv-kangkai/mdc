"use strict";

exports.exportDataGrid = exportDataGrid;

var _type = require("../../core/utils/type");

var _pdf_grid = require("./pdf_grid");

function exportDataGrid(doc, dataGrid, options) {
  if (!(0, _type.isDefined)(options.rect)) {
    throw 'options.rect is required';
  }

  var dataProvider = dataGrid.getDataProvider();
  return new Promise(function (resolve) {
    dataProvider.ready().done(function () {
      var columns = dataProvider.getColumns();
      var pdfGrid = new _pdf_grid.PdfGrid(options.splitToTablesByColumns, options.columnWidths);
      pdfGrid.startNewTable(options.drawTableBorder, options.rect);
      var dataRowsCount = dataProvider.getRowsCount();

      for (var rowIndex = 0; rowIndex < dataRowsCount; rowIndex++) {
        var currentRow = [];

        for (var cellIndex = 0; cellIndex < columns.length; cellIndex++) {
          var cellData = dataProvider.getCellData(rowIndex, cellIndex, true);
          var pdfCell = {
            text: cellData.value
          };

          if (cellData.cellSourceData.rowType === 'header') {
            var cellMerging = dataProvider.getCellMerging(rowIndex, cellIndex);

            if (cellMerging && cellMerging.rowspan > 0) {
              pdfCell.rowSpan = cellMerging.rowspan;
            }

            if (cellMerging && cellMerging.colspan > 0) {
              pdfCell.colSpan = cellMerging.colspan;
            }
          }

          if (options.onCellExporting) {
            options.onCellExporting({
              gridCell: {
                value: cellData.value
              },
              pdfCell: pdfCell
            });
          }

          currentRow.push(pdfCell);
        }

        var rowHeight = null; // TODO: Default Value

        if (options.onRowExporting) {
          var args = {
            drawNewTableFromThisRow: {},
            rowCells: currentRow
          };
          options.onRowExporting(args);
          var _args$drawNewTableFro = args.drawNewTableFromThisRow,
              startNewTable = _args$drawNewTableFro.startNewTable,
              addPage = _args$drawNewTableFro.addPage,
              tableRect = _args$drawNewTableFro.tableRect,
              splitToTablesByColumns = _args$drawNewTableFro.splitToTablesByColumns;

          if (startNewTable === true) {
            pdfGrid.startNewTable(options.drawTableBorder, tableRect, addPage === true, splitToTablesByColumns);
          }

          if ((0, _type.isDefined)(args.rowHeight)) {
            rowHeight = args.rowHeight;
          }
        }

        pdfGrid.addRow(currentRow, rowHeight);
      }

      pdfGrid.mergeCellsBySpanAttributes();
      pdfGrid.drawTo(doc);
      resolve();
    });
  });
}