import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ArrowLeft,
  Save,
  Loader2,
  Image as ImageIcon,
  X,
  Plus,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import TipTapEditor from "@/components/admin/TipTapEditor";
import { getNewsfeedPost, upsertNewsfeedPost } from "@/api/supabaseApi";

const CATEGORIES = [
  "Çözüm Güncellemeleri",
  "Haberler",
  "Makaleler",
  "Etkinlikler",
] as const;

type Category = typeof CATEGORIES[number];

const NewsfeedEditPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const postId = searchParams.get("id");
  const isEditMode = !!postId;

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState<Category>("Haberler");
  const [image, setImage] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // Load existing post if editing
  const loadPost = useCallback(async () => {
    if (!postId) return;

    setIsLoading(true);
    try {
      const post = await getNewsfeedPost({ postId });
      if (post) {
        setTitle(post.title);
        setContent(post.content);
        setAuthor(post.author);
        setCategory(post.category as Category);
        setImage(post.image);
        setTags(post.tags || []);
      } else {
        toast({
          title: "Hata",
          description: "Yazı bulunamadı",
          variant: "destructive",
        });
        navigate("/admin/newsfeed");
      }
    } catch (err) {
      toast({
        title: "Hata",
        description: err?.message || "Yazı yüklenemedi",
        variant: "destructive",
      });
      navigate("/admin/newsfeed");
    } finally {
      setIsLoading(false);
    }
  }, [postId, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (isEditMode) {
      loadPost();
    }
  }, [isEditMode, loadPost]);

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Check file size (max 2MB for base64)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Dosya çok büyük",
          description: "Maksimum dosya boyutu 2MB olmalıdır",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      toast({
        title: "Hata",
        description: "Başlık zorunludur",
        variant: "destructive",
      });
      return;
    }
    if (!content.trim() || content === "<p></p>") {
      toast({
        title: "Hata",
        description: "İçerik zorunludur",
        variant: "destructive",
      });
      return;
    }
    if (!author.trim()) {
      toast({
        title: "Hata",
        description: "Yazar zorunludur",
        variant: "destructive",
      });
      return;
    }
    if (tags.length === 0) {
      toast({
        title: "Hata",
        description: "En az 1 etiket zorunludur",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await upsertNewsfeedPost({
        title: title.trim(),
        content,
        author: author.trim(),
        category,
        image,
        tags,
        postId: postId || undefined,
      });

      toast({
        title: isEditMode ? "Yazı güncellendi" : "Yazı oluşturuldu",
        description: `"${title}" başarıyla kaydedildi.`,
      });

      navigate("/admin/newsfeed");
    } catch (err) {
      toast({
        title: "Hata",
        description: err?.message || "Yazı kaydedilemedi",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/admin">Admin</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/admin/newsfeed">HRTech Radar</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {isEditMode ? "Düzenle" : "Yeni Gönderi"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/newsfeed")}
          className="-ml-2 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>

        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold text-foreground">
            {isEditMode ? "Yazıyı Düzenle" : "Yeni Yazı"}
          </h1>
          <p className="text-muted-foreground mt-2 mb-8">
            {isEditMode
              ? "Mevcut yazıyı düzenleyin"
              : "HRTech Radar için yeni bir yazı oluşturun"}
          </p>

          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Temel Bilgiler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Başlık *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Yazı başlığı"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="author">Yazar *</Label>
                    <Input
                      id="author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Yazar adı"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori *</Label>
                    <Select
                      value={category}
                      onValueChange={(value) => setCategory(value as Category)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cover Image */}
            <Card>
              <CardHeader>
                <CardTitle>Kapak Görseli</CardTitle>
                <CardDescription>
                  Yazı için bir kapak görseli ekleyin (max 2MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {image ? (
                  <div className="relative">
                    <img
                      src={image}
                      alt="Cover"
                      className="w-full max-h-64 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setImage(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={handleImageUpload}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Görsel Yükle
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card>
              <CardHeader>
                <CardTitle>İçerik *</CardTitle>
                <CardDescription>
                  Yazı içeriğini zengin metin editörü ile düzenleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TipTapEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Yazı içeriğini buraya girin..."
                />
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Etiketler *</CardTitle>
                <CardDescription>
                  Yazıyı kategorize etmek için en az 1 etiket ekleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Yeni etiket"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button variant="outline" onClick={handleAddTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                          title="X"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/newsfeed")}
                disabled={isSaving}
              >
                İptal
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEditMode ? "Güncelle" : "Yayınla"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewsfeedEditPage;
