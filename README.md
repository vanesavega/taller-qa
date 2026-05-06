# Taller: Pruebas de Integración en Arquitecturas Basadas en Mensajes y Eventos

Asignatura: Aseguramiento de la Calidad - Ingeniería de Sistemas

---

## Miembros del equipo

- José Manuel Quintero Rodríguez
- Dahiana Vanesa Vega Mira
- Ana María Valencia Quintero

---

## Descripción

Sistema de procesamiento de pedidos implementado con dos arquitecturas reactivas:

- **RabbitMQ**: Arquitectura basada en mensajes
- **Kafka**: Arquitectura basada en eventos

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
  kafka-system/
    docker-compose.yml
    orders-api/          -> API REST (productor de eventos)
    order-events-worker/ -> Consumidor de eventos
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

## Kafka - Cómo ejecutar

1. Abrir terminal y navegar a la carpeta:

```bash
cd kafka-system
```

2. Levantar los contenedores:

```bash
docker compose up --build
```

3. Verificar que los 6 contenedores estén corriendo:

```bash
docker compose ps
```

Debes ver: zookeeper, kafka-broker, kafka-ui, orders-api-kafka, order-events-worker, order-events-worker-2

4. Acceder a la interfaz de Kafka UI:

- URL: http://localhost:8081
- Permite visualizar topics, mensajes y configuración del cluster

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
| Zookeeper | 2181 | Coordinación del cluster Kafka |
| Kafka Broker | 9092 | Comunicación con clientes Kafka |
| Kafka UI | 8081 | Interfaz web para gestión de Kafka |

## Tecnologías

- Node.js 18
- Express
- amqplib (cliente AMQP para RabbitMQ)
- kafkajs (cliente Kafka para Node.js)
- Docker / Docker Compose