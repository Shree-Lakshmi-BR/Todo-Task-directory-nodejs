let http = require('http');
let fs = require('fs');
let path = require('path');

let getTasks = () => {
  let data = fs.readFileSync(path.join(__dirname, './tasks.json'));
  return JSON.parse(data);
};
let saveTasks = (tasks) => {
  fs.writeFileSync(path.join(__dirname, './tasks.json'), JSON.stringify(tasks));
};

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/task") {
    let tasks = getTasks();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(tasks));
  } else if (req.method === "POST" && req.url === "/task") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      let { task, time } = JSON.parse(body);
      if (!task || !time) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Task and time are required" }));
        return;
      }
      let tasks = getTasks();
      let newTask = { id: Date.now(), task, time };
      tasks.push(newTask);
      saveTasks(tasks);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newTask));
    });
  } else if (req.method === "PUT" && req.url.startsWith("/task/")) {
    let id = parseInt(req.url.split("/")[2]);
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      let { task, time } = JSON.parse(body);
      if (!task || !time) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Task and time are required" }));
        return;
      }
      let tasks = getTasks();
      let taskIndex = tasks.findIndex((t) => t.id === id);
      if (taskIndex === -1) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Task not found" }));
        return;
      }
      tasks[taskIndex] = { id, task, time };
      saveTasks(tasks);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(tasks[taskIndex]));
    });
  } else if (req.method === "DELETE" && req.url.startsWith("/task/")) {
    let id = parseInt(req.url.split("/")[2]);
    let tasks = getTasks();
    let newtasks = tasks.filter((b) => b.id !== id);
    if (tasks.length === newtasks.length) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Book not found" }));
      return;
    }
    saveTasks(newtasks);
    res.writeHead(204);
    res.end();
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(5000, () => {
  console.log("Server is listening on port :http://localhost:5000");
});