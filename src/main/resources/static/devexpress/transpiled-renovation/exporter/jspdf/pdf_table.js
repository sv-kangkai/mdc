"use strict";

exports.PdfTable = void 0;

var _type = require("../../core/utils/type");

var _draw_pdf_table = require("./draw_pdf_table");

var PdfTable = /*#__PURE__*/function () {
  function PdfTable(drawTableBorder, rect, columnWidths) {
    if (!(0, _type.isDefined)(columnWidths)) {
      throw 'columnWidths is required';
    }

    this.drawTableBorder = drawTableBorder;
    this.rect = rect;
    this.columnWidths = columnWidths; // TODO

    this.rowHeights = [];
    this.rows = [];
  }

  var _proto = PdfTable.prototype;

  _proto.getCellX = function getCellX(cellIndex) {
    return this.rect.x + this.columnWidths.slice(0, cellIndex).reduce(function (a, b) {
      return a + b;
    }, 0);
  };

  _proto.getCellY = function getCellY(rowIndex) {
    return this.rect.y + this.rowHeights.slice(0, rowIndex).reduce(function (a, b) {
      return a + b;
    }, 0);
  };

  _proto.addRow = function addRow(cells, rowHeight) {
    if (!(0, _type.isDefined)(cells)) {
      throw 'cells is required';
    }

    if (cells.length !== this.columnWidths.length) {
      throw 'the length of the cells must be equal to the length of the column';
    }

    if (!(0, _type.isDefined)(rowHeight)) {
      throw 'rowHeight is required';
    }

    this.rows.push(cells);
    this.rowHeights.push(rowHeight);

    for (var i = 0; i < cells.length; i++) {
      var currentCell = cells[i];

      if (currentCell.drawLeftBorder === false) {
        if (i >= 1) {
          cells[i - 1].drawRightBorder = false;
        }
      } else if (!(0, _type.isDefined)(currentCell.drawLeftBorder)) {
        if (i >= 1 && cells[i - 1].drawRightBorder === false) {
          currentCell.drawLeftBorder = false;
        }
      }

      if (currentCell.drawTopBorder === false) {
        if (this.rows.length >= 2) {
          this.rows[this.rows.length - 2][i].drawBottomBorder = false;
        }
      } else if (!(0, _type.isDefined)(currentCell.drawTopBorder)) {
        if (this.rows.length >= 2 && this.rows[this.rows.length - 2][i].drawBottomBorder === false) {
          currentCell.drawTopBorder = false;
        }
      }

      var columnWidth = this.columnWidths[i];

      if (!(0, _type.isDefined)(columnWidth)) {
        throw 'column width is required'; // TODO
      }

      cells[i]._rect = {
        x: this.getCellX(i),
        y: this.getCellY(this.rows.length - 1),
        w: columnWidth,
        h: rowHeight
      };
    }
  };

  _proto.drawTo = function drawTo(doc) {
    (0, _draw_pdf_table.drawPdfTable)(doc, this);
  };

  return PdfTable;
}();

exports.PdfTable = PdfTable;