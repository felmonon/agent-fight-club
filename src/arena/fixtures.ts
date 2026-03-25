export const checkoutFixture = `export function calculateCheckoutTotal(items, coupon) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 7.5;

  if (!coupon) {
    return Number((subtotal + shipping).toFixed(2));
  }

  if (coupon.type === "percent") {
    return Number(Math.max(0, subtotal * (1 - coupon.value) + shipping * (1 - coupon.value)).toFixed(2));
  }

  return Number(Math.max(0, subtotal + shipping - coupon.value).toFixed(2));
}

export function formatCurrency(amount) {
  return "$" + amount.toFixed(2);
}
`;

export const securityFixture = `export function createSessionResponse(user, token) {
  const scopes = ["read:projects", ...user.extraScopes];

  return {
    userId: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    token,
    session: {
      tokenPreview: token,
      scopes
    }
  };
}
`;

export const performanceFixture = `export function dedupeRecords(records) {
  const unique = [];

  for (const record of records) {
    let seen = false;

    for (const existing of unique) {
      if (existing.id === record.id) {
        seen = true;
        break;
      }
    }

    if (!seen) {
      unique.push(record);
    }
  }

  return unique.sort((left, right) => left.id.localeCompare(right.id));
}
`;
