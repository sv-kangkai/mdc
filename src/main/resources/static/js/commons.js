 //时间格式化
    Date.prototype.format = function (format) {
    if (!format) {
        format = "yyyy-MM-dd hh:mm";
    }

    var o = {
        "M+": this.getMonth() + 1, // month
        "d+": this.getDate(), // day
        "h+": this.getHours(), // hour
        "m+": this.getMinutes(), // minute
        "s+": this.getSeconds(), // second
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
        // millisecond
    };

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
};

function formatDatebox(value) {
    if (value == null || value == '') {
        return '';
    }
    var dt;
    if (value instanceof Date) {
        dt = value;
    } else {
        dt = new Date(value);
    }
    return dt.format("yyyy-MM-dd hh:mm"); //扩展的Date的format方法(上述插件实现)
}

function datetimeFormat_1(longTypeDate){
    var datetimeType = "";
    var date = new Date();
    date.setTime(longTypeDate);
    datetimeType+= date.getFullYear();   //年
    datetimeType+= "-" + getMonth(date); //月
    datetimeType += "-" + getDay(date);   //日
    datetimeType+= "&nbsp;&nbsp;" + getHours(date);   //时
    datetimeType+= ":" + getMinutes(date);      //分
    datetimeType+= ":" + getSeconds(date);      //分
    return datetimeType;
}
//返回 01-12 的月份值
function getMonth(date){
    var month = "";
    month = date.getMonth() + 1; //getMonth()得到的月份是0-11
    if(month<10){
        month = "0" + month;
    }
    return month;
}
//返回01-30的日期
function getDay(date){
    var day = "";
    day = date.getDate();
    if(day<10){
        day = "0" + day;
    }
    return day;
}
//返回小时
function getHours(date){
    var hours = "";
    hours = date.getHours();
    if(hours<10){
        hours = "0" + hours;
    }
    return hours;
}
//返回分
function getMinutes(date){
    var minute = "";
    minute = date.getMinutes();
    if(minute<10){
        minute = "0" + minute;
    }
    return minute;
}
//返回秒
function getSeconds(date){
    var second = "";
    second = date.getSeconds();
    if(second<10){
        second = "0" + second;
    }
    return second;
}

function datetimeFormat_2(longTypeDate){
    var datetimeType = "";
    var date = new Date();
    date.setTime(longTypeDate);
    datetimeType = date.getFullYear()+"-"+getMonth(date)+"-"+getDay(date)+" "+getHours(date)+":"+getMinutes(date);//yyyy-MM-dd 00:00:00格式日期
    return datetimeType;
}
