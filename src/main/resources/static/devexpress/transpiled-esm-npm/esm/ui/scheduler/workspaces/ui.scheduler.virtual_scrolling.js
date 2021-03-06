import _extends from "@babel/runtime/helpers/esm/extends";
import domAdapter from '../../../core/dom_adapter';
import eventsEngine from '../../../events/core/events_engine';
import { getWindow } from '../../../core/utils/window';
import { addNamespace } from '../../../events/utils/index';
import { isDefined } from '../../../core/utils/type';
var DEFAULT_CELL_HEIGHT = 50;
var MIN_CELL_WIDTH = 1;
var MIN_SCROLL_OFFSET = 10;
var VIRTUAL_APPOINTMENTS_RENDER_TIMEOUT = 15;
var DOCUMENT_SCROLL_EVENT_NAMESPACE = addNamespace('scroll', 'dxSchedulerVirtualScrolling');
var scrollingOrientations = {
  vertical: 'vertical',
  horizontal: 'horizontal',
  both: 'both'
};
var DefaultScrollingOrientation = scrollingOrientations.both;
export default class VirtualScrollingDispatcher {
  constructor(workspace) {
    this._workspace = workspace;
    this._rowHeight = this.getCellHeight();
    this._cellWidth = this.getCellWidth();
    this._renderer = new Renderer(this.workspace);

    this._createVirtualScrolling();

    this._attachScrollableEvents();
  }

  get workspace() {
    return this._workspace;
  }

  get isRTL() {
    return this.workspace._isRTL();
  }

  get renderer() {
    return this._renderer;
  }

  get isVirtualScrolling() {
    return this.workspace.isVirtualScrolling();
  }

  get verticalVirtualScrolling() {
    return this._verticalVirtualScrolling;
  }

  set verticalVirtualScrolling(value) {
    this._verticalVirtualScrolling = value;
  }

  get horizontalVirtualScrolling() {
    return this._horizontalVirtualScrolling;
  }

  set horizontalVirtualScrolling(value) {
    this._horizontalVirtualScrolling = value;
  }

  get document() {
    return domAdapter.getDocument();
  }

  get height() {
    return this.workspace.invoke('getOption', 'height');
  }

  get width() {
    return this.workspace.invoke('getOption', 'width');
  }

  get rowHeight() {
    return this._rowHeight;
  }

  set rowHeight(value) {
    this._rowHeight = value;
  }

  get viewportHeight() {
    return this.height ? this.workspace.$element().height() : getWindow().innerHeight;
  }

  get cellWidth() {
    return this._cellWidth;
  }

  set cellWidth(value) {
    this._cellWidth = value;
  }

  get viewportWidth() {
    return this.width ? this.workspace.$element().width() : getWindow().innerWidth;
  }

  get topVirtualRowsCount() {
    var _this$verticalScrolli;

    return ((_this$verticalScrolli = this.verticalScrollingState) === null || _this$verticalScrolli === void 0 ? void 0 : _this$verticalScrolli.virtualItemCountBefore) > 0 ? 1 : 0;
  }

  get leftVirtualCellsCount() {
    var _this$horizontalScrol, _this$horizontalScrol2;

    var virtualItemsCount = !this.isRTL ? (_this$horizontalScrol = this.horizontalScrollingState) === null || _this$horizontalScrol === void 0 ? void 0 : _this$horizontalScrol.virtualItemCountBefore : (_this$horizontalScrol2 = this.horizontalScrollingState) === null || _this$horizontalScrol2 === void 0 ? void 0 : _this$horizontalScrol2.virtualItemCountAfter;
    return virtualItemsCount > 0 ? 1 : 0;
  }

  get virtualRowOffset() {
    var _this$verticalScrolli2;

    return ((_this$verticalScrolli2 = this.verticalScrollingState) === null || _this$verticalScrolli2 === void 0 ? void 0 : _this$verticalScrolli2.virtualItemSizeBefore) || 0;
  }

  get virtualCellOffset() {
    var _this$horizontalScrol3;

    return ((_this$horizontalScrol3 = this.horizontalScrollingState) === null || _this$horizontalScrol3 === void 0 ? void 0 : _this$horizontalScrol3.virtualItemSizeBefore) || 0;
  }

  get scrollingState() {
    var _this$verticalVirtual, _this$horizontalVirtu;

    return {
      vertical: (_this$verticalVirtual = this.verticalVirtualScrolling) === null || _this$verticalVirtual === void 0 ? void 0 : _this$verticalVirtual.state,
      horizontal: (_this$horizontalVirtu = this.horizontalVirtualScrolling) === null || _this$horizontalVirtu === void 0 ? void 0 : _this$horizontalVirtu.state
    };
  }

