// ======================================================
// =============== SHOP NEW (OWNER PRODUCTS) =============
// ======================================================

import { useEffect, useState } from "react";
import { Page, Layout, Card, Text, Button, TextField } from "@shopify/polaris";

// ⭐ FIXED — correct backend API base URL
import { API_BASE_URL } from "../api";


export default function OwnerProducts() {
  const [products, setProducts] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [loading, setLoading] = useState(true);

  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favoriteProducts")) || []
  );

  const [quantities, setQuantities] = useState({});

  // ⭐ Product search — filters everything below by title as the user types
  const [searchQuery, setSearchQuery] = useState("");

  function changeQty(id, delta) {
    setQuantities((prev) => {
      const newQty = Math.max(1, (prev[id] || 1) + delta);
      return { ...prev, [id]: newQty };
    });
  }

  function toggleFavorite(product) {
    let updated;

    if (favorites.find((f) => f.id === product.id)) {
      updated = favorites.filter((f) => f.id !== product.id);
    } else {
      updated = [...favorites, product];
    }

    setFavorites(updated);
    localStorage.setItem("favoriteProducts", JSON.stringify(updated));
  }

  useEffect(() => {
    async function loadProducts() {
      try {
        // ⭐ FIXED — now calls your Render backend
        const res = await fetch(`${API_BASE_URL}/api/products`);
const data = await res.json();
console.log("API_BASE_URL =", API_BASE_URL);
console.log("Products returned:", data);
console.log("Count:", Array.isArray(data) ? data.length : "Not an array");
setProducts(data);
        const sorted = [...data].sort((a, b) => {
          const aSales = a.sales || 0;
          const bSales = b.sales || 0;
          return bSales - aSales;
        });

        setTopSelling(sorted.slice(0, 10));
      } catch (err) {
        console.error("Error loading products:", err);
      }
      setLoading(false);
    }

    loadProducts();
  }, []);

  const categories = {};
  products.forEach((p) => {
    const cat = p.category || "Other";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(p);
  });

  // ⭐ When there's a search query, flatten everything down to one
  // "Search Results" list of matching products instead of the normal
  // Top Selling / Favorites / Category layout.
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const isSearching = trimmedQuery.length > 0;
  const searchResults = isSearching
    ? products.filter((p) => (p.title || "").toLowerCase().includes(trimmedQuery))
    : [];

  function ProductCard({ product }) {
    const price = product.variants?.[0]?.price || "N/A";
    const isFav = favorites.find((f) => f.id === product.id);
    const qty = quantities[product.id] || 1;

    return (
      <Card sectioned>
        <Text variant="headingMd" as="h3">
          {product.title}
        </Text>

        <Text as="p" style={{ marginTop: "4px" }}>
          ${price}
        </Text>

        <div
          style={{
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span
            onClick={() => changeQty(product.id, -1)}
            style={{
              fontSize: "22px",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            ➖
          </span>

          <Text as="p" variant="headingMd">
            {qty}
          </Text>

          <span
            onClick={() => changeQty(product.id, +1)}
            style={{
              fontSize: "22px",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            ➕
          </span>
        </div>

        <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
          <Button
            tone="success"
            onClick={() =>
              alert(`Added ${qty} × ${product.title} to order!`)
            }
          >
            Add to Order
          </Button>

          <Button
            tone={isFav ? "critical" : "primary"}
            onClick={() => toggleFavorite(product)}
          >
            {isFav ? "❤️ Remove" : "🤍 Favorite"}
          </Button>
        </div>
      </Card>
    );
  }

  function FavoriteCard({ product }) {
    const price = product.variants?.[0]?.price || "N/A";
    const isFav = favorites.find((f) => f.id === product.id);
    const qty = quantities[product.id] || 1;

    return (
      <div
        style={{
          minWidth: "240px",
          maxWidth: "240px",
          marginRight: "16px",
          flexShrink: 0,
        }}
      >
        <Card sectioned>
          <Text variant="headingMd" as="h3">
            {product.title}
          </Text>

          <Text as="p" style={{ marginTop: "4px" }}>
            ${price}
          </Text>

          <div
            style={{
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span
              onClick={() => changeQty(product.id, -1)}
              style={{
                fontSize: "22px",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              ➖
            </span>

            <Text as="p" variant="headingMd">
              {qty}
            </Text>

            <span
              onClick={() => changeQty(product.id, +1)}
              style={{
                fontSize: "22px",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              ➕
            </span>
          </div>

          <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
            <Button
              tone="success"
              onClick={() =>
                alert(`Added ${qty} × ${product.title} to order!`)
              }
            >
              Add to Order
            </Button>

            <Button
              tone={isFav ? "critical" : "primary"}
              onClick={() => toggleFavorite(product)}
            >
              {isFav ? "❤️ Remove" : "🤍 Favorite"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
    marginTop: "1rem",
  };

  return (
    <Page title="Shop New">
      <Layout>
        <Layout.Section>
          <div style={{ marginBottom: "1rem" }}>
            <TextField
              label="Search products"
              labelHidden
              placeholder="🔍 Search products by name..."
              value={searchQuery}
              onChange={(value) => setSearchQuery(value)}
              clearButton
              onClearButtonClick={() => setSearchQuery("")}
              autoComplete="off"
            />
          </div>

          {loading && <Text>Loading products...</Text>}

          {!loading && isSearching && (
            <Card title={`Search Results (${searchResults.length})`} sectioned>
              {searchResults.length > 0 ? (
                <div style={gridStyle}>
                  {searchResults.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <Text as="p">No products match "{searchQuery}".</Text>
              )}
            </Card>
          )}

          {!loading && !isSearching && topSelling.length > 0 && (
            <Card title="🔥 Top Selling Products" sectioned>
              <div style={gridStyle}>
                {topSelling.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </Card>
          )}

          {!loading && !isSearching && favorites.length > 0 && (
            <Card>
              <div style={{ padding: "1rem", position: "relative" }}>
                <Text variant="headingLg" as="h2">
                  ⭐ Favorite Items
                </Text>

                <div
                  style={{
                    height: "1px",
                    backgroundColor: "#e1e3e5",
                    margin: "12px 0 20px 0",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    overflowX: "auto",
                    paddingBottom: "10px",
                    gap: "16px",
                    scrollBehavior: "smooth",
                  }}
                >
                  {favorites.map((p) => (
                    <FavoriteCard key={p.id} product={p} />
                  ))}
                </div>

                <div
                  style={{
                    position: "absolute",
                    top: "60px",
                    right: "0",
                    width: "60px",
                    height: "140px",
                    background:
                      "linear-gradient(to right, transparent, rgba(255,255,255,0.9))",
                    pointerEvents: "none",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    top: "120px",
                    right: "10px",
                    fontSize: "24px",
                    opacity: 0.6,
                    pointerEvents: "none",
                  }}
                >
                  ➜
                </div>
              </div>
            </Card>
          )}

          {!loading &&
            !isSearching &&
            Object.keys(categories).map((cat) => (
              <Card key={cat} title={cat} sectioned>
                <div style={gridStyle}>
                  {categories[cat].map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </Card>
            ))}

          {!loading && !isSearching && products.length === 0 && (
            <Text>No products found.</Text>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
