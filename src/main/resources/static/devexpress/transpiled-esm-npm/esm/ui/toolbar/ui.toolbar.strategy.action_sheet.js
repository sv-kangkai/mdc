import ToolbarStrategy from './ui.toolbar.strategy';
import { extend } from '../../core/utils/extend';
import ActionSheet from '../action_sheet';
var ActionSheetStrategy = ToolbarStrategy.inherit({
  NAME: 'actionSheet',
  _getMenuItemTemplate: function _getMenuItemTemplate() {
    return this._toolbar._getTemplate('actionSheetItem');
  },
  render: function render() {
    if (!this._hasVisibleMenuItems()) {
      return;
    }

    this.callBase();
  },
  _menuWidgetClass: function _menuWidgetClass() {
    return ActionSheet;
  },
  _menuContainer: function _menuContainer() {
    return this._toolbar.$element();
  },
  _widgetOptions: function _widgetOptions() {
    return extend({}, this.callBase(), {
      target: this._$button,
      showTitle: false
    });
  },
  _menuButtonOptions: function _menuButtonOptions() {
    return extend({}, this.callBase(), {
      icon: 'overflow'
    });
  },
  _toggleMenu: function _toggleMenu() {
    this.callBase.apply(this, arguments);

    this._menu.toggle(this._menuShown);

    this._menuShown = false;
  }
});
export default ActionSheetStrategy;