  get verticalScrollingState() {
    return this.scrollingState.vertical;
  }

  get horizontalScrollingState() {
    return this.scrollingState.horizontal;
  }

  get scrollingOrientation() {
    return this.workspace.option('scrolling.orientation') || DefaultScrollingOrientation;
  }

  get verticalScrollingAllowed() {
    return this.scrollingOrientation === scrollingOrientations.vertical || this.scrollingOrientation === scrollingOrientations.both;
  }

  get horizontalScrollingAllowed() {
    return this.scrollingOrientation === scrollingOrientations.horizontal || this.scrollingOrientation === scrollingOrientations.both;
  }

  getRenderState() {
    var _this$verticalVirtual2, _this$horizontalVirtu2;

    var verticalRenderState = ((_this$verticalVirtual2 = this.verticalVirtualScrolling) === null || _this$verticalVirtual2 === void 0 ? void 0 : _this$verticalVirtual2.getRenderState()) || {};
    var horizontalRenderState = ((_this$horizontalVirtu2 = this.horizontalVirtualScrolling) === null || _this$horizontalVirtu2 === void 0 ? void 0 : _this$horizontalVirtu2.getRenderState()) || {};
    return _extends({}, verticalRenderState, horizontalRenderState);
  }

  getCellHeight() {
    var cellHeight = this.workspace.getCellHeight(false);
    var result = cellHeight > 0 ? cellHeight : DEFAULT_CELL_HEIGHT;
    return Math.floor(result);
  }

  getCellWidth() {
    var cellWidth = this.workspace.getCellWidth();
    var minCellWidth = this.workspace.getCellMinWidth(); // TODO: Remove this after CSS refactoring

    if (!cellWidth || cellWidth < minCellWidth) {
      cellWidth = minCellWidth;
    }

    var result = cellWidth > 0 ? cellWidth : MIN_CELL_WIDTH;
    return Math.floor(result);
  }

  calculateCoordinatesByDataAndPosition(cellData, position, date, isCalculateTime, isVerticalDirectionView) {
    var {
      _workspace: workSpace
    } = this;
    var {
      rowIndex,
      columnIndex
    } = position;
    var {
      startDate,
      endDate,
      allDay
    } = cellData;
    var timeToScroll = date.getTime();
    var cellStartTime = startDate.getTime();
    var cellEndTime = endDate.getTime();
    var scrollInCell = allDay || !isCalculateTime ? 0 : (timeToScroll - cellStartTime) / (cellEndTime - cellStartTime);
    var cellWidth = this.getCellWidth();
    var rowHeight = this.getCellHeight();
    var top = isVerticalDirectionView ? (rowIndex + scrollInCell) * rowHeight : rowIndex * rowHeight;
    var left = isVerticalDirectionView ? columnIndex * cellWidth : (columnIndex + scrollInCell) * cellWidth;

    if (workSpace.option('rtlEnabled')) {
      left = workSpace.getScrollableOuterWidth() - left;
    }

    return {
      top,
      left
    };
  }

  dispose() {
    if (this._onScrollHandler) {
      eventsEngine.off(this.document, DOCUMENT_SCROLL_EVENT_NAMESPACE, this._onScrollHandler);
    }
  }

  _createVirtualScrolling() {
    if (this.verticalScrollingAllowed) {
      this.verticalVirtualScrolling = new VerticalVirtualScrolling({
        workspace: this.workspace,
        viewportHeight: this.viewportHeight,
        rowHeight: this.rowHeight
      });
    }

    if (this.horizontalScrollingAllowed) {
      this.horizontalVirtualScrolling = new HorizontalVirtualScrolling({
        workspace: this.workspace,
        viewportWidth: this.viewportWidth,
        cellWidth: this.cellWidth
      });
    }
  }

  _attachScrollableEvents() {
    if (this.horizontalScrollingAllowed || this.verticalScrollingAllowed) {
      if (this.height || this.horizontalScrollingAllowed) {
        this._attachScrollableScroll();
      }

      if (!this.height) {
        this._attachWindowScroll();
      }
    }
  }

