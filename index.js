const mqtt = require('mqtt');

// MQTT broker details
const brokerUrl = 'mqtt://broker.hivemq.com';
const topic = 'mytopic';

// Create a client instance
const client = mqtt.connect(brokerUrl);

// Handle successful connection
client.on('connect', () => {
  console.log('Connected to MQTT broker');
});

// Handle connection errors
client.on('error', (error) => {
  console.error('Error:', error);
  client.end();
});

// Publish a message every 10 seconds
setInterval(() => {
  const message = '!Hello, HiveMQ!';
  client.publish(topic, message, (error) => {
    if (error) {
      console.error('Failed to publish message:', error);
    } else {
      console.log('Message published:', message);
    }
  });
}, 10000);
