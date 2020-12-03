Project name: Logging service
Developer: Alona Asher
Last Updated: December 2, 2020

The service allows user to register containers to the service by calling "add", and the service will start to collect their logs and store them in a separate text file.
The user can unregister a container from the service by calling "remove",
which will cause the service to stop collectiong the container's logs.
User can get container's logs by calling "get logs". 

In order to start the service, please run "service.js" in node.js.
This will get the server to start running and responding to requests from the user.
In order to send requests to the logging service, run "client.js" in node.js.
The user will be asked to enter a command.
The following commands are available:
1. "get list" - will return a list of the running containers.
2. "get logs" - the user will be asked to insert a container id. 
   The logs of the requested container will be returned.
3. "add" - add a container to the service. the user will be asked to insert a container id.
4. "remove" - remove a container from the service. 
	the user will be asked to insert a container id.
5. "exit" - will terminate the service.   

To Improve: 
1. Storage at MongoDb
2. Support logs filters
3. using json files instead of text files

