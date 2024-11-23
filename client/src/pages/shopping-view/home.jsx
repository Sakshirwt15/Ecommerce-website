import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { getFeatureImages } from "@/store/common-slice";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ShirtIcon,
  BabyIcon,
  CloudLightning,
  WatchIcon,
  UmbrellaIcon,
  Shirt,
  WashingMachine,
  ShoppingBasket,
  Airplay,
  Images,
  Heater,
} from "lucide-react";

// Category and Brand Data
const categoriesWithIcon = [
  { id: "men", label: "Men", icon: ShirtIcon },
  { id: "women", label: "Women", icon: CloudLightning },
  { id: "kids", label: "Kids", icon: BabyIcon },
  { id: "accessories", label: "Accessories", icon: WatchIcon },
  { id: "footwear", label: "Footwear", icon: UmbrellaIcon },
];

const brandsWithIcon = [
  { id: "nike", label: "Nike", icon: Shirt },
  { id: "adidas", label: "Adidas", icon: WashingMachine },
  { id: "puma", label: "Puma", icon: ShoppingBasket },
  { id: "levi", label: "Levi's", icon: Airplay },
  { id: "zara", label: "Zara", icon: Images },
  { id: "h&m", label: "H&M", icon: Heater },
];

// Component Definition
function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const { productList = [], productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList = [] } = useSelector((state) => state.commonFeature);
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handlers
  const handleNavigateToListingPage = (item, section) => {
    sessionStorage.setItem("filters", JSON.stringify({ [section]: [item.id] }));
    navigate(`/shop/listing`);
  };

  const handleGetProductDetails = (id) => {
    dispatch(fetchProductDetails(id));
  };

  const handleAddToCart = (productId) => {
    dispatch(addToCart({ userId: user?.id, productId, quantity: 1 })).then(
      (data) => {
        if (data?.payload?.success) {
          dispatch(fetchCartItems(user?.id));
          toast({ title: "Product added to cart" });
        }
      }
    );
  };

  // Effects
  useEffect(() => {
    dispatch(fetchAllFilteredProducts({ filterParams: {}, sortParams: "price-lowtohigh" }));
    dispatch(getFeatureImages());
  }, [dispatch]);

  useEffect(() => {
    if (productDetails) setOpenDetailsDialog(true);
  }, [productDetails]);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentSlide((prev) => (prev + 1) % featureImageList.length),
      15000
    );
    return () => clearInterval(timer);
  }, [featureImageList]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Banner Section */}
      <div className="relative w-full h-[600px] overflow-hidden">
        {featureImageList.map((slide, index) => (
          <img
            key={index}
            src={slide?.image}
            alt="Slide"
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide((prev) => (prev - 1 + featureImageList.length) % featureImageList.length)
          }
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide((prev) => (prev + 1) % featureImageList.length)
          }
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* Categories Section */}
      <Section
        title="Shop by Category"
        items={categoriesWithIcon}
        onClick={(item) => handleNavigateToListingPage(item, "category")}
      />

      {/* Brands Section */}
      <Section
        title="Shop by Brand"
        items={brandsWithIcon}
        onClick={(item) => handleNavigateToListingPage(item, "brand")}
      />

      {/* Feature Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Feature Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productList.map((product) => (
              <ShoppingProductTile
                key={product.id}
                product={product}
                handleGetProductDetails={handleGetProductDetails}
                handleAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

// Section Component for Categories and Brands
const Section = ({ title, items, onClick }) => (
  <section className="py-12 bg-gray-50">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-8">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <Card
            key={item.id}
            onClick={() => onClick(item)}
            className="cursor-pointer hover:shadow-lg transition-shadow"
          >
            <CardContent className="flex flex-col items-center justify-center p-6">
              {React.createElement(item.icon, {
                className: "w-12 h-12 mb-4 text-primary",
              })}
              <span className="font-bold">{item.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default ShoppingHome;
