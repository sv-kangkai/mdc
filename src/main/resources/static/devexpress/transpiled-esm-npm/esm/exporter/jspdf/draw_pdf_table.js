import { isDefined } from '../../core/utils/type'; // this function is large and will grow

export function drawPdfTable(doc, table) {
  if (!isDefined(doc)) {
    throw 'doc is required';
  }

  function drawBorder(rect) {
    var drawLeftBorder = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var drawRightBorder = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var drawTopBorder = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    var drawBottomBorder = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

    if (!isDefined(rect)) {
      throw 'rect is required';
    }

    var defaultBorderLineWidth = 1;

    if (!drawLeftBorder && !drawRightBorder && !drawTopBorder && !drawBottomBorder) {
      return;
    } else if (drawLeftBorder && drawRightBorder && drawTopBorder && drawBottomBorder) {
      doc.setLineWidth(defaultBorderLineWidth);
      doc.rect(rect.x, rect.y, rect.w, rect.h);
    } else {
      doc.setLineWidth(defaultBorderLineWidth);

      if (drawTopBorder) {
        doc.line(rect.x, rect.y, rect.x + rect.w, rect.y); // top
      }

      if (drawLeftBorder) {
        doc.line(rect.x, rect.y, rect.x, rect.y + rect.h); // left
      }

      if (drawRightBorder) {
        doc.line(rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + rect.h); // right
      }

      if (drawBottomBorder) {
        doc.line(rect.x, rect.y + rect.h, rect.x + rect.w, rect.y + rect.h); // bottom
      }
    }
  }

  function drawRow(rowCells) {
    if (!isDefined(rowCells)) {
      throw 'rowCells is required';
    }

    rowCells.forEach(cell => {
      if (cell.skip === true) {
        return;
      }

      if (!isDefined(cell._rect)) {
        throw 'cell._rect is required';
      }

      if (isDefined(cell.text) && cell.text !== '') {
        // TODO: use cell.text.trim() ?
        var textY = cell._rect.y + cell._rect.h / 2;
        doc.text(cell.text, cell._rect.x, textY, {
          baseline: 'middle'
        }); // align by vertical 'middle', https://github.com/MrRio/jsPDF/issues/1573
      }

      drawBorder(cell._rect, cell.drawLeftBorder, cell.drawRightBorder, cell.drawTopBorder, cell.drawBottomBorder);
    });
  }

  if (!isDefined(table)) {
    return Promise.resolve();
  }

  if (!isDefined(table.rect)) {
    throw 'table.rect is required';
  }

  if (isDefined(table.rows)) {
    for (var rowIndex = 0; rowIndex < table.rows.length; rowIndex++) {
      drawRow(table.rows[rowIndex]);
    }
  }

  if (isDefined(table.drawTableBorder) ? table.drawTableBorder : isDefined(table.rows) && table.rows.length === 0) {
    drawBorder(table.rect);
  }
}