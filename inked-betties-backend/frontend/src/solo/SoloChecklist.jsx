import { Page, Layout, Card, Text, Button } from "@shopify/polaris";
import { useState } from "react";

export default function SoloChecklist() {
  const [items, setItems] = useState([
    { text: "Clean workstation", done: false },
    { text: "Prep needles", done: false },
    { text: "Check ink levels", done: false },
  ]);

  const toggleItem = (index) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, done: !item.done } : item
      )
    );
  };

  return (
    <Page title="My Checklist">
      <Layout>
        <Layout.Section>
          <Card>
            <Text variant="headingLg" as="h2">Daily Checklist</Text>

            <div style={{ marginTop: "1rem" }}>
              {items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <Text as="p">{item.text}</Text>
                  <Button onClick={() => toggleItem(i)}>
                    {item.done ? "Undo" : "Done"}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
