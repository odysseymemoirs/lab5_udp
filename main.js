var {app, BrowserWindow,} = require("electron");
var path = require("path");
var url  = require("url");

require("electron-reload")(__dirname + "/app/index.html", {
  electron: path.join(__dirname, "node_modules", ".bin", "electron")
});


app.on("ready", () => {
  win = new BrowserWindow({width: 800, height: 600, webPreferences: {nodeIntegration: true}});
  win.loadURL(url.format({
    "pathname": path.join(__dirname, "/index.html"),
    "protocol": "file:",
    "slashes" : true
  }));


  // Emitted when the window is closed.
  win.on("closed", () => {
    win = null;
  });
});


var myFunctionList = {}; // In the future, have a module create the object?

//  messages from window

app.on("message", (data) => {
  try{
    myFunctionList[data.f](data.d);
  }catch(err){
    console.log(`ERROR: The function "${data.f}" doesn't exist`);
  }
});

//  messages from server

var client = require("dgram").createSocket("udp4").bind(process.env.port);

client.on("listening", () => {
  console.log(`Listening on port ${client.address().port}`);
});

client.on("message", async(message) => {
  var data = JSON.parse(message.toString("utf-8"));
  try{
    myFunctionList[data.f](data.d);
  }catch(err){
    console.log(err);
  }
});

// send messages to window

function SendMessage(func, data = null){
  win.webContents.send("message", {
    "f": func,
    "d": data
  });
}

// sending messages to server

function UDP(func, data = null){
  var message = Buffer.from(JSON.stringify({
    "f": func,
    "d": data
  }));

  client.send(message, 0, message.length, 9000, "localhost");
}


myFunctionList.UpdateRooms = (data) => {
  console.log(data);
  SendMessage("UpdateRooms", data);
}

myFunctionList.Message = (data) => {
  console.log('new message');
  UDP("Message", JSON.stringify({
    "name": data.name,
    "message": data.message,

  }));
}

myFunctionList.ChatMessage = (data) => {
  UDP("ChatMessage", data);
}
