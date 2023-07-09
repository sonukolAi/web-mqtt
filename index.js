const mqtt = require('mqtt');
const request = require('request');
const { v4: uuidv4 } = require('uuid');

// MQTT settings
const BROKER = 'broker.hivemq.com';
const TOPIC_NUM = 'train-num-render2';
const SEND_DATA_TOPIC = 'train-render2';

const CLIENT_ID = 'esp8266_' + uuidv4();

const mqttClient = mqtt.connect(`mqtt://${BROKER}`, {
  clientId: CLIENT_ID,
});

let trainNum = '15017/2'; // Default train number

function onMessage(topic, message) {
  if (topic === TOPIC_NUM) {
    trainNum = message.toString();
  }
}

mqttClient.on('connect', () => {
  mqttClient.subscribe(TOPIC_NUM, (err) => {
    if (err) {
      console.log('Subscription error:', err);
    } else {
      console.log('Subscribed to', TOPIC_NUM);
    }
  });
});

mqttClient.on('message', onMessage);

function fetchDataAndPublish() {
  try {
    request.get(`https://nodejs--sonukol.repl.co/${trainNum}`, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        mqttClient.publish(SEND_DATA_TOPIC, body.toString(), (err) => {
          if (err) {
            console.log('Publishing error:', err);
          } else {
            console.log('Data published:', body);
          }
        });
      } else {
        console.log('Request failed:', error);
      }
    });
  } catch (error) {
    console.log('An error occurred:', error);
  }
}

mqttClient.on('error', (error) => {
  console.log('MQTT error:', error);
});

mqttClient.on('reconnect', () => {
  console.log('Reconnecting to MQTT broker...');
});

mqttClient.on('close', () => {
  console.log('MQTT connection closed.');
});

mqttClient.on('offline', () => {
  console.log('MQTT client is offline.');
});

setInterval(() => {
  if (mqttClient.connected) {
    fetchDataAndPublish();
  } else {
    console.log('MQTT client is not connected.');
  }
}, 9000);
