// Requerir el cliente de Kafka
const { Kafka } = require('kafkajs');

// Estacblecer las variables de entorno
const bootstrapServers = process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092';
const topic = process.env.KAFKA_TOPIC || 'pedidos-creados';
const groupId = process.env.KAFKA_GROUP_ID || 'order-events-group';

// Crear el cliente de Kafka y el consumidor
const kafka = new Kafka({ brokers: bootstrapServers.split(',') });
const consumer = kafka.consumer({ groupId });

// Función principal para iniciar el consumidor y procesar los mensajes
async function start() {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  console.log(`order-events-worker conectado a Kafka: ${bootstrapServers}`);
  console.log(`Suscrito al topic: ${topic} con groupId: ${groupId}`);

  // Procesar mensajes de Kafka
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const value = message.value ? message.value.toString() : null;
      let event = null;

      // Validar el mensaje
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

// Manejo de errores
start().catch((error) => {
  console.error('Error arrancando order-events-worker:', error);
  process.exit(1);
});
