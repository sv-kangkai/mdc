import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import { createVNode } from "inferno";
import { BaseInfernoComponent } from "@devextreme/vdom";
export var viewFunction = _ref => {
  var {
    props: {
      id
    }
  } = _ref;
  return createVNode(32, "filter", null, createVNode(32, "feColorMatrix", null, null, 1, {
    "type": "matrix",
    "values": "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 0.6 0"
  }), 2, {
    "id": id
  });
};
export var GrayScaleFilterProps = {};
export class GrayScaleFilter extends BaseInfernoComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  get restAttributes() {
    var _this$props = this.props,
        restProps = _objectWithoutPropertiesLoose(_this$props, ["id"]);

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
GrayScaleFilter.defaultProps = _extends({}, GrayScaleFilterProps);