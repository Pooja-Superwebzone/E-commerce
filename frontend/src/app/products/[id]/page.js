import { notFound } from "next/navigation";
import ProductDetailsContent from "./ProductDetailsContent";
import { fetchProductById } from "@/lib/catalogApi";

export default async function ProductDetailsPage({ params }) {
  const { id } = await params;
  const productId = Number(id);
  const product = await fetchProductById(productId);

  if (!product) {
    notFound();
  }

  const hasOriginalPrice = Boolean(product.originalPrice);
  const discount = hasOriginalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <ProductDetailsContent
      product={product}
      hasOriginalPrice={hasOriginalPrice}
      discount={discount}
    />
  );
}
