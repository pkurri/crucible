---
name: event-driven-microservices
description: Event-driven microservices architecture with message brokers, CQRS pattern, and eventual consistency. Use when building distributed systems, implementing event sourcing, designing microservices, or setting up async communication.
triggers:
  - "microservices"
  - "event-driven"
  - "message queue"
  - "CQRS"
  - "event sourcing"
  - "distributed system"
---

# Event-Driven Microservices

Event-driven architecture with message brokers, CQRS, and eventual consistency.

## Capabilities

- **Event Bus**: Async communication
- **CQRS**: Separate read/write models
- **Saga**: Distributed transactions
- **Event Sourcing**: Audit trail
- **Circuit Breaker**: Fault tolerance

## Usage

```markdown
@skill event-driven-microservices

Design an event-driven system:
- Services: Order, Payment, Inventory, Shipping
- Events: OrderCreated, PaymentProcessed, InventoryReserved
- Broker: Kafka
- Pattern: Saga orchestration
```

## Architecture

```
┌─────────────┐    OrderCreated     ┌──────────────┐
│   Order     │ ─────────────────── │   Payment    │
│  Service    │                     │   Service    │
└─────────────┘                     └──────────────┘
       │                                    │
       │ PaymentProcessed                   │
       │◄───────────────────────────────────│
       │                                    │
       │ InventoryReserved                 │
       │◄──────────────────────────────────│
       └────────────────────────────────────┘
```

## Event Bus

```typescript
import { EventBus } from '@crucible/microservices';

const bus = new EventBus({
  broker: 'kafka',
  clientId: 'order-service'
});

// Publish event
await bus.publish('order.created', {
  orderId: '123',
  userId: '456',
  items: [...],
  total: 99.99
});

// Subscribe to events
bus.subscribe('payment.processed', async (event) => {
  const { orderId, status } = event;
  
  if (status === 'success') {
    await reserveInventory(orderId);
  } else {
    await cancelOrder(orderId);
  }
});
```

## CQRS Pattern

```typescript
// Command (Write)
class CreateOrderCommand {
  constructor(
    public readonly userId: string,
    public readonly items: OrderItem[]
  ) {}
}

@CommandHandler(CreateOrderCommand)
class CreateOrderHandler {
  async execute(command: CreateOrderCommand) {
    const order = await this.repository.create(command);
    await this.eventBus.publish('order.created', order);
    return order;
  }
}

// Query (Read)
@QueryHandler(GetOrdersQuery)
class GetOrdersHandler {
  async execute(query: GetOrdersQuery) {
    return this.readModel.find({
      userId: query.userId,
      status: query.status
    });
  }
}
```

## Saga Pattern

```typescript
import { Saga } from '@crucible/microservices';

const orderSaga = new Saga('order-processing')
  .step('reserve-payment')
  .invoke(async (ctx) => {
    await paymentService.charge(ctx.order.paymentMethod);
  })
  .withCompensation(async (ctx) => {
    await paymentService.refund(ctx.paymentId);
  })
  
  .step('reserve-inventory')
  .invoke(async (ctx) => {
    await inventoryService.reserve(ctx.order.items);
  })
  .withCompensation(async (ctx) => {
    await inventoryService.release(ctx.reservationId);
  })
  
  .step('create-shipment')
  .invoke(async (ctx) => {
    await shippingService.create(ctx.order);
  });

// Execute saga
const result = await orderSaga.execute({ order });
```

## Event Sourcing

```typescript
class OrderAggregate {
  private events: Event[] = [];
  private state: OrderState;

  applyEvent(event: Event) {
    this.events.push(event);
    
    switch (event.type) {
      case 'OrderCreated':
        this.state = { status: 'pending', ...event.data };
        break;
      case 'OrderPaid':
        this.state.status = 'paid';
        break;
      case 'OrderShipped':
        this.state.status = 'shipped';
        break;
    }
  }

  getUncommittedEvents() {
    return this.events;
  }
}
```

## Circuit Breaker

```typescript
import { CircuitBreaker } from '@crucible/microservices';

const breaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000
});

const result = await breaker.execute(async () => {
  return await inventoryService.checkStock(itemId);
});
```

## Integration

- Kafka: Event streaming
- Redis: Event store
- PostgreSQL: Read models
- Jaeger: Distributed tracing
