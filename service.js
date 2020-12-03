const fs = require("fs");
const express = require("express");
const Docker = require("dockerode");
const app = express();
app.use(express.json());
const dockerPort = 8888;
const serverPort = 8080;
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
  filters:{ 
    status: ["running"] 
  },
}; 

// client request for registering a new container
app.post("/add", (req, res) => {
  let newId = req.body.id;
  attachAndGetLogs(newId);
  res.end("container added");
});

// client request for deleting a container from the service
app.delete("/remove", (req, res) => {
  let idToRemove = req.body.id;
  removeContainer(idToRemove);
  res.end("container removed");
});

// client request for logs of specific container
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

// client request for list of running containers
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
      res.end(data);
      return;
    });
  });
});


// function to attach to a container and collect its logs
function attachAndGetLogs(containerId) {
  let currContainer = docker.getContainer(containerId);
  let writeStream = fs.createWriteStream(`logs_${currContainer.id}.txt`);
  currContainer.attach(attachOpts, (err, stream) => { 
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
}

function removeContainer(idToRemove){
  let currContainer = docker.getContainer(idToRemove);
  currContainer.remove(() => {
    let fileName = `logs_${idToRemove}.txt`;
    fs.unlinkSync(fileName);
    console.log("log file removed");
  });  
}

app.listen(serverPort, () => {
  console.log(`listening at http://localhost:port${serverPort}`);
});