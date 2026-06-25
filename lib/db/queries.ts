import { eq, desc, inArray, and, sql } from 'drizzle-orm'
import { db } from './index'
import { products, pages, orders, orderItems, suppliers } from './schema'
import type { Product, Page, Order, OrderItem, Supplier, NewSupplier } from './schema'

export type { Product, Page, Order, OrderItem, Supplier }

// Supplier-facing order shape: minimised PII (no customer email, no Stripe
// session id) and a supplier-specific subtotal (not the global order total).
export type SupplierOrder = {
  id:              string
  status:          string
  createdAt:       Date | null
  customerName:    string | null
  shippingAddress: string | null
  totalEur:        number
  items:           OrderItem[]
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getProducts(filter?: string): Promise<Product[]> {
  if (!filter || filter === 'all') {
    return db.select().from(products).where(eq(products.active, true))
  }
  return db.select().from(products).where(
    and(
      eq(products.active, true),
      sql`${products.cat} @> ARRAY[${filter}]::text[]`
    )
  )
}

export async function getProduct(id: string): Promise<Product | null> {
  const rows = await db.select().from(products).where(eq(products.id, id))
  return rows[0] ?? null
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return []
  return db.select().from(products).where(inArray(products.id, ids))
}

// ─── Pages ───────────────────────────────────────────────────────────────────

export async function getPages(): Promise<Page[]> {
  return db.select().from(pages).orderBy(desc(pages.createdAt))
}

export async function getPublishedPages(): Promise<Page[]> {
  return db.select().from(pages).where(eq(pages.published, true))
}

export async function getPage(id: string): Promise<Page | null> {
  const rows = await db.select().from(pages).where(eq(pages.id, id))
  return rows[0] ?? null
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function getOrders(): Promise<(Order & { items: OrderItem[] })[]> {
  const orderRows = await db.select().from(orders).orderBy(desc(orders.createdAt))
  if (!orderRows.length) return []
  const orderIds = orderRows.map((o) => o.id)
  const itemRows = await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds))
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

// ─── Suppliers ───────────────────────────────────────────────────────────────

export async function createSupplier(data: NewSupplier): Promise<Supplier> {
  const rows = await db.insert(suppliers).values(data).returning()
  return rows[0]
}

export async function getSupplierByEmail(email: string): Promise<Supplier | null> {
  const rows = await db.select().from(suppliers).where(eq(suppliers.email, email.toLowerCase()))
  return rows[0] ?? null
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  const rows = await db.select().from(suppliers).where(eq(suppliers.id, id))
  return rows[0] ?? null
}

export async function getAllSuppliers(): Promise<Supplier[]> {
  return db.select().from(suppliers).orderBy(desc(suppliers.createdAt))
}

export async function updateSupplierStatus(id: string, status: string): Promise<void> {
  await db.update(suppliers).set({ status }).where(eq(suppliers.id, id))
}

/** Persist a re-hashed password (transparent work-factor upgrade on login). */
export async function updateSupplierPasswordHash(id: string, passwordHash: string): Promise<void> {
  await db.update(suppliers).set({ passwordHash }).where(eq(suppliers.id, id))
}

// ─── Supplier — scoped data ───────────────────────────────────────────────────

export async function getSupplierProducts(supplierId: string): Promise<Product[]> {
  return db
    .select()
    .from(products)
    .where(eq(products.supplierId, supplierId))
    .orderBy(desc(products.createdAt))
}

export async function updateSupplierProductStock(
  productId: string,
  supplierId: string,
  stock: number,
): Promise<boolean> {
  const result = await db
    .update(products)
    .set({ stock })
    .where(and(eq(products.id, productId), eq(products.supplierId, supplierId)))
  return (result.rowCount ?? 0) > 0
}

export async function getSupplierOrders(
  supplierId: string,
): Promise<SupplierOrder[]> {
  // 1. product IDs belonging to this supplier
  const supplierProducts = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.supplierId, supplierId))

  if (!supplierProducts.length) return []
  const productIds = supplierProducts.map((p) => p.id)

  // 2. order items that contain those products
  const items = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.productId, productIds))

  if (!items.length) return []

  // 3. parent orders
  const orderIds = [...new Set(items.map((i) => i.orderId))]
  const orderRows = await db
    .select()
    .from(orders)
    .where(inArray(orders.id, orderIds))
    .orderBy(desc(orders.createdAt))

  // 4. expose only what a supplier needs to fulfil the order — drop customer
  //    email + Stripe session id, and compute a supplier-specific subtotal
  //    instead of leaking the global order total (other suppliers' items).
  return orderRows.map((o) => {
    const ownItems = items.filter((i) => i.orderId === o.id)
    return {
      id:              o.id,
      status:          o.status,
      createdAt:       o.createdAt,
      customerName:    o.customerName,
      shippingAddress: o.shippingAddress,
      totalEur:        ownItems.reduce((s, i) => s + i.priceEur * i.quantity, 0),
      items:           ownItems,
    }
  })
}

export async function getSupplierStats(supplierId: string) {
  const supplierOrders = await getSupplierOrders(supplierId)
  const supplierProducts = await getSupplierProducts(supplierId)

  const totalRevenue = supplierOrders
    .filter((o) => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
    .flatMap((o) => o.items)
    .reduce((sum, i) => sum + i.priceEur * i.quantity, 0)

  const pendingOrders = supplierOrders.filter((o) => o.status === 'paid').length
  const activeProducts = supplierProducts.filter((p) => p.active).length
  const lowStock = supplierProducts.filter((p) => p.stock < 10).length

  return { totalRevenue, pendingOrders, activeProducts, lowStock, totalOrders: supplierOrders.length }
}
