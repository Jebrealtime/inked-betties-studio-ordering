import { Page, Layout, Card, Text, TextField, Button } from "@shopify/polaris";
import { useState, useEffect } from "react";

const API = "https://inked-betties-backend-1.onrender.com";   // ⭐ FIXED — your backend is on port 80

export default function OwnerInventory() {
  const [newItem, setNewItem] = useState({
    name: "",
    vendor: "",
    vendorLink: "",
    quantity: "",
    lowStock: "",
  });

  const [inventory, setInventory] = useState([]);

  // ⭐ LOAD INVENTORY FROM BACKEND
  useEffect(() => {
    async function loadInventory() {
      try {
        const res = await fetch(`${API}/api/inventory`);
        const data = await res.json();
        setInventory(data);
      } catch (err) {
        console.error("Error loading inventory:", err);
      }
    }
    loadInventory();
  }, []);

  // ⭐ ADD ITEM TO BACKEND
  async function addItem() {
    if (!newItem.name.trim()) return alert("Item name is required.");

    try {
      const res = await fetch(`${API}/api/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      const savedItem = await res.json();
      setInventory([...inventory, savedItem]);

      setNewItem({
        name: "",
        vendor: "",
        vendorLink: "",
        quantity: "",
        lowStock: "",
      });
    } catch (err) {
      console.error("Error adding item:", err);
    }
  }

  // ⭐ DELETE ITEM
  async function deleteItem(id) {
    try {
      await fetch(`${API}/api/inventory/${id}`, { method: "DELETE" });
      setInventory(inventory.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  }

  // ⭐ AUTO-RESTOCK FROM INKED BETTIES
  async function reorderBetties(itemId) {
    const quantity = prompt("How many units do you want to reorder?");
    if (!quantity) return;

    try {
      const res = await fetch(`${API}/api/inventory/reorder/betties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: Number(quantity) }),
      });

      const updated = await res.json();

      setInventory(
        inventory.map((item) =>
          item._id === itemId ? updated.item : item
        )
      );
    } catch (err) {
      console.error("Error auto-restocking:", err);
    }
  }

  // ⭐ MANUAL RESTOCK (EXTERNAL)
  async function reorderExternal(itemId) {
    const quantity = prompt("How many units did you restock?");
    if (!quantity) return;

    try {
      const res = await fetch(`${API}/api/inventory/reorder/external`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: Number(quantity) }),
      });

      const updated = await res.json();

      setInventory(
        inventory.map((item) =>
          item._id === itemId ? updated.item : item
        )
      );
    } catch (err) {
      console.error("Error manual restocking:", err);
    }
  }

  return (
    <Page title="Studio Inventory">
      <Layout>

        {/* ⭐ PAGE EXPLANATION */}
        <Layout.Section>
          <Card sectioned>
            <Text variant="headingLg" as="h2">Studio Inventory</Text>

            <p
              style={{
                marginBottom: "16px",
                fontStyle: "italic",
                color: "#6d7175",
                fontSize: "14px",
                lineHeight: "20px",
              }}
            >
              Your studio inventory includes all supplies you keep in stock,
              no matter where they are purchased. Items added here can come
              from any vendor. If Inked Betties carries the same item, you’ll
              see an option to buy it directly from us. When you reorder an
              Inked Betties item, your inventory levels will automatically
              update to reflect the new stock.
            </p>

            <Text as="p">
              Track quantities, set low-stock alerts, reorder supplies, and
              manage vendor preferences. This keeps your studio organized even
              when products come from multiple sources.
            </Text>
          </Card>
        </Layout.Section>

        {/* ⭐ CURRENT INVENTORY FIRST */}
        <Layout.Section>
          <Card sectioned>
            <Text variant="headingMd" as="h3">Current Inventory</Text>

            {inventory.length === 0 && (
              <Text as="p">No inventory items added yet.</Text>
            )}

            {inventory.map((item) => (
              <Card key={item._id} sectioned>
                <Text variant="headingSm" as="h4">{item.name}</Text>

                <p>Vendor: {item.vendor || "Unknown"}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Low-stock alert: {item.lowStock}</p>

                {/* ⭐ LOW-STOCK WARNING */}
                {item.quantity <= item.lowStock && (
                  <p style={{ color: "red", fontWeight: "bold" }}>
                    Low Stock — Consider reordering
                  </p>
                )}

                {/* ⭐ BUY FROM INKED BETTIES */}
                {item.bettiesAvailable && (
                  <Button tone="success" onClick={() => reorderBetties(item._id)}>
                    Buy from Inked Betties
                  </Button>
                )}

                {/* ⭐ EXTERNAL REORDER */}
                {!item.bettiesAvailable && item.vendorLink && (
                  <Button url={item.vendorLink}>
                    Reorder from Vendor
                  </Button>
                )}

                {/* ⭐ MANUAL RESTOCK BUTTON */}
                {!item.bettiesAvailable && (
                  <Button onClick={() => reorderExternal(item._id)}>
                    Manual Restock
                  </Button>
                )}

                {/* ⭐ DELETE ITEM */}
                <Button tone="critical" onClick={() => deleteItem(item._id)}>
                  Delete Item
                </Button>
              </Card>
            ))}
          </Card>
        </Layout.Section>

        {/* ⭐ ADD INVENTORY ITEM SECOND */}
        <Layout.Section>
          <Card sectioned>
            <Text variant="headingMd" as="h3">Add Inventory Item</Text>

            <TextField
              label="Item Name"
              value={newItem.name}
              onChange={(v) => setNewItem({ ...newItem, name: v })}
            />

            <TextField
              label="Vendor"
              value={newItem.vendor}
              onChange={(v) => setNewItem({ ...newItem, vendor: v })}
            />

            <TextField
              label="Vendor Link (optional)"
              value={newItem.vendorLink}
              onChange={(v) => setNewItem({ ...newItem, vendorLink: v })}
            />

            <TextField
              label="Quantity"
              type="number"
              value={newItem.quantity}
              onChange={(v) => setNewItem({ ...newItem, quantity: v })}
            />

            <TextField
              label="Low-stock alert threshold"
              type="number"
              value={newItem.lowStock}
              onChange={(v) => setNewItem({ ...newItem, lowStock: v })}
            />

            <Button tone="success" onClick={addItem}>
              Add Item
            </Button>
          </Card>
        </Layout.Section>

      </Layout>
    </Page>
  );
}
