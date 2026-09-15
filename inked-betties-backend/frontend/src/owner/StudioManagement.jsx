import { useEffect, useState } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  TextField,
  Button,
} from "@shopify/polaris";

export default function StudioManagement() {
  const [settings, setSettings] = useState({
    studioName: "",
    companySpendingLimit: 0,
    restrictedItems: "",
    checklist: "",
  });

  const [artists, setArtists] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [newArtistName, setNewArtistName] = useState("");
  const [newArtistEmail, setNewArtistEmail] = useState("");

  // ============================
  // LOAD SETTINGS
  // ============================
  async function loadSettings() {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();

      setSettings({
        studioName: data.studioName || "",
        companySpendingLimit: data.companySpendingLimit || 0,

        restrictedItems: Array.isArray(data.restrictedItems)
          ? data.restrictedItems.join(", ")
          : "",

        checklist: Array.isArray(data.checklist)
          ? data.checklist.join(", ")
          : "",
      });
    } catch (err) {
      console.error("Settings load error:", err);
    }
  }

  async function loadArtists() {
    try {
      const res = await fetch("/api/artists");
      const data = await res.json();
      setArtists(Array.isArray(data) ? data : []);
    } catch {
      setArtists([]);
    }
  }

  async function loadNotifications() {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    }
  }

  useEffect(() => {
    loadSettings();
    loadArtists();
    loadNotifications();
  }, []);

  // ============================
