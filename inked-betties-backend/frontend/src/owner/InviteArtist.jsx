import { useState } from "react";
import { Page, Layout, Card, Text, Button } from "@shopify/polaris";
import { QRCodeSVG } from "qrcode.react";
import { currentUser } from "../api";

export default function InviteArtist() {
  const [inviteLink, setInviteLink] = useState("");
  const [message, setMessage] = useState("");

  const generateLink = async () => {
    const owner = currentUser();
    if (!owner?._id) {
      setMessage("Log in as the studio owner to create an invite link.");
      return;
    }

    // ⭐ Each studio gets its own link: it carries this owner's id, so anyone who
    // signs up through it joins THIS studio as an artist.
    const link = `${window.location.origin}/?invite=${owner._id}`;
    setInviteLink(link);

    // In-page message instead of alert(): browser popups freeze the app on some devices.
    try {
      await navigator.clipboard.writeText(link);
      setMessage("Link copied. Text it to your artist, or have them scan the QR code.");
    } catch {
      setMessage("Text this link to your artist, or have them scan the QR code.");
    }
  };

  return (
    <Page title="Invite Artist">
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Text variant="headingLg" as="h2">Invite an Artist</Text>
            <Text as="p">
              Generate an invite link for artists to join your studio.
            </Text>

            <div style={{ marginTop: "1rem" }}>
              <Button tone="success" onClick={generateLink}>
                Generate Invite Link
              </Button>
            </div>

            {message && (
              <div style={{ marginTop: "0.75rem" }}>
                <Text as="p">{message}</Text>
              </div>
            )}

            {/* ⭐ Show the link + QR code once generated */}
            {inviteLink && (
              <div style={{ marginTop: "2rem", textAlign: "center" }}>
                <Text as="p" variant="headingMd">
                  Scan or share this QR code:
                </Text>

                <div
                  style={{
                    marginTop: "1rem",
                    display: "inline-block",
                    padding: "12px",
                    background: "#fff",
                    borderRadius: "8px",
                  }}
                >
                  <QRCodeSVG value={inviteLink} size={180} />
                </div>

                <Text as="p" style={{ marginTop: "1rem", wordBreak: "break-all" }}>
                  {inviteLink}
                </Text>
              </div>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
