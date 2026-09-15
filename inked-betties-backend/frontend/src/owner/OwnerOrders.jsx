import { useEffect, useState } from "react";
import { Page, Layout, Card, Text, Button } from "@shopify/polaris";

export default function OwnerOrders() {
  const [orders, setOrders] = useState([]);

  async function loadOrders() {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Order load error:", err);
      setOrders([]);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function approve(id) {
    await fetch(`/api/orders/${id}/approve`, { method: "PUT" });
    loadOrders();
  }

  async function reject(id) {
    await fetch(`/api/orders/${id}/reject`, { method: "PUT" });
    loadOrders();
  }

  const pending = orders.filter((o) => o.status === "Pending");
  const approved = orders.filter((o) => o.status === "Approved");

  return (
    <Page title="Staff Orders">
      <Layout>

        {/* ===========================
            PENDING ORDERS
        ============================ */}
        <Layout.Section>
          <Card sectioned>
            <Text as="h2" variant="headingLg">
              Pending Orders
            </Text>

            {pending.length === 0 && (
              <Text>No pending orders.</Text>
            )}

            {pending.map((order) => (
              <Card key={order._id} sectioned>
                <Text as="h3" variant="headingMd">
                  {order.artist}
                </Text>

                <Text>Status: Pending</Text>
                <Text>Date: {order.date}</Text>

                <div style={{ marginTop: "1rem" }}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ marginBottom: "6px" }}>
                      <Text>{item.name}</Text>
                      <Text>Qty: {item.qty} — ${item.price}</Text>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "1rem", display: "flex", gap: "10px" }}>
                  <Button onClick={() => approve(order._id)}>Approve</Button>
                  <Button onClick={() => reject(order._id)}>Reject</Button>
                </div>
              </Card>
            ))}
          </Card>
        </Layout.Section>

        {/* ===========================
            APPROVED ORDERS
        ============================ */}
        <Layout.Section>
          <Card sectioned>
            <Text as="h2" variant="headingLg">
              Approved Orders
            </Text>

            {approved.length === 0 && (
              <Text>No approved orders yet.</Text>
            )}

            {approved.map((order) => (
              <Card key={order._id} sectioned>
                <Text as="h3" variant="headingMd">
                  {order.artist}
                </Text>

                <Text>Status: Approved</Text>
                <Text>Date: {order.date}</Text>

                <div style={{ marginTop: "1rem" }}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ marginBottom: "6px" }}>
                      <Text>{item.name}</Text>
                      <Text>Qty: {item.qty} — ${item.price}</Text>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </Card>
        </Layout.Section>

      </Layout>
    </Page>
  );
}
