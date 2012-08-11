exports.getLocTime = function(nS) {
    return new Date(parseInt(nS) * 1000).toLocaleString().replace(/:\d{1,2}$/,' '); 
}

exports.timeToString = function(timeString, formatString){
    return  new Date(parseInt(timeString)*1000).pattern(formatString);
}

exports.subStringHtml = function(str, length, moreString){
    if(str.length<=length){
        return str;
    }else{
        moreString = moreString == undefined? '...' : moreString;
        return str.substr(0,length)+ moreString;
    }
}

exports.stripHtmlTag = function(html,isEncode){
    var r = /<[^>]*>/g;
    if(isEncode == true){
        html = this.html_decode(html);
    }
    return html.replace(r,'');
}


exports.go = function(viewName, res, collection, needLayout, req){
    db = require('./common').db;
    commonArgs = require('./common').commonArgs;
    functions = require('./common').functions;
    db.getColl('configs', {
        'type':'article'
    },{}, function(error, articleCls){
        commonArgs.articleCls = articleCls;
        commonArgs.req = req;
        var params = {
            common: commonArgs,
            fun: functions,
            coll: collection,
            layout: needLayout == false? false: true
        };
        res.render(viewName, params);
    });
}

exports.redirect = function(res,message,url){
    url = url || '/';
    this.go('error', res, {'url':url,'message':message}, false);
//    res.writeHead(302, {
//        'Location': url
//    });
//    res.end();
}

exports.clientIp = function(req){
    var ipAddress = req.headers['x-forwarded-for'] == undefined ? req.connection.remoteAddress : req.headers['x-forwarded-for'];
    return ipAddress;
}

exports.md5 = function(str, encoding){
    return require('crypto').createHash('md5').update(str).digest(encoding || 'hex');
};

exports.html_encode = function(str)   
{   
  var s = "";   
  if (str.length == 0) return "";
  s = str.replace(/</g, "&lt;");   
  s = s.replace(/>/g, "&gt;"); 
  s = s.replace(/\'/g, "&#39;");   
  s = s.replace(/\"/g, "&quot;");
  return s;   
} 
exports.html_decode = function (str)   
{   
  var s = "";   
  if (str.length == 0) return "";
  s = str.replace(/&lt;/g, "<");   
  s = s.replace(/&gt;/g, ">");  
  s = s.replace(/&#39;/g, "\'");
  s = s.replace(/&quot;/g, "\"");
  return s;
} 








//inner function
Date.prototype.pattern=function(fmt) {
    var o = {
        "M+" : this.getMonth()+1, //月份
        "d+" : this.getDate(), //日
        "h+" : this.getHours() == 0 ? 12 : this.getHours(), //小时
        "H+" : this.getHours(), //小时
        "m+" : this.getMinutes(), //分
        "s+" : this.getSeconds(), //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S" : this.getMilliseconds() //毫秒
    };
    var week = {
        "0" : "\u65e5",
        "1" : "\u4e00",
        "2" : "\u4e8c",
        "3" : "\u4e09",
        "4" : "\u56db",
        "5" : "\u4e94",
        "6" : "\u516d"
    };      
 
    if(/(y+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
 
    if(/(E+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "\u661f\u671f" : "\u5468") : "")+week[this.getDay()+""]);
    }

    for(var k in o){
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
}
