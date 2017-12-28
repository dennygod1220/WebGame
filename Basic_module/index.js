/*基本連線設定_使用SOCKET.IO*/
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var PORT = 9999;
var io = require('socket.io')(server);
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendfile('index.html');
});

server.listen(PORT, function () {
    console.log('Server is listen on PORT : ' + PORT);
});
/* --------------------------SOCKET.IO---------------------------------------------------*/
io.on('connection', function (socket) {
    console.log('a user is connect , this connect id is : ' + socket.id);
    //當使用者離開時的事件
    socket.on('disconnect', function (data) {
        console.log('a user is disconnect , id is : ' + socket.id);
    });
});