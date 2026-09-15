import { useEffect, useState } from "react";
import { Page, Layout, Card, Text, Checkbox } from "@shopify/polaris";

export default function ArtistChecklist() {
  const [items, setItems] = useState([]);
  const [checked, setChecked] = useState({});
  const [artist, setArtist] = useState(null);

  useEffect(() => {
    async function loadChecklist() {
      // ⭐ 1. Load logged-in artist
      const stored = localStorage.getItem("artist");
      if (!stored) return;
      const user = JSON.parse(stored);
      setArtist(user);

      // ⭐ 2. Load studio-wide checklist
      const res = await fetch("/api/settings");
      const data = await res.json();
      const checklist = Array.isArray(data.checklist) ? data.checklist : [];
      setItems(checklist);

      // ⭐ 3. DAILY RESET CHECK
      const today = new Date().toISOString().split("T")[0];

      if (user.lastChecklistReset !== today) {
        await fetch(`/api/artists/${user._id}/reset-checklist`, {
          method: "POST"
        });

        // update local copy so it doesn't reset twice
        user.lastChecklistReset = today;
        localStorage.setItem("artist", JSON.stringify(user));
      }

      // ⭐ 4. Load artist progress
      const artistRes = await fetch(`/api/artists/${user._id}`);
      const artistData = await artistRes.json();

      const progress = artistData.checklistProgress || {};

      const initial = {};
      checklist.forEach((item) => {
        initial[item] = progress[item] || false;
      });

      setChecked(initial);
    }

    loadChecklist();
  }, []);

  async function toggleItem(item) {
    if (!artist) return;

    const newValue = !checked[item];

    // Update UI immediately
    setChecked({
      ...checked,
      [item]: newValue,
    });

    // ⭐ Save progress + notify owner
    await fetch(`/api/artists/${artist._id}/checklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item,
        completed: newValue
      })
    });
  }

  return (
    <Page title="Checklist">
      <Layout>
        <Layout.Section>
          <Card sectioned>
            {items.length === 0 && <Text>No checklist items.</Text>}

            {items.map((item, i) => (
              <Checkbox
                key={i}
                label={item}
                checked={checked[item] || false}
                onChange={() => toggleItem(item)}
              />
            ))}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
