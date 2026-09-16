// ======================================================
// ===============   IMPORTS & GLOBAL SETUP   ============
// ======================================================

import { useState, useEffect } from "react";
import {
  Frame,
  Navigation,
  Page,
  Layout,
  Card,
  Button,
  Text,
  TextField,
} from "@shopify/polaris";
import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import "./inked-betties-theme.css";

// SOLO PAGES
import SoloDashboard from "./solo/SoloDashboard";
import SoloInventory from "./solo/SoloInventory";
import SoloChecklist from "./solo/SoloChecklist";
import SoloOrderSupplies from "./solo/SoloOrderSupplies";

// OWNER PAGES
import OwnerDashboard from "./owner/OwnerDashboard";
import OwnerOrders from "./owner/OwnerOrders";
import OwnerProducts from "./owner/OwnerProducts";
import OwnerInventory from "./owner/OwnerInventory";
import InviteArtist from "./owner/InviteArtist";
import StudioManagement from "./owner/StudioManagement";
import PreviousOrders from "./owner/PreviousOrders";
import FavoriteProducts from "./owner/FavoriteProducts";

// ARTIST PAGES
import ArtistDashboard from "./artist/ArtistDashboard";
import ArtistChecklist from "./artist/ArtistChecklist";
import ArtistOrder from "./artist/ArtistOrder";

// NEW PAGES
import OwnerReorder from "./owner/OwnerReorder";
import ArtistSettings from "./owner/ArtistSettings";
import RestrictedItems from "./owner/RestrictedItems";

// ======================================================
// =====================   APP ROOT   ===================
// ======================================================