  _attachScrollableScroll() {
    var scrollable = this.workspace.getScrollable();
    var currentOnScroll = scrollable.option('onScroll');
    scrollable.option('onScroll', e => {
      currentOnScroll === null || currentOnScroll === void 0 ? void 0 : currentOnScroll.apply(scrollable, [e]);

      this._process(e === null || e === void 0 ? void 0 : e.scrollOffset);
    });
  }

  _attachWindowScroll() {
    var window = getWindow();
    this._onScrollHandler = this.workspace._createAction(() => {
      var {
        scrollX,
        scrollY
      } = window;

      if (scrollX >= MIN_SCROLL_OFFSET || scrollY >= MIN_SCROLL_OFFSET) {
        this._process({
          left: scrollX,
          top: scrollY
        });
      }
    });
    eventsEngine.on(this.document, DOCUMENT_SCROLL_EVENT_NAMESPACE, this._onScrollHandler);
  }

  _process(scrollPosition) {
    if (scrollPosition) {
      var _this$verticalVirtual3, _this$horizontalVirtu3;

      var {
        left,
        top
      } = scrollPosition;
      var verticalStateChanged = isDefined(top) && ((_this$verticalVirtual3 = this.verticalVirtualScrolling) === null || _this$verticalVirtual3 === void 0 ? void 0 : _this$verticalVirtual3.updateState(top));
      var horizontalStateChanged = isDefined(left) && ((_this$horizontalVirtu3 = this.horizontalVirtualScrolling) === null || _this$horizontalVirtu3 === void 0 ? void 0 : _this$horizontalVirtu3.updateState(left));

      if (verticalStateChanged || horizontalStateChanged) {
        this.renderer.updateRender();
      }
    }
  }

  updateDimensions(isForce) {
    var cellHeight = this.getCellHeight(false);
    var needUpdateVertical = this.verticalScrollingAllowed && cellHeight !== this.rowHeight;

    if (needUpdateVertical || isForce) {
      var _this$verticalVirtual4;

      this.rowHeight = cellHeight;
      (_this$verticalVirtual4 = this.verticalVirtualScrolling) === null || _this$verticalVirtual4 === void 0 ? void 0 : _this$verticalVirtual4.reinitState(cellHeight, isForce);
    }

    var cellWidth = this.getCellWidth();
    var needUpdateHorizontal = this.horizontalScrollingAllowed && cellWidth !== this.cellWidth;

    if (needUpdateHorizontal || isForce) {
      var _this$horizontalVirtu4;

      this.cellWidth = cellWidth;
      (_this$horizontalVirtu4 = this.horizontalVirtualScrolling) === null || _this$horizontalVirtu4 === void 0 ? void 0 : _this$horizontalVirtu4.reinitState(cellWidth, isForce);
    }

    if (needUpdateVertical || needUpdateHorizontal) {
      this.renderer._renderGrid();
    }
  }

}

class VirtualScrollingBase {
  constructor(options) {
    this._workspace = options.workspace;
    this._state = this.defaultState;
    this._viewportSize = options.viewportSize;
    this._itemSize = options.itemSize;
    this._position = -1;
    this._itemSizeChanged = false;
    this.updateState(0);
  }

  get viewportSize() {
    return this._viewportSize;
  }

  get itemSize() {
    return this._itemSize;
  }

  set itemSize(value) {
    this._itemSizeChanged = this._itemSize !== value;
    this._itemSize = value;
  }

  get state() {
    return this._state;
  }

  set state(value) {
    this._state = value;
  }

  get startIndex() {
    return this.state.startIndex;
  }

  get pageSize() {
    return Math.ceil(this.viewportSize / this.itemSize);
  }

  get outlineCount() {
    return Math.floor(this.pageSize / 2);
  }

  get workspace() {
    return this._workspace;
  }

  get groupCount() {
    return this.workspace._getGroupCount();
  }

  get isVerticalGrouping() {
    return this.workspace._isVerticalGroupedWorkSpace();
  }

  get defaultState() {
    return {
      prevPosition: 0,
      startIndex: -1,
      itemCount: 0,
      virtualItemCountBefore: 0,
      virtualItemCountAfter: 0,
      outlineCountBefore: 0,
      outlineCountAfter: 0,
      virtualItemSizeBefore: 0,
      virtualItemSizeAfter: 0,
      outlineSizeBefore: 0,
      outlineSizeAfter: 0
    };
  }

  get maxScrollPosition() {
    return this.getTotalItemCount() * this.itemSize - this.viewportSize;
  }

  get position() {
    return this._position;
  }

  set position(value) {
    this._position = value;
  }

