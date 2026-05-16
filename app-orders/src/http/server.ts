import '@opentelemetry/auto-instrumentations-node/register'
import { trace } from '@opentelemetry/api'

import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'
import { z } from 'zod'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { db } from '../db/client.ts'
import { schema } from '../db/schema/index.ts'
import { randomUUID } from 'node:crypto'
import { dispatchOrderCreated } from '../broker/messages/order-created.ts'
import { tracer } from '../tracer/tracer.ts'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, { origin: '*' })

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.get('/health', () => {
  return 'OK'
})

app.post(
  '/orders',
  {
    schema: {
      body: z.object({
        amount: z.coerce.number(),
      }),
    },
  },
  async (request, reply) => {
    const { amount } = request.body

    const orderId = randomUUID()

    await db.insert(schema.orders).values({
      id: orderId,
      customerId: 'e3986d79-e96a-44e4-acc8-ad76416c35e9',
      amount,
    })

    const span = tracer.startSpan('eu acho que aqui ta dando ruim')

    trace.getActiveSpan()?.setAttribute('order_id', orderId)

    dispatchOrderCreated({
      orderId,
      amount,
      customer: {
        id: 'e3986d79-e96a-44e4-acc8-ad76416c35e9',
      },
    })

    span.setAttribute('test', 'hello world')

    span.end()

    return reply.status(201).send()
  },
)

app.listen({ host: '0.0.0.0', port: 3333 }).then(() => {
  console.log('[Orders] HTTP Server running!')
})
