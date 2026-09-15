import { useState } from "react";
import { Page, Card, TextField, Button, Text } from "@shopify/polaris";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    const res = await fetch("/api/artists/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.status !== "ok") {
      setError(data.message || "Login failed");
      return;
    }

    setUser(data.artist);
    localStorage.setItem("user", JSON.stringify(data.artist));
  }

  return (
    <Page title="Inked Betties Login">
      <Card sectioned>
        <TextField label="Email" value={email} onChange={setEmail} />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
        />

        {error && <Text tone="critical">{error}</Text>}

        <Button tone="success" onClick={handleLogin}>
          Login
        </Button>
      </Card>
    </Page>
  );
}
