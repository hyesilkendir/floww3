-- PostgreSQL schema for Calafco Accounting System

-- Create enums
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE category_type AS ENUM ('income', 'expense');
CREATE TYPE payroll_period AS ENUM ('monthly', 'weekly', 'biweekly');
CREATE TYPE bonus_type AS ENUM ('bonus', 'advance', 'overtime', 'commission');
CREATE TYPE quote_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');
CREATE TYPE debt_status AS ENUM ('pending', 'paid', 'overdue');
CREATE TYPE debt_type AS ENUM ('payable', 'receivable');
CREATE TYPE recurring_period AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly');

-- Users table
CREATE TABLE users (
    id VARCHAR(191) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Currencies table
CREATE TABLE currencies (
    id VARCHAR(191) PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- Categories table
CREATE TABLE categories (
    id VARCHAR(191) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type category_type NOT NULL,
    color VARCHAR(7) NOT NULL,
    is_default BOOLEAN DEFAULT false NOT NULL,
    user_id VARCHAR(191) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Clients table
CREATE TABLE clients (
    id VARCHAR(191) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    tax_number VARCHAR(50),
    contact_person VARCHAR(255),
    contract_start_date TIMESTAMP,
    contract_end_date TIMESTAMP,
    currency_id VARCHAR(191) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    user_id VARCHAR(191) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Employees table
CREATE TABLE employees (
    id VARCHAR(191) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    net_salary DECIMAL(15,2) NOT NULL,
    currency_id VARCHAR(191) NOT NULL,
    payroll_period payroll_period NOT NULL,
    payment_day INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    user_id VARCHAR(191) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Transactions table
CREATE TABLE transactions (
    id VARCHAR(191) PRIMARY KEY,
    type transaction_type NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency_id VARCHAR(191) NOT NULL,
    category_id VARCHAR(191) NOT NULL,
    client_id VARCHAR(191),
    employee_id VARCHAR(191),
    description TEXT NOT NULL,
    transaction_date TIMESTAMP NOT NULL,
    is_vat_included BOOLEAN DEFAULT false NOT NULL,
    vat_rate DECIMAL(5,2) DEFAULT 0.00 NOT NULL,
    is_recurring BOOLEAN DEFAULT false NOT NULL,
    recurring_period recurring_period,
    next_recurring_date TIMESTAMP,
    parent_transaction_id VARCHAR(191),
    user_id VARCHAR(191) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Bonuses table
CREATE TABLE bonuses (
    id VARCHAR(191) PRIMARY KEY,
    employee_id VARCHAR(191) NOT NULL,
    type bonus_type NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency_id VARCHAR(191) NOT NULL,
    description TEXT NOT NULL,
    payment_date TIMESTAMP NOT NULL,
    user_id VARCHAR(191) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Quotes table
CREATE TABLE quotes (
    id VARCHAR(191) PRIMARY KEY,
    client_id VARCHAR(191) NOT NULL,
    quote_number VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    status quote_status DEFAULT 'draft' NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    vat_amount DECIMAL(15,2) NOT NULL,
    total DECIMAL(15,2) NOT NULL,
    currency_id VARCHAR(191) NOT NULL,
    notes TEXT,
    terms_and_conditions TEXT,
    tevkifat_applied BOOLEAN DEFAULT false NOT NULL,
    tevkifat_rate VARCHAR(10),
    tevkifat_amount DECIMAL(15,2) DEFAULT 0.00,
    net_amount_after_tevkifat DECIMAL(15,2) DEFAULT 0.00,
    user_id VARCHAR(191) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Quote Items table
CREATE TABLE quote_items (
    id VARCHAR(191) PRIMARY KEY,
    quote_id VARCHAR(191) NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    vat_rate DECIMAL(5,2) NOT NULL,
    total DECIMAL(15,2) NOT NULL,
    "order" INTEGER NOT NULL
);

-- Debts table
CREATE TABLE debts (
    id VARCHAR(191) PRIMARY KEY,
    client_id VARCHAR(191),
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency_id VARCHAR(191) NOT NULL,
    due_date TIMESTAMP NOT NULL,
    status debt_status DEFAULT 'pending' NOT NULL,
    type debt_type NOT NULL,
    description TEXT,
    user_id VARCHAR(191) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Company Settings table
CREATE TABLE company_settings (
    id VARCHAR(191) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    tax_number VARCHAR(50),
    light_mode_logo TEXT,
    dark_mode_logo TEXT,
    quote_logo TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tevkifat Rates table
CREATE TABLE tevkifat_rates (
    id VARCHAR(191) PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    numerator INTEGER NOT NULL,
    denominator INTEGER NOT NULL,
    description VARCHAR(500) NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- Create indexes
CREATE INDEX email_idx ON users (email);
CREATE INDEX code_idx ON currencies (code);
CREATE INDEX user_id_idx ON categories (user_id);
CREATE INDEX user_id_idx ON clients (user_id);
CREATE INDEX currency_id_idx ON clients (currency_id);
CREATE INDEX tax_number_idx ON clients (tax_number);
CREATE INDEX user_id_idx ON employees (user_id);
CREATE INDEX currency_id_idx ON employees (currency_id);
CREATE INDEX user_id_idx ON transactions (user_id);
CREATE INDEX category_id_idx ON transactions (category_id);
CREATE INDEX client_id_idx ON transactions (client_id);
CREATE INDEX employee_id_idx ON transactions (employee_id);
CREATE INDEX currency_id_idx ON transactions (currency_id);
CREATE INDEX transaction_date_idx ON transactions (transaction_date);
CREATE INDEX parent_transaction_id_idx ON transactions (parent_transaction_id);
CREATE INDEX employee_id_idx ON bonuses (employee_id);
CREATE INDEX user_id_idx ON bonuses (user_id);
CREATE INDEX currency_id_idx ON bonuses (currency_id);
CREATE INDEX payment_date_idx ON bonuses (payment_date);
CREATE INDEX client_id_idx ON quotes (client_id);
CREATE INDEX user_id_idx ON quotes (user_id);
CREATE INDEX currency_id_idx ON quotes (currency_id);
CREATE INDEX quote_number_idx ON quotes (quote_number);
CREATE INDEX status_idx ON quotes (status);
CREATE INDEX valid_until_idx ON quotes (valid_until);
CREATE INDEX quote_id_idx ON quote_items (quote_id);
CREATE INDEX order_idx ON quote_items ("order");
CREATE INDEX client_id_idx ON debts (client_id);
CREATE INDEX user_id_idx ON debts (user_id);
CREATE INDEX currency_id_idx ON debts (currency_id);
CREATE INDEX due_date_idx ON debts (due_date);
CREATE INDEX status_idx ON debts (status);
CREATE INDEX type_idx ON debts (type);
CREATE INDEX code_idx ON tevkifat_rates (code);
CREATE INDEX is_active_idx ON tevkifat_rates (is_active);

-- Foreign Key Constraints
ALTER TABLE categories ADD CONSTRAINT fk_categories_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE clients ADD CONSTRAINT fk_clients_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE clients ADD CONSTRAINT fk_clients_currency_id 
FOREIGN KEY (currency_id) REFERENCES currencies(id) ON DELETE RESTRICT;

ALTER TABLE employees ADD CONSTRAINT fk_employees_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE employees ADD CONSTRAINT fk_employees_currency_id 
FOREIGN KEY (currency_id) REFERENCES currencies(id) ON DELETE RESTRICT;

ALTER TABLE transactions ADD CONSTRAINT fk_transactions_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE transactions ADD CONSTRAINT fk_transactions_currency_id 
FOREIGN KEY (currency_id) REFERENCES currencies(id) ON DELETE RESTRICT;
ALTER TABLE transactions ADD CONSTRAINT fk_transactions_category_id 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT;
ALTER TABLE transactions ADD CONSTRAINT fk_transactions_client_id 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE transactions ADD CONSTRAINT fk_transactions_employee_id 
FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE transactions ADD CONSTRAINT fk_transactions_parent_transaction_id 
FOREIGN KEY (parent_transaction_id) REFERENCES transactions(id) ON DELETE SET NULL;

ALTER TABLE bonuses ADD CONSTRAINT fk_bonuses_employee_id 
FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;
ALTER TABLE bonuses ADD CONSTRAINT fk_bonuses_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE bonuses ADD CONSTRAINT fk_bonuses_currency_id 
FOREIGN KEY (currency_id) REFERENCES currencies(id) ON DELETE RESTRICT;

ALTER TABLE quotes ADD CONSTRAINT fk_quotes_client_id 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
ALTER TABLE quotes ADD CONSTRAINT fk_quotes_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE quotes ADD CONSTRAINT fk_quotes_currency_id 
FOREIGN KEY (currency_id) REFERENCES currencies(id) ON DELETE RESTRICT;

ALTER TABLE quote_items ADD CONSTRAINT fk_quote_items_quote_id 
FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE;

ALTER TABLE debts ADD CONSTRAINT fk_debts_client_id 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE debts ADD CONSTRAINT fk_debts_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE debts ADD CONSTRAINT fk_debts_currency_id 
FOREIGN KEY (currency_id) REFERENCES currencies(id) ON DELETE RESTRICT;
