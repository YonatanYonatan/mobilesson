/**
 * Created by fishman on 10/23/2015.
 */
var express = require('express');
var app = express();

app.use(function(req,res,next){
    console.log(req.ip);
    next();
});
app.use(express.static('public'));


app.get('/',function(req,res){
    res.sendFile('/index.html');
});

app.listen(8080, function(){
    console.log('server is on');
});