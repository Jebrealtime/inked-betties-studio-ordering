import { Card, Text, Spinner } from "@shopify/polaris";

function CustomerProducts({ products, loading }) {
  if (loading) {
    return <Spinner accessibilityLabel="Loading products" size="large" />;
  }

  // ⭐ NEW — Top Selling Products (first 10 sorted by sales)
  const topSelling = [...products]
    .sort((a, b) => (b.sales || 0) - (a.sales || 0))
    .slice(0, 10);

  return (
    <Card>
      <Text variant="headingLg">Available Products</Text>

      {/* ⭐ NEW — Top Selling Section WITH TITLE */}
      {topSelling.length > 0 && (
        <Card title="Top Selling Products" sectioned>
          {topSelling.map((p) => (
            <Card key={p._id} sectioned>
              <Text variant="headingMd">{p.name}</Text>
              <Text>${p.price}</Text>
            </Card>
          ))}
        </Card>
      )}

      {/* ⭐ Existing Section — UNTOUCHED */}
      {products.length === 0 && (
        <Text>No products available for ordering.</Text>
      )}

      {products.map((p) => (
        <Card key={p._id} sectioned>
          <Text variant="headingMd">{p.name}</Text>
          <Text>${p.price}</Text>
        </Card>
      ))}
    </Card>
  );
}

export default CustomerProducts;