  needUpdateState(position) {
    var {
      prevPosition,
      startIndex
    } = this.state;
    var isFirstInitialization = startIndex < 0;

    if (isFirstInitialization) {
      return true;
    }

    var isStartIndexChanged = false;

    if (this._validateAndSavePosition(position)) {
      if (position === 0 || position === this.maxScrollPosition) {
        return true;
      }

      var currentPosition = prevPosition;
      var currentItemsCount = Math.floor(currentPosition / this.itemSize);
      var itemsCount = Math.floor(position / this.itemSize);
      isStartIndexChanged = Math.abs(currentItemsCount - itemsCount) >= this.outlineCount;
    }

    return isStartIndexChanged;
  }

  _validateAndSavePosition(position) {
    if (!isDefined(position)) {
      return false;
    }

    var result = this.position !== position;
    this.position = position;
    return result;
  }

  _correctPosition(position) {
    return position >= 0 ? Math.min(position, this.maxScrollPosition) : -1;
  }

  updateState(position, isForce) {
    position = this._correctPosition(position);

    if (!this.needUpdateState(position) && !isForce) {
      return false;
    }

    var itemsInfoBefore = this._calcItemInfoBefore(position);

    var itemsDeltaBefore = this._calcItemDeltaBefore(itemsInfoBefore);

    var {
      outlineCountAfter,
      virtualItemCountAfter,
      itemCountWithAfter
    } = this._calcItemInfoAfter(itemsDeltaBefore);

    var {
      virtualItemCountBefore,
      outlineCountBefore
    } = itemsInfoBefore;
    var itemCount = outlineCountBefore + itemCountWithAfter + outlineCountAfter;
    var itemCountBefore = Math.floor(position / this.itemSize);
    this.state.prevPosition = itemCountBefore * this.itemSize;
    this.state.startIndex = itemCountBefore - outlineCountBefore;
    this.state.virtualItemCountBefore = virtualItemCountBefore;
    this.state.outlineCountBefore = outlineCountBefore;
    this.state.itemCount = itemCount;
    this.state.outlineCountAfter = outlineCountAfter;
    this.state.virtualItemCountAfter = virtualItemCountAfter;

    this._updateStateCore();

    return true;
  }

  reinitState(itemSize, isForceUpdate) {
    var {
      position
    } = this;
    this.itemSize = itemSize;
    this.updateState(0, isForceUpdate);

    if (position > 0) {
      this.updateState(position, isForceUpdate);
    }
  }

  _calcItemInfoBefore(position) {
    var virtualItemCountBefore = Math.floor(position / this.itemSize);
    var outlineCountBefore = Math.min(virtualItemCountBefore, this.outlineCount);
    virtualItemCountBefore -= outlineCountBefore;
    return {
      virtualItemCountBefore,
      outlineCountBefore
    };
  }

  _calcItemDeltaBefore(itemInfoBefore) {
    var {
      virtualItemCountBefore,
      outlineCountBefore
    } = itemInfoBefore;
    var totalItemCount = this.getTotalItemCount();
    return totalItemCount - virtualItemCountBefore - outlineCountBefore;
  }

  getTotalItemCount() {
    throw 'getTotalItemCount method should be implemented';
  }

  getRenderState() {
    throw 'getRenderState method should be implemented';
  }

  _calcItemInfoAfter(itemsDeltaBefore) {
    var itemCountWithAfter = itemsDeltaBefore >= this.pageSize ? this.pageSize : itemsDeltaBefore;
    var virtualItemCountAfter = itemsDeltaBefore - itemCountWithAfter;
    var outlineCountAfter = virtualItemCountAfter > 0 ? Math.min(virtualItemCountAfter, this.outlineCount) : 0;

    if (virtualItemCountAfter > 0) {
      virtualItemCountAfter -= outlineCountAfter;
    }

    return {
      virtualItemCountAfter,
      outlineCountAfter,
      itemCountWithAfter
    };
  }

