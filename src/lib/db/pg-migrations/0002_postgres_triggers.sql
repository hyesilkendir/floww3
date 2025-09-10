-- PostgreSQL Triggers and Functions for Calafco Accounting System

-- Function to update client balance when transaction changes
CREATE OR REPLACE FUNCTION update_client_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- For UPDATE: revert old balance and apply new
    IF TG_OP = 'UPDATE' THEN
        -- Revert old balance
        IF OLD.client_id IS NOT NULL THEN
            UPDATE clients 
            SET balance = balance - CASE 
                WHEN OLD.type = 'income' THEN OLD.amount::DECIMAL(15,2)
                ELSE -OLD.amount::DECIMAL(15,2)
            END,
            updated_at = NOW()
            WHERE id = OLD.client_id;
        END IF;
        
        -- Apply new balance
        IF NEW.client_id IS NOT NULL THEN
            UPDATE clients 
            SET balance = balance + CASE 
                WHEN NEW.type = 'income' THEN NEW.amount::DECIMAL(15,2)
                ELSE -NEW.amount::DECIMAL(15,2)
            END,
            updated_at = NOW()
            WHERE id = NEW.client_id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- For INSERT: apply new balance
    IF TG_OP = 'INSERT' THEN
        IF NEW.client_id IS NOT NULL THEN
            UPDATE clients 
            SET balance = balance + CASE 
                WHEN NEW.type = 'income' THEN NEW.amount::DECIMAL(15,2)
                ELSE -NEW.amount::DECIMAL(15,2)
            END,
            updated_at = NOW()
            WHERE id = NEW.client_id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- For DELETE: revert old balance
    IF TG_OP = 'DELETE' THEN
        IF OLD.client_id IS NOT NULL THEN
            UPDATE clients 
            SET balance = balance - CASE 
                WHEN OLD.type = 'income' THEN OLD.amount::DECIMAL(15,2)
                ELSE -OLD.amount::DECIMAL(15,2)
            END,
            updated_at = NOW()
            WHERE id = OLD.client_id;
        END IF;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for client balance updates
CREATE TRIGGER tr_transaction_client_balance_insert
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_client_balance();

CREATE TRIGGER tr_transaction_client_balance_update
    AFTER UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_client_balance();

CREATE TRIGGER tr_transaction_client_balance_delete
    AFTER DELETE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_client_balance();

-- Function to update quote totals when quote items change
CREATE OR REPLACE FUNCTION update_quote_totals()
RETURNS TRIGGER AS $$
DECLARE
    quote_subtotal DECIMAL(15,2) := 0;
    quote_vat_amount DECIMAL(15,2) := 0;
    quote_total DECIMAL(15,2) := 0;
    target_quote_id VARCHAR(191);
BEGIN
    -- Determine which quote to update
    IF TG_OP = 'DELETE' THEN
        target_quote_id := OLD.quote_id;
    ELSE
        target_quote_id := NEW.quote_id;
    END IF;
    
    -- Calculate new totals
    SELECT 
        COALESCE(SUM(qi.quantity * qi.unit_price), 0),
        COALESCE(SUM((qi.quantity * qi.unit_price) * (qi.vat_rate / 100)), 0),
        COALESCE(SUM(qi.total), 0)
    INTO quote_subtotal, quote_vat_amount, quote_total
    FROM quote_items qi
    WHERE qi.quote_id = target_quote_id;
    
    -- Update quote totals
    UPDATE quotes 
    SET 
        subtotal = quote_subtotal,
        vat_amount = quote_vat_amount,
        total = quote_total,
        updated_at = NOW()
    WHERE id = target_quote_id;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for quote totals updates
CREATE TRIGGER tr_quote_items_update_quote_totals_insert
    AFTER INSERT ON quote_items
    FOR EACH ROW
    EXECUTE FUNCTION update_quote_totals();

CREATE TRIGGER tr_quote_items_update_quote_totals_update
    AFTER UPDATE ON quote_items
    FOR EACH ROW
    EXECUTE FUNCTION update_quote_totals();

CREATE TRIGGER tr_quote_items_update_quote_totals_delete
    AFTER DELETE ON quote_items
    FOR EACH ROW
    EXECUTE FUNCTION update_quote_totals();

-- Function to calculate tevkifat amounts automatically
CREATE OR REPLACE FUNCTION calculate_tevkifat()
RETURNS TRIGGER AS $$
DECLARE
    numerator INTEGER;
    denominator INTEGER;
BEGIN
    IF NEW.tevkifat_applied = true AND NEW.tevkifat_rate IS NOT NULL THEN
        -- Parse tevkifat rate (e.g., "9/10")
        SELECT 
            split_part(NEW.tevkifat_rate, '/', 1)::INTEGER,
            split_part(NEW.tevkifat_rate, '/', 2)::INTEGER
        INTO numerator, denominator;
        
        -- Calculate tevkifat amount based on VAT
        NEW.tevkifat_amount := (NEW.vat_amount * numerator) / denominator;
        NEW.net_amount_after_tevkifat := NEW.total - NEW.tevkifat_amount;
    ELSE
        NEW.tevkifat_amount := 0;
        NEW.net_amount_after_tevkifat := NEW.total;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tevkifat calculation
CREATE TRIGGER tr_quotes_calculate_tevkifat_insert
    BEFORE INSERT ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION calculate_tevkifat();

CREATE TRIGGER tr_quotes_calculate_tevkifat_update
    BEFORE UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION calculate_tevkifat();

-- Function to auto-generate quote numbers
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
DECLARE
    next_number INTEGER := 1;
    quote_prefix VARCHAR(10) := 'TKF';
    current_year VARCHAR(4) := EXTRACT(YEAR FROM NOW())::VARCHAR;
BEGIN
    -- Find the next quote number for this year
    SELECT COALESCE(MAX(
        CASE 
            WHEN quote_number LIKE quote_prefix || '-' || current_year || '-%' 
            THEN split_part(quote_number, '-', 3)::INTEGER
            ELSE 0
        END
    ), 0) + 1
    INTO next_number
    FROM quotes 
    WHERE quote_number LIKE quote_prefix || '-' || current_year || '-%';
    
    -- Generate quote number: TKF-2024-001
    NEW.quote_number := quote_prefix || '-' || current_year || '-' || LPAD(next_number::TEXT, 3, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for quote number generation
CREATE TRIGGER tr_quotes_generate_number
    BEFORE INSERT ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION generate_quote_number();

-- Function to auto-update debt status based on due date
CREATE OR REPLACE FUNCTION update_debt_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'pending' AND NEW.due_date < NOW() THEN
        NEW.status := 'overdue';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for debt status update
CREATE TRIGGER tr_debts_update_status
    BEFORE UPDATE ON debts
    FOR EACH ROW
    EXECUTE FUNCTION update_debt_status();

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER tr_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_quotes_updated_at
    BEFORE UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_debts_updated_at
    BEFORE UPDATE ON debts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_company_settings_updated_at
    BEFORE UPDATE ON company_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
