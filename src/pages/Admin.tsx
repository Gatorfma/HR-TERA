import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, TrendingUp, Eye } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminTabs from "@/components/admin/AdminTabs";
import CompanySettingsLanding from "@/components/admin/CompanySettingsLanding";
import { supabase } from "@/api/supabaseClient";
import { toast } from "@/hooks/use-toast";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"];

type DashboardKpis = {
  total_users: number;
  users_added_30d: number;
  total_products: number;
  products_added_30d: number;
  weekly_visits: number;
  conversion_rate: number;
};

type WeeklyVisitRow = {
  day: string;
  visits: number;
};

type MonthlyProductRow = {
  month: string;
  products: number;
};

type CategoryRow = {
  category: string;
  value: number;
};

const Admin = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam === "users" ? "users" : "analytics";
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [visitData, setVisitData] = useState<Array<{ name: string; visits: number }>>([]);
  const [productData, setProductData] = useState<Array<{ name: string; products: number }>>([]);
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);

  const categorySummary = useMemo(() => {
    const total = categoryData.reduce((sum, item) => sum + item.value, 0);
    const sorted = [...categoryData].sort((a, b) => b.value - a.value);
    const topCount = 6;
    const top = sorted.slice(0, topCount);
    const restTotal = sorted.slice(topCount).reduce((sum, item) => sum + item.value, 0);
    const pieData = restTotal > 0 ? [...top, { name: "Diğer", value: restTotal }] : top;
    const items = pieData.map((item, index) => {
      const isOther = item.name === "Diğer";
      const percent = total > 0 ? (item.value / total) * 100 : 0;
      return {
        ...item,
        percent,
        isOther,
        color: isOther ? "hsl(var(--muted-foreground))" : COLORS[index % COLORS.length],
      };
    });

    return { total, items };
  }, [categoryData]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const loadDashboard = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setLoading(true);
      }

      const [kpisRes, weeklyRes, monthlyRes, categoryRes] = await Promise.all([
        supabase.rpc("admin_get_dashboard_kpis"),
        supabase.rpc("admin_get_weekly_visits", { p_days: 7 }),
        supabase.rpc("admin_get_monthly_product_additions", { p_months: 6 }),
        supabase.rpc("admin_get_category_distribution"),
      ]);

      const firstError = kpisRes.error || weeklyRes.error || monthlyRes.error || categoryRes.error;

      if (firstError) {
        toast({
          title: "Analitik verileri yüklenemedi",
          description: firstError.message,
          variant: "destructive",
        });
        setKpis(null);
        setVisitData([]);
        setProductData([]);
        setCategoryData([]);
        setLoading(false);
        return;
      }

      const kpiRow = (kpisRes.data?.[0] as DashboardKpis | undefined) ?? null;
      setKpis(kpiRow);

      const formattedVisits = ((weeklyRes.data ?? []) as WeeklyVisitRow[]).map((row) => {
        const date = new Date(`${row.day}T00:00:00`);
        const label = new Intl.DateTimeFormat("tr-TR", { weekday: "short" }).format(date);
        return { name: label, visits: row.visits };
      });

      const formattedProducts = ((monthlyRes.data ?? []) as MonthlyProductRow[]).map((row) => {
        const date = new Date(`${row.month}T00:00:00`);
        const label = new Intl.DateTimeFormat("tr-TR", { month: "short" }).format(date);
        return { name: label, products: row.products };
      });

      const formattedCategories = ((categoryRes.data ?? []) as CategoryRow[]).map((row) => ({
        name: row.category,
        value: row.value,
      }));

      setVisitData(formattedVisits);
      setProductData(formattedProducts);
      setCategoryData(formattedCategories);
      setLoading(false);
    },
    [toast]
  );

  useEffect(() => {
    if (activeTab === "analytics") {
      loadDashboard();
    }
  }, [activeTab, loadDashboard]);

  useEffect(() => {
    if (activeTab !== "analytics") return;

    const channel = supabase
      .channel("admin-dashboard-analytics")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "analytics_events" },
        () => {
          loadDashboard({ silent: true });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          loadDashboard({ silent: true });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab, loadDashboard]);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Admin Paneli</h1>
        
        <div className="space-y-6">
          <AdminTabs activeTab={activeTab} />

          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Kullanıcı</CardTitle>
                    <Users className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {loading || !kpis ? "—" : kpis.total_users.toLocaleString("tr-TR")}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {loading || !kpis
                        ? "Son 30 gün: —"
                        : `Son 30 gün: +${kpis.users_added_30d.toLocaleString("tr-TR")}`}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Çözüm</CardTitle>
                    <Package className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {loading || !kpis ? "—" : kpis.total_products.toLocaleString("tr-TR")}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {loading || !kpis
                        ? "Son 30 gün: —"
                        : `Son 30 gün: +${kpis.products_added_30d.toLocaleString("tr-TR")}`}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Haftalık Ziyaret</CardTitle>
                    <Eye className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {loading || !kpis ? "—" : kpis.weekly_visits.toLocaleString("tr-TR")}
                    </div>
                    <p className="text-xs text-muted-foreground">Son 7 gün</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Dönüşüm Oranı</CardTitle>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                      {loading || !kpis ? "—" : `${kpis.conversion_rate.toFixed(1)}%`}
                    </div>
                    <p className="text-xs text-muted-foreground">Son 30 gün çözüm CTA / çözüm görüntüleme</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Haftalık Ziyaretler</CardTitle>
                    <CardDescription>Son 7 günlük site ziyaretleri</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={visitData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }} 
                        />
                        <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Aylık Çözüm Ekleme</CardTitle>
                    <CardDescription>Son 6 ayda eklenen çözümler</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={productData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px"
                          }} 
                        />
                        <Line type="monotone" dataKey="products" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Kategori Dağılımı</CardTitle>
                    <CardDescription>En yoğun 6 kategori + diğerleri</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center h-[320px] text-muted-foreground">
                        Veriler yükleniyor...
                      </div>
                    ) : categorySummary.total === 0 ? (
                      <div className="flex items-center justify-center h-[320px] text-muted-foreground">
                        Kategori verisi bulunamadı.
                      </div>
                    ) : (
                      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center">
                        <div className="relative h-[320px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={categorySummary.items}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={120}
                                paddingAngle={2}
                                stroke="hsl(var(--card))"
                                strokeWidth={2}
                              >
                                {categorySummary.items.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value, name) => {
                                  const percent = categorySummary.total
                                    ? ((Number(value) / categorySummary.total) * 100).toFixed(1)
                                    : "0.0";
                                  return [`${value} çözüm • %${percent}`, name];
                                }}
                                contentStyle={{
                                  backgroundColor: "hsl(var(--card))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "8px",
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-foreground">
                              {categorySummary.total.toLocaleString("tr-TR")}
                            </span>
                            <span className="text-xs text-muted-foreground">Toplam Çözüm</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Kategori</span>
                            <span>Pay / Adet</span>
                          </div>
                          {categorySummary.items.map((item, index) => (
                            <div key={`${item.name}-${index}`} className="space-y-2">
                              <div className="flex items-center justify-between gap-3 text-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  <span
                                    className={`font-medium truncate ${
                                      item.isOther ? "text-muted-foreground" : "text-foreground"
                                    }`}
                                  >
                                    {item.name}
                                  </span>
                                </div>
                                <span className="text-muted-foreground whitespace-nowrap">
                                  %{item.percent.toFixed(1)} • {item.value}
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-muted">
                                <div
                                  className="h-2 rounded-full"
                                  style={{
                                    width: `${item.percent}%`,
                                    backgroundColor: item.color,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "users" && <CompanySettingsLanding />}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Admin;
