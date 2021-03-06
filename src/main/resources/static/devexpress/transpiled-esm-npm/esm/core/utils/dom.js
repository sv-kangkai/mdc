import domAdapter from '../../core/dom_adapter';
import $ from '../../core/renderer';
import { isDefined, isRenderer, isWindow } from './type';
import { getWindow } from './window';
var window = getWindow();
export var resetActiveElement = function resetActiveElement() {
  var activeElement = domAdapter.getActiveElement();
  var body = domAdapter.getBody(); // TODO: remove this hack after msie 11 support stopped

  if (activeElement && activeElement !== body && activeElement.blur) {
    try {
      activeElement.blur();
    } catch (e) {
      body.blur();
    }
  }
};
export var clearSelection = function clearSelection() {
  var selection = window.getSelection();
  if (!selection) return;
  if (selection.type === 'Caret') return;

  if (selection.empty) {
    selection.empty();
  } else if (selection.removeAllRanges) {
    // T522811
    try {
      selection.removeAllRanges();
    } catch (e) {}
  }
};
export var closestCommonParent = function closestCommonParent(startTarget, endTarget) {
  var $startTarget = $(startTarget);
  var $endTarget = $(endTarget);

  if ($startTarget[0] === $endTarget[0]) {
    return $startTarget[0];
  }

  var $startParents = $startTarget.parents();
  var $endParents = $endTarget.parents();
  var startingParent = Math.min($startParents.length, $endParents.length);

  for (var i = -startingParent; i < 0; i++) {
    if ($startParents.get(i) === $endParents.get(i)) {
      return $startParents.get(i);
    }
  }
};
export var extractTemplateMarkup = function extractTemplateMarkup(element) {
  element = $(element);
  var templateTag = element.length && element.filter(function isNotExecutableScript() {
    var $node = $(this);
    return $node.is('script[type]') && $node.attr('type').indexOf('script') < 0;
  });

  if (templateTag.length) {
    return templateTag.eq(0).html();
  } else {
    element = $('<div>').append(element);
    return element.html();
  }
};
export var normalizeTemplateElement = function normalizeTemplateElement(element) {
  var $element = isDefined(element) && (element.nodeType || isRenderer(element)) ? $(element) : $('<div>').html(element).contents();

  if ($element.length === 1) {
    if ($element.is('script')) {
      $element = normalizeTemplateElement($element.html().trim());
    } else if ($element.is('table')) {
      $element = $element.children('tbody').contents();
    }
  }

  return $element;
};
export var clipboardText = function clipboardText(event, text) {
  var clipboard = event.originalEvent && event.originalEvent.clipboardData || window.clipboardData;

  if (arguments.length === 1) {
    return clipboard && clipboard.getData('Text');
  }

  clipboard && clipboard.setData('Text', text);
};
export var contains = function contains(container, element) {
  if (!element) {
    return false;
  }

  if (domAdapter.isTextNode(element)) {
    element = element.parentNode;
  }

  if (domAdapter.isDocument(container)) {
    return container.documentElement.contains(element);
  }

  if (isWindow(container)) {
    return contains(container.document, element);
  }

  return container.contains ? container.contains(element) : !!(element.compareDocumentPosition(container) & element.DOCUMENT_POSITION_CONTAINS);
};
export var createTextElementHiddenCopy = function createTextElementHiddenCopy(element, text, options) {
  var elementStyles = window.getComputedStyle($(element).get(0));
  var includePaddings = options && options.includePaddings;
  return $('<div>').text(text).css({
    'fontStyle': elementStyles.fontStyle,
    'fontVariant': elementStyles.fontVariant,
    'fontWeight': elementStyles.fontWeight,
    'fontSize': elementStyles.fontSize,
    'fontFamily': elementStyles.fontFamily,
    'letterSpacing': elementStyles.letterSpacing,
    'border': elementStyles.border,
    'paddingTop': includePaddings ? elementStyles.paddingTop : '',
    'paddingRight': includePaddings ? elementStyles.paddingRight : '',
    'paddingBottom': includePaddings ? elementStyles.paddingBottom : '',
    'paddingLeft': includePaddings ? elementStyles.paddingLeft : '',
    'visibility': 'hidden',
    'whiteSpace': 'pre',
    'position': 'absolute',
    'float': 'left'
  });
};