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
        resetMachine(); // Reset the machine on request failure
      }
    });
  } catch (error) {
    console.log('An error occurred:', error);
    resetMachine(); // Reset the machine on error
  }
}

function resetMachine() {
  // Perform necessary actions to restart the machine
  console.log('Restarting the machine...');
  process.exit(1); // Restart the process
}

mqttClient.on('error', (error) => {
  console.log('MQTT error:', error);
  resetMachine(); // Reset the machine on MQTT error
});

mqttClient.on('reconnect', () => {
  console.log('Reconnecting to MQTT broker...');
});

mqttClient.on('close', () => {
  console.log('MQTT connection closed.');
  resetMachine(); // Reset the machine when MQTT connection is closed
});

mqttClient.on('offline', () => {
  console.log('MQTT client is offline.');
  resetMachine(); // Reset the machine when MQTT client is offline
});

setInterval(() => {
  if (mqttClient.connected) {
    fetchDataAndPublish();
  } else {
    console.log('MQTT client is not connected.');
    resetMachine(); // Reset the machine when MQTT client is not connected
  }
}, 9000);

// Clear console output
console.clear();
