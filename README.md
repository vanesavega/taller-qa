# Taller: Pruebas de Integración en Arquitecturas Basadas en Mensajes y Eventos

Asignatura: Aseguramiento de la Calidad - Ingeniería de Sistemas

## Descripción

Sistema de procesamiento de pedidos implementado con dos arquitecturas reactivas:

- **RabbitMQ**: Arquitectura basada en mensajes
- **Kafka**: Arquitectura basada en eventos (pendiente)

## Requisitos previos

- Docker Desktop instalado y corriendo
- Postman o curl para probar los endpoints

## Estructura del proyecto

```
taller-qa/
  rabbitmq-system/
    docker-compose.yml
    orders-api/          -> API REST (productor de mensajes)
    notification-worker/ -> Consumidor de mensajes
  kafka-system/          -> (pendiente)
```

## RabbitMQ - Cómo ejecutar

1. Abrir terminal y navegar a la carpeta:

```bash
cd rabbitmq-system
```

2. Levantar los contenedores:

```bash
docker compose up --build
```

3. Verificar que los 3 contenedores estén corriendo:

```bash
docker compose ps
```

Debes ver: rabbitmq, orders-api-rabbit, notification-worker

4. Acceder a la consola de RabbitMQ:

- URL: http://localhost:15672
- Usuario: admin
- Contraseña: admin

5. Enviar un pedido de prueba:

```bash
curl -X POST http://localhost:3000/orders -H "Content-Type: application/json" -d "{\"customerName\": \"Pedro\", \"product\": \"Libro de arquitectura\", \"quantity\": 1}"
```

6. Apagar los contenedores:

```bash
docker compose down
```

## Puertos utilizados

| Servicio | Puerto | Uso |
|----------|--------|-----|
| RabbitMQ AMQP | 5672 | Comunicación entre servicios |
| RabbitMQ Management | 15672 | Consola web |
| Orders API | 3000 | Endpoint HTTP |

## Tecnologías

- Node.js 18
- Express
- amqplib (cliente AMQP para RabbitMQ)
- Docker / Docker Compose