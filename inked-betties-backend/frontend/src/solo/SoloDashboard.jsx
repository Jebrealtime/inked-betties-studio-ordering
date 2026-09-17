import { useEffect, useState } from "react";
import { Page, Layout, Card, Text, Button, Badge } from "@shopify/polaris";
import { API_BASE_URL } from "../api";

export default function SoloDashboard({ setActivePage }) {
  const [artist, setArtist] = useState(null);
  const [artists, setArtists] = useState([]);
  const [orders, setOrders] = useState([]);
  const [previousOrders, setPreviousOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // ⭐ Load all artists from backend
  useEffect(() => {
    async function loadArtists() {
      const res = await fetch(`${API_BASE_URL}/api/artists`);
      const data = await res.json();
      setArtists(data);
    }

    loadArtists();
  }, []);

  // ⭐ Auto-load the test solo artist once artists are fetched
  useEffect(() => {
const loggedInUser = JSON.parse(
localStorage.getItem("user")
);
if (loggedInUser) {
setArtist(loggedInUser);
}
}, []);

  // ⭐ Load artist-specific data
  useEffect(() => {
    async function loadData() {
      if (!artist) return;

      setFavorites(artist.favorites || []);

      const ordersRes = await fetch(`${API_BASE_URL}/api/orders/artist/${artist.email}`);
      const ordersData = await ordersRes.json();
      setOrders(ordersData || []);

      const prevRes = await fetch(`${API_BASE_URL}/api/previous-orders/${artist.email}`);
      const prevData = await prevRes.json();
      setPreviousOrders(prevData || []);
    }

    loadData();
  }, [artist]);

  // ⭐ Show loading screen until test artist is auto-loaded
  if (!artist) {
    return (
      <Page title="Loading Solo Artist...">
        <Card sectioned className="ink-card">
          <Text>Loading your solo artist profile...</Text>
        </Card>
      </Page>
    );
  }

  return (
    <Page title={`Welcome, ${artist.name}`}>
      <Layout>

        {/* ⭐ Quick Actions (clean grid) */}
        <Layout.Section>
          <Card sectioned className="ink-card">
            <Text as="h2" variant="headingLg">Quick Actions</Text>

            <div className="solo-actions">
              <Button className="ink-button" onClick={() => setActivePage("products")}>
                Shop New
              </Button>

              <Button className="ink-button" onClick={() => setActivePage("solo-inventory")}>
                My Inventory
              </Button>

              <Button className="ink-button" onClick={() => setActivePage("solo-order")}>
                Order Supplies
              </Button>

              <Button className="ink-button" onClick={() => setActivePage("artist-settings")}>
                Settings
              </Button>
            </div>
          </Card>
        </Layout.Section>

        {/* ⭐ Favorites (horizontal scroll) */}
        <Layout.Section>
          <Card sectioned className="ink-card">
            <Text as="h2" variant="headingLg">Favorite Products</Text>

            {favorites.length === 0 && (
              <Text>You have no favorite products yet.</Text>
            )}

            {favorites.length > 0 && (
              <div className="favorite-scroll">
                {favorites.map((item, i) => (
                  <div key={i} className="product-tile">
                    <Text className="product-title">{item}</Text>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Layout.Section>

        {/* ⭐ Current Orders */}
        <Layout.Section>
          <Card sectioned className="ink-card">
            <Text as="h2" variant="headingLg">Current Orders</Text>

            {orders.length === 0 && <Text>No active orders.</Text>}

            {orders.map((order, i) => (
              <Card key={i} sectioned className="ink-card">
                <Text>Order ID: {order._id}</Text>
                <Text>Status: {order.status}</Text>
              </Card>
            ))}
          </Card>
        </Layout.Section>

        {/* ⭐ Previous Orders */}
        <Layout.Section>
          <Card sectioned className="ink-card">
            <Text as="h2" variant="headingLg">Previous Orders</Text>

            {previousOrders.length === 0 && <Text>No previous orders found.</Text>}

            {previousOrders.map((order, i) => (
              <Card key={i} sectioned className="ink-card">
                <Text>Order ID: {order._id}</Text>
                <Text>Date: {order.date}</Text>
              </Card>
            ))}
          </Card>
        </Layout.Section>

      </Layout>
    </Page>
  );
}
