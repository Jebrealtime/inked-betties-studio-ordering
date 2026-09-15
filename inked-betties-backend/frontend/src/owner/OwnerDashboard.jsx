// ======================================================
// =============== OWNER DASHBOARD =======================
// ======================================================

import { Page, Layout, Card, Button, Text } from "@shopify/polaris";

export default function OwnerDashboard({ setActivePage }) {
  return (
    <Page title="Studio Owner Dashboard">

     

      {/* ⭐ NORMAL CONTENT BELOW WATERMARK */}
      <Layout>
        <Layout.Section>
          <Card sectioned className="ink-card">
            <Text variant="headingLg" as="h2">
              Welcome, Studio Owner
            </Text>

            <div className="owner-actions">
              <Button className="ink-button" onClick={() => setActivePage("orders")}>
                Staff Orders
              </Button>

              <Button className="ink-button" onClick={() => setActivePage("previous-orders")}>
                Previous Orders
              </Button>

              <Button className="ink-button" onClick={() => setActivePage("favorite-products")}>
                Favorite Products
              </Button>

              <Button className="ink-button" onClick={() => setActivePage("products")}>
                Shop New
              </Button>

              <Button className="ink-button" onClick={() => setActivePage("inventory")}>
                Inventory
              </Button>

              <Button className="ink-button" onClick={() => setActivePage("invite-artist")}>
                Invite Artist
              </Button>

              <Button className="ink-button" onClick={() => setActivePage("studio-management")}>
                Studio Management
              </Button>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
