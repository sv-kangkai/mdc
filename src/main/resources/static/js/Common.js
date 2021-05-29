
//调用此函数将创建一个Kendo弹出窗口，本函数需要6个参数
//参数：primaryKeyName URL后面所需参数的名字（一般是主键名称）http://localhost/controllerName/actionName?primaryKeyName=primaryKeyValue
//参数：primaryKeyValue URL后面参数的值 http://localhost/controllerName/actionName?primaryKeyName=primaryKeyValue
//参数：controllerName 控制器名称 http://localhost/controllerName/actionName?primaryKeyName=primaryKeyValue
//参数：actionName 控制器中方法的名称 http://localhost/controllerName/actionName?primaryKeyName=primaryKeyValue
//参数：windowWidth 新建详细信息窗口的宽度，可自行调整，格式：200px
//参数：titleText 弹出窗口的标题，可自定义，类型为字符串型
function showPopupWindow(primaryKeyName, primaryKeyValue, controllerName, actionName, windowWidth, titleText) {
    var detailWindow = $("<div id='DetailWindow'></div>");
    $("body").append(detailWindow);
    var myWindow = $("#DetailWindow");
    myWindow.kendoWindow({
        width: windowWidth,
        title: titleText,
        content: "/" + controllerName + "/" + actionName + "?" + primaryKeyName + "=" + primaryKeyValue,
        modal: true,
        draggable: true
    });
    myWindow.data("kendoWindow").center().open();
}
function showCreatNewPopupWindow(controllerName, actionName, windowWidth, titleText) {
    var detailWindow = $("<div id='DetailWindow'></div>");
    $("body").append(detailWindow);
    $("body").remove(detailWindow);
    var myWindow = $("#DetailWindow");
    myWindow.kendoWindow({
        width: windowWidth,
        title: titleText,
        content: "/" + controllerName + "/" + actionName,
        modal: true,
        draggable: true
    });
    myWindow.data("kendoWindow").center().open();
}