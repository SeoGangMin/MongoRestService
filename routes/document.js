
var express = require('express');
var router  = express.Router();
var Mongo      = _Common.Mongo;
var MongoWrapper = _Common.MongoWrapper;

/**
 * @apiVersion 0.0.1
 * @api {get} /document/query Query Documents
 * @apiPermission None
 * @apiName QueryDocuments
 * @apiGroup Document
 * @apiSampleRequest off
 *
 * @apiParam {String} collection 컬렉션명
 * @apiParam {Object} query 쿼리조건
 * @apiParam {Object} [sort] 정렬옵션
 * @apiParam {Number} [page_number] skip개수
 * @apiParam {Number} [page_size] 요청할 개수
 * @apiParam {String[]} [join_colls] join할 컬렉션명들
 *
 * @apiSuccess {Number} code 결과 코드
 * @apiSuccess {Object} result 요청한 Documents
 *
 */
router.get('/:database_name/:collection_name/find', function(req, res, next){
  var database_name   = req.params.database_name;
  var collection_name = req.params.collection_name;

  var params     = JSON.parse(req.query.params);
  var find       = params.find;
  var sort       = params.sort;
  var skip       = params.page_number;
  var limit      = params.page_size;
  var join_colls = params.join_colls;

  if(!sort) sort   = {'_id':1};
  if(!skip) skip   = 0;
  if(!limit) limit = 0;

  skip = limit*skip;

  if(find['_id']){
    if(find['_id']['$in']){
      find['_id']['$in'] = db.getObjectId(find['_id']['$in']);
    }else{
      find['_id'] = db.getObjectId(find['_id']);
    }
  }

  Mongo.getCollection(database_name, collection_name)
  .then(
    function( collection ){
      return MongoWrapper.findDocs( collection, find, {sort:sort, skip:skip, limit:limit}, join_colls);
    },
    function( err ){
      next(err);
    }
  )
  .then(
    function( docs ){
      res.status(200).send({result:docs});
    },
    function( err ){
      next(err);
    }
  );
});

/**
 * @apiVersion 0.0.1
 * @api {post} /document/create create Document
 * @apiPermission None
 * @apiName CreateDocument
 * @apiGroup Document
 * @apiSampleRequest off
 *
 * @apiParam {String} collection 컬렉션명
 * @apiParam {Object} create_doc 생성할 다큐먼트
 *
 * @apiSuccess {Number} code 결과 코드
 * @apiSuccess {Object} result 생성된 Document
 *
 */
router.post('/:database_name/:collection_name/create',function(req, res, next){
  var database_name   = req.params.database_name;
  var collection_name = req.params.collection_name;

  var create_doc      = req.body.create_doc;

  console.log(req.body);

  Mongo.getCollection(database_name, collection_name)
  .then(
    function( collection ){
      return MongoWrapper.createDoc(collection, create_doc);
    }
    ,function( err ){
      next(err);
    }
  )
  .then(
    function( doc ){
      console.log(doc);
      res.status(200).send({result:doc});
    }
    ,function( err ){
      next(err);
    }
  )
});

router.post('/:database_name/:collection_name/findAndModify',function(req, res, next){
  var database_name   = req.params.database_name;
  var collection_name = req.params.collection_name;

  var find            = req.body.find;
  var update          = req.body.update;

  console.log(req.body);

  Mongo.getCollection(database_name, collection_name)
  .then(
    function( collection ){
      return MongoWrapper.findAndModify(collection, find, update);
    }
    ,function( err ){
      next(err);
    }
  )
  .then(
    function( doc ){
      console.log(doc);
      res.status(200).send({result:doc})
    }
    ,function( err ){
      console.log(err);
      next(err);
    }
  );
});

router.post('/:database_name/:collection_name/remove', function(req, res, next){
  var database_name   = req.params.database_name;
  var collection_name = req.params.collection_name;

  var find            = req.body.find;

  if(find['_id']){
    if(find['_id']['$in']){
      find['_id']['$in'] = db.getObjectId(find['_id']['$in']);
    }else{
      find['_id'] = db.getObjectId(find['_id']);
    }
  }

  Mongo.getCollection(database_name, collection_name)
  .then(
    function( collection ){
      return MongoWrapper.remove(collection, find);
    }
    ,function( err ){
      next(err);
    }
  )
  .then(
    function( removed ){
      res.status(200).send({result:'success'});
    }
    ,function( err ){
      next(err);
    }
  )
});

module.exports = router;
