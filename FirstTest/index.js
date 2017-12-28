/*基本連線設定_使用SOCKET.IO*/
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var PORT = 9999;
var io = require('socket.io')(server);
app.use(express.static(__dirname + '/public'));

app.get('/',function(req,res){
    res.sendfile('index.html');
});

server.listen(PORT);
/* --------------------------SOCKET.IO---------------------------------------------------*/
io.on('connection',function(socket){
    console.log('a user is connect , this connect id is : ' + socket.id);

    socket.on('send name',function(data){
        console.log('a user name is: '+data);
        io.sockets.connected[socket.id].emit('connect sucess',data);
    });

    socket.on('disconnect',function(data){
        console.log('a user is disconnect , id is : '+socket.id);
    });
});