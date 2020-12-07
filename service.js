const fs = require("fs");
const express = require("express");
const Docker = require("dockerode");
const app = express();
app.use(express.json());
const dockerPort = 8888;
const serverPort = 8080;
const docker = new Docker("localhost", dockerPort);
let labelToFollow; 

const attachOpts = {
  stream: true,
  stdout: true,
  stderr: true,
  logs: true,
  timestamps: true,
};

const runningContOpts = {
  all: false,
  filters:{ 
    status: ["running"] 
  },
}; 

app.post("/setLabel", (req, res) => {
  labelToFollow = req.body.label;
  attachToLabeledContainers({
    all: false,
    filters:{ 
      status: ["running"], 
      label: [labelToFollow] 
    }
  });
  res.end("label set");
});

function attachToLabeledContainers(labelOpts) {
  docker.listContainers(labelOpts, (err, containers) => {
    containers.forEach((currContainer) => {
      let writeStream = fs.createWriteStream(`logs_${currContainer.Id}.txt`);
      docker.getContainer(currContainer.Id).attach(attachOpts, (err, stream) => { 
        stream.pipe(writeStream);
        if (err) {
          console.error(err);
          return;
        }
        stream.on('exit', (process) => {
          writeStream.end();
          process.exit(process);
        });
      });
    });
  });
}

app.get("/logs", (req, res) => {
  let reqParamId = req.query.id;
  fs.readFile(`logs_${reqParamId}.txt`, (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
    return;
  });
});

app.get("/list", (req, res) => {
  docker.listContainers(runningContOpts, (err, containers) => {
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
      res.end(data);
      return;
    });
  });
});

app.listen(serverPort, () => {
  console.log(`listening at http://localhost:port${serverPort}`);
});