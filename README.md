Project name: Logging service
Developer: Alona Asher
Last Updated: December 2, 2020

In order to start the service, please run "service.js" in node.js.
This will get the server to start running and responding to requests from the user.
It will also start listening to running containers and collect their logs.

In order to send requests to the logging service, run "client.js" in node.js.
The user will be asked to enter a command.
The following commands are available:
1. get list - will return a list of running containers.
2. get logs - the user will be asked to insert a container id. 
   The logs of the requested container will be returned.
3. exit - will terminate the service.   

To Improve: 
1. Storage at MongoDb
2. Support logs filters

