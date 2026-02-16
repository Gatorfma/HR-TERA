import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Loader2,
  Star,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "@/hooks/use-toast";
import {
  adminGetProductsWithReviewCounts,
  adminGetReviewsForProduct,
  adminApproveReview,
  adminRejectReview,
  adminDeleteReview,
  adminApproveReply,
  adminRejectReply,
  adminDeleteReply,
} from "@/api/adminProductsApi";
import { AdminReviewItem, AdminProductWithReviewCounts } from "@/lib/admin-types";

type ReviewTab = "pending" | "approved" | "rejected";

const PAGE_SIZE = 20;

// ─── StarRow ────────────────────────────────────────────────────────────────
const StarRow = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`w-3.5 h-3.5 ${
          s <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
        }`}
      />
    ))}
  </div>
);

// ─── ReviewItemCard ──────────────────────────────────────────────────────────
interface ReviewItemCardProps {
  item: AdminReviewItem;
  tab: ReviewTab;
  onAction: () => void;
}

const ReviewItemCard = ({ item, tab, onAction }: ReviewItemCardProps) => {
  const [loading, setLoading] = useState(false);
  const isReply = item.parent_review_id !== null;
  const hasPendingEdit = item.has_pending_edit;

  const run = async (fn: () => Promise<void>, successMsg: string) => {
    setLoading(true);
    try {
      await fn();
      toast({ title: successMsg });
      onAction();
    } catch (err) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "İşlem başarısız",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    if (isReply) {
      run(() => adminApproveReply(item.review_id), "Yanıt onaylandı");
    } else {
      run(() => adminApproveReview(item.review_id), "Yorum onaylandı");
    }
  };

  const handleReject = () => {
    if (isReply) {
      run(() => adminRejectReply(item.review_id), "Yanıt reddedildi");
    } else {
      run(() => adminRejectReview(item.review_id), "Yorum reddedildi");
    }
  };

  const handleDelete = () => {
    if (isReply) {
      run(() => adminDeleteReply(item.review_id), "Yanıt silindi");
    } else {
      run(() => adminDeleteReview(item.review_id), "Yorum silindi");
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-foreground">
              {item.reviewer_name}
            </span>
            {(item.reviewer_role || item.reviewer_company) && (
              <span className="text-xs text-muted-foreground">
                {[item.reviewer_role, item.reviewer_company]
                  .filter(Boolean)
                  .join(" — ")}
              </span>
            )}
            {isReply && (
              <Badge variant="secondary" className="text-xs">
                ↩ Yanıt
              </Badge>
            )}
            {hasPendingEdit && (
              <Badge variant="outline" className="text-xs border-amber-400 text-amber-600 bg-amber-50">
                Düzenleme Bekliyor
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(item.created_at).toLocaleDateString("tr-TR")}
          </p>
        </div>
        {item.rating != null && !isReply && (
          <StarRow rating={item.rating} />
        )}
      </div>

      {/* Content: if has pending edit, show side-by-side */}
      {hasPendingEdit ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
              Yayında
            </p>
            {item.rating != null && <StarRow rating={item.rating} />}
            {item.title && (
              <p className="font-semibold text-sm text-foreground mt-1">{item.title}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.body}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3">
            <p className="text-xs font-medium text-amber-700 mb-1 uppercase tracking-wide">
              Önerilen Değişiklik
            </p>
            {item.pending_rating != null && <StarRow rating={item.pending_rating} />}
            {item.pending_title && (
              <p className="font-semibold text-sm text-foreground mt-1">{item.pending_title}</p>
            )}
            {item.pending_body && (
              <p className="text-sm text-amber-800 mt-1 leading-relaxed">{item.pending_body}</p>
            )}
          </div>
        </div>
      ) : (
        <div>
          {item.title && (
            <p className="font-semibold text-sm text-foreground mb-1">{item.title}</p>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
        </div>
      )}

      {/* Admin note */}
      {item.admin_note && (
        <p className="text-xs text-destructive bg-destructive/10 rounded p-2">
          Not: {item.admin_note}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        {/* Approve/Reject only when this item itself needs moderation */}
        {(item.status === "pending" || hasPendingEdit) && (
          <>
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={loading}
              className="bg-emerald-600 text-white hover:bg-emerald-700 h-7 text-xs"
            >
              {hasPendingEdit ? "Düzenlemeyi Onayla" : "Onayla"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleReject}
              disabled={loading}
              className="h-7 text-xs"
            >
              {hasPendingEdit ? "Düzenlemeyi Reddet" : "Reddet"}
            </Button>
          </>
        )}

        {/* Delete only for non-pending items in approved/rejected tabs */}
        {(tab === "approved" || tab === "rejected") && item.status !== "pending" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                disabled={loading}
                className="h-7 text-xs ml-auto"
              >
                Sil
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Yorumu Sil</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu yorum kalıcı olarak silinecek. Bu işlem geri alınamaz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
      </div>

      {/* Replies: pending-only in pending tab, all in approved tab */}
      {(() => {
        const allReplies = item.replies ?? [];
        const repliesToShow =
          tab === "pending"
            ? allReplies.filter((r) => r.status === "pending")
            : tab === "approved"
            ? allReplies
            : [];
        if (repliesToShow.length === 0) return null;
        return (
          <div className="mt-2 pl-4 border-l-2 border-border space-y-2">
            {repliesToShow.map((reply) => (
              <ReviewItemCard
                key={reply.review_id}
                item={reply}
                tab={reply.status as ReviewTab}
                onAction={onAction}
              />
            ))}
          </div>
        );
      })()}
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const ReviewRequestsPage = () => {
  const navigate = useNavigate();

  // Product list state
  const [products, setProducts] = useState<AdminProductWithReviewCounts[]>([]);
  const [productPage, setProductPage] = useState(1);
  const [productSearch, setProductSearch] = useState("");
  const [productSearchInput, setProductSearchInput] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const selectedProduct = products.find((p) => p.product_id === selectedProductId);

  // Reviews state
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [reviewTab, setReviewTab] = useState<ReviewTab>("pending");
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setProductSearch(productSearchInput), 400);
    return () => clearTimeout(t);
  }, [productSearchInput]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const data = await adminGetProductsWithReviewCounts(
        productPage,
        PAGE_SIZE,
        productSearch || null
      );
      setProducts(data);
    } catch (err) {
      toast({
        title: "Ürünler yüklenemedi",
        description: err instanceof Error ? err.message : "Hata",
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  }, [productPage, productSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fetch reviews when product or tab changes
  const fetchReviews = useCallback(async () => {
    if (!selectedProductId) return;
    setLoadingReviews(true);
    try {
      const data = await adminGetReviewsForProduct(selectedProductId, reviewTab);
      setReviews(data);
    } catch (err) {
      toast({
        title: "Yorumlar yüklenemedi",
        description: err instanceof Error ? err.message : "Hata",
        variant: "destructive",
      });
    } finally {
      setLoadingReviews(false);
    }
  }, [selectedProductId, reviewTab]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin")}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Admin
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Yorum Talepleri</h1>
            <p className="text-sm text-muted-foreground">
              Ürün yorumlarını ve yanıtlarını yönetin
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Product List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ürünler</CardTitle>
                <CardDescription className="text-xs">
                  Bekleyen yorumlu ürünler üstte gösterilir
                </CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Ürün veya şirket ara..."
                    value={productSearchInput}
                    onChange={(e) => {
                      setProductSearchInput(e.target.value);
                      setProductPage(1);
                    }}
                    className="pl-9 h-8 text-sm"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loadingProducts ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : products.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Ürün bulunamadı
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {products.map((product) => (
                      <button
                        key={product.product_id}
                        onClick={() => {
                          setSelectedProductId(product.product_id);
                          setReviewTab("pending");
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                          selectedProductId === product.product_id
                            ? "bg-primary/5 border-l-2 border-primary"
                            : ""
                        }`}
                      >
                        {product.logo ? (
                          <img
                            src={product.logo}
                            alt={product.product_name}
                            className="w-8 h-8 rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-muted-foreground">
                              {product.product_name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {product.product_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {product.company_name}
                          </p>
                        </div>
                        {product.pending_review_count > 0 && (
                          <Badge className="flex-shrink-0 bg-amber-500 text-white text-xs px-1.5">
                            {product.pending_review_count}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                    disabled={productPage === 1 || loadingProducts}
                    className="h-7 text-xs"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Önceki
                  </Button>
                  <span className="text-xs text-muted-foreground">Sayfa {productPage}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setProductPage((p) => p + 1)}
                    disabled={products.length < PAGE_SIZE || loadingProducts}
                    className="h-7 text-xs"
                  >
                    Sonraki
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Review Management */}
          <div className="lg:col-span-2">
            {!selectedProductId ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">
                    Yorumları yönetmek için sol listeden bir ürün seçin
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {selectedProduct?.product_name ?? "Ürün"} — Yorumlar
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {selectedProduct?.company_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs
                    value={reviewTab}
                    onValueChange={(v) => setReviewTab(v as ReviewTab)}
                  >
                    <TabsList className="w-full grid grid-cols-3 mb-4">
                      <TabsTrigger value="pending" className="text-xs">
                        Bekleyen
                        {selectedProduct && selectedProduct.pending_review_count > 0 && (
                          <Badge className="ml-1.5 bg-amber-500 text-white text-xs px-1.5 h-4">
                            {selectedProduct.pending_review_count}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="approved" className="text-xs">
                        Onaylanan
                      </TabsTrigger>
                      <TabsTrigger value="rejected" className="text-xs">
                        Reddedilen
                      </TabsTrigger>
                    </TabsList>

                    {(["pending", "approved", "rejected"] as ReviewTab[]).map((tab) => (
                      <TabsContent key={tab} value={tab} className="mt-0">
                        {loadingReviews ? (
                          <div className="flex justify-center py-10">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : reviews.length === 0 ? (
                          <div className="text-center py-10">
                            <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">
                              {tab === "pending"
                                ? "Bekleyen yorum yok"
                                : "Yorum yok"}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {reviews.map((item) => (
                              <ReviewItemCard
                                key={item.review_id}
                                item={item}
                                tab={tab}
                                onAction={() => {
                                  fetchReviews();
                                  fetchProducts();
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReviewRequestsPage;
