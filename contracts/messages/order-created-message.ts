export interface OrderCreatedMessages {
  orderId: string
  amount: number
  customer: {
    id: string
  }
}
