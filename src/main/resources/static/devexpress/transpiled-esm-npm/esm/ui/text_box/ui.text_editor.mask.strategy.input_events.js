import BaseMaskStrategy from './ui.text_editor.mask.strategy.base';
var DELETE_INPUT_TYPE = 'deleteContentBackward';

class InputEventsMaskStrategy extends BaseMaskStrategy {
  _getStrategyName() {
    return 'inputEvents';
  }

  getHandleEventNames() {
    return [...super.getHandleEventNames(), 'beforeInput'];
  }

  _beforeInputHandler() {
    this._prevCaret = this.editorCaret();
  }

  _inputHandler(_ref) {
    var {
      originalEvent
    } = _ref;

    if (!originalEvent) {
      return;
    }

    var {
      inputType,
      data
    } = originalEvent;
    var currentCaret = this.editorCaret();

    if (inputType === DELETE_INPUT_TYPE) {
      var length = this._prevCaret.end - this._prevCaret.start || 1;
      this.editor.setBackwardDirection();

      this._updateEditorMask({
        start: currentCaret.start,
        length,
        text: this._getEmptyString(length)
      });
    } else {
      if (!currentCaret.end) {
        return;
      }

      this._autoFillHandler(originalEvent);

      this.editorCaret(currentCaret);

      var _length = this._prevCaret.end - this._prevCaret.start;

      var newData = data + (_length ? this._getEmptyString(_length - data.length) : '');
      this.editor.setForwardDirection();

      var hasValidChars = this._updateEditorMask({
        start: this._prevCaret.start,
        length: _length || newData.length,
        text: newData
      });

      if (!hasValidChars) {
        this.editorCaret(this._prevCaret);
      }
    }
  }

  _getEmptyString(length) {
    return Array(length + 1).join(' ');
  }

  _updateEditorMask(args) {
    var textLength = args.text.length;

    var updatedCharsCount = this.editor._handleChain(args);

    if (this.editor.isForwardDirection()) {
      var {
        start,
        end
      } = this.editorCaret();
      var correction = updatedCharsCount - textLength;

      if (start <= updatedCharsCount && updatedCharsCount > 1) {
        this.editorCaret({
          start: start + correction,
          end: end + correction
        });
      }

      this.editor.isForwardDirection() && this.editor._adjustCaret();
    }

    this.editor._displayMask();

    return !!updatedCharsCount;
  }

}

export default InputEventsMaskStrategy;