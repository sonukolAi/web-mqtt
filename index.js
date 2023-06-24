const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const mqtt = require('mqtt');

const app = express();
const port = process.env.PORT || 330;

const sources = {
  google: {
    url: (num) => `https://www.google.com/search?q=${num}+train+running+status`,
    processData: async ($, res) => {
      try {
        const train = $('div.k9rLYb').eq(0).text().trim();
        const status = $('div.dK1Bub .rUtx7d').eq(1).text();
        const delay = $('div.Rjvkvf.MB86Dc').eq(1).text().trim();
        const currentTime = new Date().toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: 'numeric',
          minute: 'numeric',
        });
        res.json({ train, status, delay, currentTime });
      } catch (error) {
        console.error(error);
        res.status(500).send('Error occurred');
      }
    },
  },
};

app.get('/:num', async (req, res) => {
  try {
    const { num } = req.params;
    const selectedSource = sources.google;

    if (!selectedSource) {
      return res.status(400).send('Invalid source');
    }

    const url = selectedSource.url(num);
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
      },
    });

    const $ = cheerio.load(data);
    await selectedSource.processData($, res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred');
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

const brokerUrl = 'mqtt://broker.hivemq.com';
const topic = 'mytopic';

const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe(topic);
});

client.on('message', (topic, message) => {
  console.log(`Received message on topic ${topic}: ${message.toString()}`);
});

client.on('error', (error) => {
  console.error('Error:', error);
});

function publishMessage(topic, message) {
  client.publish(topic, message);
  console.log(`Published message on topic ${topic}: ${message}`);
}

publishMessage(topic, '!Hello, HiveMQ!');

setInterval(() => {
  publishMessage(topic, '!hi i am server');
}, 5000);

function cleanUp() {
  client.unsubscribe(topic);
  client.end();
  console.log('Unsubscribed and disconnected');
}
