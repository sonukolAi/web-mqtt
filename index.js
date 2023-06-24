const mqtt = require('mqtt');

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
publishMessage('mytopic', '!Hello, HiveMQ!');

// Schedule message publication every 5 seconds
setInterval(() => {
  publishMessage('mytopic', '!hi i am server');
}, 10000);

// Unsubscribe and disconnect gracefully when you're done
function cleanUp() {
  client.unsubscribe('mytopic');
  client.end();
  console.log('Unsubscribed and disconnected');
}

// Uncomment the line below if you want to automatically disconnect after 20 seconds
// setTimeout(cleanUp, 20000);
