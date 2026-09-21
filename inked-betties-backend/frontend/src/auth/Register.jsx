import { useState } from "react";
import { Page, Card, TextField, Button, Text, ChoiceList } from "@shopify/polaris";
import { API_BASE_URL } from "../api"; // adjust path if api.js lives elsewhere

export default function Register({ setActivePage }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "solo" // default selection
  });

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function updateField(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleRegister() {
    // ⭐ Guard against double-taps / slow-server double-clicks creating
    // duplicate accounts, and give visible feedback so it never again
    // looks like the button "did nothing" during a slow (cold-start) response.
    if (submitting) return;
    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/artists/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      let data;
      try {
        data = await res.json();
      } catch {
        setMessage("Server returned an invalid response.");
        return;
      }

      if (data.status === "ok") {
        setMessage("Account created! Taking you to login...");
        if (setActivePage) {
          setTimeout(() => setActivePage("login"), 1200);
        }
      } else {
        setMessage(data.message || "Error creating account.");
      }
    } catch (err) {
      setMessage("Network error — backend unreachable.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Page title="Create Inked Betties Account">
      <Card sectioned>
        <TextField
          label="Name"
          value={form.name}
          onChange={(v) => updateField("name", v)}
        />

        <TextField
          label="Email"
          value={form.email}
          onChange={(v) => updateField("email", v)}
        />

        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={(v) => updateField("password", v)}
        />
        <div className="ink-password-toggle">
          <Button variant="plain" size="slim" onClick={() => setShowPassword((s) => !s)}>
            {showPassword ? "Hide password" : "Show password"}
          </Button>
        </div>

        <ChoiceList
          title="How will you be using Inked Betties?"
          choices={[
            {
              label: "Solo",
              helpText:
                "Just me — I order my own supplies. (This includes solo studio owners with no staff.)",
              value: "solo",
            },
            {
              label: "Studio Owner",
              helpText:
                "I manage other artists, and they'll be placing orders through my account too.",
              value: "owner",
            },
          ]}
          selected={[form.role]}
          onChange={(value) => updateField("role", value[0])}
        />

        <Button tone="success" onClick={handleRegister} loading={submitting} disabled={submitting}>
          {submitting ? "Creating account..." : "Register"}
        </Button>

        {message && <Text>{message}</Text>}
      </Card>
    </Page>
  );
}