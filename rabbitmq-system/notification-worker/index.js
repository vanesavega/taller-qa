const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672';
const QUEUE_NAME = 'pedidos';

async function startWorker() {
  const maxRetries = 10;
  for (let i = 1; i <= maxRetries; i++) {
    try {
      console.log(`[notification-worker] Intento ${i} de conexión a RabbitMQ...`);
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();

      await channel.assertQueue(QUEUE_NAME, { durable: true });

      // Prefetch 1: procesar un mensaje a la vez
      channel.prefetch(1);

      console.log(`[notification-worker] Conectado. Esperando mensajes en cola '${QUEUE_NAME}'...`);

      channel.consume(QUEUE_NAME, async (msg) => {
        if (msg !== null) {
          const data = JSON.parse(msg.content.toString());

          console.log('==========================================');
          console.log('[notification-worker] Mensaje recibido:');
          console.log(`  Tipo: ${data.type}`);
          console.log(`  Order ID: ${data.orderId}`);
          console.log(`  Cliente: ${data.customerName}`);
          console.log(`  Producto: ${data.product}`);
          console.log(`  Cantidad: ${data.quantity}`);
          console.log(`  Fecha: ${data.createdAt}`);
          console.log('[notification-worker] Simulando envío de notificación...');

          // Simular procesamiento (1 segundo)
          await new Promise(r => setTimeout(r, 1000));

          console.log(`[notification-worker] Notificación enviada para pedido ${data.orderId}`);
          console.log('==========================================');

          // ACK manual - confirmar que se procesó
          channel.ack(msg);
        }
      });

      return;
    } catch (err) {
      console.error(`[notification-worker] Error (intento ${i}):`, err.message);
      if (i < maxRetries) await new Promise(r => setTimeout(r, 3000));
    }
  }
  throw new Error('No se pudo conectar a RabbitMQ');
}

startWorker().catch(err => {
  console.error('[notification-worker] Fatal:', err.message);
  process.exit(1);
});