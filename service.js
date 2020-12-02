const fs = require("fs");
const express = require("express");
const Docker = require("dockerode");
const app = express();
app.use(express.json());
const dockerPort = 8080;
const serverPort = 8888;
const docker = new Docker("localhost", dockerPort);

const logOpts = {
  stderr: true,
  stdout: true,
  follow: false,
};
const attachOpts = {
  stream: true,
  stdout: true,
  stderr: true,
  logs: true,
  timestamps: true,
};

const filterRunOpts = {
  all: false,
  filters: { status: ["running"] },
}; 

collectRunningContLogs();

// function to get list of running containers and collect their logs
function collectRunningContLogs() {
  docker.listContainers(filterRunOpts, (err, containers) => {
    containers.forEach((container) => {
      attachAndGetLogs(container);
    });
  });
}

// function to attach to running containers and collect their logs
function attachAndGetLogs(container) {
  let currContainer = docker.getContainer(container.Id);
  let contFile = fs.createWriteStream(`logs_${currContainer.id}.txt`);
  currContainer.attach(attachOpts, (err, stream) => { 
    stream.pipe(contFile);
    if (err) {
      console.error(err);
      return;
    }
    stream.on('exit', function (process) {
      process.exit(process);
    });
  });
}

app.listen(serverPort, () => {
  console.log(`listening at http://localhost:port${serverPort}`);
});


// response to client request for a list of running containers
app.get("/list", (req, res) => {
  docker.listContainers(filterRunOpts, (err, containers) => {
    let fileName = `container_list.txt`;
    fs.writeFile(fileName, "List of running containers: \n", (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    containers.forEach((container) => {
      let content = `\nName: ${container.Names} - ID: ` + container.Id;
      fs.appendFile(fileName, content, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    });
    
    fs.readFile(fileName, (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.write(data);
      return;
    });
  });
});

// response to client request for logs of specific container
app.get("/logs", (req, res) => {
  let reqParamId = req.query.id;
  fs.readFile(`logs_${reqParamId}.txt`, (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(data);
    return;
  });
});