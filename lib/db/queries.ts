import { eq, desc, inArray } from 'drizzle-orm'
import { db } from './index'
import { products, orders, orderItems } from './schema'
import type { Product, Order, OrderItem } from './schema'

export type { Product, Order, OrderItem }

export async function getProducts(filter?: string): Promise<Product[]> {
  const rows = await db.select().from(products).where(eq(products.active, true))
  if (!filter || filter === 'all') return rows
  return rows.filter((p) => p.cat.includes(filter))
}

export async function getProduct(id: string): Promise<Product | null> {
  const rows = await db.select().from(products).where(eq(products.id, id))
  return rows[0] ?? null
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return []
  return db.select().from(products).where(inArray(products.id, ids))
}

export async function getOrders(): Promise<(Order & { items: OrderItem[] })[]> {
  const orderRows = await db.select().from(orders).orderBy(desc(orders.createdAt))
  const itemRows  = await db.select().from(orderItems)
  return orderRows.map((o) => ({
    ...o,
    items: itemRows.filter((i) => i.orderId === o.id),
  }))
}

export async function getOrder(id: string): Promise<(Order & { items: OrderItem[] }) | null> {
  const orderRows = await db.select().from(orders).where(eq(orders.id, id))
  if (!orderRows[0]) return null
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id))
  return { ...orderRows[0], items }
}

export async function getOrderBySession(sessionId: string): Promise<Order | null> {
  const rows = await db.select().from(orders).where(eq(orders.stripeSessionId, sessionId))
  return rows[0] ?? null
}
