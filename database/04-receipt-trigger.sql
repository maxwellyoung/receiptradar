CREATE OR REPLACE FUNCTION on_new_receipt()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM http_post(
        'https://cihuylmusthumxpuexrl.supabase.co/functions/v1/receipt-processed',
        jsonb_build_object('record', NEW)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER new_receipt_trigger
AFTER INSERT ON receipts
FOR EACH ROW
EXECUTE FUNCTION on_new_receipt(); 