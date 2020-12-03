const http = require("follow-redirects").http;
const readline = require("readline");
const serverPort = 8080;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const commands = {
  GETLIST: "get list",
  GETLOGS: "get logs",
  ADDCONT: "add",
  REMOVECON: "remove",
  EXIT: "exit"
};

console.log("Welcome to our logging service. Please enter command");
rl.on("line", (cmd) => {
  if (cmd.localeCompare(commands.GETLIST) === 0) {
    reqContainerList();
  } else if (cmd.localeCompare(commands.GETLOGS) === 0) {
    rl.question("enter container id ", function (id) {
      reqContainerLogs(id);
    });
  } else if (cmd.localeCompare(commands.ADDCONT) === 0) {
    rl.question("enter container id ", function (id) {
      addContainer(id);
    });
  } else if (cmd.localeCompare(commands.REMOVECON) === 0) {
      rl.question("enter container id ", function (id) {
        removeContainer(id);
    });
  } else if (cmd.localeCompare(commands.EXIT) === 0) {
    rl.close();
  }
});

rl.on("close", () => {
  console.log("\nThanks for using our service");
});

function reqContainerList() {
  const getListOpts = {
    method: "GET",
    hostname: "localhost",
    port: serverPort,
    path: "/list",
    headers: {},
    maxRedirects: 20,
  };
  
  getReqFromServer(getListOpts);
}

function reqContainerLogs(id) {
  const getLogsOpts = {
    method: "GET",
    hostname: "localhost",
    port: serverPort,
    path: `/logs?id=${id}`,
    headers: {},
    maxRedirects: 20,
  };
  
  getReqFromServer(getLogsOpts);
}

function addContainer(id) {
  let dataToPost = JSON.stringify({"id":`${id}`});
  const addContOpts = {
    'method': 'POST',
    'hostname': 'localhost',
    'port': serverPort,
    'path': '/add',
    'headers': { 'Content-Type': 'application/json' },
    'maxRedirects': 20
  };

  postReqToServer(addContOpts, dataToPost);                                                                             
}

function removeContainer(id){
  const dataToDelete = JSON.stringify({"id":`${id}`});
  const removeContOpt = {
    'method': 'DELETE',
    'hostname': 'localhost',
    'port': serverPort,
    'path': '/remove',
    'headers': { 'Content-Type': 'application/json' },
    'maxRedirects': 20
  }
  
  deleteReqToServer(removeContOpt, dataToDelete);
}

function deleteReqToServer(options, dataToDelete){
  let req = http.request(options, function (res) {
    let chunks = [];  
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });
    res.on("end", function (chunk) {
      let body = Buffer.concat(chunks);
      console.log(body.toString());
    });
    res.on("error", function (error) {
      console.error(error);
    });
  });
  req.setHeader('Content-Length', dataToDelete.length);
  req.write(dataToDelete);
  req.end();
}

function postReqToServer(options, dataToPost){
  let req = http.request(options, function (res) {
    let chunks = [];
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });
    res.on("end", function (chunk) {
      let body = Buffer.concat(chunks);
      console.log(body.toString());
    });
    res.on("error", function (error) {
      console.error(error);
    });
  });
  req.write(dataToPost);
  req.end();
}

function getReqFromServer(options){
  let req = http.request(options, (res) => {
    let chunks = [];
    res.on("data", (chunk) => {
      chunks.push(chunk);
    });
    res.on("end", (chunk) => {
      let body = Buffer.concat(chunks);
      console.log(body.toString());
    });
    res.on("error", (error) => {
      console.error(error);
    });
  });
  req.end();
}