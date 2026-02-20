import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Newspaper,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminTabs from "@/components/admin/AdminTabs";
import { getNewsfeedPosts, deleteNewsfeedPost } from "@/api/supabaseApi";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const POSTS_PER_PAGE = 10;

type NewsfeedPost = {
  id: string;
  title: string;
  author: string;
  slug: string;
  image: string | null;
  tags: string[];
  category: string;
  created_at: string;
  updated_at: string;
};

const CategoryBadge = ({ category }: { category: string }) => {
  const colors: Record<string, string> = {
    "Çözüm Güncellemeleri": "bg-blue-100 text-blue-800 border-blue-300",
    "Haberler": "bg-green-100 text-green-800 border-green-300",
    "Makaleler": "bg-purple-100 text-purple-800 border-purple-300",
    "Etkinlikler": "bg-orange-100 text-orange-800 border-orange-300",
  };

  return (
    <Badge className={`text-xs ${colors[category] || "bg-gray-100 text-gray-800"}`}>
      {category}
    </Badge>
  );
};

const AdminNewsfeed = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<NewsfeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<NewsfeedPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPosts = useCallback(async (page: number = 1, search: string = "") => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getNewsfeedPosts({
        n: POSTS_PER_PAGE,
        page,
        searchQuery: search || null,
      });

      setPosts(data);
      setHasMore(data.length === POSTS_PER_PAGE);
      setCurrentPage(page);
    } catch (err) {
      setError(err?.message || "Yazılar yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteNewsfeedPost({ postId: deleteTarget.id });

      toast({
        title: "Yazı silindi",
        description: `"${deleteTarget.title}" başarıyla silindi.`,
      });

      // Refresh the list
      await fetchPosts(currentPage, searchQuery);
    } catch (err) {
      toast({
        title: "Hata",
        description: err?.message || "Yazı silinemedi",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPosts(1);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts(1, searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (error && !isLoading && posts.length === 0) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center text-center gap-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="font-semibold text-lg text-foreground">Hata</h3>
                <p className="text-muted-foreground mt-1">{error}</p>
              </div>
              <Button onClick={() => fetchPosts(1)}>Tekrar Dene</Button>
            </div>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Admin Paneli</h1>

        <div className="space-y-6">
          <AdminTabs activeTab="newsfeed" />

          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/admin">Admin</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>HRTech Radar</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5" />
                    HRTech Radar Yazıları
                  </CardTitle>
                  <CardDescription>
                    Haber, makale ve güncellemeleri yönetin
                  </CardDescription>
                </div>
                <Button onClick={() => navigate("/admin/newsfeed/edit")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Gönderi
                </Button>
              </div>

              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Başlık veya etiket ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Newspaper className="h-12 w-12 mb-4 opacity-50" />
                  <p>Henüz yazı bulunmuyor.</p>
                  <Button
                    variant="link"
                    onClick={() => navigate("/admin/newsfeed/edit")}
                  >
                    İlk yazıyı ekleyin
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        {post.image ? (
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Newspaper className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <CategoryBadge category={post.category} />
                          <span className="text-xs text-muted-foreground">
                            {post.author}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(post.created_at), "d MMM yyyy", {
                              locale: tr,
                            })}
                          </span>
                        </div>
                        {post.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            {post.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{post.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/newsfeed/edit?id=${post.id}`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(post)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchPosts(currentPage - 1, searchQuery)}
                      disabled={currentPage <= 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Önceki
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Sayfa {currentPage}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchPosts(currentPage + 1, searchQuery)}
                      disabled={!hasMore || isLoading}
                    >
                      Sonraki
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yazıyı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" yazısını silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminNewsfeed;
