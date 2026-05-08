// Requerir el servicio para la API Rest y el cliente de Kafka
const express = require('express');
const { Kafka } = require('kafkajs');

// Configuración de los puertos y variables de entorno
const port = process.env.PORT || 3000;
const bootstrapServers = process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092';
const topic = process.env.KAFKA_TOPIC || 'pedidos-creados';

// Crear el cliente de Kafka y el productor
const kafka = new Kafka({ brokers: bootstrapServers.split(',') });
const producer = kafka.producer();

const app = express();
app.use(express.json());

// Endpoint POST /orders
app.post('/orders', async (req, res) => {
  // Validar el pedido recibido
  const order = req.body;
  if (!order || Object.keys(order).length === 0) {
    return res.status(400).json({ error: 'El pedido no puede estar vacío' });
  }

  // Construir el evento
  const event = {
    type: 'PedidoCreado',
    timestamp: new Date().toISOString(),
    payload: order,
  };

  // Publicar el evento en Kafka
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(event) }],
    });

    return res.status(201).json({ status: 'Pedido enviado', event });
  } catch (error) {
    console.error('Error enviando evento a Kafka:', error);
    return res.status(500).json({ error: 'No se pudo publicar el evento' });
  }
});

// Función principal para iniciar el servidor
async function start() {
  await producer.connect();
  app.listen(port, () => {
    console.log(`orders-api iniciado en http://0.0.0.0:${port}`);
    console.log(`Kafka brokers: ${bootstrapServers}`);
    console.log(`Kafka topic: ${topic}`);
  });
}

start().catch((error) => {
  console.error('Error arrancando orders-api:', error);
  process.exit(1);
});
