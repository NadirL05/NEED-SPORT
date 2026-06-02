import { pgTable, text, integer, boolean, timestamp, serial } from 'drizzle-orm/pg-core'

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  club: text('club').notNull(),
  name: text('name').notNull(),
  priceEur: integer('price_eur').notNull(),
  compareAtPriceEur: integer('compare_at_price_eur'),
  cat: text('cat').array().notNull().default([]),
  img: text('img').notNull(),
  stock: integer('stock').notNull().default(100),
  active: boolean('active').notNull().default(true),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const pages = pgTable('pages', {
  id: text('id').primaryKey(),           // slug: 'livraison', 'authenticite', etc.
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  published: boolean('published').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  stripeSessionId: text('stripe_session_id').unique().notNull(),
  status: text('status').notNull().default('pending'),
  totalEur: integer('total_eur').notNull(),
  customerEmail: text('customer_email'),
  customerName: text('customer_name'),
  shippingAddress: text('shipping_address'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull(),
  productName: text('product_name').notNull(),
  quantity: integer('quantity').notNull(),
  priceEur: integer('price_eur').notNull(),
  size: text('size'),
})

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type Page = typeof pages.$inferSelect
export type NewPage = typeof pages.$inferInsert
export type Order = typeof orders.$inferSelect
export type OrderItem = typeof orderItems.$inferSelect
