// ======================================================
// =============== OWNER REORDER PAGE ====================
// ======================================================

import { useState } from "react";
import { Page, Layout, Card, Text, Button, TextField } from "@shopify/polaris";

export default function OwnerReorder({ reorderItems, onSubmit }) {
  const [items, setItems] = useState(reorderItems);

  // ======================================================
  // =============== UPDATE QUANTITY ======================
  // ======================================================

  function updateQty(name, newQty) {
    setItems({
      ...items,
      [name]: {
        ...items[name],
        qty: Number(newQty),
      },
    });
  }

  // ======================================================
  // =============== SUBMIT REORDER =======================
  // ======================================================

  function submitReorder() {
    console.log("Final reorder submitted:", items);

    alert("Reorder submitted! (We will save this to Previous Orders next)");

    if (onSubmit) onSubmit(items);
  }

  // ======================================================
  // =============== RENDER UI ============================
  // ======================================================

  return (
    <Page title="Finalize Reorder">
      <Layout>
        <Layout.Section>
          <Card>
            <Text variant="headingLg" as="h2">
              Finalize Reorder
            </Text>

            <Text as="p" tone="subdued" style={{ marginBottom: "1rem" }}>
              Adjust quantities below before submitting your reorder.
            </Text>

            {/* Item List */}
            {Object.keys(items).map((name) => (
              <Card key={name} sectioned>
                <Text variant="headingMd" as="h3">{name}</Text>

                <TextField
                  label="Quantity"
                  type="number"
                  value={String(items[name].qty)}
                  onChange={(val) => updateQty(name, val)}
                />

                <Text as="p" tone="subdued" style={{ marginTop: "0.5rem" }}>
                  Price: ${items[name].price}
                </Text>
              </Card>
            ))}

            {/* Submit Button */}
            <Button
              tone="success"
              onClick={submitReorder}
              fullWidth
              style={{ marginTop: "1.5rem" }}
            >
              Submit Reorder
            </Button>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
