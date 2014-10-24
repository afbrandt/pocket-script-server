var express = require('express'),
  mongoskin = require('mongoskin'),
  bodyParser = require('body-parser'),
  busboy = require('connect-busboy'),
  AWS = require('aws-sdk')

var app = express()
AWS.config.loadFromPath('./awsConfig.json')

app.use(bodyParser())
app.use(busboy())

var db = mongoskin.db('mongodb://@localhost:27017/test', {safe:true})
var s3 = new AWS.S3()

app.get('/', function(req, res) {
  res.send('I am awake...')
})

app.get('/objects/', function(req, res) {
  s3.listObjects({Bucket: 'pocketserver-development'}, function(er, data) {
    if (er) {}
    res.send(data)
  })
})

app.post('/object/', function(req, res) {
  res.send(202)
})

app.listen(3000)
