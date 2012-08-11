
/*
 * GET home page.
 */
var $ = require('../common');

//首页
exports.index = function(req, res){
    var condition = {};
    if(req.session.user == undefined){
        var condition = {
            'is_show':'Y'
        };
    }
    var option = {
        'sort':[['last_update','desc']],
        'limit':10
    };
    $.db.getColl('article', condition, option, function(error,collection){
        $.functions.go('index', res,{
            articles:collection
        },true,req);
    });
};

//文章详细页
exports.article = function(req, res){
    if(req.params.id == undefined || req.params.id.length != 24){
        res.end("id empty");
    }
    
    $.db.getOne('article', req.params.id, function(error,item){
        if(item!=null){
            item.clk_times ++;
            var repliesHtml = '';
            if(item.replies != undefined){
                repliesHtml = generateRepliesTree(item.replies,req.session.user);
            }
            $.db.save('article',item,function(){});
            $.functions.go('article',res, {
                article:item,
                repliesHtml: repliesHtml
            },true,req);
        }else{
            res.redirect('/');
        }
        
    });
    
};

exports.article_replies = function(req, res){
    if(req.params.id == undefined || req.params.id.length != 24){
        res.end("false");
    }else{
        $.db.getOne('article', req.params.id, function(error,item){
            
            if(item.replies != undefined && !error){
                res.end(generateRepliesTree(item.replies,req.session.user));
            }else{
                res.end('false');
            }
        });
    }
}

//文章列表页
exports.articles = function(req, res){
    var condition = {};
    if(req.session.user == undefined){
        var condition = {
            'is_show':'Y'
        };
    }
    if( req.param('name') != '全部' && isNaN(decodeURIComponent(req.param('name'))) ){
        condition['cls_name'] = req.param('name');
    }
    //console.log(req.param('pageIndex'));
    var page = {
        pageSize:20,
        articleCount:0,
        pageCount: 0,
        pageIndex: 1,
        pagePre: 1,
        pageNext:1
    };
    $.db.getColl('article', condition, {}, function(error,articles){
        page.articleCount = articles.length;
        page.pageCount = Math.floor((page.articleCount-1)/page.pageSize)+1 ;
        page.pageIndex = isNaN(req.param('pageIndex'))?1:req.param('pageIndex');
        page.pagePre = page.pageIndex-1<1?1:page.pageIndex-1;
        page.pageNext = page.pageIndex+1>page.pageCount?page.pageCount:page.pageIndex+1;
        
        var option = {
            'sort':[['last_update','desc']],
            limit: page.pageSize,
            skip: (page.pageIndex-1)*page.pageSize
        };
        $.db.getColl('article', condition, option, function(error,collection){
            $.functions.go('articles', res,{
                articles:collection,
                page: page
            },true,req);
        });
    });
}


//inner function
function generateRepliesTree(replies,admin){
    if(replies != undefined && replies.length > 0){
        var htmlString = "<ul>";
        var repliesLength = replies.length;
        for(var i=0; i<repliesLength; i++){
            if(replies[i] == null){
                continue;
            }else{
                htmlString += '<li style="margin:10px 0;padding:5px;border: 1px dotted blue;" index="'+i+'">';
                htmlString += '<div style="color:#aaa;"  onmouseover="$(this).find(\'.replyOpration\').show();" '+
                ' onmouseout="$(this).find(\'.replyOpration\').hide();">';
                htmlString += "" + replies[i]['author'] + "\uff0c" ;
                htmlString += '<span style="font-size:12px">'+ $.functions.timeToString(replies[i]['reply_time'],'yyyy-MM-dd hh:mm') + "</span>" ;
                htmlString += '<span class="replyOpration" style="display:none;">&nbsp;<a class="replyLink" href="#replyForm" onclick="setReplyIndex(this)" >回复</a>';
                if(admin != undefined){
                    htmlString += '&nbsp;<a href="javascript:;" onclick="deleteThisReply(this)">删除</a>';
                }
                htmlString += '</span></div>';
                htmlString += '<div style="font-size:16px;">';
                htmlString += replies[i]['content'];
                if(replies[i].replies != undefined && replies[i].replies.length>0){
                    htmlString += generateRepliesTree(replies[i].replies,admin);
                }
                htmlString += '</div></li>';
            }
        }
        htmlString += '</ul>';
        return htmlString;
    }else{
        return '';
    }
    
}
