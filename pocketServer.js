var express = require('express'),
  mongoskin = require('mongoskin'),
  bodyParser = require('body-parser'),
  busboy = require('connect-busboy'),
  AWS = require('aws-sdk')

var app = express()
AWS.config.loadFromPath('./awsConfig.json')

app.use(bodyParser({limit: '50mb'}))
app.use(busboy())

var db = mongoskin.db('mongodb://@localhost:27017/test', {safe:true})
var s3 = new AWS.S3()

app.get('/', function(req, res) {
  res.send('I am awake...')
})

app.get('/objects/', function(req, res) {
  s3.listObjects({Bucket: 'pocketserver-development'}, function(er, data) {
    if (er) {
      res.send(400, er)
    } else {
      res.send(200, data)
    }
  })
})

app.post('/object/', function(req, res) {
  console.log('processing POST')
  var orderLabel
  
  var error = null;
  req.busboy.on('field', function(fieldName, val, fieldNameTruncated, valTruncated) {
    if (fieldName === 'deviceToken') {
      console.log('field: ' + fieldName + ' value: ' + val)
    }
  })
  req.busboy.on('file', function(fieldName, file, fileName) {
    //console.log(file.length)
    
    // Create the initial array containing the stream's chunks
    file.fileRead = [];

    file.on('data', function(chunk) {
      // Push chunks into the fileRead array
      this.fileRead.push(chunk);
    });
    
    file.on('end', function() {
      // Concat the chunks into a Buffer
      var finalBuffer = Buffer.concat(this.fileRead);
      
       s3.putObject({Bucket: 'pocketserver-development', Body: finalBuffer, Key: fileName, ContentLength: finalBuffer.length}, function(err, data) {
        if (err) {
          console.log(err)
          error = err
          //didCompleteSuccess = false
          //res.send(400)
        }
        else {
          //res.send(201)
          console.log('success!')
        }   
      })
    })
  })
  req.pipe(req.busboy)
  req.busboy.on('end', function() {
  	if (error) {
  	  res.send(400, error)
  	}
  	else {
  	  res.send(201)
  	}
  })
})

app.listen(3000)
