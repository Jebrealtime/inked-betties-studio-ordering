// ======================================================
// =============== STUDIO RULES HELPER ===================
// ======================================================

export function evaluateOrderForArtist({ artistEmail, items, total }) {
  const artists = JSON.parse(localStorage.getItem("studioArtists")) || [];
  const notifications =
    JSON.parse(localStorage.getItem("studioNotifications")) || [];

  const artist = artists.find((a) => a.email === artistEmail);

  if (!artist) {
    return { allowed: true, needsApproval: false };
  }

  let allowed = true;
  let needsApproval = false;
  const reasons = [];

  // Company-wide spending limit
  const companyLimit = Number(localStorage.getItem("companySpendingLimit")) || 0;

  if (companyLimit > 0 && total > companyLimit) {
    allowed = false;
    reasons.push(
      `Order total $${total} exceeds company-wide limit $${companyLimit}`
    );
  }

  // Artist-specific spending limit
  if (artist.spendingLimit > 0 && total > artist.spendingLimit) {
    allowed = false;
    reasons.push(
      `Order total $${total} exceeds artist limit $${artist.spendingLimit} for ${artist.email}`
    );
  }

  // Restricted items check
  const restrictedHit = [];
  artist.restrictedItems.forEach((restricted) => {
    Object.keys(items).forEach((name) => {
      if (name.toLowerCase().includes(restricted.toLowerCase())) {
        restrictedHit.push(name);
      }
    });
  });

  if (restrictedHit.length > 0) {
    needsApproval = true;
    reasons.push(
      `Restricted items requested: ${restrictedHit.join(", ")} by ${artist.email}`
    );
  }

  // Save notification if anything triggered
  if (reasons.length > 0) {
    notifications.push({
      artistEmail,
      total,
      items,
      reasons,
      date: new Date().toLocaleString(),
    });

    localStorage.setItem(
      "studioNotifications",
      JSON.stringify(notifications)
    );
  }

  return { allowed, needsApproval, reasons };
}
