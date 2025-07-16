CREATE OR REPLACE FUNCTION search_receipts(user_id_param UUID, search_term_param TEXT)
RETURNS SETOF receipts AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM receipts r
    WHERE
        r.user_id = user_id_param AND (
            r.store_name ILIKE ('%' || search_term_param || '%') OR
            EXISTS (
                SELECT 1
                FROM jsonb_array_elements(r.ocr_data->'items') AS item
                WHERE item->>'name' ILIKE ('%' || search_term_param || '%')
            )
        )
    ORDER BY r.date DESC;
END;
$$ LANGUAGE plpgsql; 