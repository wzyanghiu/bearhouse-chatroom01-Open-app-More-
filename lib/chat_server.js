//var socketio = require('socket.io');
//var io;

var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = function(io)
{
    console.log("Chat Server listen {");
    //io = socketio.listen(server);
    //io.set('log level', 2);
    io.on('connection', function(socket)
    	{
    		guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);

    		joinRoom(socket, 'room 01', io);

    		handleMessageBroadcasting(socket);
    		handleNameChangeAttempts(socket, nickNames, namesUsed);
    		handleRoomJoining(socket);

    		socket.on('rooms', function()
    			{
                    //console.log("rooms: " + currentRoom);
    				socket.emit('rooms', socket.rooms);
    			});

    		handleClidentDisconnection(socket, nickNames, namesUsed);
    	});
    console.log("Chat Server listen }");
}

function assignGuestName(socket, guestNumber, nickNames, namesUsed)
{
	var name = 'Guest' + guestNumber;
	nickNames[socket.id] = name;
	socket.emit('nameResult', {success: true, name: name});
	namesUsed.push(name);
    return guestNumber + 1;
}

function joinRoom(socket, room, io)
{
	//socket.join(room);
    //console.log(room +":"+ socket.id);
    //currentRoom[socket.id] = room;
    //socket.emit('joinResult', {room:room});
    //socket.broadcast.to(room).emit('message', {text:nickNames[socket.id] + ' has joined ' + room + '. Welcome!'});

    socket.join(room, function()
        {
            currentRoom[socket.id] = room;

            console.log("currentRoom info: " + currentRoom);
            socket.emit('joinResult', {room: room});
            console.log(socket.rooms); // [ <socket.id>, 'room 237' ]
            //io.to(room, 'A new user has joined the room'); // broadcast to everyone in the room
            socket.broadcast.to(room).emit('room', "A new user has joined the room");
        });

/*
    //var usersInRoom;
    //var usersInRoom = io.sockets.clients(room);
    io.of('/').in(room).clients(function(error, clients)
        {
            console.log("joinRoom {");
            if (error) throw error;
            //console.log(clients);

            if (clients.length > 1)
            {
                var usersInRoomSummary = 'Users currently in ' + room + ': ';
                for (var index in clients)
                {
                    var userSocketId = clients[index].id;
                    if (userSocketId != socket.id)
                    {
                        if (index > 0)
                        {
                            usersInRoomSummary += ', ';
                        }
                        usersInRoomSummary += nickNames[userSocketId]
                    }
                }
                usersInRoomSummary += '.';

                console.log(usersInRoomSummary);
                socket.emit('message', {text:usersInRoomSummary});
                console.log("joinRoom }");
            }
        });


    if (usersInRoom.length > 1)
    {
    	var usersInRoomSummary = 'Users currently in ' + room + ': ';
    	for (var index in usersInRoom)
    	{
    		var userSocketId = usersInRoom[index].id;
    		if (userSocketId != socket.id)
    		{
    			if (index > 0)
    			{
     			    usersInRoomSummary += ', ';
    			}
    			usersInRoomSummary += nickNames[userSocketId]
            }
    	}
    	usersInRoomSummary += '.';
    	socket.emit('message', {text:usersInRoomSummary});
    }
*/
}

function handleNameChangeAttempts(socket, nickNames, namesUsed)
{
	socket.on('nameAttempt' , function(name)
		{
            if (name.indexOf('Guest') == 0)
            {
                socket.emit('nameResult', {success: false, message:'Name can not be Guest'});
            }
            else
            {
            	if (namesUsed.indexOf[name] == -1)
            	{
            		var prvName = nickNames[socket.id];
            		var prvNameIndex = namesUsed.indexOf(prvName);
            		namesUsed.push(name);
	                nickNames[socket.id] = name;
	                delete namesUsed[prvNameIndex];
	                socket.emit('nameResult', {success: true, name: name});

	                socket.broadcast.to(currentRoom[socket.id]).emit
	                    ('message', {text: 'Previous name ' + prvName + 'now is known as ' + name});
            	}
                else
                {
                    socket.emit('nameResult', {success: false, message:'Name is already exist'});
                }
            }
		});
}

function handleMessageBroadcasting(socket)
{
    console.log("handleMessageBroadcasting {");
    socket.on('message', function(message)
    	{
            console.log("B-msg: " + message.room + " - " + message.text);
            //socket.broadcast.emit('system', socket.nickname, users.length, 'logout')
    		socket.broadcast.to(message.room).emit('message', {text: nickNames[socket.id] + ": " + message.text});
    	});
    console.log("handleMessageBroadcasting }");
}

function handleRoomJoining(socket)
{
	socket.on('join', function(room)
		{
			socket.leave(currentRoom[socket.id]);
			joinRoom(socket, room.newRoom);
		});
}

function handleClidentDisconnection(socket, nickNames, namesUsed)
{
	socket.on('disconnect', function()
		{
			var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
			delete namesUsed[nameIndex];
			delete nickNames[socket.id];
		});
}
