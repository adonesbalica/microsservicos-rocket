import { channels } from '../channels/index.ts'
import type { OrderCreatedMessages } from '../../../../contracts/messages/order-created-message.ts'

export function dispatchOrderCreated(data: OrderCreatedMessages) {
  channels.orders.sendToQueue('orders', Buffer.from(JSON.stringify(data)))
}
