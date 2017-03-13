
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');

var express = require('express'),
    app     = express(),
    server  = require('http').createServer(app),
    io      = require('socket.io').listen(server); 


app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/public');
app.set('lib', __dirname + '/lib');
app.set('view engine', 'html');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require('./routes')(app);
server.listen(80);

var nickNames = {};
var users = [];

//var chatserver = require('./lib/chat_server');
//chatserver.listen(io);

io.on('connection', function(socket) 
    {
        console.log("connection ...");
        //昵称设置
        socket.on('login', function(nickname) 
            {
                console.log("login event: " + nickname);
                if (users.indexOf(nickname) > -1) 
                {
                    socket.emit('nickExisted');
                }
                else
                {
                    console.log('loginSuccess: ' + nickname);
                    socket.userIndex = users.length;
                    socket.nickname = nickname;

                    users.push(nickname);
                    nickNames[socket.id] = nickname;

                    socket.emit('loginSuccess');
                    io.sockets.emit('system', nickname, users.length, 'login');
                };
            });

        socket.on('postMsg', function(msg) 
            {
                //将消息发送到除自己外的所有用户
                socket.broadcast.emit('newMsg', socket.nickname, msg);
            });

        socket.on('img', function(imgData)
            {
                //通过一个newImg事件分发到除自己外的每个用户
                socket.broadcast.emit('newImg', socket.nickname, imgData);
            });

        socket.on('disconnect', function() 
            {
                console.log("disconnect: " + socket.nickname);
                delete nickNames[socket.id];
                //将断开连接的用户从users中删除
                users.splice(socket.userIndex, 1);
                //通知除自己以外的所有人
                socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
            });

    });

