import { useEffect } from "react";
import { Page, Layout, Card, Text, Button } from "@shopify/polaris";

export default function ArtistDashboard({ setActivePage }) {

  // ⭐ AUTO-REDIRECT IF OWNER REMOVED THE ARTIST
  useEffect(() => {
    const artistId = localStorage.getItem("artistId"); // adjust if stored differently

    if (!artistId) return;

    fetch(`/api/artists/${artistId}`)
      .then(res => res.json())
      .then(data => {
        if (data.role === "solo") {
          alert("You’ve been removed from the studio and switched to Solo Artist mode.");
          localStorage.setItem("role", "solo");
          window.location.href = "/solo/dashboard";
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Page title="Artist Dashboard">
      <Layout>

        {/* ⭐ Artist Quick Actions */}
        <Layout.Section>
          <Card sectioned className="ink-card">
            <Text variant="headingLg" as="h2">
              Welcome Artist
            </Text>

            <Text>
              You can shop products, submit orders, and complete your checklist.
            </Text>

            <div className="artist-actions">
              <Button className="ink-button" onClick={() => setActivePage("products")}>
                Shop New
              </Button>

              <Button className="ink-button" onClick={() => setActivePage("artist-checklist")}>
                Checklist
              </Button>

              <Button className="ink-button" onClick={() => setActivePage("artist-order")}>
                Submit Order
              </Button>

              <Button className="ink-button" onClick={() => setActivePage("artist-orders")}>
                My Orders
              </Button>
            </div>
          </Card>
        </Layout.Section>

      </Layout>
    </Page>
  );
}
