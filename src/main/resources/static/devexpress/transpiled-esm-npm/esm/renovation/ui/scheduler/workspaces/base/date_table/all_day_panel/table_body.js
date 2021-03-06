import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import _extends from "@babel/runtime/helpers/esm/extends";
import { createComponentVNode, normalizeProps } from "inferno";
import { BaseInfernoComponent } from "@devextreme/vdom";
import { Row } from "../../row";
import { AllDayPanelCell as Cell } from "./cell";
import { combineClasses } from "../../../../../../utils/combine_classes";
export var viewFunction = viewModel => createComponentVNode(2, Row, {
  "leftVirtualCellWidth": viewModel.props.leftVirtualCellWidth,
  "rightVirtualCellWidth": viewModel.props.rightVirtualCellWidth,
  "leftVirtualCellCount": viewModel.props.leftVirtualCellCount,
  "rightVirtualCellCount": viewModel.props.rightVirtualCellCount,
  "className": viewModel.classes,
  children: viewModel.props.viewData.map(_ref => {
    var {
      endDate,
      groupIndex: cellGroupIndex,
      groups,
      index: cellIndex,
      isFirstGroupCell,
      isLastGroupCell,
      key,
      startDate
    } = _ref;
    return createComponentVNode(2, Cell, {
      "isFirstGroupCell": !viewModel.props.isVerticalGroupOrientation && isFirstGroupCell,
      "isLastGroupCell": !viewModel.props.isVerticalGroupOrientation && isLastGroupCell,
      "startDate": startDate,
      "endDate": endDate,
      "groups": groups,
      "groupIndex": cellGroupIndex,
      "index": cellIndex,
      "dataCellTemplate": viewModel.props.dataCellTemplate
    }, key);
  })
});
export var AllDayPanelTableBodyProps = {
  viewData: [],
  isVerticalGroupOrientation: false,
  className: "",
  leftVirtualCellWidth: 0,
  rightVirtualCellWidth: 0
};

var getTemplate = TemplateProp => TemplateProp && (TemplateProp.defaultProps ? props => normalizeProps(createComponentVNode(2, TemplateProp, _extends({}, props))) : TemplateProp);

export class AllDayPanelTableBody extends BaseInfernoComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  get classes() {
    var {
      className
    } = this.props;
    return combineClasses({
      "dx-scheduler-all-day-table-row": true,
      [className]: !!className
    });
  }

  get restAttributes() {
    var _this$props = this.props,
        restProps = _objectWithoutPropertiesLoose(_this$props, ["className", "dataCellTemplate", "isVerticalGroupOrientation", "leftVirtualCellCount", "leftVirtualCellWidth", "rightVirtualCellCount", "rightVirtualCellWidth", "viewData"]);

    return restProps;
  }

  render() {
    var props = this.props;
    return viewFunction({
      props: _extends({}, props, {
        dataCellTemplate: getTemplate(props.dataCellTemplate)
      }),
      classes: this.classes,
      restAttributes: this.restAttributes
    });
  }

}
AllDayPanelTableBody.defaultProps = _extends({}, AllDayPanelTableBodyProps);