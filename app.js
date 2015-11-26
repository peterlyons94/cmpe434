var express = require('express');
var app = express()
, http = require('http')
, server = http.createServer(app)
, io = require('socket.io').listen(server);

server.listen(8080);

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// usernames which are currently connected to the chat
var usernames = {};
var passwords = {};

// rooms which are currently available in chat
var rooms = ['Random'];

io.sockets.on('connection', function (socket) {

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username, password){
		// store the username in the socket session for this client
		socket.username = username;
		socket.password = password;
		// store the room name in the socket session for this client
		socket.room = 'Random';
		// add the client's username to the global list
		usernames[username] = username;
		passwords[password] = password;
		// send client to room 1
		socket.join('Random');
		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected to Random');
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to('Random').emit('updatechat', 'SERVER', username + ' has connected to this room');
		socket.emit('updaterooms', rooms, 'Random');
		socket.emit('updateusers', usernames);
	});


	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});
	
	// Sending a message to specific users
	socket.on('specificchat', function(data, userlist){
		io.sockets.in(socket.room).to(userlist).emit('updatechat', socket.username, data);
	});

	// When the user switches rooms
	socket.on('switchRoom', function(newroom){
		// leave the current room (stored in session)
		socket.leave(socket.room);
		// join new room, received as function parameter
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
		socket.emit('updateusers', usernames);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});

	// when the user creates a new room
	socket.on('newRoom', function(newroom){
		// add room to global list
		rooms.push(newroom);
		socket.leave(socket.room);
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'You have created ' + newroom);
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
		socket.emit('updateusers', usernames);
	});

	// when the user deletes a chatroom
	socket.on('deleteRoom', function(room){
		if(room != 'Random'){
			socket.leave(room);
			socket.emit('updatechat', 'SERVER', 'You have deleted ' + room);
			var index = rooms.indexOf(socket.room);
			if (index > -1) {
			    rooms.splice(index, 1);
			}

			socket.join('Random');
			io.sockets.emit('updaterooms', rooms, 'Random');
			socket.emit('updatechat', 'SERVER', 'You have now joined ' + socket.room);
		} else {
			socket.broadcast.to(socket.room).emit('updatechat','SERVER', "You can't delete this room");
		}
	});
	
	/*
	var attempt = 3; // Variable to count number of attempts.
	// Below function Executes on click of login button.
	
	function validate(){
		var username = document.getElementById("username").value;
		var password = document.getElementById("password").value;
		if ( username == "Formget" && password == "formget#123"){
			alert ("Login successfully");
			window.location = "index.html"; // Redirecting to other page.
			return false;
		} else{
			attempt --;// Decrementing by one.
			alert("You have left "+attempt+" attempt;");
			// Disabling fields after 3 attempts.
			if( attempt == 0){
				document.getElementById("username").disabled = true;
				document.getElementById("password").disabled = true;
				document.getElementById("submit").disabled = true;
				return false;
			}
		}
	}

	*/

});
