import { useState } from "react";
import { Page, Card, TextField, Button, Text } from "@shopify/polaris";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "artist"
  });

  const [message, setMessage] = useState("");

  function updateField(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleRegister() {
    const res = await fetch("/api/artists/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (data.status === "ok") {
      setMessage("Account created! You can now log in.");
    } else {
      setMessage("Error creating account.");
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
          type="password"
          value={form.password}
          onChange={(v) => updateField("password", v)}
        />

        <TextField
          label="Role (artist, solo, owner)"
          value={form.role}
          onChange={(v) => updateField("role", v)}
        />

        <Button tone="success" onClick={handleRegister}>
          Register
        </Button>

        {message && <Text>{message}</Text>}
      </Card>
    </Page>
  );
}
