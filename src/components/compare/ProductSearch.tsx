import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2, Bookmark, BookmarkCheck } from "lucide-react";
import { getProducts, getAllCategories, getSimilarProducts } from "@/api/supabaseApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBookmarks, BookmarkEntry } from "@/hooks/useBookmarks";

interface SearchResult {
  product_id: string;
  product_name: string;
  logo: string;
  main_category: string;
  subscription: string;
}

interface ProductSearchProps {
  open: boolean;
  onClose: () => void;
  onSelect: (product: SearchResult) => void;
  excludeIds: string[];
  compareProductIds: string[];
}

const PAGE_SIZE = 12;

const ProductSearch = ({
  open,
  onClose,
  onSelect,
  excludeIds,
  compareProductIds,
}: ProductSearchProps) => {
  const { t } = useLanguage();
  const { bookmarks, isBookmarked, toggleBookmark } = useBookmarks();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Search mode state
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Browse mode state
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [browseProducts, setBrowseProducts] = useState<SearchResult[]>([]);
  const [browsePage, setBrowsePage] = useState(1);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);

  const isSearchMode = query.trim().length > 0;

  // Reset all state when modal opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setSearchResults([]);
      setSelectedCategory(null);
      setBrowseProducts([]);
      setBrowsePage(1);
      setHasMore(true);
      setSuggestions([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Fetch categories on open
  useEffect(() => {
    if (!open) return;
    getAllCategories()
      .then((data: string[]) => {
        setCategories(data ?? []);
      })
      .catch(() => setCategories([]));
  }, [open]);

  // Fetch suggestions when modal opens with products in compare
  useEffect(() => {
    if (!open || compareProductIds.length === 0) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const idsToQuery = compareProductIds.slice(0, 2);
        const results = await Promise.all(
          idsToQuery.map((id) => getSimilarProducts(id, 6))
        );

        const flat = results.flat();
        const seen = new Set<string>();
        const deduped: SearchResult[] = [];

        for (const p of flat) {
          if (
            !seen.has(p.product_id) &&
            !excludeIds.includes(p.product_id)
          ) {
            seen.add(p.product_id);
            deduped.push({
              product_id: p.product_id,
              product_name: p.product_name,
              logo: p.logo,
              main_category: p.main_category,
              subscription: p.subscription?.toLowerCase() || "freemium",
            });
          }
          if (deduped.length >= 6) break;
        }

        setSuggestions(deduped);
      } catch {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [open, compareProductIds.join(","), excludeIds.join(",")]);

  // Fetch browse products
  const fetchBrowse = useCallback(
    async (page: number, category: string | null, append: boolean) => {
      setBrowseLoading(true);
      try {
        const data = await getProducts({
          n: PAGE_SIZE,
          page,
          productFilter: null,
          vendorFilter: null,
          categoryFilter: category,
          languageFilter: null,
          countryFilter: null,
          tierFilter: null,
        });

        const mapped: SearchResult[] = data
          .filter((p: any) => !excludeIds.includes(p.product_id))
          .map((p: any) => ({
            product_id: p.product_id,
            product_name: p.product_name,
            logo: p.logo,
            main_category: p.main_category,
            subscription: p.subscription?.toLowerCase() || "freemium",
          }));

        if (append) {
          setBrowseProducts((prev) => [...prev, ...mapped]);
        } else {
          setBrowseProducts(mapped);
        }
        setHasMore(data.length >= PAGE_SIZE);
      } catch {
        if (!append) setBrowseProducts([]);
        setHasMore(false);
      } finally {
        setBrowseLoading(false);
      }
    },
    [excludeIds.join(",")]
  );

  // Initial browse fetch on open
  useEffect(() => {
    if (open) {
      fetchBrowse(1, null, false);
    }
  }, [open]);

  // Category change
  const handleCategoryChange = (cat: string | null) => {
    setSelectedCategory(cat);
    setBrowsePage(1);
    setHasMore(true);
    fetchBrowse(1, cat, false);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  // Load more
  const handleLoadMore = () => {
    const nextPage = browsePage + 1;
    setBrowsePage(nextPage);
    fetchBrowse(nextPage, selectedCategory, true);
  };

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await getProducts({
          n: 12,
          page: 1,
          productFilter: query.trim(),
          vendorFilter: null,
          categoryFilter: null,
          languageFilter: null,
          countryFilter: null,
          tierFilter: null,
        });
        const mapped: SearchResult[] = data
          .filter((p: any) => !excludeIds.includes(p.product_id))
          .map((p: any) => ({
            product_id: p.product_id,
            product_name: p.product_name,
            logo: p.logo,
            main_category: p.main_category,
            subscription: p.subscription?.toLowerCase() || "freemium",
          }));
        setSearchResults(mapped);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, excludeIds.join(",")]);

  const handleSelect = (product: SearchResult) => {
    onSelect(product);
    onClose();
  };

  const handleBookmarkClick = (e: React.MouseEvent, product: SearchResult) => {
    e.stopPropagation();
    toggleBookmark({
      product_id: product.product_id,
      product_name: product.product_name,
      logo: product.logo,
      main_category: product.main_category,
      subscription: product.subscription,
    });
  };

  if (!open) return null;

  // Compact card for horizontal scroll sections (Suggested / Bookmarked)
  const HorizCard = ({
    product,
    muted,
  }: {
    product: SearchResult | BookmarkEntry;
    muted?: boolean;
  }) => (
    <button
      onClick={() => !muted && handleSelect(product as SearchResult)}
      className={`relative w-[160px] flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-center ${
        muted ? "opacity-50 cursor-default" : "cursor-pointer"
      }`}
    >
      {/* Bookmark icon */}
      <button
        onClick={(e) => handleBookmarkClick(e, product as SearchResult)}
        className="absolute top-1.5 right-1.5 p-1 rounded-full hover:bg-primary/10 transition-colors"
        title={
          isBookmarked(product.product_id)
            ? t("compare.removeBookmark")
            : t("compare.bookmark")
        }
      >
        {isBookmarked(product.product_id) ? (
          <BookmarkCheck className="w-3.5 h-3.5 text-primary" />
        ) : (
          <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>

      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        <img
          src={product.logo}
          alt={product.product_name}
          className="w-full h-full object-cover"
        />
      </div>
      <p className="text-xs font-medium text-foreground truncate w-full">
        {product.product_name}
      </p>
      <p className="text-[10px] text-muted-foreground truncate w-full">
        {product.main_category}
      </p>
      {muted && (
        <span className="text-[10px] text-primary font-medium">
          {t("compare.added")}
        </span>
      )}
    </button>
  );

  // Grid card for All Solutions / Search results
  const GridCard = ({ product }: { product: SearchResult }) => (
    <button
      onClick={() => handleSelect(product)}
      className="relative flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left w-full"
    >
      {/* Bookmark icon */}
      <button
        onClick={(e) => handleBookmarkClick(e, product)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-primary/10 transition-colors"
        title={
          isBookmarked(product.product_id)
            ? t("compare.removeBookmark")
            : t("compare.bookmark")
        }
      >
        {isBookmarked(product.product_id) ? (
          <BookmarkCheck className="w-3.5 h-3.5 text-primary" />
        ) : (
          <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>

      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        <img
          src={product.logo}
          alt={product.product_name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0 pr-6">
        <p className="text-sm font-medium text-foreground truncate">
          {product.product_name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {product.main_category}
        </p>
      </div>
    </button>
  );

  // Section header
  const SectionHeader = ({
    title,
    desc,
  }: {
    title: string;
    desc?: string;
  }) => (
    <div className="mb-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {desc && (
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      )}
    </div>
  );

  const filteredBookmarks = bookmarks;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] sm:pt-[10vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-2xl shadow-xl border border-border w-full max-w-3xl mx-4 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Sticky header: Search + Category pills */}
        <div className="flex-shrink-0 border-b border-border">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("compare.searchPlaceholder")}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-md transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Category pills (browse mode only) */}
          {!isSearchMode && categories.length > 0 && (
            <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => handleCategoryChange(null)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t("compare.allCategories")}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
          {isSearchMode ? (
            /* ===== SEARCH MODE ===== */
            searchLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.map((product) => (
                  <GridCard key={product.product_id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  {t("compare.noResults")}
                </p>
              </div>
            )
          ) : (
            /* ===== BROWSE MODE ===== */
            <>
              {/* Suggested section */}
              {suggestions.length > 0 && (
                <div className="mb-6">
                  <SectionHeader
                    title={t("compare.suggested")}
                    desc={t("compare.suggestedDesc")}
                  />
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                    {suggestions.map((product) => (
                      <HorizCard
                        key={product.product_id}
                        product={product}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Bookmarked section */}
              {filteredBookmarks.length > 0 && (
                <div className="mb-6">
                  <SectionHeader title={t("compare.bookmarked")} />
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                    {filteredBookmarks.map((bm) => (
                      <HorizCard
                        key={bm.product_id}
                        product={bm}
                        muted={excludeIds.includes(bm.product_id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Solutions grid */}
              <div>
                <SectionHeader title={t("compare.allSolutions")} />

                {browseProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {browseProducts.map((product) => (
                      <GridCard
                        key={product.product_id}
                        product={product}
                      />
                    ))}
                  </div>
                ) : browseLoading ? null : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {t("compare.noResults")}
                  </p>
                )}

                {/* Load more / End of results / Loading */}
                <div className="mt-4 text-center">
                  {browseLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
                  ) : hasMore && browseProducts.length > 0 ? (
                    <button
                      onClick={handleLoadMore}
                      className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      {t("compare.loadMore")}
                    </button>
                  ) : browseProducts.length > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {t("compare.endOfResults")}
                    </p>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSearch;
