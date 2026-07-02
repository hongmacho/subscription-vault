import {
  sqliteTable,
  integer,
  text,
  primaryKey,
} from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// Subscriptions table
export const subscriptions = sqliteTable('subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  category: text('category').notNull(),
  monthlyPrice: integer('monthly_price').notNull(),
  billingDayOfMonth: integer('billing_day_of_month').notNull(),
  contractStartDate: text('contract_start_date').notNull(),
  contractType: text('contract_type').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).defaultNow(),
})

// Price history table
export const priceHistories = sqliteTable('price_histories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  subscriptionId: integer('subscription_id')
    .notNull()
    .references(() => subscriptions.id),
  previousPrice: integer('previous_price').notNull(),
  newPrice: integer('new_price').notNull(),
  changeDate: text('change_date').notNull(),
  changeReason: text('change_reason'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).defaultNow(),
})

// Alternative services table
export const alternativeServices = sqliteTable('alternative_services', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  subscriptionId: integer('subscription_id')
    .notNull()
    .references(() => subscriptions.id),
  serviceName: text('service_name').notNull(),
  monthlyPrice: integer('monthly_price').notNull(),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).defaultNow(),
})

// Relations
export const subscriptionsRelations = relations(subscriptions, ({ many }) => ({
  priceHistories: many(priceHistories),
  alternativeServices: many(alternativeServices),
}))

export const priceHistoriesRelations = relations(
  priceHistories,
  ({ one }) => ({
    subscription: one(subscriptions, {
      fields: [priceHistories.subscriptionId],
      references: [subscriptions.id],
    }),
  })
)

export const alternativeServicesRelations = relations(
  alternativeServices,
  ({ one }) => ({
    subscription: one(subscriptions, {
      fields: [alternativeServices.subscriptionId],
      references: [subscriptions.id],
    }),
  })
)
