import { extend } from '../../core/utils/extend';
import ToolbarStrategy from './ui.toolbar.strategy';
import ToolbarMenu from './ui.toolbar.menu';
import DropDownMenu from '../drop_down_menu';
var MENU_INVISIBLE_CLASS = 'dx-state-invisible';
var DropDownMenuStrategy = ToolbarStrategy.inherit({
  NAME: 'dropDownMenu',
  render: function render() {
    if (!this._hasVisibleMenuItems()) {
      return;
    }

    this._renderMenuButtonContainer();

    this._renderWidget();
  },
  renderMenuItems: function renderMenuItems() {
    if (!this._menu) {
      this.render();
    }

    this.callBase();

    if (this._menu && !this._menu.option('items').length) {
      this._menu.close();
    }
  },
  _menuWidgetClass: function _menuWidgetClass() {
    return DropDownMenu;
  },
  _widgetOptions: function _widgetOptions() {
    var that = this;
    return extend(this.callBase(), {
      deferRendering: true,
      container: that._toolbar.option('menuContainer'),
      menuWidget: ToolbarMenu,
      onOptionChanged: function onOptionChanged(e) {
        if (e.name === 'items') {
          that._updateMenuVisibility(e.value);
        }
      },
      popupPosition: {
        at: 'bottom right',
        my: 'top right'
      }
    });
  },
  _updateMenuVisibility: function _updateMenuVisibility(menuItems) {
    var items = menuItems || this._getMenuItems();

    var isMenuVisible = items.length && this._hasVisibleMenuItems(items);

    this._toggleMenuVisibility(isMenuVisible);
  },
  _toggleMenuVisibility: function _toggleMenuVisibility(value) {
    if (!this._menuContainer()) {
      return;
    }

    this._menuContainer().toggleClass(MENU_INVISIBLE_CLASS, !value);
  },
  _menuContainer: function _menuContainer() {
    return this._$menuButtonContainer;
  }
});
export default DropDownMenuStrategy;