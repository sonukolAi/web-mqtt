const mqtt = require('mqtt');
const request = require('request');
const { v4: uuidv4 } = require('uuid');

// MQTT settings
const BROKER = 'broker.hivemq.com';
const TOPIC_NUM = 'train-num-render';
const SEND_DATA_TOPIC = 'train-render';

const CLIENT_ID = 'esp8266_' + uuidv4();

const mqttClient = mqtt.connect(`mqtt://${BROKER}`);

let trainNum = '11706/1'; // Default train number

function onMessage(topic, message) {
  if (topic === TOPIC_NUM) {
    trainNum = message.toString();
  }
}

mqttClient.on('connect', () => {
  mqttClient.subscribe(TOPIC_NUM);
});

mqttClient.on('message', onMessage);

function fetchDataAndPublish() {
  try {
    request.get(`https://nodejs--sonukol.repl.co/${trainNum}`, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        mqttClient.publish(SEND_DATA_TOPIC, body);
        console.log(body);
      } else {
        console.log('Request failed:', error);
      }
    });
  } catch (error) {
    console.log('An error occurred:', error);
  }
}

setInterval(() => {
  mqttClient.emit('check');
  fetchDataAndPublish();
}, 5000);
