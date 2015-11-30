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
var globalusers = [];

// rooms which are currently available in chat
var rooms = ['Random'];
io.sockets.on('connection', function (socket) {
	
	/*	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username, password){
		// store the username in the socket session for this client
		socket.username = username;
		socket.password = password;		
		socket.room = 'Random';

		// add the client's user details to a user object
		var user = [];
		user.username = username;
		user.room = socket.room;
		user.password = password;
		user.id = socket.id;

		//add the user object to the global list
		users.push(user);
		globalusers.push(user);

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
	});*/

	socket.on('login', function(userattempt, pwattempt){
		
		// First user
		if(globalusers.length == 0){
			// anyone else
			socket.username = userattempt;
			socket.password = pwattempt;
			adduser(userattempt, pwattempt);
		} 
		else{
			var flag = false;
			var index = -1;
			for(g in globalusers){
				// if they already online
				if(users.length > 0 ){
					for(h in users){
						if(users[h].username == userattempt){	// username already online
							flag = true;
						} 
					}
				}
				else if(globalusers[g].username == userattempt && globalusers[g].password == pwattempt){	// username exists, but not online
					index = g;
				}
				else if(globalusers[g].username == userattempt){ // same username, but not pw
					flag = true;
				}
			}
			// check to see the instruction
			if(flag == true){
				socket.emit('retry');
			}else{
				if(index > -1){
					adduser(globalusers[g].username, globalusers[g].password);
					socket.emit('updatechat', 'SERVER', "Welcome back");
				}else{
					adduser(userattempt, pwattempt);
				}
			}
		}
	});

	socket.on('androidlogin', function(userattempt, pwattempt){
		// First user
		if(globalusers.length == 0){
			// anyone else
			socket.username = userattempt;
			socket.password = pwattempt;
			adduser(userattempt, pwattempt);
		} 
		else{
			var flag = false;
			var index = -1;
			for(g in globalusers){
				// if they already online
				if(users.length > 0 ){
					for(h in users){
						if(users[h].username == userattempt){	// username already online
							flag = true;
						} 
					}
				}
				else if(globalusers[g].username == userattempt && globalusers[g].password == pwattempt){	// username exists, but not online
					index = g;
				}
				else if(globalusers[g].username == userattempt){ // same username, but not pw
					flag = true;
				}
			}
			// check to see the instruction
			var success = "";
			if(flag == true){
				success = "false";
				socket.emit('onlogin', success);
			}else{
				if(index > -1){
					adduser(globalusers[g].username, globalusers[g].password);
					socket.emit('updatechat', 'SERVER', "Welcome back");
				}else{
					adduser(userattempt, pwattempt);
				}
				socket.emit('onlogin', success);
			}
		}
	});

	function adduser(username, password){
		// store the username in the socket session for this client
		socket.username = username;
		socket.password = password;		
		socket.room = 'Random';

		// add the client's user details to a user object
		var user = [];
		user.username = username;
		user.room = socket.room;
		user.password = password;
		user.id = socket.id;

		//add the user object to the global list
		users.push(user);

		// should probably cheeck to see if user exisats already on global list
		var flag = false;
		for(n in globalusers){
			if(globalusers[g] == username){
				flag = true;
			}
		}
		if(flag == false){
			globalusers.push(user);
		}

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
	}

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		//check to see if the user sends the ./help first
		if(data.indexOf("./help") > -1 || data.indexOf("./h") > -1){
			console.log(socket.id);
			console.log(socket.username);	
			socket.emit('updatechat', 'HELP',
				"This is a help function, only you can see it.");
		} else if(data.indexOf("~meow~") > -1 || data.indexOf(":meow:") > -1){
			io.sockets.in(socket.room).emit('updatechat', 'CAT LORD', "=^.^=");
		}
		else{
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
		// check if room exists
		for(p in rooms){
			if(rooms[p].indexOf(newroom) > -1){
				newroom = newroom + ".1";
			}
		}
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
		for(k in users){
			socket.broadcast.to(users[k].id).emit('updaterooms', rooms, users[k].room);
		}
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
				socket.broadcast.to(users[obj].id).emit('updaterooms', rooms, users[obj].room);
			}	
			socket.emit('updaterooms', rooms, 'Random');
			socket.emit('updatechat', 'SERVER', 'You have now joined ' + socket.room);
		}
	});
});
