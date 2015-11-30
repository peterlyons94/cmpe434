<h1>CMPE 434 chatroom using socket.io</h1>

<h3>Server Installation Instructions: </h3>

1. Clone repository into a folder on a Linux machine. 
2. Run the following commands inside the folder
	
	```
	sudo apt-get install npm
	sudo apt-get install nodejs-legacy
	npm install .
	node app.js
	```

3. The server should be up and running. 
	- Make sure that in the index.html file, and within the android app that the correct IP address is listed. 
	- For demonstration purposes it has been pointed towards a host on DigitalOcean, but for localized testing please change the addresses in both the index.html file and in the anroid client to localhost:8080.

<h3>Features: </h3>

1. Multi-room chat
2. Ability to create a username and password
	- Simple Login Validation
3. Ability to create a new chatroom, or delete an old one
4. Send messages to one or many users
5. See active chatrooms and active users within the chat room
6. Help function by typing "./h or ./help"


<h3>Android Client Install Instructions: </h3>

1. Open Android Studio and select import project
2. Navigate to where the ``` android_client ``` is stored and select the project
3. Ensure that Intel Virtualization technology is enabled. If it not, find a tutorial online.
4. Make sure that the correct IP address is listed in the constants file.
5. Run emulator & enjoy.


Project by: Peter Lyons, Hannah Iacono.