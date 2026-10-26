import { useEffect, useState } from "react";
import { Page, Layout, Card, Text, Button, TextField } from "@shopify/polaris";
import { API_BASE_URL, currentUser } from "../api";

export default function ArtistSettings() {
  const [artists, setArtists] = useState([]);

  async function loadArtists() {
    const ownerId = currentUser()?._id;
    if (!ownerId) return setArtists([]);
    const res = await fetch(`${API_BASE_URL}/api/artists?ownerId=${ownerId}`);
    const data = await res.json();
    setArtists(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadArtists();
  }, []);

  async function updateLimit(id, spendingLimit) {
    await fetch(`${API_BASE_URL}/api/artists/${id}/limit`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spendingLimit })
    });

    loadArtists();
  }

  async function updateRestricted(id, restrictedItems) {
    await fetch(`${API_BASE_URL}/api/artists/${id}/restricted`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restrictedItems })
    });

    loadArtists();
  }

  return (
    <Page title="Artist Settings">
      <Layout>
        <Layout.Section>
          {artists.map((artist) => (
            <Card key={artist._id} sectioned>
              <Text variant="headingMd">{artist.name}</Text>

              <TextField
                label="Spending Limit"
                type="number"
                value={artist.spendingLimit}
                onChange={(v) => updateLimit(artist._id, Number(v))}
              />

              <TextField
                label="Restricted Items (comma separated)"
                value={artist.restrictedItems.join(", ")}
                onChange={(v) =>
                  updateRestricted(artist._id, v.split(",").map((s) => s.trim()))
                }
              />
            </Card>
          ))}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
