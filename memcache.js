var memcache = require('memcache');

exports.set = function(key,value){
    mcClient.set(key, value, function(err, response) {
    });
}

exports.get = function(key,callback){
    mcClient.get(key, function(err, data) {
        callback(data);
    });
}

exports.del = function(key){
    
    }

mcClient = new memcache.Client();
mcClient.connect();
