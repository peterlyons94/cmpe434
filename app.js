var express = require('express');
var app = express()
, http = require('http')
, server = http.createServer(app)
, io = require('socket.io').listen(server);

server.listen(8080);

// routing
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// usernames which are currently connected to the chat
var users = [];

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
		// add the client's user details to a user object
		var user = [];
		user.username = username;
		user.room = socket.room;
		user.password = password;
		user.id = socket.id;
		//add the user object to the global list
		users.push(user);

		// send client to room 1
		socket.join('Random');
		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected to Random');
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to('Random').emit('updatechat', 'SERVER', username + ' has connected to this room');
		socket.emit('updaterooms', rooms, 'Random');
		// list the users in the room
		// update users room
		var inroom = [];
		for(var obj in users){
			if(users[obj].room == socket.room){
				inroom.push(users[obj].username);
			}
		}

		io.sockets.emit('updateusers', inroom, socket.room);
		console.log(users);
	});


	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		//check to see if the user sends the ./help first
		if(data.indexOf("./help") > -1 || data.indexOf("./h") > -1){
			console.log(socket.id);
			console.log(socket.username);	
			socket.broadcast.to(socket.id).emit('updatechat', 'HELP',
				"This is a help function, only you can see it.");
		} else{
			// we tell the client to execute 'updatechat' with 2 parameters
			io.sockets.in(socket.room).emit('updatechat', socket.username, data);
		}

	});
	
	// Sending a message to specific users
	socket.on('specificchat', function(userlist, data){
		console.log(data);
		console.log(userlist);
		for(var i in userlist){
			for(var j in users){
				if(users[j].username == userlist[i]){
					socket.broadcast.to(users[j].id).emit('updatechat', socket.username, data);
				}
			}
			
		}
	});

		// Sending a message to specific users
	socket.on('specificAppChat', function(user, data){
		console.log(data);
		console.log(user);
		for(var j in users){
			if(users[j].username == user){
				socket.broadcast.to(users[j].id).emit('updatechat', socket.username, data);
			}
		}
			
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
		// update users room
		var inroom = [];
		for(var obj in users){
			if(users[obj].username == socket.username){ 
				users[obj].room = socket.room;
			}
			if(users[obj].room == socket.room){
				inroom.push(users[obj].username);
			}
		}
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
		io.sockets.emit('updateusers', inroom, newroom);
		console.log(users);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		var i = 0;
		for(var obj in users){
			if(users[obj].username == socket.username){ 
				var index = i;
				//console.log(index);
				if (index > -1) {
			    	users.splice(index, 1);
				}
			}
			i++;
		}
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', users);
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
		// update users room
		var inroom = [];
		for(var obj in users){
			if(users[obj].username == socket.username){ 
				users[obj].room = socket.room;
			}
			if(users[obj].room == socket.room){
				inroom.push(users[obj].username);
			}
		}
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
		socket.emit('updateusers', inroom, newroom);
	});

	// when the user deletes a chatroom
	socket.on('deleteRoom', function(room){
		// check to make sure you're only one in room
		var inroom = [];
		for(var obj in users){
			if(users[obj].username == socket.username){ 
				users[obj].room = socket.room;
			}			
			if(users[obj].room == socket.room){
				inroom.push(users[obj].username);
			}
		}
		console.log(socket.room);
		console.log(inroom);
		// if the room is not random
		var roomin = socket.room;
		if(roomin == 'Random' || inroom.length > 1){
			socket.broadcast.to(socket.room).emit('updatechat','SERVER', "You can't delete this room");
		} else{
			//console.log(roomin);
			socket.leave(room);
			socket.emit('updatechat', 'SERVER', 'You have deleted ' + roomin);
			var index = rooms.indexOf(socket.room);
			if (index > -1) {
			    rooms.splice(index, 1);
			}
			socket.join('Random');
			// update users room
			socket.room = 'Random';
			for(var obj in users){
				if(users[obj].username == socket.username){ 
					users[obj].room = socket.room;
				}		
				if(users[obj].room == socket.room){
					inroom.push(users[obj].username);
				}
			}	
			io.sockets.emit('updaterooms', rooms, 'Random');
			socket.emit('updatechat', 'SERVER', 'You have now joined ' + socket.room);
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
