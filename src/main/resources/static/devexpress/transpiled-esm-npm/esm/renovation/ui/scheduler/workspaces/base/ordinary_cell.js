import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import { createVNode } from "inferno";
import { BaseInfernoComponent, normalizeStyles } from "@devextreme/vdom";
export var viewFunction = _ref => {
  var {
    props: {
      children,
      className,
      colSpan,
      styles
    }
  } = _ref;
  return createVNode(1, "td", className, children, 0, {
    "style": normalizeStyles(styles),
    "colSpan": colSpan
  });
};
export var CellProps = {};
export class OrdinaryCell extends BaseInfernoComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  get restAttributes() {
    var _this$props = this.props,
        restProps = _objectWithoutPropertiesLoose(_this$props, ["children", "className", "colSpan", "styles"]);

    return restProps;
  }

  render() {
    var props = this.props;
    return viewFunction({
      props: _extends({}, props),
      restAttributes: this.restAttributes
    });
  }

}
OrdinaryCell.defaultProps = _extends({}, CellProps);