// SAVE ALL SETTINGS
// ============================
async function saveAllSettings() {
  try {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studioName: settings.studioName,
        companySpendingLimit: settings.companySpendingLimit,

        restrictedItems: settings.restrictedItems
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0),

        checklist: settings.checklist
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0),

        // ⭐ NEW FIELD — saves the toggle
        notifyOnChecklistCompletion: settings.notifyOnChecklistCompletion || false,
      }),
    });

    await res.json();
    alert("Settings saved!");
    loadSettings();
  } catch (err) {
    console.error("Save error:", err);
    alert("Error saving settings");
  }
}


  // ============================
  // INVITE ARTIST
  // ============================
  async function inviteArtist() {
    const res = await fetch("/api/artists/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newArtistName,
        email: newArtistEmail,
      }),
    });

    const data = await res.json();

    if (data.status === "ok") {
      alert("Artist invited!");
      setNewArtistName("");
      setNewArtistEmail("");
      loadArtists();
    } else {
      alert("Error inviting artist");
    }
  }

  // ============================
  // UPDATE ARTIST SPENDING LIMIT
  // ============================
  async function updateArtistLimit(id, newLimit) {
    try {
      await fetch(`/api/artists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spendingLimit: Number(newLimit),
        }),
      });

      loadArtists();
    } catch (err) {
      console.error("Artist update error:", err);
      alert("Error updating artist limit");
    }
  }

  // ============================
  // REMOVE ARTIST
  // ============================
  async function removeArtist(id) {
    await fetch(`/api/artists/${id}`, {
      method: "DELETE",
    });

    loadArtists();
  }

  return (
    <Page title="Studio Management">
      <Layout>
        <Layout.Section>

          {/* STUDIO INFO */}
          <Card sectioned>
            <Text as="h2" variant="headingLg">Studio Information</Text>

            <TextField
              label="Studio Name"
              value={settings.studioName}
              onChange={(v) => setSettings({ ...settings, studioName: v })}
            />
          </Card>

          {/* COMPANY + INDIVIDUAL SPENDING LIMITS */}
          <Card sectioned>
            <Text as="h2" variant="headingLg">Spending Limits</Text>

            {/* ⭐ ITALIC EXPLANATION (REAL ITALICS) */}
<p
  style={{
    marginBottom: "16px",
    fontStyle: "italic",
    color: "#6d7175", // Polaris subdued color
    fontSize: "14px",
    lineHeight: "20px",
  }}
>
  The company limit applies to each artist individually. It is not a combined
  studio-wide total. Each artist can spend up to this amount unless you set a
  personal limit for them.
</p>


            {/* Company Limit */}
            <TextField
              type="number"
              label="Company-Wide Spending Limit"
              value={String(settings.companySpendingLimit)}
              onChange={(v) =>
                setSettings({ ...settings, companySpendingLimit: Number(v) })
              }
            />

            {/* Individual Artist Limits */}
            <div style={{ marginTop: "20px" }}>
              <Text as="h3" variant="headingMd">
                Individual Artist Limits
              </Text>

              {artists.length === 0 && (
                <Text>No artists added yet.</Text>
              )}

              {artists.map((artist) => (
                <Card key={artist._id} sectioned>
                  <Text as="h3" variant="headingMd">{artist.name}</Text>
                  <Text>Email: {artist.email}</Text>

                  <TextField
                    type="number"
                    label="Artist Spending Limit (optional)"
                    value={String(artist.spendingLimit || "")}
                    onChange={(v) => updateArtistLimit(artist._id, v)}
                  />

                  <Text color="subdued">
                    {artist.spendingLimit
                      ? `This artist has a personal limit of $${artist.spendingLimit}.`
                      : `Using company limit of $${settings.companySpendingLimit}.`}
                  </Text>
                </Card>
              ))}
            </div>
          </Card>

          {/* RESTRICTED ITEMS */}
          <Card sectioned>
            <Text as="h2" variant="headingLg">Restricted Items</Text>

            <TextField
              label="Restricted Items (comma separated)"
              value={settings.restrictedItems}
              onChange={(v) =>
                setSettings({ ...settings, restrictedItems: v })
              }
            />
          </Card>

          {/* CHECKLIST */}
<Card sectioned>
  <Text as="h2" variant="headingLg">Artist Checklist</Text>

  {/* ⭐ ITALIC EXPLANATION */}
  <p
    style={{
      marginBottom: "16px",
      fontStyle: "italic",
      color: "#6d7175",
      fontSize: "14px",
      lineHeight: "20px",
    }}
  >
    This checklist appears on every artist’s dashboard. Use it for shared
    procedures such as opening tasks, closing tasks, sanitation steps,
    equipment checks, or anything all artists must complete. Artists can
    also mark these tasks as completed, and you can enable notifications
    so the owner is alerted when items are checked off.
  </p>

  {/* ⭐ NOTIFY OWNER TOGGLE */}
  <div style={{ marginBottom: "16px" }}>
    <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <input
        type="checkbox"
        checked={settings.notifyOnChecklistCompletion || false}
        onChange={(e) =>
          setSettings({
            ...settings,
            notifyOnChecklistCompletion: e.target.checked,
          })
        }
      />
      <span style={{ fontSize: "15px" }}>
        Notify owner when artists complete checklist items
      </span>
    </label>
  </div>

  <TextField
    label="Checklist Items (comma separated)"
    value={settings.checklist}
    onChange={(v) =>
      setSettings({ ...settings, checklist: v })
    }
  />
</Card>


          {/* ADD ARTIST */}
          <Card sectioned>
            <Text as="h2" variant="headingLg">Add Artist</Text>

            <TextField
              label="Artist Name"
              value={newArtistName}
              onChange={setNewArtistName}
            />

            <TextField
              label="Artist Email"
              value={newArtistEmail}
              onChange={setNewArtistEmail}
            />

            <Button tone="success" onClick={inviteArtist}>
              Invite Artist
            </Button>
          </Card>

          {/* CURRENT ARTISTS */}
          <Card sectioned>
            <Text as="h2" variant="headingLg">Current Artists</Text>

            {artists.length === 0 && <Text>No artists added yet.</Text>}

            {artists.map((artist) => (
              <Card key={artist._id} sectioned>
                <Text as="h3" variant="headingMd">{artist.name}</Text>
                <Text>Email: {artist.email}</Text>
                <Text>Role: {artist.role}</Text>

                <Button tone="critical" onClick={() => removeArtist(artist._id)}>
                  Remove Artist
                </Button>
              </Card>
            ))}
          </Card>

          {/* NOTIFICATIONS */}
          <Card sectioned>
            <Text as="h2" variant="headingLg">Notifications</Text>

            {notifications.length === 0 && <Text>No notifications yet.</Text>}

            {notifications.map((note) => (
              <Card key={note._id} sectioned>
                <Text>Artist: {note.artistEmail}</Text>
                <Text>Reasons: {Array.isArray(note.reasons) ? note.reasons.join(", ") : ""}</Text>
                <Text>Date: {note.date}</Text>
              </Card>
            ))}
          </Card>

          {/* SAVE */}
          <Card sectioned>
            <Button tone="success" onClick={saveAllSettings}>
              Save All Settings
            </Button>
          </Card>

        </Layout.Section>
      </Layout>
    </Page>
  );
}
