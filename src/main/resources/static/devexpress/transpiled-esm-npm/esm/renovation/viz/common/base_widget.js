import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import _extends from "@babel/runtime/helpers/esm/extends";
import { createVNode, createFragment, createComponentVNode, normalizeProps } from "inferno";
import { Fragment } from "inferno";
import { InfernoEffect, InfernoComponent } from "@devextreme/vdom";
import { isDefined } from "../../../core/utils/type";
import { combineClasses } from "../../utils/combine_classes";
import { BaseWidgetProps } from "./base_props";
import { ConfigContext } from "../../common/config_context";
import { ConfigProvider } from "../../common/config_provider";
import { RootSvgElement } from "./renderers/svg_root";
import { GrayScaleFilter } from "./renderers/gray_scale_filter";
import { sizeIsValid, pickPositiveValue, getElementWidth, getElementHeight, isUpdatedFlatObject } from "./utils";
import { resolveRtlEnabled, resolveRtlEnabledDefinition } from "../../utils/resolve_rtl";
import { getNextDefsSvgId, getFuncIri } from "./renderers/utils";
var DEFAULT_CANVAS = {
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0
};

var getCssClasses = model => {
  var containerClassesMap = {
    "dx-widget": true,
    "dx-visibility-change-handler": true,
    [String(model.className)]: !!model.className
  };
  return combineClasses(containerClassesMap);
};

var calculateCanvas = model => {
  var _model$size, _model$margin, _model$defaultCanvas;

  var {
    height,
    width
  } = (_model$size = model.size) !== null && _model$size !== void 0 ? _model$size : {};
  var margin = (_model$margin = model.margin) !== null && _model$margin !== void 0 ? _model$margin : {};
  var defaultCanvas = (_model$defaultCanvas = model.defaultCanvas) !== null && _model$defaultCanvas !== void 0 ? _model$defaultCanvas : DEFAULT_CANVAS;
  var elementWidth = !sizeIsValid(width) ? getElementWidth(model.element) : 0;
  var elementHeight = !sizeIsValid(height) ? getElementHeight(model.element) : 0;
  var canvas = {
    width: width && width <= 0 ? 0 : Math.floor(pickPositiveValue([width, elementWidth, defaultCanvas.width])),
    height: height && height <= 0 ? 0 : Math.floor(pickPositiveValue([height, elementHeight, defaultCanvas.height])),
    left: pickPositiveValue([margin.left, defaultCanvas.left]),
    top: pickPositiveValue([margin.top, defaultCanvas.top]),
    right: pickPositiveValue([margin.right, defaultCanvas.right]),
    bottom: pickPositiveValue([margin.bottom, defaultCanvas.bottom])
  };

  if (canvas.width - canvas.left - canvas.right <= 0 || canvas.height - canvas.top - canvas.bottom <= 0) {
    return _extends({}, defaultCanvas);
  }

  return canvas;
};

export var viewFunction = viewModel => {
  var grayFilterId = viewModel.props.disabled ? getNextDefsSvgId() : undefined;
  var canvas = viewModel.props.canvas || DEFAULT_CANVAS;
  var widget = normalizeProps(createVNode(1, "div", viewModel.cssClasses, createComponentVNode(2, RootSvgElement, {
    "rootElementRef": viewModel.svgElementRef,
    "className": viewModel.props.classes,
    "width": canvas.width,
    "height": canvas.height,
    "pointerEvents": viewModel.pointerEventsState,
    "filter": grayFilterId ? getFuncIri(grayFilterId) : undefined,
    children: createFragment([createVNode(32, "defs", null, grayFilterId && createComponentVNode(2, GrayScaleFilter, {
      "id": grayFilterId
    }), 0), viewModel.props.children], 0)
  }), 2, _extends({}, viewModel.restAttributes), null, viewModel.containerRef));
  return viewModel.shouldRenderConfigProvider ? createComponentVNode(2, ConfigProvider, {
    "rtlEnabled": viewModel.rtlEnabled,
    children: widget
  }) : widget;
};
export var Props = _extends({}, BaseWidgetProps);
import { createRef as infernoCreateRef } from "inferno";
export class BaseWidget extends InfernoComponent {
  constructor(props) {
    super(props);
    this._currentState = null;
    this.containerRef = infernoCreateRef();
    this.svgElementRef = infernoCreateRef();
    this.state = {
      canvas: this.props.canvas !== undefined ? this.props.canvas : this.props.defaultCanvas
    };
    this.setRootElementRef = this.setRootElementRef.bind(this);
    this.contentReadyEffect = this.contentReadyEffect.bind(this);
    this.svg = this.svg.bind(this);
    this.setCanvas = this.setCanvas.bind(this);
  }

