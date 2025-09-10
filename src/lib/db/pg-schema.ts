import { 
  pgTable, 
  varchar, 
  text, 
  integer, 
  decimal, 
  boolean, 
  timestamp, 
  pgEnum,
  index,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'expense']);
export const categoryTypeEnum = pgEnum('category_type', ['income', 'expense']);
export const payrollPeriodEnum = pgEnum('payroll_period', ['monthly', 'weekly', 'biweekly']);
export const bonusTypeEnum = pgEnum('bonus_type', ['bonus', 'advance', 'overtime', 'commission']);
export const quoteStatusEnum = pgEnum('quote_status', ['draft', 'sent', 'accepted', 'rejected', 'expired']);
export const debtStatusEnum = pgEnum('debt_status', ['pending', 'paid', 'overdue']);
export const debtTypeEnum = pgEnum('debt_type', ['payable', 'receivable']);
export const recurringPeriodEnum = pgEnum('recurring_period', ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']);

// Users table
export const users = pgTable('users', {
  id: varchar('id', { length: 191 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex('email_idx').on(table.email),
}));

// Currencies table
export const currencies = pgTable('currencies', {
  id: varchar('id', { length: 191 }).primaryKey(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  symbol: varchar('symbol', { length: 10 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
}, (table) => ({
  codeIdx: uniqueIndex('code_idx').on(table.code),
}));

// Categories table
export const categories = pgTable('categories', {
  id: varchar('id', { length: 191 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: categoryTypeEnum('type').notNull(),
  color: varchar('color', { length: 7 }).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  userId: varchar('user_id', { length: 191 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
}));

// Clients table
export const clients = pgTable('clients', {
  id: varchar('id', { length: 191 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  taxNumber: varchar('tax_number', { length: 50 }),
  contactPerson: varchar('contact_person', { length: 255 }),
  contractStartDate: timestamp('contract_start_date'),
  contractEndDate: timestamp('contract_end_date'),
  currencyId: varchar('currency_id', { length: 191 }).notNull(),
  balance: decimal('balance', { precision: 15, scale: 2 }).default('0.00').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  userId: varchar('user_id', { length: 191 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  currencyIdIdx: index('currency_id_idx').on(table.currencyId),
  taxNumberIdx: index('tax_number_idx').on(table.taxNumber),
}));

// Employees table
export const employees = pgTable('employees', {
  id: varchar('id', { length: 191 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  position: varchar('position', { length: 255 }).notNull(),
  netSalary: decimal('net_salary', { precision: 15, scale: 2 }).notNull(),
  currencyId: varchar('currency_id', { length: 191 }).notNull(),
  payrollPeriod: payrollPeriodEnum('payroll_period').notNull(),
  paymentDay: integer('payment_day').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  userId: varchar('user_id', { length: 191 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  currencyIdIdx: index('currency_id_idx').on(table.currencyId),
}));

// Transactions table
export const transactions = pgTable('transactions', {
  id: varchar('id', { length: 191 }).primaryKey(),
  type: transactionTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  currencyId: varchar('currency_id', { length: 191 }).notNull(),
  categoryId: varchar('category_id', { length: 191 }).notNull(),
  clientId: varchar('client_id', { length: 191 }),
  employeeId: varchar('employee_id', { length: 191 }),
  description: text('description').notNull(),
  transactionDate: timestamp('transaction_date').notNull(),
  isVatIncluded: boolean('is_vat_included').default(false).notNull(),
  vatRate: decimal('vat_rate', { precision: 5, scale: 2 }).default('0.00').notNull(),
  isRecurring: boolean('is_recurring').default(false).notNull(),
  recurringPeriod: recurringPeriodEnum('recurring_period'),
  nextRecurringDate: timestamp('next_recurring_date'),
  parentTransactionId: varchar('parent_transaction_id', { length: 191 }),
  userId: varchar('user_id', { length: 191 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  categoryIdIdx: index('category_id_idx').on(table.categoryId),
  clientIdIdx: index('client_id_idx').on(table.clientId),
  employeeIdIdx: index('employee_id_idx').on(table.employeeId),
  currencyIdIdx: index('currency_id_idx').on(table.currencyId),
  transactionDateIdx: index('transaction_date_idx').on(table.transactionDate),
  parentTransactionIdIdx: index('parent_transaction_id_idx').on(table.parentTransactionId),
}));

// Bonuses table
export const bonuses = pgTable('bonuses', {
  id: varchar('id', { length: 191 }).primaryKey(),
  employeeId: varchar('employee_id', { length: 191 }).notNull(),
  type: bonusTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  currencyId: varchar('currency_id', { length: 191 }).notNull(),
  description: text('description').notNull(),
  paymentDate: timestamp('payment_date').notNull(),
  userId: varchar('user_id', { length: 191 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  employeeIdIdx: index('employee_id_idx').on(table.employeeId),
  userIdIdx: index('user_id_idx').on(table.userId),
  currencyIdIdx: index('currency_id_idx').on(table.currencyId),
  paymentDateIdx: index('payment_date_idx').on(table.paymentDate),
}));

// Quotes table
export const quotes = pgTable('quotes', {
  id: varchar('id', { length: 191 }).primaryKey(),
  clientId: varchar('client_id', { length: 191 }).notNull(),
  quoteNumber: varchar('quote_number', { length: 100 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  validUntil: timestamp('valid_until').notNull(),
  status: quoteStatusEnum('status').default('draft').notNull(),
  subtotal: decimal('subtotal', { precision: 15, scale: 2 }).notNull(),
  vatAmount: decimal('vat_amount', { precision: 15, scale: 2 }).notNull(),
  total: decimal('total', { precision: 15, scale: 2 }).notNull(),
  currencyId: varchar('currency_id', { length: 191 }).notNull(),
  notes: text('notes'),
  termsAndConditions: text('terms_and_conditions'),
  // Tevkifat fields
  tevkifatApplied: boolean('tevkifat_applied').default(false).notNull(),
  tevkifatRate: varchar('tevkifat_rate', { length: 10 }),
  tevkifatAmount: decimal('tevkifat_amount', { precision: 15, scale: 2 }).default('0.00'),
  netAmountAfterTevkifat: decimal('net_amount_after_tevkifat', { precision: 15, scale: 2 }).default('0.00'),
  userId: varchar('user_id', { length: 191 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  clientIdIdx: index('client_id_idx').on(table.clientId),
  userIdIdx: index('user_id_idx').on(table.userId),
  currencyIdIdx: index('currency_id_idx').on(table.currencyId),
  quoteNumberIdx: uniqueIndex('quote_number_idx').on(table.quoteNumber),
  statusIdx: index('status_idx').on(table.status),
  validUntilIdx: index('valid_until_idx').on(table.validUntil),
}));

// Quote Items table
export const quoteItems = pgTable('quote_items', {
  id: varchar('id', { length: 191 }).primaryKey(),
  quoteId: varchar('quote_id', { length: 191 }).notNull(),
  description: text('description').notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 15, scale: 2 }).notNull(),
  vatRate: decimal('vat_rate', { precision: 5, scale: 2 }).notNull(),
  total: decimal('total', { precision: 15, scale: 2 }).notNull(),
  order: integer('order').notNull(),
}, (table) => ({
  quoteIdIdx: index('quote_id_idx').on(table.quoteId),
  orderIdx: index('order_idx').on(table.order),
}));

// Debts table
export const debts = pgTable('debts', {
  id: varchar('id', { length: 191 }).primaryKey(),
  clientId: varchar('client_id', { length: 191 }),
  title: varchar('title', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  currencyId: varchar('currency_id', { length: 191 }).notNull(),
  dueDate: timestamp('due_date').notNull(),
  status: debtStatusEnum('status').default('pending').notNull(),
  type: debtTypeEnum('type').notNull(),
  description: text('description'),
  userId: varchar('user_id', { length: 191 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  clientIdIdx: index('client_id_idx').on(table.clientId),
  userIdIdx: index('user_id_idx').on(table.userId),
  currencyIdIdx: index('currency_id_idx').on(table.currencyId),
  dueDateIdx: index('due_date_idx').on(table.dueDate),
  statusIdx: index('status_idx').on(table.status),
  typeIdx: index('type_idx').on(table.type),
}));

// Company Settings table
export const companySettings = pgTable('company_settings', {
  id: varchar('id', { length: 191 }).primaryKey(),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  address: text('address').notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  website: varchar('website', { length: 255 }),
  taxNumber: varchar('tax_number', { length: 50 }),
  lightModeLogo: text('light_mode_logo'),
  darkModeLogo: text('dark_mode_logo'),
  quoteLogo: text('quote_logo'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tevkifat Rates table
export const tevkifatRates = pgTable('tevkifat_rates', {
  id: varchar('id', { length: 191 }).primaryKey(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  numerator: integer('numerator').notNull(),
  denominator: integer('denominator').notNull(),
  description: varchar('description', { length: 500 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
}, (table) => ({
  codeIdx: uniqueIndex('code_idx').on(table.code),
  isActiveIdx: index('is_active_idx').on(table.isActive),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  clients: many(clients),
  employees: many(employees),
  transactions: many(transactions),
  categories: many(categories),
  quotes: many(quotes),
  debts: many(debts),
  bonuses: many(bonuses),
}));

export const currenciesRelations = relations(currencies, ({ many }) => ({
  clients: many(clients),
  employees: many(employees),
  transactions: many(transactions),
  bonuses: many(bonuses),
  quotes: many(quotes),
  debts: many(debts),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
  currency: one(currencies, {
    fields: [clients.currencyId],
    references: [currencies.id],
  }),
  transactions: many(transactions),
  quotes: many(quotes),
  debts: many(debts),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  currency: one(currencies, {
    fields: [employees.currencyId],
    references: [currencies.id],
  }),
  transactions: many(transactions),
  bonuses: many(bonuses),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  currency: one(currencies, {
    fields: [transactions.currencyId],
    references: [currencies.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  client: one(clients, {
    fields: [transactions.clientId],
    references: [clients.id],
  }),
  employee: one(employees, {
    fields: [transactions.employeeId],
    references: [employees.id],
  }),
  parentTransaction: one(transactions, {
    fields: [transactions.parentTransactionId],
    references: [transactions.id],
  }),
}));

export const bonusesRelations = relations(bonuses, ({ one }) => ({
  employee: one(employees, {
    fields: [bonuses.employeeId],
    references: [employees.id],
  }),
  user: one(users, {
    fields: [bonuses.userId],
    references: [users.id],
  }),
  currency: one(currencies, {
    fields: [bonuses.currencyId],
    references: [currencies.id],
  }),
}));

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  client: one(clients, {
    fields: [quotes.clientId],
    references: [clients.id],
  }),
  user: one(users, {
    fields: [quotes.userId],
    references: [users.id],
  }),
  currency: one(currencies, {
    fields: [quotes.currencyId],
    references: [currencies.id],
  }),
  items: many(quoteItems),
}));

export const quoteItemsRelations = relations(quoteItems, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteItems.quoteId],
    references: [quotes.id],
  }),
}));

export const debtsRelations = relations(debts, ({ one }) => ({
  client: one(clients, {
    fields: [debts.clientId],
    references: [clients.id],
  }),
  user: one(users, {
    fields: [debts.userId],
    references: [users.id],
  }),
  currency: one(currencies, {
    fields: [debts.currencyId],
    references: [currencies.id],
  }),
}));
