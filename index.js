const fetch = require('node-fetch');
const mqtt = require('mqtt');

// MQTT settings
const BROKER = "mqtt://broker.hivemq.com";
const TOPIC_NUM = "train-num";
const SEND_DATA_TOPIC = "trainn";

const CLIENT_ID = "esp8266_" + Math.floor(Math.random() * 100000);

const mqttClient = mqtt.connect(BROKER);
let trainNum = "11706/1";  // Default train number

function onMessage(topic, message) {
  if (topic === TOPIC_NUM) {
    trainNum = message.toString();
  }
}

function connectWifi() {
  console.log("Connecting to Wi-Fi...");
  // Implement your Wi-Fi connection logic here
  // This can vary depending on the Node.js environment you are using
}

function checkWifiConnection() {
  try {
    // Implement MQTT check_msg() method here if necessary
    fetch(`https://nodejs--sonukol.repl.co/${trainNum}`)
      .then(response => {
        if (response.status === 200) {
          return response.text();
        } else {
          throw new Error('HTTP request failed');
        }
      })
      .then(data => {
        mqttClient.publish(SEND_DATA_TOPIC, data);
        console.log(data);
      })
      .catch(error => {
        console.error("An error occurred:", error);
        // Handle error by resetting the device or taking appropriate action
      });
  } catch (error) {
    console.error("An error occurred:", error);
    // Handle error by resetting the device or taking appropriate action
  }
}

mqttClient.on('connect', () => {
  console.log("MQTT connected");
  mqttClient.subscribe(TOPIC_NUM);
});

mqttClient.on('message', onMessage);

connectWifi();

setInterval(() => {
  try {
    checkWifiConnection();
  } catch (error) {
    console.error("An error occurred:", error);
    // Handle error by resetting the device or taking appropriate action
  }
}, 3000);