  _updateStateCore() {
    var {
      state
    } = this;
    var virtualItemCountBefore = state.virtualItemCountBefore;
    var virtualItemCountAfter = state.virtualItemCountAfter;
    var outlineCountBefore = state.outlineCountBefore;
    var outlineCountAfter = state.outlineCountAfter;
    var prevVirtualItemSizeBefore = state.virtualItemSizeBefore;
    var prevVirtualItemSizeAfter = state.virtualItemSizeAfter;
    var prevOutlineSizeBefore = state.outlineSizeBefore;
    var prevOutlineSizeAfter = state.outlineSizeAfter;
    var virtualItemSizeBefore = this.itemSize * virtualItemCountBefore;
    var virtualItemSizeAfter = this.itemSize * virtualItemCountAfter;
    var outlineSizeBefore = this.itemSize * outlineCountBefore;
    var outlineSizeAfter = this.itemSize * outlineCountAfter;
    var prevVirtualSizeBefore = prevVirtualItemSizeBefore + prevOutlineSizeBefore;
    var virtualSizeBefore = virtualItemSizeBefore + outlineSizeBefore;
    var prevVirtualSizeAfter = prevVirtualItemSizeAfter + prevOutlineSizeAfter;
    var virtualSizeAfter = virtualItemSizeAfter + outlineSizeAfter;
    var isAppend = prevVirtualSizeBefore < virtualSizeBefore;
    var isPrepend = prevVirtualSizeAfter < virtualSizeAfter;
    var needAddItems = this._itemSizeChanged || isAppend || isPrepend;

    if (needAddItems) {
      this._updateStateVirtualItems(virtualItemSizeBefore, virtualItemSizeAfter);
    }
  }

  _updateStateVirtualItems(virtualItemSizeBefore, virtualItemSizeAfter) {
    var {
      state
    } = this;
    state.virtualItemSizeBefore = virtualItemSizeBefore;
    state.virtualItemSizeAfter = virtualItemSizeAfter;
  }

}

class VerticalVirtualScrolling extends VirtualScrollingBase {
  constructor(options) {
    super({
      workspace: options.workspace,
      viewportSize: options.viewportHeight,
      itemSize: options.rowHeight
    });
  }

  get prevTopPosition() {
    return this.state.prevPosition;
  }

  get rowCount() {
    return this.state.itemCount;
  }

  get topVirtualRowCount() {
    return this.state.virtualItemCountBefore;
  }

  get bottomVirtualRowCount() {
    return this.state.virtualItemCountAfter;
  }

  getTotalItemCount() {
    return this.workspace._getTotalRowCount(this.groupCount, this.isVerticalGrouping);
  }

  getRenderState() {
    return {
      topVirtualRowHeight: this.state.virtualItemSizeBefore,
      bottomVirtualRowHeight: this.state.virtualItemSizeAfter,
      startRowIndex: this.state.startIndex,
      rowCount: this.state.itemCount,
      startIndex: this.state.startIndex
    };
  }

}

class HorizontalVirtualScrolling extends VirtualScrollingBase {
  constructor(options) {
    super({
      workspace: options.workspace,
      viewportSize: options.viewportWidth,
      itemSize: options.cellWidth
    });
  }

  get isRTL() {
    return this.workspace._isRTL();
  }

  getTotalItemCount() {
    return this.workspace._getTotalCellCount(this.groupCount, this.isVerticalGrouping);
  }

  getRenderState() {
    return {
      leftVirtualCellWidth: this.state.virtualItemSizeBefore,
      rightVirtualCellWidth: this.state.virtualItemSizeAfter,
      startCellIndex: this.state.startIndex,
      cellCount: this.state.itemCount,
      cellWidth: this.itemSize
    };
  }

  _updateStateVirtualItems(virtualItemSizeBefore, virtualItemSizeAfter) {
    if (!this.isRTL) {
      super._updateStateVirtualItems(virtualItemSizeBefore, virtualItemSizeAfter);
    } else {
      var {
        state
      } = this;
      state.virtualItemSizeAfter = virtualItemSizeBefore;
      state.virtualItemSizeBefore = virtualItemSizeAfter;
      state.startIndex = this.getTotalItemCount() - this.startIndex - this.state.itemCount;
    }
  }

}

class Renderer {
  constructor(workspace) {
    this._workspace = workspace;
    this._renderAppointmentTimeout = null;
  }

  getRenderTimeout() {
    return VIRTUAL_APPOINTMENTS_RENDER_TIMEOUT;
  }

  get workspace() {
    return this._workspace;
  }

  updateRender() {
    this._renderGrid();

    this._renderAppointments();
  }

  _renderGrid() {
    this.workspace.renderRWorkspace(false);
  }

  _renderAppointments() {
    var renderTimeout = this.getRenderTimeout();

    if (renderTimeout >= 0) {
      clearTimeout(this._renderAppointmentTimeout);
      this._renderAppointmentTimeout = setTimeout(() => this.workspace.updateAppointments(), renderTimeout);
    } else {
      this.workspace.updateAppointments();
    }
  }

}