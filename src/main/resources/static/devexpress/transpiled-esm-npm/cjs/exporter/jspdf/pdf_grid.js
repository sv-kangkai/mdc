"use strict";

exports.PdfGrid = void 0;

var _type = require("../../core/utils/type");

var _pdf_table = require("./pdf_table");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var PdfGrid = /*#__PURE__*/function () {
  function PdfGrid(splitByColumns, columnWidths) {
    this._splitByColumns = splitByColumns !== null && splitByColumns !== void 0 ? splitByColumns : [];
    this._columnWidths = columnWidths !== null && columnWidths !== void 0 ? columnWidths : [];
    this._newPageTables = [];
    this._tables = [];
    this._currentHorizontalTables = null;
  }

  var _proto = PdfGrid.prototype;

  _proto._addLastTableToNewPages = function _addLastTableToNewPages() {
    this._newPageTables.push(this._currentHorizontalTables[this._currentHorizontalTables.length - 1]);
  };

  _proto.startNewTable = function startNewTable(drawTableBorder, firstTableRect, firstTableOnNewPage, splitByColumns) {
    var _this$_splitByColumns, _this$_splitByColumns2, _this$_tables;

    if ((0, _type.isDefined)(splitByColumns)) {
      this._splitByColumns = splitByColumns;
    }

    var firstTableEndColumnIndex = (_this$_splitByColumns = (_this$_splitByColumns2 = this._splitByColumns[0]) === null || _this$_splitByColumns2 === void 0 ? void 0 : _this$_splitByColumns2.columnIndex) !== null && _this$_splitByColumns !== void 0 ? _this$_splitByColumns : this._columnWidths.length;
    this._currentHorizontalTables = [new _pdf_table.PdfTable(drawTableBorder, firstTableRect, this._columnWidths.slice(0, firstTableEndColumnIndex))];

    if (firstTableOnNewPage) {
      this._addLastTableToNewPages();
    }

    if ((0, _type.isDefined)(this._splitByColumns)) {
      for (var i = 0; i < this._splitByColumns.length; i++) {
        var _this$_splitByColumns3, _this$_splitByColumns4;

        var beginColumnIndex = this._splitByColumns[i].columnIndex;
        var endColumnIndex = (_this$_splitByColumns3 = (_this$_splitByColumns4 = this._splitByColumns[i + 1]) === null || _this$_splitByColumns4 === void 0 ? void 0 : _this$_splitByColumns4.columnIndex) !== null && _this$_splitByColumns3 !== void 0 ? _this$_splitByColumns3 : this._columnWidths.length;

        this._currentHorizontalTables.push(new _pdf_table.PdfTable(drawTableBorder, this._splitByColumns[i].tableRect, this._columnWidths.slice(beginColumnIndex, endColumnIndex)));

        if (this._splitByColumns[i].drawOnNewPage) {
          this._addLastTableToNewPages();
        }
      }
    }

    (_this$_tables = this._tables).push.apply(_this$_tables, _toConsumableArray(this._currentHorizontalTables));
  };

  _proto.addRow = function addRow(cells, rowHeight) {
    var _this = this;

    var currentTableIndex = 0;
    var currentTableCells = [];

    var _loop = function _loop(cellIndex) {
      var isNewTableColumn = _this._splitByColumns.filter(function (splitByColumn) {
        return splitByColumn.columnIndex === cellIndex;
      })[0];

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
  };

  _proto._trySplitColSpanArea = function _trySplitColSpanArea(cells, splitIndex) {
    var colSpanArea = this._findColSpanArea(cells, splitIndex);

    if ((0, _type.isDefined)(colSpanArea)) {
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
  };

  _proto._findColSpanArea = function _findColSpanArea(cells, targetCellIndex) {
    for (var index = 0; index < cells.length; index++) {
      if (cells[index].colSpan > 0) {
        var colSpan = cells[index].colSpan;
        var startIndex = index;
        var endIndex = startIndex + colSpan;

        if (startIndex < targetCellIndex && targetCellIndex <= endIndex) {
          return {
            colSpan: colSpan,
            startIndex: startIndex,
            endIndex: endIndex
          };
        } else {
          index = endIndex;
        }
      }
    }

    return null;
  };

  _proto.mergeCellsBySpanAttributes = function mergeCellsBySpanAttributes() {
    this._tables.forEach(function (table) {
      for (var rowIndex = 0; rowIndex < table.rows.length; rowIndex++) {
        for (var cellIndex = 0; cellIndex < table.rows[rowIndex].length; cellIndex++) {
          var cell = table.rows[rowIndex][cellIndex];

          if (!cell.skip) {
            if ((0, _type.isDefined)(cell.rowSpan)) {
              for (var i = 1; i <= cell.rowSpan; i++) {
                var mergedCell = table.rows[rowIndex + i][cellIndex];

                if ((0, _type.isDefined)(mergedCell)) {
                  cell._rect.h += mergedCell._rect.h;
                  mergedCell.skip = true;
                }
              }
            }

            if ((0, _type.isDefined)(cell.colSpan)) {
              for (var _i = 1; _i <= cell.colSpan; _i++) {
                var _mergedCell = table.rows[rowIndex][cellIndex + _i];

                if ((0, _type.isDefined)(_mergedCell)) {
                  cell._rect.w += _mergedCell._rect.w;
                  _mergedCell.skip = true;
                }
              }
            }
          }
        }
      }
    });
  };

  _proto.drawTo = function drawTo(doc) {
    var _this2 = this;

    this._tables.forEach(function (table) {
      if (_this2._newPageTables.indexOf(table) !== -1) {
        doc.addPage();
      }

      table.drawTo(doc);
    });
  };

  return PdfGrid;
}();

exports.PdfGrid = PdfGrid;