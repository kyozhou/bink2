var $ = require('../common');

exports.get_article = function(req, res){
    //console.log(req.param('id'));
    if(req.param('id') == undefined || req.param('id').length != 24){
        res.end();
    }else{
        $.db.getOne('article', req.param('id'), function(error,item){
            //console.log(item);
            
            if(item != null){
                
                res.send(item);
            }else{
                res.end();
            }
            
        //res.end();
        });
    }
    
}


