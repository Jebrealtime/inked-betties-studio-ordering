import { useEffect, useState } from "react";
import { Page, Layout, Card, Text } from "@shopify/polaris";

export default function PreviousOrders() {
  const [orders, setOrders] = useState([]);

  async function loadOrders() {
    const res = await fetch("/api/previous-orders");
    const data = await res.json();
    setOrders(data);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <Page title="Previous Combined Orders">
      <Layout>
        <Layout.Section>
          {orders.map((o) => (
            <Card key={o._id} sectioned>
              <Text variant="headingMd">{o.timestamp}</Text>

              <Text variant="headingSm">Combined Items</Text>
              {o.combinedItems.map((i, idx) => (
                <Text key={idx}>
                  {i.name} — Qty: {i.qty} — ${i.price}
                </Text>
              ))}

              <Text variant="headingSm" style={{ marginTop: "1rem" }}>
                Artist Orders
              </Text>
              {o.orders.map((ord, idx) => (
                <Text key={idx}>
                  {ord.artist} — {ord.status}
                </Text>
              ))}

              <Text style={{ marginTop: "1rem" }}>
                PDF: {o.pdfPath}
              </Text>
            </Card>
          ))}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
