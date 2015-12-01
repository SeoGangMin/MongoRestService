var Mongo = require('./Mongo');
var Q     = require('q');

module.exports = {
  findDocs : function(collection, find, opt, join_colls){
    var deffered = Q.defer();
    var cursor = collection.find(find, opt);
    if(join_colls){
      Mongo.getRefDocument(join_colls, cursor)
      .then(
        function( docs ){
          deffered.resolve(docs);
        }
        ,function( err ){
          deffered.reject(err);
        }
      );
    }else{
        cursor.toArray(function(err, docs){
          if(err){
            deffered.reject(err);
          }else{
            deffered.resolve(docs);
          }
        });
    }

    return deffered.promise;
  }
  ,findDoc : function(collection, find){
    var deffered = Q.defer();
    collection.findOne(find, function(err1, doc){
      if(err1){
        deffered.reject(err1);
      }else{
        deffered.resolve(doc);
      }
    });

    return deffered.promise;

  }
  ,createDoc : function(collection, create_doc){
    var deffered = Q.defer();
    Mongo.getNextSeqNumber(collection)
    .then(
      function( nextSeq ){
        create_doc['seq_number'] = nextSeq;
        collection.insert(create_doc,{w:1}, function(err, created){
          if(err){
            console.log(err);
            deffered.reject(err);
          }else{
            console.log(created);
            deffered.resolve(created.ops);
          }
        });
      }
      ,function( err ){
        deffered.reject(err);
      }
    );

    return deffered.promise;
  }

  ,findOrCreate : function(collection, find, create_doc){
    var deffered = Q.defer();
    Mongo.getNextSeqNumber(collection)
    .then(
      function( nextSeq ){
        create_doc['seq_number'] = nextSeq;
        collection.findAndModify(
          find,
          {_id:1},
          {
            $setOnInsert : create_doc
          },
          {
            new : true,
            upsert:true
          },
          function(err, doc){
            if(err){
              deffered.reject(err);
            }else{
              deffered.resolve(doc);
            }
          });
      }
      ,function( err ){
        deffered.reject(err);
      }
    );

    return deffered.promise;

  }

  ,findAndModify : function(collection, find, update){
    var deffered = Q.defer();

    Mongo.getNextSeqNumber(collection)
    .then(
      function( nextSeq ){
        if(Object.keys(update).length > 0){
          update[Object.keys(update)[0]]['seq_number'] = nextSeq;
        }

        collection.findAndModify(
          find
          ,{_id:1}
          ,update
          ,{
            new : true,
            upsert:true
          },
          function(err, doc){
            if(err){
              deffered.reject(err);
            }else{
              deffered.resolve(doc);
            }
          });
      }
      ,function( err ){
        deffered.reject(err);
      }
    );

    return deffered.promise;
  }
  ,remove : function(collection, find){
    var deferred = Q.defer();
    Mongo.getCollection(collection_name)
    .then(
      function(collection){
        collection.remove(find, function(err, result){
          if(err){
            deferred.reject(err);
          }else{
            deferred.resolve(result);
          }
        });
      }
      ,function(err){
        deferred.reject(err);
      }
    );
    return deferred.promise;
  }
};
