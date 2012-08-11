
/*
 * Admin
 */
var $ = require('../common');

exports.login = function(req, res){
    if(req.session.login_error_times != undefined && req.session.login_error_times>3){
        res.redirect('/');
    }else{
        if(req.session.user == undefined){
            $.functions.go('admin_login',res,{},false);
        }else{
            res.redirect('/');
        }
    }
    
};

exports.logout = function(req, res){
    delete req.session.user;
    res.redirect('/');
};

exports.login_check = function(req, res){
    if(req.session.login_error_times != undefined && req.session.login_error_times>3){
        res.redirect('/');
    }else{
        if(req.body.username.length>0 && req.body.password.length>0){
            $.db.getColl('user', {
                'username': req.body.username,
                'password': $.functions.md5(req.body.password)
            },{}, function(error,collection){
                if(collection.length >= 1){
                    delete collection[0]['password'];
                    req.session.user = collection[0];
                    res.redirect('/');
                }else{
                    if(req.session.login_error_times == undefined){
                        req.session.login_error_times = 1;
                    }else{
                        req.session.login_error_times ++;
                    }
                    $.functions.redirect(res, '登录错误', '/woyaodenglua');
                }
            });
        }else{
            res.end('username or password is empty');
        }
    }
    
}

exports.article_add = function(req, res){
    needLogin(req,res);
    var article = {
        '_id':'',
        'title':'',
        'content':'',
        'is_show':'Y',
        'indexnum':0,
        'author':'周斌',
        'cls_name':''
    };
    $.functions.go('admin_article_edit',res, {
        'article':article
    },true,req);
}

exports.article_edit = function(req, res){
    needLogin(req,res);
    if(req.session.user == undefined){
        res.end('404');
    }
    if(req.params.id == undefined || req.params.id.length != 24){
        res.end("id error");
    }else{
        $.db.getOne('article', req.params.id, function(error,item){
            $.functions.go('admin_article_edit',res, {
                'article':item
            },true,req);
        });
    }
}

exports.save_article = function(req , res){
    needLogin(req,res);
    var article = req.param('article');
    
    if(article == undefined){
        res.send('false');
    }else{
        if(article._id != undefined && article._id.length != 24){
            delete article._id;
            article.clk_times = 0;
            article.c_time = parseInt(new Date().getTime()/1000)
        }
        var article_id = article._id;
        article.content = $.functions.html_encode(article.content);
        article.last_update = parseInt(new Date().getTime()/1000);
        if(article.cls_name_custom != undefined && article.cls_name_custom != ''){
            var config = {
                'name':article.cls_name_custom,
                'type': 'article'
            }
            $.db.save('configs', config, function(error){});
            article.cls_name = article.cls_name_custom;
            delete article.cls_name_custom;
        }
        $.db.save('article', article, function(error){
            if(article_id == undefined){
                res.redirect("/");
            }else{
                res.redirect("/article/"+article_id+"/");
            }
            
        });
        
    }
}

exports.article_delete = function(req , res){
    needLogin(req,res);
    var article_id = req.param('id');
    
    if(article_id == undefined || article_id.length != 24){
        res.send('error');
    }else{
        $.db.removeById('article', article_id, function(){
            res.redirect("/");
        });
    }
}

exports.save_article_reply = function(req, res){
    needLogin(req,res);
    var reply = req.param('reply');
    var replyIndex = req.param('replyIndex');
    var article_id = req.param('article_id');
    if(article_id != undefined && reply != undefined){
        $.db.getOne('article', article_id, function(error,article){
            reply['reply_time'] = parseInt(new Date().getTime()/1000);
            reply['ip'] = $.functions.clientIp(req);
            var temp = article;
            if(replyIndex != undefined && replyIndex.length>0){
                var replyIndexArray = replyIndex.split('|');
                
                for(var i=0;i<replyIndexArray.length; i++){
                    temp = temp.replies[replyIndexArray[i]];
                }
                
            }
            if(temp.replies != undefined && temp.replies.length>0){
                temp.replies.push(reply);
            }else{
                temp.replies = [reply];
            }
            $.db.save('article', article, function(isSuccess){
                if(isSuccess){
                    res.end('true');
                }else{
                    res.end('false');
                }
            });
        });
    }else{
        res.end('false');
    }
}

exports.delete_article_reply = function(req , res){
    needLogin(req,res);
    var replyIndex = req.param('replyIndex');
    var article_id = req.param('article_id');
    if(article_id != undefined ){
        $.db.getOne('article', article_id, function(error,article){
            var temp = article;
            if(replyIndex != undefined && replyIndex.length>0){
                var replyIndexArray = replyIndex.split('|');
                for(var i=0;i<replyIndexArray.length-1; i++){
                    temp = temp.replies[replyIndexArray[i]];
                }
                temp.replies.splice(replyIndexArray[replyIndexArray.length-1],1);
                $.db.save('article', article, function(error){
                    if(error){
                        res.send(error);
                    }else{
                        res.end('true');
                    }
                });
            }
            else{
                res.end('false2');
            }
            
        });
    }else{
        res.end('false1');
    }
};

exports.delete_configs = function(req, res){
    needLogin(req,res);
    var configId = req.param('id');
    if(configId != undefined && configId.length == 24){
        $.db.removeById('configs', configId, function(){
            res.redirect("/");
        });
    }else{
        res.end('false');
    }
};

exports.change_password = function(req, res){
    needLogin(req,res);
    var newPassword = req.body.password;
    if(newPassword != undefined && newPassword.length>0){
        var user = req.session.user;
        user['password'] = $.functions.md5(req.body.password)
        $.db.save('user',user,function(isSuccess){
            delete req.session.user;
            res.end(isSuccess?'true':'false');
        });
    }else{
        res.end('false');
    }
}

function needLogin(req,res, isRedirect){
    isRedirect = isRedirect == undefined?true:isRedirect;
    if(req.session.user == undefined){
        if(isRedirect){
            $.functions.redirect('/',res)
        }
        return false;
    }else{
        return true;
    }
}