const mqtt = require('mqtt');
const axios = require('axios');

// MQTT broker URL
const brokerUrl = 'mqtt://broker.hivemq.com';

// Create a client instance
const client = mqtt.connect(brokerUrl);

// Set up event handlers for connect, message, and error events
client.on('connect', () => {
  console.log('Connected to MQTT broker');

  // Subscribe to a topic when connected
  client.subscribe('mytopic');
});

client.on('message', (topic, message) => {
  console.log(`Received message on topic ${topic}: ${message.toString()}`);
});

client.on('error', (error) => {
  console.error('Error:', error);
});

// Publish a message to a topic
function publishMessage(topic, message) {
  client.publish(topic, message);
  console.log(`Published message on topic ${topic}: ${message}`);
}

// Example usage: publishing a message and subscribing to a topic
publishMessage('mytopic', 'Hello, HiveMQ!');

// Schedule message publication every 5 seconds
setInterval(() => {
  publishMessage('mytopic', 'Another message');
}, 5000);

// Unsubscribe and disconnect gracefully when you're done
function cleanUp() {
  client.unsubscribe('mytopic');
  client.end();
  console.log('Unsubscribed and disconnected');
}

// Handle incoming MQTT messages
client.on('message', (topic, message) => {
  console.log(`Received message on topic ${topic}: ${message.toString()}`);
});

// Send MQTT message after handling a request
function handleMessage(trainNum) {
  const SEND_DATA_TOPIC = 'data_topic';

  axios.get(`https://nodejs--sonukol.repl.co/${trainNum}`)
    .then((response) => {
      client.publish(SEND_DATA_TOPIC, response.data);
      console.log(response.data);
    })
    .catch((error) => {
      console.error('An error occurred:', error);
      process.exit(1); // Handle error by terminating the program
    });
}

(async function () {
  try {
    // Connect to WiFi
    await connectWifi();

    // Check WiFi connection every 2 seconds
    setInterval(checkWifiConnection, 2000);
  } catch (error) {
    console.log('An error occurred:', error);
    process.exit(1); // Handle error by terminating the program
  }
})();
