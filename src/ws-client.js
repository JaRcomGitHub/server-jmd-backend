const WebSocket = require("ws");
const fs = require("fs/promises");
const path = require("path");

//s. если запускать файл сам по себе
// const dotenv = require("dotenv");
// dotenv.config();
// const { WS_URL_PORT } = process.env;
//e. если запускать файл сам по себе

// const DEVICES_FILE = "devices-data.json";
// const devices = require("./devices-data.json");
const DIRECTORY_PATH_TO_FILES = "../../logs_ppk/";
const DEVICES_FILE = "devices-buf-data.json";
const devices = require(DIRECTORY_PATH_TO_FILES + DEVICES_FILE);

function wsClientListen(ws_port) {
  let ws = connectToWebSocket(ws_port);

  setInterval(() => {
    // check connect ws if(3=CLOSED) The connection is closed or couldn't be opened.
    if (ws?.readyState === 3) {
      // try reconnect to ws
      ws = connectToWebSocket();
    }
    // console.log(devices);
    //dataWorking(devices);
  }, 10000); // every 10 sec check connect ws and try reconnect to ws
}

// wsClientListen(WS_URL_PORT); // если запускать файл сам по себе
module.exports = { wsClientListen, devices }; // если в связке

let status_ws = null;
function connectToWebSocket(ws_port) {
  let ws = new WebSocket(ws_port);

  ws.onerror = function (error) {
    if (status_ws !== false) {
      status_ws = false;
      // console.log("ws.onerror", new Date().toISOString());
      consoleLogToFile("ws onerror " + new Date().toISOString());
    }
  };

  ws.onopen = function (e) {
    if (status_ws !== true) {
      status_ws = true;
      // console.log("ws.onopen", new Date().toISOString());
      consoleLogToFile("ws onopen " + new Date().toISOString());
    }
  };

  ws.onmessage = (e) => {
    dataAddToLogFile(e.data);
    // console.log("ws: " + e.data);
    const values = strParseJson(e.data);
    // console.log(values);
    addDataToDevice(values);
  };

  return ws;
}

async function dataAddToLogFile(content) {
  const filename = getCurrentDate() + ".log";
  const logFile = path.resolve(__dirname, "../logs", filename);
  try {
    await fs.appendFile(logFile, content + "\n");
  } catch (err) {
    console.log(err);
  }
}

function getCurrentDate() {
  return new Date()
    .toISOString()
    .replace("-", "")
    .replace("-", "")
    .replace(/\T.+/, "");
}

async function consoleLogToFile(content) {
  const filename = "console.log";
  const logFile = path.resolve(__dirname, "logs", filename);
  try {
    await fs.appendFile(logFile, content + "\n");
  } catch (err) {
    console.log(err);
  }
}

function strParseJson(strJSON) {
  const obj = JSON.parse(strJSON);
  const str = obj.diag;
  const { did, time } = obj;
  const aSN = str.match("(?<=SN:)[0-9a-fA-F]*");
  const aver = str.match("(?<=ver:)[0-9.]*");
  const aid = str.match("(?<=id:)[0-9]*");
  const str2 = str.slice(aid.index);
  const temp = str2.match("(?<=, )");
  const msg = str2.slice(temp.index);

  const sn = aSN ? aSN[0] : "";
  const ver = aver ? aver[0] : "";
  const id = aid ? aid[0] * 1 : "";

  const data = { ppk: did, time, sn, ver, id, msg };
  return data;
}

function addDataToDevice(data) {
  const { ppk, time, sn, ver, id, msg } = data;

  // // кусок временно для отладки - отображение времени сообщения
  // const date = new Date(time * 1000);
  // // console.log(date.toISOString());
  // var hours = date.getHours(); // Hours part from the timestamp
  // var minutes = "0" + date.getMinutes(); // Minutes part from the timestamp
  // var seconds = "0" + date.getSeconds(); // Seconds part from the timestamp
  // // Will display time in 10:30:23 format
  // var formattedTime =
  //   hours + ":" + minutes.substr(-2) + ":" + seconds.substr(-2);
  // console.log(formattedTime, ppk, sn, msg);

  if (!devices.hasOwnProperty(ppk)) {
    devices[ppk] = { [sn]: { ver, id, msgs: [time, msg] } };
  } else {
    const d = devices[ppk];
    if (!d.hasOwnProperty(sn)) {
      devices[ppk] = { [sn]: { ver, id, msgs: [time, msg] } };
    } else {
      d[sn].ver = ver;
      d[sn].id = id;
      d[sn].msgs.push(time, msg);
      const size = d[sn].msgs.length;
      const maxsize = 10 * 2; // сообщение состоит из времени и строки
      if (size > maxsize) {
        for (let index = 0; index < size - maxsize; index++) {
          d[sn].msgs.shift();
        }
      }
      //d[sn].msgl = d[sn].msgs.length / 2; // текущее количество сообщений
    }
    devices[ppk] = { ...devices[ppk], ...d };
  }
}

// async function dataWorking(obj) {
//   const dataFile = path.resolve(__dirname, ".", DEVICES_FILE);
//   const content = JSON.stringify(obj, null, " ");
//   try {
//     await fs.writeFile(dataFile, content + "\n");
//   } catch (err) {
//     console.log(err);
//   }
// }
