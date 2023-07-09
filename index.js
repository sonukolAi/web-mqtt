const mqtt = require('mqtt');
const request = require('request');
const { v4: uuidv4 } = require('uuid');

// MQTT settings
const BROKER = 'broker.hivemq.com';
const TOPIC_NUM = 'train-num-render';
const SEND_DATA_TOPIC = 'train-render';

const CLIENT_ID = 'esp8266_' + uuidv4();

let trainNum = '15017/2'; // Default train number

function connectToMQTT() {
  const mqttClient = mqtt.connect(`mqtt://${BROKER}`, {
    clientId: CLIENT_ID,
  });

  mqttClient.on('connect', () => {
    mqttClient.subscribe(TOPIC_NUM, (err) => {
      if (err) {
        console.log('Subscription error:', err);
      } else {
        console.log('Subscribed to', TOPIC_NUM);
      }
    });
  });

  mqttClient.on('message', (topic, message) => {
    if (topic === TOPIC_NUM) {
      trainNum = message.toString();
      console.log('Train number updated:', trainNum);
    }
  });

  mqttClient.on('error', (error) => {
    console.log('MQTT error:', error);
    mqttClient.end();
    reconnectToMQTT();
  });

  mqttClient.on('close', () => {
    console.log('MQTT connection closed.');
    mqttClient.end();
    reconnectToMQTT();
  });

  mqttClient.on('offline', () => {
    console.log('MQTT client is offline.');
    mqttClient.end();
    reconnectToMQTT();
  });

  mqttClient.on('reconnect', () => {
    console.log('Reconnecting to MQTT broker...');
  });

  setInterval(() => {
    if (mqttClient.connected) {
      fetchDataAndPublish(mqttClient);
    } else {
      console.log('MQTT client is not connected.');
      mqttClient.end();
      reconnectToMQTT();
    }
  }, 9000);

  return mqttClient;
}

function fetchDataAndPublish(mqttClient) {
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

function reconnectToMQTT() {
  setTimeout(() => {
    console.log('Reconnecting to MQTT broker...');
    connectToMQTT();
  }, 5000); // Wait for 5 seconds before reconnecting
}

// Start the initial MQTT connection
console.clear();
connectToMQTT();
