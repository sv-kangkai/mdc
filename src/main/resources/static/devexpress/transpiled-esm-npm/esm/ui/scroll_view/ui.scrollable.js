import $ from '../../core/renderer';
import eventsEngine from '../../events/core/events_engine';
import { nativeScrolling } from '../../core/utils/support';
import browser from '../../core/utils/browser';
import { deferUpdate, deferRender, ensureDefined } from '../../core/utils/common';
import { isPlainObject, isDefined } from '../../core/utils/type';
import { extend } from '../../core/utils/extend';
import { getPublicElement } from '../../core/element';
import { getWindow, hasWindow } from '../../core/utils/window';
import domAdapter from '../../core/dom_adapter';
import devices from '../../core/devices';
import registerComponent from '../../core/component_registrator';
import DOMComponent from '../../core/dom_component';
import { focusable } from '../widget/selectors';
import { addNamespace } from '../../events/utils/index';
import scrollEvents from './ui.events.emitter.gesture.scroll';
import { SimulatedStrategy } from './ui.scrollable.simulated';
import NativeStrategy from './ui.scrollable.native';
import { deviceDependentOptions } from './ui.scrollable.device';
import { when } from '../../core/utils/deferred';
var SCROLLABLE = 'dxScrollable';
var SCROLLABLE_STRATEGY = 'dxScrollableStrategy';
var SCROLLABLE_CLASS = 'dx-scrollable';
var SCROLLABLE_DISABLED_CLASS = 'dx-scrollable-disabled';
var SCROLLABLE_CONTAINER_CLASS = 'dx-scrollable-container';
var SCROLLABLE_WRAPPER_CLASS = 'dx-scrollable-wrapper';
var SCROLLABLE_CONTENT_CLASS = 'dx-scrollable-content';
var VERTICAL = 'vertical';
var HORIZONTAL = 'horizontal';
var BOTH = 'both';
var Scrollable = DOMComponent.inherit({
  _getDefaultOptions: function _getDefaultOptions() {
    return extend(this.callBase(), {
      disabled: false,
      onScroll: null,
      direction: VERTICAL,
      showScrollbar: 'onScroll',
      useNative: true,
      bounceEnabled: true,
      scrollByContent: true,
      scrollByThumb: false,
      onUpdated: null,
      onStart: null,
      onEnd: null,
      onBounce: null,
      useSimulatedScrollbar: false,
      useKeyboard: true,
      inertiaEnabled: true,
      updateManually: false
    });
  },
  _defaultOptionsRules: function _defaultOptionsRules() {
    return this.callBase().concat(deviceDependentOptions(), [{
      device: function device() {
        return nativeScrolling && devices.real().platform === 'android' && !browser.mozilla;
      },
      options: {
        useSimulatedScrollbar: true
      }
    }]);
  },
  _initOptions: function _initOptions(options) {
    this.callBase(options);

    if (!('useSimulatedScrollbar' in options)) {
      this._setUseSimulatedScrollbar();
    }
  },
  _setUseSimulatedScrollbar: function _setUseSimulatedScrollbar() {
    if (!this.initialOption('useSimulatedScrollbar')) {
      this.option('useSimulatedScrollbar', !this.option('useNative'));
    }
  },
  _init: function _init() {
    this.callBase();

    this._initScrollableMarkup();

    this._locked = false;
  },
  _getWindowDevicePixelRatio: function _getWindowDevicePixelRatio() {
    return hasWindow() ? getWindow().devicePixelRatio : 1;
  },
  _visibilityChanged: function _visibilityChanged(visible) {
    if (visible) {
      this.update();

      this._updateRtlPosition();

      this._savedScrollOffset && this.scrollTo(this._savedScrollOffset);
      delete this._savedScrollOffset;
    } else {
      this._savedScrollOffset = this.scrollOffset();
    }
  },
  _initScrollableMarkup: function _initScrollableMarkup() {
    var $element = this.$element().addClass(SCROLLABLE_CLASS);
    var $container = this._$container = $('<div>').addClass(SCROLLABLE_CONTAINER_CLASS);
    var $wrapper = this._$wrapper = $('<div>').addClass(SCROLLABLE_WRAPPER_CLASS);
    var $content = this._$content = $('<div>').addClass(SCROLLABLE_CONTENT_CLASS);

    if (domAdapter.hasDocumentProperty('onbeforeactivate') && browser.msie && browser.version < 12) {
      eventsEngine.on($element, addNamespace('beforeactivate', SCROLLABLE), function (e) {
        if (!$(e.target).is(focusable)) {
          e.preventDefault();
        }
      });
    }

    $content.append($element.contents()).appendTo($container);
    $container.appendTo($wrapper);
    $wrapper.appendTo($element);
  },
  _dimensionChanged: function _dimensionChanged() {
    this.update();

    this._updateRtlPosition();
  },
  _initMarkup: function _initMarkup() {
    this.callBase();

    this._renderDirection();
  },
  _render: function _render() {
    this._renderStrategy();

    this._attachEventHandlers();

    this._renderDisabledState();

    this._createActions();

    this.update();
    this.callBase();
    this._rtlConfig = {
      scrollRight: 0,
      clientWidth: this._container().get(0).clientWidth,
      windowPixelRatio: this._getWindowDevicePixelRatio()
    };

    this._updateRtlPosition();
  },
  _isHorizontalAndRtlEnabled: function _isHorizontalAndRtlEnabled() {
    return this.option('rtlEnabled') && this.option('direction') !== VERTICAL;
  },
  _updateRtlPosition: function _updateRtlPosition() {
    this._updateBounds();

    if (this._isHorizontalAndRtlEnabled()) {
      deferUpdate(() => {
        var scrollLeft = this._getMaxOffset().left - this._rtlConfig.scrollRight;

        if (scrollLeft <= 0) {
          scrollLeft = 0;
          this._rtlConfig.scrollRight = this._getMaxOffset().left;
        }

        deferRender(() => {
          if (this.scrollLeft() !== scrollLeft) {
            this._rtlConfig.skipUpdating = true;
            this.scrollTo({
              left: scrollLeft
            });
            this._rtlConfig.skipUpdating = false;
          }
        });
      });
    }
  },
  _getMaxOffset: function _getMaxOffset() {
    var {
      scrollWidth,
      clientWidth,
      scrollHeight,
      clientHeight
    } = this._container().get(0);

    return {
      left: scrollWidth - clientWidth,
      top: scrollHeight - clientHeight
    };
  },
  _updateBounds: function _updateBounds() {
    this._strategy.updateBounds();
  },
  _attachEventHandlers: function _attachEventHandlers() {
    var strategy = this._strategy;
    var initEventData = {
      getDirection: strategy.getDirection.bind(strategy),
      validate: this._validate.bind(this),
      isNative: this.option('useNative'),
      scrollTarget: this._$container
    };
    eventsEngine.off(this._$wrapper, '.' + SCROLLABLE);
    eventsEngine.on(this._$wrapper, addNamespace(scrollEvents.init, SCROLLABLE), initEventData, this._initHandler.bind(this));
    eventsEngine.on(this._$wrapper, addNamespace(scrollEvents.start, SCROLLABLE), strategy.handleStart.bind(strategy));
    eventsEngine.on(this._$wrapper, addNamespace(scrollEvents.move, SCROLLABLE), strategy.handleMove.bind(strategy));
    eventsEngine.on(this._$wrapper, addNamespace(scrollEvents.end, SCROLLABLE), strategy.handleEnd.bind(strategy));
    eventsEngine.on(this._$wrapper, addNamespace(scrollEvents.cancel, SCROLLABLE), strategy.handleCancel.bind(strategy));
    eventsEngine.on(this._$wrapper, addNamespace(scrollEvents.stop, SCROLLABLE), strategy.handleStop.bind(strategy));
    eventsEngine.off(this._$container, '.' + SCROLLABLE);
    eventsEngine.on(this._$container, addNamespace('scroll', SCROLLABLE), strategy.handleScroll.bind(strategy));
  },
  _updateRtlConfig: function _updateRtlConfig() {
    if (this._isHorizontalAndRtlEnabled() && !this._rtlConfig.skipUpdating) {
      var {
        clientWidth,
        scrollLeft
      } = this._container().get(0);

      var windowPixelRatio = this._getWindowDevicePixelRatio();

      if (this._rtlConfig.windowPixelRatio === windowPixelRatio && this._rtlConfig.clientWidth === clientWidth) {
        this._rtlConfig.scrollRight = this._getMaxOffset().left - scrollLeft;
      }

      this._rtlConfig.clientWidth = clientWidth;
      this._rtlConfig.windowPixelRatio = windowPixelRatio;
    }
  },
  _validate: function _validate(e) {
    if (this._isLocked()) {
      return false;
    }

    this._updateIfNeed();

    return this._strategy.validate(e);
  },
  _initHandler: function _initHandler() {
    var strategy = this._strategy;
    strategy.handleInit.apply(strategy, arguments);
  },
  _renderDisabledState: function _renderDisabledState() {
    this.$element().toggleClass(SCROLLABLE_DISABLED_CLASS, this.option('disabled'));

    if (this.option('disabled')) {
      this._lock();
    } else {
      this._unlock();
    }
  },
  _renderDirection: function _renderDirection() {
    this.$element().removeClass('dx-scrollable-' + HORIZONTAL).removeClass('dx-scrollable-' + VERTICAL).removeClass('dx-scrollable-' + BOTH).addClass('dx-scrollable-' + this.option('direction'));
  },
  _renderStrategy: function _renderStrategy() {
    this._createStrategy();

    this._strategy.render();

    this.$element().data(SCROLLABLE_STRATEGY, this._strategy);
  },
  _createStrategy: function _createStrategy() {
    this._strategy = this.option('useNative') ? new NativeStrategy(this) : new SimulatedStrategy(this);
  },
  _createActions: function _createActions() {
    this._strategy && this._strategy.createActions();
  },
  _clean: function _clean() {
    this._strategy && this._strategy.dispose();
  },
  _optionChanged: function _optionChanged(args) {
    switch (args.name) {
      case 'onStart':
      case 'onEnd':
      case 'onUpdated':
      case 'onScroll':
      case 'onBounce':
        this._createActions();

        break;

      case 'direction':
        this._resetInactiveDirection();

        this._invalidate();

        break;

      case 'useNative':
        this._setUseSimulatedScrollbar();

        this._invalidate();

        break;

      case 'inertiaEnabled':
      case 'scrollByContent':
      case 'scrollByThumb':
      case 'bounceEnabled':
      case 'useKeyboard':
      case 'showScrollbar':
      case 'useSimulatedScrollbar':
        this._invalidate();

        break;

      case 'disabled':
        this._renderDisabledState();

        this._strategy && this._strategy.disabledChanged();
        break;

      case 'updateManually':
        break;

      case 'width':
        this.callBase(args);

        this._updateRtlPosition();

        break;

      default:
        this.callBase(args);
    }
  },
  _resetInactiveDirection: function _resetInactiveDirection() {
    var inactiveProp = this._getInactiveProp();

    if (!inactiveProp || !hasWindow()) {
      return;
    }

    var scrollOffset = this.scrollOffset();
    scrollOffset[inactiveProp] = 0;
    this.scrollTo(scrollOffset);
  },
  _getInactiveProp: function _getInactiveProp() {
    var direction = this.option('direction');

    if (direction === VERTICAL) {
      return 'left';
    }

    if (direction === HORIZONTAL) {
      return 'top';
    }
  },
  _location: function _location() {
    return this._strategy.location();
  },
  _normalizeLocation: function _normalizeLocation(location) {
    if (isPlainObject(location)) {
      var left = ensureDefined(location.left, location.x);
      var top = ensureDefined(location.top, location.y);
      return {
        left: isDefined(left) ? -left : undefined,
        top: isDefined(top) ? -top : undefined
      };
    } else {
      var direction = this.option('direction');
      return {
        left: direction !== VERTICAL ? -location : undefined,
        top: direction !== HORIZONTAL ? -location : undefined
      };
    }
  },
  _isLocked: function _isLocked() {
    return this._locked;
  },
  _lock: function _lock() {
    this._locked = true;
  },
  _unlock: function _unlock() {
    if (!this.option('disabled')) {
      this._locked = false;
    }
  },
  _isDirection: function _isDirection(direction) {
    var current = this.option('direction');

    if (direction === VERTICAL) {
      return current !== HORIZONTAL;
    }

    if (direction === HORIZONTAL) {
      return current !== VERTICAL;
    }

    return current === direction;
  },
  _updateAllowedDirection: function _updateAllowedDirection() {
    var allowedDirections = this._strategy._allowedDirections();

    if (this._isDirection(BOTH) && allowedDirections.vertical && allowedDirections.horizontal) {
      this._allowedDirectionValue = BOTH;
    } else if (this._isDirection(HORIZONTAL) && allowedDirections.horizontal) {
      this._allowedDirectionValue = HORIZONTAL;
    } else if (this._isDirection(VERTICAL) && allowedDirections.vertical) {
      this._allowedDirectionValue = VERTICAL;
    } else {
      this._allowedDirectionValue = null;
    }
  },
  _allowedDirection: function _allowedDirection() {
    return this._allowedDirectionValue;
  },
  _container: function _container() {
    return this._$container;
  },
  $content: function $content() {
    return this._$content;
  },
  content: function content() {
    return getPublicElement(this._$content);
  },
  scrollOffset: function scrollOffset() {
    return this._getScrollOffset();
  },

  _getScrollOffset() {
    return {
      top: -this._location().top,
      left: -this._location().left
    };
  },

  scrollTop: function scrollTop() {
    return this.scrollOffset().top;
  },
  scrollLeft: function scrollLeft() {
    return this.scrollOffset().left;
  },
  clientHeight: function clientHeight() {
    return this._$container.height();
  },
  scrollHeight: function scrollHeight() {
    return this.$content().outerHeight();
  },
  clientWidth: function clientWidth() {
    return this._$container.width();
  },
  scrollWidth: function scrollWidth() {
    return this.$content().outerWidth();
  },
  update: function update() {
    if (!this._strategy) {
      return;
    }

    return when(this._strategy.update()).done(function () {
      this._updateAllowedDirection();
    }.bind(this));
  },
  scrollBy: function scrollBy(distance) {
    distance = this._normalizeLocation(distance);

    if (!distance.top && !distance.left) {
      return;
    }

    this._updateIfNeed();

    this._strategy.scrollBy(distance);

    this._updateRtlConfig();
  },
  scrollTo: function scrollTo(targetLocation) {
    targetLocation = this._normalizeLocation(targetLocation);

    this._updateIfNeed();

    var location = this._location();

    if (!this.option('useNative')) {
      targetLocation = this._strategy._applyScaleRatio(targetLocation);
      location = this._strategy._applyScaleRatio(location);
    }

    var distance = this._normalizeLocation({
      left: location.left - ensureDefined(targetLocation.left, location.left),
      top: location.top - ensureDefined(targetLocation.top, location.top)
    });

    if (!distance.top && !distance.left) {
      return;
    }

    this._strategy.scrollBy(distance);

    this._updateRtlConfig();
  },
  scrollToElement: function scrollToElement(element, offset) {
    var $element = $(element);
    var elementInsideContent = this.$content().find(element).length;
    var elementIsInsideContent = $element.parents('.' + SCROLLABLE_CLASS).length - $element.parents('.' + SCROLLABLE_CONTENT_CLASS).length === 0;

    if (!elementInsideContent || !elementIsInsideContent) {
      return;
    }

    var scrollPosition = {
      top: 0,
      left: 0
    };
    var direction = this.option('direction');

    if (direction !== VERTICAL) {
      scrollPosition.left = this.getScrollElementPosition($element, HORIZONTAL, offset);
    }

    if (direction !== HORIZONTAL) {
      scrollPosition.top = this.getScrollElementPosition($element, VERTICAL, offset);
    }

    this.scrollTo(scrollPosition);
  },
  scrollToElementTopLeft: function scrollToElementTopLeft(element) {
    var $element = $(element);
    var elementInsideContent = this.$content().find(element).length;
    var elementIsInsideContent = $element.parents('.' + SCROLLABLE_CLASS).length - $element.parents('.' + SCROLLABLE_CONTENT_CLASS).length === 0;

    if (!elementInsideContent || !elementIsInsideContent) {
      return;
    }

    var scrollPosition = {
      top: 0,
      left: 0
    };
    var direction = this.option('direction');

    if (direction !== VERTICAL) {
      var leftPosition = this._elementPositionRelativeToContent($element, 'left');

      scrollPosition.left = this.option('rtlEnabled') === true ? leftPosition + $element.width() - this.clientWidth() : leftPosition;
    }

    if (direction !== HORIZONTAL) {
      scrollPosition.top = this._elementPositionRelativeToContent($element, 'top');
    }

    this.scrollTo(scrollPosition);
  },
  getScrollElementPosition: function getScrollElementPosition($element, direction, offset) {
    offset = offset || {};
    var isVertical = direction === VERTICAL;
    var startOffset = (isVertical ? offset.top : offset.left) || 0;
    var endOffset = (isVertical ? offset.bottom : offset.right) || 0;

    var elementPositionRelativeToContent = this._elementPositionRelativeToContent($element, isVertical ? 'top' : 'left');

    var elementPosition = elementPositionRelativeToContent;
    var elementSize = $element[isVertical ? 'outerHeight' : 'outerWidth']();
    var scrollLocation = isVertical ? this.scrollTop() : this.scrollLeft();

    var clientSize = this._container().get(0)[isVertical ? 'clientHeight' : 'clientWidth'];

    var startDistance = scrollLocation - elementPosition + startOffset;
    var endDistance = scrollLocation - elementPosition - elementSize + clientSize - endOffset;

    if (startDistance <= 0 && endDistance >= 0) {
      return scrollLocation;
    }

    return scrollLocation - (Math.abs(startDistance) > Math.abs(endDistance) ? endDistance : startDistance);
  },
  _elementPositionRelativeToContent: function _elementPositionRelativeToContent($element, prop) {
    var result = 0;

    while (this._hasScrollContent($element)) {
      result += $element.position()[prop];
      $element = $element.offsetParent();
    }

    return result;
  },
  _hasScrollContent: function _hasScrollContent($element) {
    var $content = this.$content();
    return $element.closest($content).length && !$element.is($content);
  },
  _updateIfNeed: function _updateIfNeed() {
    if (!this.option('updateManually')) {
      this.update();
    }
  },
  _useTemplates: function _useTemplates() {
    return false;
  }
});
registerComponent(SCROLLABLE, Scrollable);
export default Scrollable;