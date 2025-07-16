/// <reference types="https://deno.land/x/deno/cli/types/deno.d.ts" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

console.log("Receipt processed function up and running!");

serve(async (req) => {
  try {
    const { record, user_email } = await req.json();
    console.log("Processing receipt:", record);

    if (!RESEND_API_KEY) {
      throw new Error("Resend API key is not set.");
    }

    if (!user_email) {
      throw new Error("User email not provided.");
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ReceiptRadar <noreply@receiptradar.com>",
        to: [user_email],
        subject: "Your Receipt Has Been Processed!",
        html: `<h1>Your receipt from ${record.store_name} has been processed.</h1><p>Total: $${record.total_amount}</p>`,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
