import { useState, useEffect } from "react";
import { Page, Layout, Card, Text, Button } from "@shopify/polaris";

export default function ArtistOrder() {
  const [restricted, setRestricted] = useState([]);

  useEffect(() => {
    async function loadRestricted() {
      const res = await fetch("/api/settings/restricted");
      const data = await res.json();
      setRestricted(data);
    }
    loadRestricted();
  }, []);

  return (
    <Page title="Submit Order">
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Text>Order form goes here.</Text>
            <Text tone="critical">
              Restricted: {restricted.join(", ")}
            </Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
