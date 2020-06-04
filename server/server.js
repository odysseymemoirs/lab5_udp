var server = require("dgram").createSocket("udp4").bind(9000);

var chatRooms = {};
// room1
chatRooms['room1'] = [];
chatRooms['room1_chat'] = [];

const myFunctionList = {}; 

server.on("listening", () => {
  console.log(`Listening on port ${server.address().port}`);
});

server.on("message", (data) => {
  data = JSON.parse(data.toString("utf-8"));
  var dd = JSON.parse(data.d);

  try {
    myFunctionList[data.f](dd);
  } catch (err) {
    console.log(err);
    console.log(`ERROR: The function "${data.f}" doesn't exist`);
  }
});


// sending messages to client

function UDP(func, data = null) {
  var message = Buffer.from(JSON.stringify({
    "f": func,
    "d": data
  }));

  server.send(message, 0, message.length, 9001, "localhost");
  server.send(message, 0, message.length, 9002, "localhost");
}


myFunctionList.JoinRoom = (data) => {

  chatRooms['room1'].push(data.name);
  UDP("UpdateRooms", chatRooms);
}

myFunctionList.Message = (data) => {

  chatRooms['room1_chat'].push({
    name: data.name,
    message: data.message
  });

  UDP("UpdateRooms",{
    name: data.name,
    message: data.message
  } );

}