  get config() {
    if ("ConfigContext" in this.context) {
      return this.context.ConfigContext;
    }

    return ConfigContext;
  }

  createEffects() {
    return [new InfernoEffect(this.setRootElementRef, []), new InfernoEffect(this.contentReadyEffect, [this.props.onContentReady, this.__state_canvas, this.props.canvasChange, this.props.defaultCanvas, this.props.margin, this.props.size])];
  }

  updateEffects() {
    var _this$_effects$;

    (_this$_effects$ = this._effects[1]) === null || _this$_effects$ === void 0 ? void 0 : _this$_effects$.update([this.props.onContentReady, this.__state_canvas, this.props.canvasChange, this.props.defaultCanvas, this.props.margin, this.props.size]);
  }

  get __state_canvas() {
    var state = this._currentState || this.state;
    return this.props.canvas !== undefined ? this.props.canvas : state.canvas;
  }

  set_canvas(value) {
    this.setState(state => {
      this._currentState = state;
      var newValue = value();
      this.props.canvasChange(newValue);
      this._currentState = null;
      return {
        canvas: newValue
      };
    });
  }

  setRootElementRef() {
    this.props.rootElementRef.current = this.containerRef.current;
  }

  contentReadyEffect() {
    var {
      onContentReady
    } = this.props;
    this.setCanvas();
    onContentReady === null || onContentReady === void 0 ? void 0 : onContentReady({
      element: this.svgElementRef.current
    });
  }

  get shouldRenderConfigProvider() {
    var {
      rtlEnabled
    } = this.props;
    return resolveRtlEnabledDefinition(rtlEnabled, this.config);
  }

  get rtlEnabled() {
    var {
      rtlEnabled
    } = this.props;
    return resolveRtlEnabled(rtlEnabled, this.config);
  }

  get pointerEventsState() {
    var {
      disabled,
      pointerEvents
    } = this.props;
    return disabled ? "none" : pointerEvents;
  }

  get cssClasses() {
    var {
      className
    } = this.props;
    return getCssClasses({
      className
    });
  }

  setCanvas() {
    var {
      defaultCanvas,
      margin,
      size
    } = this.props;
    var newCanvas = calculateCanvas({
      element: this.containerRef.current,
      defaultCanvas,
      size,
      margin
    });

    if (isDefined(newCanvas.height) && isDefined(newCanvas.width) && isUpdatedFlatObject(this.__state_canvas, newCanvas)) {
      this.set_canvas(() => newCanvas);
    }
  }

  get restAttributes() {
    var _this$props$canvas = _extends({}, this.props, {
      canvas: this.__state_canvas
    }),
        restProps = _objectWithoutPropertiesLoose(_this$props$canvas, ["canvas", "canvasChange", "children", "className", "classes", "defaultCanvas", "disabled", "margin", "onContentReady", "pointerEvents", "rootElementRef", "rtlEnabled", "size"]);

    return restProps;
  }

  svg() {
    return this.svgElementRef.current;
  }

  render() {
    var props = this.props;
    return viewFunction({
      props: _extends({}, props, {
        canvas: this.__state_canvas
      }),
      containerRef: this.containerRef,
      svgElementRef: this.svgElementRef,
      config: this.config,
      shouldRenderConfigProvider: this.shouldRenderConfigProvider,
      rtlEnabled: this.rtlEnabled,
      pointerEventsState: this.pointerEventsState,
      cssClasses: this.cssClasses,
      setCanvas: this.setCanvas,
      restAttributes: this.restAttributes
    });
  }

}
BaseWidget.defaultProps = _extends({}, Props);