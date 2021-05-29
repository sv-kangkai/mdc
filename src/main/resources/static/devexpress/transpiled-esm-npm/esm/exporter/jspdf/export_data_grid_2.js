import { isDefined } from '../../core/utils/type';
import { PdfGrid } from './pdf_grid';

function exportDataGrid(doc, dataGrid, options) {
  if (!isDefined(options.rect)) {
    throw 'options.rect is required';
  }

  var dataProvider = dataGrid.getDataProvider();
  return new Promise(resolve => {
    dataProvider.ready().done(() => {
      var columns = dataProvider.getColumns();
      var pdfGrid = new PdfGrid(options.splitToTablesByColumns, options.columnWidths);
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
              pdfCell
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
          var {
            startNewTable,
            addPage,
            tableRect,
            splitToTablesByColumns
          } = args.drawNewTableFromThisRow;

          if (startNewTable === true) {
            pdfGrid.startNewTable(options.drawTableBorder, tableRect, addPage === true, splitToTablesByColumns);
          }

          if (isDefined(args.rowHeight)) {
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

export { exportDataGrid };