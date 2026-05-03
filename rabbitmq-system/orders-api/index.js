const express = require('express');
const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672';
const QUEUE_NAME = 'pedidos';

let channel = null;

// Conexión a RabbitMQ con reintentos
async function connectRabbitMQ() {
  const maxRetries = 10;
  for (let i = 1; i <= maxRetries; i++) {
    try {
      console.log(`[orders-api] Intento ${i} de conexión a RabbitMQ...`);
      const connection = await amqp.connect(RABBITMQ_URL);
      channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      console.log(`[orders-api] Conectado a RabbitMQ. Cola '${QUEUE_NAME}' lista.`);
      return;
    } catch (err) {
      console.error(`[orders-api] Error conectando (intento ${i}):`, err.message);
      if (i < maxRetries) await new Promise(r => setTimeout(r, 3000));
    }
  }
  throw new Error('No se pudo conectar a RabbitMQ');
}

// Endpoint POST /orders
app.post('/orders', async (req, res) => {
  try {
    const { customerName, product, quantity } = req.body;

    // Validación básica
    if (!customerName || !product || !quantity) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan campos obligatorios: customerName, product, quantity'
      });
    }

    const orderId = 'ORD-' + Date.now();

    // Construir mensaje
    const message = {
      type: 'OrderCreatedMessage',
      orderId,
      customerName,
      product,
      quantity,
      createdAt: new Date().toISOString()
    };

    // Publicar en RabbitMQ
    channel.sendToQueue(
      QUEUE_NAME,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );

    console.log(`[orders-api] Mensaje publicado en cola '${QUEUE_NAME}':`, JSON.stringify(message));

    // Respuesta inmediata - NO espera al worker
    res.status(202).json({
      status: 'accepted',
      message: 'Pedido recibido y enviado a RabbitMQ',
      orderId
    });
  } catch (err) {
    console.error('[orders-api] Error:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'orders-api-rabbitmq' });
});

connectRabbitMQ().then(() => {
  app.listen(3000, () => {
    console.log('[orders-api] Servidor escuchando en puerto 3000');
  });
});