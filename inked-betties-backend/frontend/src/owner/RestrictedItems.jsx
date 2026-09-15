// ======================================================
// =============== RESTRICTED ITEMS PAGE =================
// ======================================================

import { Page, Layout, Card, Text } from "@shopify/polaris";

export default function RestrictedItems() {
  const artists = JSON.parse(localStorage.getItem("studioArtists")) || [];

  const allRestricted = [];

  artists.forEach((a) => {
    a.restrictedItems.forEach((item) => {
      allRestricted.push({ item, artist: a.email });
    });
  });

  return (
    <Page title="Restricted Items">
      <Layout>
        <Layout.Section>
          <Card>
            <Text variant="headingLg" as="h2">
              Restricted Items
            </Text>

            {allRestricted.length === 0 && (
              <Text>No restricted items set.</Text>
            )}

            {allRestricted.map((r, i) => (
              <Card key={i} sectioned>
                <Text variant="headingMd" as="h3">{r.item}</Text>
                <Text as="p">Restricted for: {r.artist}</Text>
              </Card>
            ))}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
