const { Kafka } = require('kafkajs');

const bootstrapServers = process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092';
const topic = process.env.KAFKA_TOPIC || 'pedidos-creados';
const groupId = process.env.KAFKA_GROUP_ID || 'order-events-group';

const kafka = new Kafka({ brokers: bootstrapServers.split(',') });
const consumer = kafka.consumer({ groupId });

async function start() {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  console.log(`order-events-worker conectado a Kafka: ${bootstrapServers}`);
  console.log(`Suscrito al topic: ${topic} con groupId: ${groupId}`);

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const value = message.value ? message.value.toString() : null;
      let event = null;

      try {
        event = value ? JSON.parse(value) : null;
      } catch (error) {
        console.error('Mensaje Kafka no es JSON válido:', value);
        return;
      }

      console.log('Evento recibido:', {
        topic,
        partition,
        offset: message.offset,
        event,
      });
    },
  });
}

start().catch((error) => {
  console.error('Error arrancando order-events-worker:', error);
  process.exit(1);
});
