import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StarIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import StarRatingComponent from "../common/star-rating";
import { useToast } from "../ui/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { setProductDetails } from "@/store/shop/products-slice";
import { addReview, getReviews } from "@/store/shop/review-slice";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);

  const { toast } = useToast();

  const validReviews = reviews.filter((reviewItem) => typeof reviewItem.reviewValue === "number");
  const averageReview = 
    validReviews.length > 0
      ? validReviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) / validReviews.length
      : 0;

  function handleAddToCart(getCurrentProductId, getTotalStock) {
    if (isAddingToCart) return;
    setIsAddingToCart(true);

    let getCartItems = cartItems.items || [];
    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({ title: `Only ${getQuantity} quantity can be added for this item`, variant: "destructive" });
          setIsAddingToCart(false);
          return;
        }
      }
    }

    dispatch(addToCart({ userId: user?.id, productId: getCurrentProductId, quantity: 1 }))
      .then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchCartItems(user?.id));
          toast({ title: "Product is added to cart" });
        }
        setIsAddingToCart(false);
      });
  }

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
  }

  function handleAddReview() {
    dispatch(addReview({
      productId: productDetails?._id,
      userId: user?.id,
      userName: user?.userName,
      reviewMessage: reviewMsg,
      reviewValue: rating,
    })).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({ title: "Review added successfully!" });
      }
    });
  }

  useEffect(() => {
    if (productDetails !== null) dispatch(getReviews(productDetails?._id));
  }, [productDetails]);

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid grid-cols-2 gap-8 sm:p-12 max-w-[90vw] sm:max-w-[80vw] lg:max-w-[70vw]">
        <div className="relative overflow-hidden rounded-lg">
          <img src={productDetails?.image} alt={productDetails?.title} className="aspect-square w-full object-cover" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold">{productDetails?.title}</h1>
          <p className="text-muted-foreground text-2xl mb-5 mt-4">{productDetails?.description}</p>
          <div className="flex items-center justify-between">
            <p className={`text-3xl font-bold text-primary ${productDetails?.salePrice > 0 ? "line-through" : ""}`}>
              ${productDetails?.price}
            </p>
            {productDetails?.salePrice > 0 && (
              <p className="text-2xl font-bold text-muted-foreground">${productDetails?.salePrice}</p>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5">
              <StarRatingComponent rating={averageReview} />
            </div>
            <span className="text-muted-foreground">({averageReview.toFixed(2)})</span>
          </div>
          <div className="mt-5 mb-5">
            {productDetails?.totalStock === 0 ? (
              <Button className="w-full" disabled>Out of Stock</Button>
            ) : (
              <Button
                className="w-full"
                disabled={isAddingToCart}
                onClick={() => handleAddToCart(productDetails?._id, productDetails?.totalStock)}
              >
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </Button>
            )}
          </div>
          <Separator className="my-5" />
          <div className="flex flex-col gap-5">
            <div className="grid gap-3">
              <Label>Write a review</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Write a review"
                  value={reviewMsg}
                  onChange={(e) => setReviewMsg(e.target.value)}
                />
                <Button onClick={handleAddReview}>Submit</Button>
              </div>
              <StarRatingComponent editable rating={rating} onChange={setRating} />
            </div>
            <div>
              <Label>Reviews</Label>
              <div className="mt-2 flex flex-col gap-3">
                {reviews.map((reviewItem) => (
                  <div key={reviewItem._id} className="flex gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {reviewItem?.userName ? reviewItem.userName[0].toUpperCase() : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{reviewItem.userName}</p>
                      <p>{reviewItem.reviewMessage}</p>
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-4 w-4 text-yellow-500" />
                        <span>{reviewItem.reviewValue.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