function App() {
  const [user, setUser] = useState(null);

  const devRole = localStorage.getItem("role") || "artist";
  const role = user?.role || devRole;

  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  // ======================================================
  // =====================   LOGIN FORM   =================
  // ======================================================

  const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    try {
      const res = await fetch(
        "https://https://inked-betties-studio-ordering.onrender.com.onrender.com/api/artists/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      // If backend returns HTML or empty body, this prevents the crash
      let data;
      try {
        data = await res.json();
      } catch {
        setError("Server returned invalid response");
        return;
      }

      if (data.status !== "ok") {
        setError(data.message || "Login failed");
        return;
      }

      setUser(data.artist);
      localStorage.setItem("user", JSON.stringify(data.artist));
    } catch (err) {
      setError("Network error — backend unreachable");
    }
  }

  return (
    <Page title="Inked Betties Login">
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <TextField label="Email" value={email} onChange={setEmail} />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
            />

            {error && <Text tone="critical">{error}</Text>}

            <Button tone="success" onClick={handleLogin}>
              Login
            </Button>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};


  // ======================================================
  // =====================   LOGOUT   =====================
  // ======================================================

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
    setActivePage("dashboard");
  }

  // ======================================================
  // ===================   ROLE SWITCHER   ================
  // ======================================================

  const RoleSwitcher = () => (
    <div
      style={{
        padding: "10px",
        background: "#f6f6f6",
        borderBottom: "1px solid #ddd",
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        position: "sticky",
        top: 0,
        zIndex: 999,
      }}
    >
      <Button
        onClick={() => {
          localStorage.setItem("role", "owner");
          window.location.reload();
        }}
      >
        Owner Mode
      </Button>

      <Button
        onClick={() => {
          localStorage.setItem("role", "solo");
          window.location.reload();
        }}
      >
        Solo Mode
      </Button>

      <Button
        onClick={() => {
          localStorage.setItem("role", "artist");
          window.location.reload();
        }}
      >
        Artist Mode
      </Button>

      {!user && (
        <Button tone="success" onClick={() => setActivePage("login")}>
          Login
        </Button>
      )}

      {user && (
        <Button tone="critical" onClick={logout}>
          Logout ({user.name})
        </Button>
      )}
    </div>
  );

  // ======================================================
  // =====================   PAGE ROUTER   ================
  // ======================================================

  const renderPage = () => {
    if (activePage === "login") return <LoginScreen />;

    switch (activePage) {
      case "dashboard":
        return role === "owner" ? (
          <OwnerDashboard setActivePage={setActivePage} />
        ) : role === "solo" ? (
          <SoloDashboard setActivePage={setActivePage} />
        ) : (
          <ArtistDashboard setActivePage={setActivePage} />
        );

      case "orders":
        return role === "owner" ? (
          <OwnerOrders setActivePage={setActivePage} />
        ) : (
          <Page title="Orders">
            <Text>No orders yet.</Text>
          </Page>
        );

      case "owner-reorder":
        return (
          <OwnerReorder
            reorderItems={JSON.parse(localStorage.getItem("reorderData"))}
            onSubmit={(finalOrder) => {
              console.log("Saved reorder:", finalOrder);
              setActivePage("previous-orders");
            }}
          />
        );

      case "previous-orders":
        return <PreviousOrders />;

      case "favorite-products":
        return <FavoriteProducts />;

      case "products":
        return <OwnerProducts />;

      case "inventory":
        return role === "owner" ? <OwnerInventory /> : <SoloInventory />;

      case "invite-artist":
        return <InviteArtist />;

      case "studio-management":
        return <StudioManagement />;

      case "artist-settings":
        return <ArtistSettings />;

      case "restricted-items":
        return <RestrictedItems />;

      // SOLO PAGES
      case "solo-order":
        return <SoloOrderSupplies />;

      case "solo-inventory":
        return <SoloInventory />;

      case "solo-checklist":
        return <SoloChecklist />;

      // ARTIST PAGES
      case "artist-checklist":
        return <ArtistChecklist />;

      case "artist-order":
        return <ArtistOrder />;

      case "artist-orders":
        return (
          <Page title="My Orders">
            <Text>No orders yet.</Text>
          </Page>
        );

      default:
        return (
          <Page title="Unknown Page">
            <Text>Page not found.</Text>
          </Page>
        );
    }
  };

  // ======================================================
  // =====================   NAVIGATION   =================
  // ======================================================

  const navigationItems =
    role === "owner"
      ? [
          { label: "Dashboard", onClick: () => setActivePage("dashboard") },
          { label: "Staff Orders", onClick: () => setActivePage("orders") },
          { label: "Previous Orders", onClick: () => setActivePage("previous-orders") },
          { label: "Favorite Products", onClick: () => setActivePage("favorite-products") },
          { label: "Shop New", onClick: () => setActivePage("products") },
          { label: "Inventory", onClick: () => setActivePage("inventory") },
          { label: "Invite Artist", onClick: () => setActivePage("invite-artist") },
          { label: "Studio Management", onClick: () => setActivePage("studio-management") },
          { label: "Artist Settings", onClick: () => setActivePage("artist-settings") },
          { label: "Restricted Items", onClick: () => setActivePage("restricted-items") },
          { label: "Logout", onClick: logout },
        ]
      : role === "solo"
      ? [
          { label: "Dashboard", onClick: () => setActivePage("dashboard") },
          { label: "Shop New", onClick: () => setActivePage("products") },
          { label: "Inventory", onClick: () => setActivePage("solo-inventory") },
          { label: "Checklist", onClick: () => setActivePage("solo-checklist") },
          { label: "Order Supplies", onClick: () => setActivePage("solo-order") },
          { label: "Logout", onClick: logout },
        ]
      : [
          { label: "Dashboard", onClick: () => setActivePage("dashboard") },
          { label: "Shop New", onClick: () => setActivePage("products") },
          { label: "Checklist", onClick: () => setActivePage("artist-checklist") },
          { label: "Submit Order", onClick: () => setActivePage("artist-order") },
          { label: "My Orders", onClick: () => setActivePage("artist-orders") },
          { label: "Logout", onClick: logout },
        ];

  // ======================================================
  // =====================   MAIN FRAME   =================
  // ======================================================

  return (
    <AppProvider>
      <div className="ink-app">
        {/* HARD BACKGROUND LOGO */}
        <img
          className="ink-bg-logo"
          src="https://cdn.shopify.com/s/files/1/0684/4982/8931/files/inked-betties-logo.png?v=1789004957"
          alt="Inked Betties Logo"
        />

        <RoleSwitcher />

        <Frame
          navigation={
            <Navigation location="/">
              <Navigation.Section items={navigationItems} />
            </Navigation>
          }
        >
          {renderPage()}
        </Frame>
      </div>
    </AppProvider>
  );
}

export default App;
