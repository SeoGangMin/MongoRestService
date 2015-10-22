var mongodb      = require('mongodb')
    ,MongoClient = mongodb.MongoClient
    ,ObjectID    = require('bson-objectid')
    ,Join        = require('mongo-join').Join
    ,Q           = require('q');

var HOST          = "";

var options = {
  poolSize : 10,
  socketOptions : {
    connectTimeoutMS: 20000,
    socketTimeoutMS : 20000
  }
};

var databases = {};

function connectDatabase(database_name){
  var deffered = Q.defer();
  if(databases[database_name]){
    deffered.resolve( databases[database_name]['db'] );
  }else{
    MongoClient.connect(getDatabaseUri(HOST, database_name), options, function(err, db){
      if(err){
        if(db){
          db.close();
        }
        deffered.reject( err );
      }else{
        if(!databases[database_name]){
          databases[database_name] = {};
        }
        databases[database_name]['db'] = db;
        databases[database_name]['collections'] = {};
        databases[database_name]['db'].on('close', function(){
          delete databases[database_name];
        });
        deffered.resolve( databases[database_name]['db']);
      }
    });
  }
  return deffered.promise;
}

exports.getCollection = function(database_name, collection_name){
  var deffered = Q.defer();
  var collection = null;
  if(!databases[database_name]){
    connectDatabase(database_name)
    .then(
      function( db ){
        databases[database_name]['collections'][collection_name] = databases[database_name]['db'].collection(collection_name);
        deffered.resolve( databases[database_name]['collections'][collection_name] );
      },
      function( err ){
        deffered.reject( err );
      }
    );
  }else{
    if(!databases[database_name]['collections'][collection_name]){
      console.log('collection off');
      databases[database_name]['collections'][collection_name] = databases[database_name]['db'].collection(collection_name);
      deffered.resolve( databases[database_name]['collections'][collection_name] );
    }else{
      console.log('collection on');
      deffered.resolve( databases[database_name]['collections'][collection_name] );
    }
  }

  return deffered.promise;

}

exports.getRefDocument = function(colls, cursor){
  var deffered = Q.defer();
  var join = new Join(client);
  for(var i in colls){
    var coll = colls[i];
    var obj = {
      field: coll+'_ref_id',
      to: '_id',
      from: coll
    };
    join.on(obj);
  };

  join.toArray(cursor, function(err, docs){
    if(err){
      deffered.reject(err);
    }else{
      deffered.resolve(docs);
    }
  });

  return deffered.promise;
}


exports.getNextSeqNumber = function(collection){
  var deffered = Q.defer();
  var cursor = collection.find({}, {'seq_number':1, _id:0}, {sort:{seq_number:-1}, limit : 1});
  cursor.toArray(function(err, maxSeq){
    if(err){
      deffered.reject(err);
    }else{
      var nextSeq = 1;
      if(maxSeq.length > 0){
        nextSeq = Number(maxSeq[0]['seq_number'])+1;
      }
      deffered.resolve(nextSeq);
    }
  });

  return deffered.promise;
};

exports.getObjectId = function(ids){
  var retVal = null;
  if(Array.isArray(ids)){
    retVal = [];
    for(var i in ids){
      var id = ids[i];
      retVal.push(ObjectID(id));
    }
  }else{
    retVal = ObjectID(ids);
  }

  return retVal;
}


function getDatabaseUri(host, databaseName){
  return 'mongodb://'+host+'/'+databaseName+'?w=0&readPreference=secondary';
}
