import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { supabase } from "../lib/supabase";

export const households = new Hono()
  // POST /api/v1/households -> creates a new household
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        name: z.string().min(1, "Household name cannot be empty."),
      })
    ),
    async (c) => {
      const { name } = c.req.valid("json");
      const user = c.get("user"); // Assumes user is set in auth middleware

      // 1. Create the household
      const { data: household, error: householdError } = await supabase
        .from("households")
        .insert({ name: name, owner_id: user.id })
        .select()
        .single();

      if (householdError) {
        return c.json(
          {
            error: "Failed to create household",
            details: householdError.message,
          },
          500
        );
      }

      // 2. Add the creator as the first member with an 'admin' role
      const { error: memberError } = await supabase
        .from("household_users")
        .insert({
          household_id: household.id,
          user_id: user.id,
          role: "admin",
        });

      if (memberError) {
        // TODO: In a real scenario, we might want to roll back the household creation
        return c.json(
          {
            error: "Failed to add owner to household",
            details: memberError.message,
          },
          500
        );
      }

      // 3. Set this as the user's active household
      const { error: updateUserError } = await supabase
        .from("users")
        .update({ active_household_id: household.id })
        .eq("id", user.id);

      if (updateUserError) {
        // Not a deal-breaker, so we'll just log this error
        console.error(
          "Failed to set active household for user",
          updateUserError
        );
      }

      return c.json(household, 201);
    }
  )

  // POST /api/v1/households/:householdId/members -> adds a member to a household
  .post(
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

      // 1. Verify requester is an admin of the household
      const { data: membership, error: membershipError } = await supabase
        .from("household_users")
        .select("role")
        .eq("household_id", householdId)
        .eq("user_id", requester.id)
        .single();

      if (membershipError || membership?.role !== "admin") {
        return c.json(
          {
            error:
              "Forbidden: You do not have permission to add members to this household.",
          },
          403
        );
      }

      // 2. Find the user to be added by their email
      const { data: newMember, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", newMemberEmail)
        .single();

      if (userError || !newMember) {
        return c.json({ error: "User not found." }, 404);
      }

      // 3. Add the new member to the household
      const { error: addMemberError } = await supabase
        .from("household_users")
        .insert({
          household_id: householdId,
          user_id: newMember.id,
          role: "member", // New users are always members by default
        });

      if (addMemberError) {
        // Handle potential duplicate entry (user is already in the household)
        if (addMemberError.code === "23505") {
          // unique_violation
          return c.json(
            { error: "This user is already a member of the household." },
            409
          );
        }
        return c.json(
          { error: "Failed to add member", details: addMemberError.message },
          500
        );
      }

      return c.json({ success: true, message: "Member added successfully." });
    }
  )

  // GET /api/v1/households/mine -> gets the active household and its members for the current user
  .get("/mine", async (c) => {
    const user = c.get("user");

    // First, get the user's active household ID
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("active_household_id")
      .eq("id", user.id)
      .single();

    if (userError || !userData?.active_household_id) {
      return c.json({ error: "User does not have an active household." }, 404);
    }

    const householdId = userData.active_household_id;

    // Now, fetch the household details and its members
    const { data: household, error: householdError } = await supabase
      .from("households")
      .select(
        `
        id,
        name,
        created_at,
        owner_id,
        members:household_users (
          role,
          user:users (
            id,
            email
          )
        )
      `
      )
      .eq("id", householdId)
      .single();

    if (householdError) {
      return c.json(
        {
          error: "Failed to fetch household details",
          details: householdError.message,
        },
        500
      );
    }

    if (!household) {
      return c.json({ error: "Active household not found." }, 404);
    }

    return c.json(household);
  });
