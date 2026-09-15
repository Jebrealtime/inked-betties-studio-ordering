import { useEffect, useState } from "react";
import { Page, Layout, Card, Text, Button } from "@shopify/polaris";

// ⭐ FIXED — correct backend API base URL
const API = "https://inked-betties-backend-1.onrender.com";

export default function SoloOrderSupplies() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  async function loadProducts() {
    try {
      // ⭐ FIXED — now calls your Render backend
      const res = await fetch(`${API}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function addToCart(product) {
    setCart([
      ...cart,
      {
        name: product.title,
        price: product.variants[0].price,
        qty: 1,
      },
    ]);
  }

  async function submitOrder() {
    try {
      // ⭐ FIXED — now posts to your Render backend
      await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artist: "Solo Artist",
          items: cart,
        }),
      });

      alert("Order submitted!");
      setCart([]);
    } catch (err) {
      console.error("Error submitting order:", err);
      alert("Failed to submit order.");
    }
  }

  return (
    <Page title="Order Supplies">
      <Layout>
        <Layout.Section>
          <Card>
            <Text variant="headingLg">Products</Text>

            {products.map((p) => (
              <Card key={p.id} sectioned>
                <Text>{p.title}</Text>
                <Text>Price: ${p.variants[0].price}</Text>
                <Text>
                  {p.variants[0].inventory_quantity > 0
                    ? "Available"
                    : "Unavailable"}
                </Text>

                {p.variants[0].inventory_quantity > 0 && (
                  <Button onClick={() => addToCart(p)}>Add to Cart</Button>
                )}
              </Card>
            ))}

            {cart.length > 0 && (
              <Button tone="success" onClick={submitOrder}>
                Submit Order
              </Button>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
