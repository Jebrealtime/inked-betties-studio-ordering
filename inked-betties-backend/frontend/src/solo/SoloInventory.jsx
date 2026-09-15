import { Page, Layout, Card, Text } from "@shopify/polaris";

export default function SoloInventory() {
  return (
    <Page title="My Inventory">
      <Layout>
        <Layout.Section>
          <Card>
            <Text variant="headingLg" as="h2">My Inventory</Text>
            <Text as="p">
              This is your personal inventory. You can track supplies you own,
              items you need, and reorder materials.
            </Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
