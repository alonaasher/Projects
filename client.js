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
  EXIT: "exit",
};

console.log("Welcome to our logging service. Please enter command");
rl.on("line", (cmd) => {
  if (cmd.localeCompare(commands.GETLIST) === 0) {
    reqContainerList();
  } else if (cmd.localeCompare(commands.GETLOGS) === 0) {
    rl.question("enter container id ", function (id) {
      reqContainerLogs(id);
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
  
  reqFromServer(getListOpts);
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
  
  reqFromServer(getLogsOpts);
}

function reqFromServer(options){
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