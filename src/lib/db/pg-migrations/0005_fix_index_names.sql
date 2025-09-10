-- Fix duplicate index names across tables by creating unique names (idempotent)

-- Categories
CREATE INDEX IF NOT EXISTS categories_user_id_idx ON categories (user_id);

-- Clients
CREATE INDEX IF NOT EXISTS clients_user_id_idx ON clients (user_id);
CREATE INDEX IF NOT EXISTS clients_currency_id_idx ON clients (currency_id);
CREATE INDEX IF NOT EXISTS clients_tax_number_idx ON clients (tax_number);

-- Employees
CREATE INDEX IF NOT EXISTS employees_user_id_idx ON employees (user_id);
CREATE INDEX IF NOT EXISTS employees_currency_id_idx ON employees (currency_id);

-- Transactions
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions (user_id);
CREATE INDEX IF NOT EXISTS transactions_category_id_idx ON transactions (category_id);
CREATE INDEX IF NOT EXISTS transactions_client_id_idx ON transactions (client_id);
CREATE INDEX IF NOT EXISTS transactions_employee_id_idx ON transactions (employee_id);
CREATE INDEX IF NOT EXISTS transactions_currency_id_idx ON transactions (currency_id);
CREATE INDEX IF NOT EXISTS transactions_transaction_date_idx ON transactions (transaction_date);
CREATE INDEX IF NOT EXISTS transactions_parent_transaction_id_idx ON transactions (parent_transaction_id);

-- Bonuses
CREATE INDEX IF NOT EXISTS bonuses_employee_id_idx ON bonuses (employee_id);
CREATE INDEX IF NOT EXISTS bonuses_user_id_idx ON bonuses (user_id);
CREATE INDEX IF NOT EXISTS bonuses_currency_id_idx ON bonuses (currency_id);
CREATE INDEX IF NOT EXISTS bonuses_payment_date_idx ON bonuses (payment_date);

-- Quotes
CREATE INDEX IF NOT EXISTS quotes_client_id_idx ON quotes (client_id);
CREATE INDEX IF NOT EXISTS quotes_user_id_idx ON quotes (user_id);
CREATE INDEX IF NOT EXISTS quotes_currency_id_idx ON quotes (currency_id);
CREATE INDEX IF NOT EXISTS quotes_quote_number_idx ON quotes (quote_number);
CREATE INDEX IF NOT EXISTS quotes_status_idx ON quotes (status);
CREATE INDEX IF NOT EXISTS quotes_valid_until_idx ON quotes (valid_until);

-- Quote Items
CREATE INDEX IF NOT EXISTS quote_items_quote_id_idx ON quote_items (quote_id);
CREATE INDEX IF NOT EXISTS quote_items_order_idx ON quote_items ("order");

-- Debts
CREATE INDEX IF NOT EXISTS debts_client_id_idx ON debts (client_id);
CREATE INDEX IF NOT EXISTS debts_user_id_idx ON debts (user_id);
CREATE INDEX IF NOT EXISTS debts_currency_id_idx ON debts (currency_id);
CREATE INDEX IF NOT EXISTS debts_due_date_idx ON debts (due_date);
CREATE INDEX IF NOT EXISTS debts_status_idx ON debts (status);
CREATE INDEX IF NOT EXISTS debts_type_idx ON debts (type);

-- Tevkifat Rates (avoid conflict with currencies.code_idx)
CREATE INDEX IF NOT EXISTS tevkifat_rates_code_idx ON tevkifat_rates (code);
CREATE INDEX IF NOT EXISTS tevkifat_rates_is_active_idx ON tevkifat_rates (is_active);

-- Verification tokens
CREATE INDEX IF NOT EXISTS verification_tokens_user_id_idx ON verification_tokens (user_id);
