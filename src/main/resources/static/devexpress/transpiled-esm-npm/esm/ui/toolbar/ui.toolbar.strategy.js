import $ from '../../core/renderer';
import { noop } from '../../core/utils/common';
import { each } from '../../core/utils/iterator';
import { compileGetter } from '../../core/utils/data';
import Class from '../../core/class';
import Button from '../button';
var abstract = Class.abstract;
var TOOLBAR_MENU_CONTAINER_CLASS = 'dx-toolbar-menu-container';
var TOOLBAR_MENU_BUTTON_CLASS = 'dx-toolbar-menu-button';
var ToolbarStrategy = Class.inherit({
  ctor: function ctor(toolbar) {
    this._toolbar = toolbar;
  },
  render: function render() {
    this._renderMenuButton();

    this._renderWidget();
  },
  _widgetOptions: function _widgetOptions() {
    var itemClickAction = this._toolbar._createActionByOption('onItemClick');

    return {
      itemTemplate: this._getMenuItemTemplate.bind(this),
      onItemClick: function (e) {
        this._toggleMenu(false, true);

        itemClickAction(e);
      }.bind(this)
    };
  },
  _getMenuItemTemplate: function _getMenuItemTemplate() {
    return this._toolbar._getTemplateByOption('menuItemTemplate');
  },
  _renderWidget: function _renderWidget() {
    var $menu = $('<div>').appendTo(this._menuContainer());
    this._menu = this._toolbar._createComponent($menu, this._menuWidgetClass(), this._widgetOptions());
    this.renderMenuItems();
  },
  _menuContainer: abstract,
  _menuWidgetClass: abstract,
  _hasVisibleMenuItems: function _hasVisibleMenuItems(items) {
    var menuItems = items || this._toolbar.option('items');

    var result = false;
    var optionGetter = compileGetter('visible');
    var overflowGetter = compileGetter('locateInMenu');
    each(menuItems, function (index, item) {
      var itemVisible = optionGetter(item, {
        functionsAsIs: true
      });
      var itemOverflow = overflowGetter(item, {
        functionsAsIs: true
      });

      if (itemVisible !== false && (itemOverflow === 'auto' || itemOverflow === 'always') || item.location === 'menu') {
        result = true;
      }
    });
    return result;
  },
  _getMenuItems: function _getMenuItems() {
    return this._toolbar._getMenuItems();
  },
  _updateMenuVisibility: noop,
  _renderMenuButton: function _renderMenuButton() {
    var buttonOptions = this._menuButtonOptions();

    this._renderMenuButtonContainer();

    this._$button = $('<div>').appendTo(this._$menuButtonContainer).addClass(TOOLBAR_MENU_BUTTON_CLASS);

    this._toolbar._createComponent(this._$button, Button, buttonOptions);
  },
  _menuButtonOptions: function _menuButtonOptions() {
    return {
      onClick: this._menuButtonClickHandler.bind(this)
    };
  },
  _menuButtonClickHandler: function _menuButtonClickHandler() {
    this._toggleMenu(!this._menuShown, true);
  },
  _renderMenuButtonContainer: function _renderMenuButtonContainer() {
    var $afterSection = this._toolbar._$afterSection;
    this._$menuButtonContainer = $('<div>').appendTo($afterSection).addClass(this._toolbar._buttonClass()).addClass(TOOLBAR_MENU_CONTAINER_CLASS);
  },
  renderMenuItems: function renderMenuItems() {
    this._menu && this._menu.option('items', this._getMenuItems());
  },
  toggleMenuVisibility: function toggleMenuVisibility(visible, animate) {
    this._menu && this._toggleMenu(visible, animate);
  },
  _toggleMenu: function _toggleMenu(visible) {
    this._menuShown = visible;
  },
  getMenuWidget: function getMenuWidget() {
    return this._menu;
  },
  widgetOption: function widgetOption(name, value) {
    this._menu && this._menu.option(name, value);
  },
  handleToolbarVisibilityChange: noop
});
export default ToolbarStrategy;