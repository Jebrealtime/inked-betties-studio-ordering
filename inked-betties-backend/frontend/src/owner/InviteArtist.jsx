import { useState } from "react";
import { Page, Layout, Card, Text, Button } from "@shopify/polaris";
import { QRCodeSVG } from "qrcode.react";   // ⭐ FIXED IMPORT

export default function InviteArtist() {
  const [inviteLink, setInviteLink] = useState("");

  const generateLink = () => {
    // ⭐ Replace this with your real backend-generated link later
    const link = "https://inkedbetties.com/artist?studio=abc123";

    setInviteLink(link);
    navigator.clipboard.writeText(link);
    alert("Invite link copied to clipboard!");
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

            {/* ⭐ Show the link + QR code once generated */}
            {inviteLink && (
              <div style={{ marginTop: "2rem", textAlign: "center" }}>
                <Text as="p" variant="headingMd">
                  Scan or share this QR code:
                </Text>

                <div style={{ marginTop: "1rem" }}>
                  <QRCodeSVG value={inviteLink} size={180} />   {/* ⭐ FIXED COMPONENT */}
                </div>

                <Text as="p" style={{ marginTop: "1rem" }}>
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
