import { isDefined } from '../../core/utils/type';
import { PdfTable } from './pdf_table';
export class PdfGrid {
  constructor(splitByColumns, columnWidths) {
    this._splitByColumns = splitByColumns !== null && splitByColumns !== void 0 ? splitByColumns : [];
    this._columnWidths = columnWidths !== null && columnWidths !== void 0 ? columnWidths : [];
    this._newPageTables = [];
    this._tables = [];
    this._currentHorizontalTables = null;
  }

  _addLastTableToNewPages() {
    this._newPageTables.push(this._currentHorizontalTables[this._currentHorizontalTables.length - 1]);
  }

  startNewTable(drawTableBorder, firstTableRect, firstTableOnNewPage, splitByColumns) {
    var _this$_splitByColumns, _this$_splitByColumns2;

    if (isDefined(splitByColumns)) {
      this._splitByColumns = splitByColumns;
    }

    var firstTableEndColumnIndex = (_this$_splitByColumns = (_this$_splitByColumns2 = this._splitByColumns[0]) === null || _this$_splitByColumns2 === void 0 ? void 0 : _this$_splitByColumns2.columnIndex) !== null && _this$_splitByColumns !== void 0 ? _this$_splitByColumns : this._columnWidths.length;
    this._currentHorizontalTables = [new PdfTable(drawTableBorder, firstTableRect, this._columnWidths.slice(0, firstTableEndColumnIndex))];

    if (firstTableOnNewPage) {
      this._addLastTableToNewPages();
    }

    if (isDefined(this._splitByColumns)) {
      for (var i = 0; i < this._splitByColumns.length; i++) {
        var _this$_splitByColumns3, _this$_splitByColumns4;

        var beginColumnIndex = this._splitByColumns[i].columnIndex;
        var endColumnIndex = (_this$_splitByColumns3 = (_this$_splitByColumns4 = this._splitByColumns[i + 1]) === null || _this$_splitByColumns4 === void 0 ? void 0 : _this$_splitByColumns4.columnIndex) !== null && _this$_splitByColumns3 !== void 0 ? _this$_splitByColumns3 : this._columnWidths.length;

        this._currentHorizontalTables.push(new PdfTable(drawTableBorder, this._splitByColumns[i].tableRect, this._columnWidths.slice(beginColumnIndex, endColumnIndex)));

        if (this._splitByColumns[i].drawOnNewPage) {
          this._addLastTableToNewPages();
        }
      }
    }

    this._tables.push(...this._currentHorizontalTables);
  }

  addRow(cells, rowHeight) {
    var _this = this;

    var currentTableIndex = 0;
    var currentTableCells = [];

    var _loop = function _loop(cellIndex) {
      var isNewTableColumn = _this._splitByColumns.filter(splitByColumn => splitByColumn.columnIndex === cellIndex)[0];

      if (isNewTableColumn) {
        _this._currentHorizontalTables[currentTableIndex].addRow(currentTableCells, rowHeight);

        _this._trySplitColSpanArea(cells, cellIndex);

        currentTableIndex++;
        currentTableCells = [];
      }

      currentTableCells.push(cells[cellIndex]);
    };

    for (var cellIndex = 0; cellIndex < cells.length; cellIndex++) {
      _loop(cellIndex);
    }

    this._currentHorizontalTables[currentTableIndex].addRow(currentTableCells, rowHeight);
  }

  _trySplitColSpanArea(cells, splitIndex) {
    var colSpanArea = this._findColSpanArea(cells, splitIndex);

    if (isDefined(colSpanArea)) {
      var leftAreaColSpan = splitIndex - colSpanArea.startIndex - 1;
      var rightAreaColSpan = colSpanArea.endIndex - splitIndex;
      cells[splitIndex].text = cells[colSpanArea.startIndex].text;

      for (var index = colSpanArea.startIndex; index <= colSpanArea.endIndex; index++) {
        var colSpan = index < splitIndex ? leftAreaColSpan : rightAreaColSpan;

        if (colSpan > 0) {
          cells[index].colSpan = colSpan;
        } else {
          delete cells[index].colSpan;
        }
      }
    }
  }

  _findColSpanArea(cells, targetCellIndex) {
    for (var index = 0; index < cells.length; index++) {
      if (cells[index].colSpan > 0) {
        var colSpan = cells[index].colSpan;
        var startIndex = index;
        var endIndex = startIndex + colSpan;

        if (startIndex < targetCellIndex && targetCellIndex <= endIndex) {
          return {
            colSpan,
            startIndex,
            endIndex
          };
        } else {
          index = endIndex;
        }
      }
    }

    return null;
  }

  mergeCellsBySpanAttributes() {
    this._tables.forEach(table => {
      for (var rowIndex = 0; rowIndex < table.rows.length; rowIndex++) {
        for (var cellIndex = 0; cellIndex < table.rows[rowIndex].length; cellIndex++) {
          var cell = table.rows[rowIndex][cellIndex];

          if (!cell.skip) {
            if (isDefined(cell.rowSpan)) {
              for (var i = 1; i <= cell.rowSpan; i++) {
                var mergedCell = table.rows[rowIndex + i][cellIndex];

                if (isDefined(mergedCell)) {
                  cell._rect.h += mergedCell._rect.h;
                  mergedCell.skip = true;
                }
              }
            }

            if (isDefined(cell.colSpan)) {
              for (var _i = 1; _i <= cell.colSpan; _i++) {
                var _mergedCell = table.rows[rowIndex][cellIndex + _i];

                if (isDefined(_mergedCell)) {
                  cell._rect.w += _mergedCell._rect.w;
                  _mergedCell.skip = true;
                }
              }
            }
          }
        }
      }
    });
  }

  drawTo(doc) {
    this._tables.forEach(table => {
      if (this._newPageTables.indexOf(table) !== -1) {
        doc.addPage();
      }

      table.drawTo(doc);
    });
  }

}