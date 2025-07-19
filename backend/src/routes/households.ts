import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createSupabaseClient } from "@/lib/supabase";

type User = {
  id: string;
  email: string;
};

type Env = {
  Variables: {
    user: User;
  };
};

const households = new Hono<Env>();

// Create a new household
households.post(
  "/",
  zValidator(
    "json",
    z.object({
      name: z.string().min(1, "Household name cannot be empty."),
    })
  ),
  async (c) => {
    const { name } = c.req.valid("json");
    const user = c.get("user");
    const supabaseClient = createSupabaseClient(c.env);

    const { data: household, error } = await supabaseClient
      .from("households")
      .insert({ name: name, owner_id: user.id })
      .select()
      .single();

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    // Add the owner as a member of the household
    const { error: memberError } = await supabaseClient
      .from("household_members")
      .insert({ household_id: household.id, user_id: user.id });

    if (memberError) {
      // If adding the member fails, we should probably roll back the household creation
      // For now, we'll just log the error and return the created household
      console.error("Failed to add owner to household:", memberError);
    }

    return c.json(household, 201);
  }
);

// Get all households for the current user
households.get("/", async (c) => {
  const user = c.get("user");
  const supabaseClient = createSupabaseClient(c.env);

  const { data, error } = await supabaseClient
    .from("households")
    .select(
      `
      id,
      name,
      owner_id,
      members:household_members(user_id)
    `
    )
    .eq("members.user_id", user.id);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data);
});

// Add a member to a household
households.post(
  "/:householdId/members",
  zValidator(
    "json",
    z.object({
      email: z.string().email("Invalid email address."),
    })
  ),
  async (c) => {
    const { householdId } = c.req.param();
    const { email: newMemberEmail } = c.req.valid("json");
    const requester = c.get("user");
    const supabaseClient = createSupabaseClient(c.env);

    // 1. Verify the requester is the owner of the household
    const { data: household, error: householdError } = await supabaseClient
      .from("households")
      .select("owner_id")
      .eq("id", householdId)
      .eq("owner_id", requester.id)
      .single();

    if (householdError || !household) {
      return c.json({ error: "Unauthorized or household not found" }, 403);
    }

    // 2. Find the user to be added by their email
    const { data: newMember, error: userError } = await supabaseClient
      .from("users")
      .select("id")
      .eq("email", newMemberEmail)
      .single();

    if (userError || !newMember) {
      return c.json({ error: "User to be added not found" }, 404);
    }

    // 3. Add the new member to the household
    const { error: insertError } = await supabaseClient
      .from("household_members")
      .insert({ household_id: householdId, user_id: newMember.id });

    if (insertError) {
      // Handle potential duplicate members or other db errors
      if (insertError.code === "23505") {
        return c.json({ error: "User is already a member" }, 409);
      }
      return c.json({ error: "Failed to add member" }, 500);
    }

    return c.json({ message: "Member added successfully" }, 201);
  }
);

// Get a single household's details
households.get("/:id", async (c) => {
  const { id } = c.req.param();
  const user = c.get("user");
  const supabaseClient = createSupabaseClient(c.env);

  const { data, error } = await supabaseClient
    .from("households")
    .select(
      `
      id,
      name,
      owner_id,
      members:household_members(user:users(id, email))
    `
    )
    .eq("id", id)
    .eq("members.user_id", user.id) // Ensure user is part of the household
    .single();

  if (error) {
    return c.json(
      { error: "Household not found or you are not a member" },
      404
    );
  }

  return c.json(data);
});

export { households };
