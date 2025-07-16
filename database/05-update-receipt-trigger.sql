CREATE OR REPLACE FUNCTION on_new_receipt()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
    SELECT email INTO user_email FROM users WHERE id = NEW.user_id;

    PERFORM http_post(
        'https://cihuylmusthumxpuexrl.supabase.co/functions/v1/receipt-processed',
        jsonb_build_object(
            'record', NEW,
            'user_email', user_email
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql; 