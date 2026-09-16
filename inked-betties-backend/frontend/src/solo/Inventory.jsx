import { useState, useEffect } from "react";
import { API_BASE_URL } from "../api";   // ⭐ FIXED — correct backend API base URL

export default function Inventory() {
  const [open, setOpen] = useState({});
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggle = (cat) => {
    setOpen({ ...open, [cat]: !open[cat] });
  };

  useEffect(() => {
    async function loadProducts() {
      try {
        // ⭐ FIXED — now calls your Render backend
        const res = await fetch(`${API_BASE_URL}/api/products`);
        const data = await res.json();

        if (data.status !== "ok") {
          throw new Error(data.message || "Failed to load products");
        }

        // CUSTOMER-FACING CATEGORIES
        const grouped = {
          Needles: data.products
            .filter((p) => p.category === "Needles")
            .map((p) => p.title),

          Cartridges: data.products
            .filter((p) => p.category === "Cartridges")
            .map((p) => p.title),

          Pigments: data.products
            .filter((p) => p.category === "Pigments")
            .map((p) => p.title),

          PPE: data.products
            .filter((p) => p.category === "PPE")
            .map((p) => p.title),

          Aftercare: data.products
            .filter((p) => p.category === "Aftercare")
            .map((p) => p.title),

          MachineParts: data.products
            .filter((p) => p.category === "Machine Parts")
            .map((p) => p.title),

          ShopSupplies: data.products
            .filter((p) => p.category === "Shop Supplies")
            .map((p) => p.title),
        };

        setCategories(grouped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error loading products: {error}</div>;

  return (
    <div>
      <h2>My Inventory</h2>

      {Object.keys(categories).map((cat) => (
        <div key={cat} style={{ marginBottom: "12px" }}>
          <div
            onClick={() => toggle(cat)}
            style={{ cursor: "pointer", fontWeight: "bold" }}
          >
            {open[cat] ? "▾" : "▸"} {cat}
          </div>

          {open[cat] && (
            <div style={{ marginLeft: "20px", marginTop: "6px" }}>
              {categories[cat].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "4px",
                  }}
                >
                  <span>{item}</span>

                  <button>Order</button>

                  <a
                    href={`https://inkedbetties.com/products/${encodeURIComponent(
                      item
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ↗
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
