var mongodb = require('mongodb');
var Db = mongodb.Db;
var Connection = mongodb.Connection;
var Server = mongodb.Server;
var BSON = mongodb.BSON;
var ObjectID = mongodb.ObjectID;

DBProvider = function(host, port) {
    this.db= new Db('bink2', new Server(host, port, {
        auto_reconnect: true
    }, {}));
    this.db.open(function(){});
};

DBProvider.prototype.getCollection= function(collectionName, callback) {
    this.db.collection(collectionName, function(error, collection) {
        if( error ) callback(error);
        else callback(null, collection);
    });
};

DBProvider.prototype.getColl = function(collectionName, condition, option, callback) {

    this.getCollection(collectionName, function(error, collection) {
        if( error ) {
            callback(error);
        }
        else {
            var collectionFound = collection.find(condition,option);
            if(collectionFound != undefined){
                collectionFound.toArray(function(error, results) {
                    if( error ) {
                        callback(error);
                    }
                    else {
                        callback(null, results);
                    }
                });
            }
            else{
                callback('collection could not to find');
            }
        }
    });
};

DBProvider.prototype.getOne= function(collectionName, id, callback) {
    this.getCollection(collectionName, function(error, collection) {
        if( error ) {
            callback(error);
        }
        else {
            collection.findOne({
                _id: ObjectID.createFromHexString(id)
            }, function(error, collectionFound) {
                if( error ) {
                    callback(error);
                }
                else {
                    callback(null, collectionFound);
                }
            });
        }
    });
};

DBProvider.prototype.save = function(collectionName, itemToSave,  callback) {
    this.getCollection(collectionName, function(error, collection) {
        if( error ) callback(error)
        else {
            if(itemToSave._id != undefined && itemToSave._id.length == 24){ //update
                var _id = typeof(itemToSave._id) == 'object' ? itemToSave._id:ObjectID.createFromHexString(itemToSave._id);
                delete itemToSave._id;//important step
                collection.update({
                    '_id':_id
                }, {
                    '$set': itemToSave
                },{},function(error,object){
                    if(error){
                        callback(false);
                    }else{
                        itemToSave._id = _id;//如果_id跟着一起更新，那么会失败，故先删除_id，完了以后再加入
                        callback(true);
                    }
                });
            }else{ //insert
                collection.save(itemToSave,{
                    safe:true
                },function(error,object){
                    if(error){
                        callback(false);
                    }else{
                        callback(true);
                    }
                });
            }
            
        }
    });
};

DBProvider.prototype.push = function(collectionName, id, itemToSave,  callback) {
    this.getCollection(collectionName, function(error, collection) {
        if( error ) callback(error)
        else {
            if(id != undefined && id.length == 24){
                var _id = ObjectID.createFromHexString(id);
                collection.update({
                    '_id':_id
                }, {
                    '$push': itemToSave
                },{},function(error,object){
                    if(error){
                        callback(false);
                    }else{
                        callback(true);
                    }
                });
            }else{
                callback(false);
            }
            
        }
    });
};

DBProvider.prototype.removeById= function(collectionName, id, callback) {
    this.getCollection(collectionName, function(error, collection) {
        if( error ) {
            callback(error);
        }
        else {
            collection.remove({
                _id: ObjectID.createFromHexString(id)
            }, function(error, collectionFound) {
                if( error ) {
                    callback(error);
                }
                else {
                    callback();
                }
            });
        }
    });
};

exports.DBProvider = DBProvider;