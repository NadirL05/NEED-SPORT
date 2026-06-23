import { pgTable, text, integer, boolean, timestamp, serial } from 'drizzle-orm/pg-core'

export const suppliers = pgTable('suppliers', {
  id:           text('id').primaryKey(),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  companyName:  text('company_name').notNull(),
  contactName:  text('contact_name').notNull(),
  phone:        text('phone'),
  country:      text('country').notNull().default('FR'),
  status:       text('status').notNull().default('active'), // 'active' | 'pending' | 'suspended'
  createdAt:    timestamp('created_at').defaultNow(),
})

export const products = pgTable('products', {
  id:                text('id').primaryKey(),
  supplierId:        text('supplier_id').references(() => suppliers.id, { onDelete: 'set null' }),
  club:              text('club').notNull(),
  name:              text('name').notNull(),
  priceEur:          integer('price_eur').notNull(),
  compareAtPriceEur: integer('compare_at_price_eur'),
  cat:               text('cat').array().notNull().default([]),
  img:               text('img').notNull(),
  stock:             integer('stock').notNull().default(100),
  active:            boolean('active').notNull().default(true),
  seoTitle:          text('seo_title'),
  seoDescription:    text('seo_description'),
  createdAt:         timestamp('created_at').defaultNow(),
})

export const pages = pgTable('pages', {
  id:             text('id').primaryKey(),
  title:          text('title').notNull(),
  content:        text('content').notNull().default(''),
  seoTitle:       text('seo_title'),
  seoDescription: text('seo_description'),
  published:      boolean('published').notNull().default(false),
  createdAt:      timestamp('created_at').defaultNow(),
  updatedAt:      timestamp('updated_at').defaultNow(),
})

export const orders = pgTable('orders', {
  id:              text('id').primaryKey(),
  stripeSessionId: text('stripe_session_id').unique().notNull(),
  status:          text('status').notNull().default('pending'),
  totalEur:        integer('total_eur').notNull(),
  customerEmail:   text('customer_email'),
  customerName:    text('customer_name'),
  shippingAddress: text('shipping_address'),
  createdAt:       timestamp('created_at').defaultNow(),
})

export const orderItems = pgTable('order_items', {
  id:          serial('id').primaryKey(),
  orderId:     text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId:   text('product_id').notNull(),
  productName: text('product_name').notNull(),
  quantity:    integer('quantity').notNull(),
  priceEur:    integer('price_eur').notNull(),
  size:        text('size'),
})

export const employees = pgTable('employees', {
  id:           text('id').primaryKey(),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name:         text('name').notNull(),
  active:       boolean('active').notNull().default(true),
  createdAt:    timestamp('created_at').defaultNow(),
})

// Centralised, serverless-safe rate limiting (fixed window) backed by Postgres.
export const rateLimits = pgTable('rate_limits', {
  key:       text('key').primaryKey(),
  count:     integer('count').notNull().default(0),
  expiresAt: timestamp('expires_at').notNull(),
})

export const promoCodes = pgTable('promo_codes', {
  id:             text('id').primaryKey(),
  code:           text('code').notNull().unique(),
  discountPct:    integer('discount_pct').notNull(),
  description:    text('description').notNull().default(''),
  active:         boolean('active').notNull().default(true),
  showOnSite:     boolean('show_on_site').notNull().default(false),
  expiresAt:      timestamp('expires_at'),
  stripeCouponId: text('stripe_coupon_id'),
  createdAt:      timestamp('created_at').defaultNow(),
})

export type PromoCode    = typeof promoCodes.$inferSelect
export type NewPromoCode = typeof promoCodes.$inferInsert

export type Supplier    = typeof suppliers.$inferSelect
export type NewSupplier = typeof suppliers.$inferInsert
export type Product     = typeof products.$inferSelect
export type NewProduct  = typeof products.$inferInsert
export type Page        = typeof pages.$inferSelect
export type NewPage     = typeof pages.$inferInsert
export type Order       = typeof orders.$inferSelect
export type OrderItem   = typeof orderItems.$inferSelect
export type Employee    = typeof employees.$inferSelect
export type NewEmployee = typeof employees.$inferInsert
