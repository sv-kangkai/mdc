import _extends from "@babel/runtime/helpers/esm/extends";
import { equalByValue } from '../../core/utils/common';
import VerticalAppointmentsStrategy from './rendering_strategies/ui.scheduler.appointments.strategy.vertical';
import HorizontalAppointmentsStrategy from './rendering_strategies/ui.scheduler.appointments.strategy.horizontal';
import HorizontalMonthLineAppointmentsStrategy from './rendering_strategies/ui.scheduler.appointments.strategy.horizontal_month_line';
import HorizontalMonthAppointmentsStrategy from './rendering_strategies/ui.scheduler.appointments.strategy.horizontal_month';
import AgendaAppointmentsStrategy from './rendering_strategies/ui.scheduler.appointments.strategy.agenda';
var RENDERING_STRATEGIES = {
  'horizontal': HorizontalAppointmentsStrategy,
  'horizontalMonth': HorizontalMonthAppointmentsStrategy,
  'horizontalMonthLine': HorizontalMonthLineAppointmentsStrategy,
  'vertical': VerticalAppointmentsStrategy,
  'agenda': AgendaAppointmentsStrategy
};

class AppointmentLayoutManager {
  constructor(instance, renderingStrategy) {
    this.instance = instance;
    renderingStrategy && this.initRenderingStrategy(renderingStrategy);
  }

  getCellDimensions(options) {
    if (this.instance._workSpace) {
      return {
        width: this.instance._workSpace.getCellWidth(),
        height: this.instance._workSpace.getCellHeight(),
        allDayHeight: this.instance._workSpace.getAllDayHeight()
      };
    }
  }

  getGroupOrientation(options) {
    if (this.instance._workSpace) {
      options.callback(this.instance._workSpace._getRealGroupOrientation());
    }
  }

  initRenderingStrategy(renderingStrategy) {
    var Strategy = RENDERING_STRATEGIES[renderingStrategy];
    this._renderingStrategyInstance = new Strategy(this.instance);
    this.renderingStrategy = renderingStrategy;
  }

  createAppointmentsMap(items) {
    var {
      allDayHeight
    } = this.getCellDimensions();
    this.instance._allDayCellHeight = allDayHeight;
    this.getGroupOrientation({
      callback: groupOrientation => this.instance._groupOrientation = groupOrientation
    });
    var appointments = items ? items.slice() : [];
    this._positionMap = this._renderingStrategyInstance.createTaskPositionMap(appointments);
    return this._createAppointmentsMapCore(appointments, this._positionMap);
  }

  _createAppointmentsMapCore(list, positionMap) {
    var {
      virtualScrollingDispatcher
    } = this.instance.getWorkSpace();
    var virtualCellCount = virtualScrollingDispatcher ? virtualScrollingDispatcher.leftVirtualCellsCount : 0;
    var virtualRowCount = virtualScrollingDispatcher ? virtualScrollingDispatcher.topVirtualRowsCount : 0;
    return list.map((data, index) => {
      if (!this._renderingStrategyInstance.keepAppointmentSettings()) {
        delete data.settings;
      }

      var appointmentSettings = positionMap[index];
      appointmentSettings.forEach(settings => {
        settings.direction = this.renderingStrategy === 'vertical' && !settings.allDay ? 'vertical' : 'horizontal';
      });
      return {
        itemData: data,
        settings: appointmentSettings,
        needRepaint: true,
        needRemove: false,
        virtualCellCount,
        virtualRowCount
      };
    });
  }

  _isDataChanged(data) {
    var updatedData = this.instance.getUpdatedAppointment();
    return updatedData === data || this.instance.getUpdatedAppointmentKeys().some(item => data[item.key] === item.value);
  }

  _isAppointmentShouldAppear(currentAppointment, sourceAppointment) {
    return currentAppointment.needRepaint && sourceAppointment.needRemove;
  }

  _isSettingChanged(settings, sourceSetting) {
    if (settings.length !== sourceSetting.length) {
      return true;
    }

    var createSettingsToCompare = (settings, index) => {
      var virtualCellCount = settings.virtualCellCount || 0;
      var virtualRowCount = settings.virtualRowCount || 0;
      var cellIndex = settings[index].cellIndex + virtualCellCount;
      var rowIndex = settings[index].rowIndex + virtualRowCount;
      return _extends({}, settings[index], {
        cellIndex: cellIndex,
        rowIndex: rowIndex,
        virtualCellCount: -1,
        virtualRowCount: -1
      });
    };

    for (var i = 0; i < settings.length; i++) {
      var newSettings = createSettingsToCompare(settings, i);
      var oldSettings = createSettingsToCompare(sourceSetting, i);

      if (oldSettings) {
        // exclude sortedIndex property for comparison in commonUtils.equalByValue
        oldSettings.sortedIndex = newSettings.sortedIndex;
      }

      if (!equalByValue(newSettings, oldSettings)) {
        return true;
      }
    }

    return false;
  }

  _getAssociatedSourceAppointment(currentAppointment, sourceAppointments) {
    for (var i = 0; i < sourceAppointments.length; i++) {
      var item = sourceAppointments[i];

      if (item.itemData === currentAppointment.itemData) {
        return item;
      }
    }

    return null;
  }

  _getDeletedAppointments(currentAppointments, sourceAppointments) {
    var result = [];

    for (var i = 0; i < sourceAppointments.length; i++) {
      var sourceAppointment = sourceAppointments[i];

      var currentAppointment = this._getAssociatedSourceAppointment(sourceAppointment, currentAppointments);

      if (!currentAppointment) {
        sourceAppointment.needRemove = true;
        result.push(sourceAppointment);
      }
    }

    return result;
  }

  getRepaintedAppointments(currentAppointments, sourceAppointments) {
    if (sourceAppointments.length === 0 || this.renderingStrategy === 'agenda') {
      return currentAppointments;
    }

    currentAppointments.forEach(appointment => {
      var sourceAppointment = this._getAssociatedSourceAppointment(appointment, sourceAppointments);

      if (sourceAppointment) {
        appointment.needRepaint = this._isDataChanged(appointment.itemData) || this._isSettingChanged(appointment.settings, sourceAppointment.settings) || this._isAppointmentShouldAppear(appointment, sourceAppointment);
      }
    });
    return currentAppointments.concat(this._getDeletedAppointments(currentAppointments, sourceAppointments));
  }

  getRenderingStrategyInstance() {
    return this._renderingStrategyInstance;
  }

}

export default AppointmentLayoutManager;