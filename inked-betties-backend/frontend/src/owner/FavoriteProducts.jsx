// ======================================================
// =============== FAVORITE PRODUCTS (OWNER) =============
// ======================================================

import { useEffect, useState } from "react";
import { Page, Layout, Card, Text, Button } from "@shopify/polaris";

export default function FavoriteProducts() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favoriteProducts")) || [];
    setFavorites(saved);
  }, []);

  function removeFavorite(id) {
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    localStorage.setItem("favoriteProducts", JSON.stringify(updated));
  }

  return (
    <Page title="Favorite Products">
      <Layout>
        <Layout.Section>
          <Card>
            <Text variant="headingLg" as="h2">
              Favorite Products
            </Text>

            {favorites.length === 0 && (
              <Text>No favorite products yet.</Text>
            )}

            {favorites.length > 0 &&
              favorites.map((p) => (
                <Card key={p.id} sectioned>
                  <Text variant="headingMd" as="h3">{p.title}</Text>
                  <Text as="p">Price: ${p.variants?.[0]?.price}</Text>

                  <Button
                    tone="critical"
                    onClick={() => removeFavorite(p.id)}
                    style={{ marginTop: "10px" }}
                  >
                    Remove Favorite ❤️
                  </Button>
                </Card>
              ))}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
