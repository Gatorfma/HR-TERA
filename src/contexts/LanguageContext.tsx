import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "tr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// English translations
const en: Record<string, string> = {
  // Navbar
  "nav.products": "Products",
  "nav.vendors": "Vendors",
  "nav.blog": "Blog",
  "nav.pricing": "Pricing",
  "nav.login": "Log in / Sign up",
  "nav.profile": "My Profile",

  // Hero Section
  "hero.badge": "Ultimate HR Solutions",
  "hero.title1": "Unlock Potential with",
  "hero.title2": "50+ HR Products",
  "hero.subtitle": "Explore a library of high-quality, customizable HR solutions to power your workforce.",
  "hero.searchPlaceholder": "Search Products or Vendors",
  "hero.stat1.title": "50+ Products",
  "hero.stat1.desc": "Free & premium HR solutions for every need",
  "hero.stat2.title": "1,000+ Satisfied",
  "hero.stat2.desc": "HR professionals trust our marketplace",
  "hero.stat3.title": "30+ Vendors",
  "hero.stat3.desc": "Trusted HR service providers",

  // Products Section
  "products.title": "Popular Products",
  "products.subtitle": "Featured premium-tier solutions trusted by leading companies",
  "products.browseAll": "Browse all",
  "products.searchPlaceholder": "Search Products",
  "products.showing": "Showing",
  "products.of": " of",
  "products.productsCount": "products",
  "products.loading": "Loading products...",
  "products.noProducts": "No products found.",
  "products.clearFilters": "Clear filters",
  "products.retry": "Retry",
  "products.vendorTier": "Vendor Tier",
  "products.category": "Category",
  "products.allTiers": "All Tiers",
  "products.premium": "Premium",
  "products.plus": "Plus",
  "products.free": "Free",
  "products.allProducts": "All Products",
  "products.clearAllFilters": "Clear all filters",

  // Vendors Section
  "vendors.title": "Vendors",
  "vendors.subtitle": "Top-rated premium vendors in the marketplace",
  "vendors.browseAll": "Browse all",
  "vendors.searchPlaceholder": "Search Vendor",
  "vendors.showing": "Showing",
  "vendors.vendorsCount": "vendors",
  "vendors.noVendors": "No vendors found.",
  "vendors.vendorTier": "Vendor Tier",
  "vendors.vendorType": "Vendor Type",
  "vendors.allVendors": "All Vendors",
  "vendors.from": "From",

  // Blog Section
  "blog.title": "From the Blog",
  "blog.subtitle": "Latest insights and trends in HR technology",
  "blog.viewAll": "View all articles",

  // Testimonials Section
  "testimonials.title": "Pricing Plan",

  // Pricing Section
  "pricing.title": "Pricing Plan",
  "pricing.subtitle": "Choose the tier that matches your visibility and support needs.",
  "pricing.monthly": "Monthly",
  "pricing.yearly": "Yearly",
  "pricing.choosePlan": "Choose Your Plan",
  "pricing.free": "Free",
  "pricing.save": "Save",
  "pricing.comingSoon": "Plan details coming soon.",

  // Ownership Request
  "ownership.title": "Vendor",
  "ownership.unclaimedBadge": "Unclaimed product",
  "ownership.promptTitle": "Are you the supplier of this product?",
  "ownership.promptDesc": "This product has no verified supplier. Submit your request and we'll review it.",
  "ownership.loginRequired": "You must log in to apply as the supplier of this product.",
  "ownership.loginCta": "Log in",
  "ownership.formTitle": "Supplier Application",
  "ownership.formDesc": "Confirm your details and submit your ownership request.",
  "ownership.companyName": "Company name",
  "ownership.companySize": "Company size",
  "ownership.website": "Website",
  "ownership.messageLabel": "Message (optional)",
  "ownership.messagePlaceholder": "Tell us why this vendor belongs to you.",
  "ownership.paymentTitle": "Payment (coming soon)",
  "ownership.paymentDesc": "No payment is required for freemium requests.",
  "ownership.paymentComingSoon": "Payment will be required for paid tiers. Online payments are coming soon.",
  "ownership.submit": "Submit request",
  "ownership.submitting": "Submitting...",
  "ownership.vendorMissing": "Vendor information could not be found.",
  "ownership.fullNameRequired": "Full name is required.",
  "ownership.companyRequired": "Company name is required.",
  "ownership.companySizeHint": "Use a range like 1-10.",
  "ownership.companySizeInvalid": "Company size should be a range like 1-10.",
  "ownership.websiteInvalid": "Website must start with http:// or https://",
  "ownership.vendorUpdateFailed": "Vendor profile could not be updated.",
  "ownership.requestFailed": "Ownership request could not be submitted.",
  "ownership.requestSuccessTitle": "Request submitted",
  "ownership.requestSuccessDesc": "We received your request and will get back to you.",
  "ownership.profileUpdateNote": "These details will also update your profile.",
  "ownership.requestedTierLabel": "Requested tier",
  "ownership.tierTitle": "Choose your tier",
  "ownership.tierSubtitle": "Select the visibility level you want to apply for.",
  "ownership.tierFreemiumLabel": "Freemium",
  "ownership.tierFreemiumSubtitle": "Quick start",
  "ownership.tierFreemiumPrice": "Free",
  "ownership.tierFreemiumDesc": "Basic listing, no payment required.",
  "ownership.tierPlusLabel": "Plus",
  "ownership.tierPlusSubtitle": "Featured visibility",
  "ownership.tierPlusPrice": "$99 / mo",
  "ownership.tierPlusDesc": "Boosted visibility and analytics.",
  "ownership.tierPremiumLabel": "Premium",
  "ownership.tierPremiumSubtitle": "Premium reach",
  "ownership.tierPremiumPrice": "$199 / mo",
  "ownership.tierPremiumDesc": "Top placement with priority support.",
  "ownership.previewTitle": "Preview",
  "ownership.previewDesc": "How your vendor card will appear.",
  "ownership.previewCompanyFallback": "Your company",
  "ownership.previewWebsiteFallback": "Website pending",
  "ownership.previewStatus": "Pending review",
  "ownership.previewTierLabel": "Tier",

  // FAQ Section
  "faq.title1": "Frequently Asked",
  "faq.title2": "Questions",
  "faq.subtitle":
    "Unlock the full potential of your HR with a membership that offers unlimited access to our entire library of premium products and vendors.",
  "faq.q1": "What is included in the free plan?",
  "faq.a1":
    "The free plan gives you access to a limited selection of products and vendors to help you get started. You'll also receive basic updates to the free library. Also our Team Plan allows up to 5 users to access the full library, collaborate on projects, and share resources. It's perfect for growing HR teams.",
  "faq.q2": "What do I get with the Pro Plan?",
  "faq.a2":
    "The Pro Plan includes access to all premium HR products, priority vendor matching, advanced analytics, and dedicated support. You'll also get early access to new products and features.",
  "faq.q3": "Can I upgrade or downgrade my plan at any time?",
  "faq.a3":
    "Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle. If you upgrade mid-cycle, you'll be charged a prorated amount.",
  "faq.q4": "Do you offer a team plan for multiple users?",
  "faq.a4":
    "Absolutely! Our Enterprise plan is designed for teams of all sizes. It includes multi-user access, team management features, shared resources, and volume discounts.",
  "faq.q5": "How often are new products added?",
  "faq.a5":
    "We add new products and vendors to our marketplace weekly. Premium members get early access to all new additions and can vote on upcoming features.",

  // Footer
  "footer.newsletter.title": "Subscribe our Newsletter",
  "footer.newsletter.desc": "Create profiles, connect with vendors, or build your HR community.",
  "footer.newsletter.placeholder": "Enter your email",
  "footer.newsletter.button": "Subscribe",
  "footer.company": "Company",
  "footer.blog": "Blog",
  "footer.products": "Products",
  "footer.vendors": "Vendors",
  "footer.pricing": "Pricing Plan",
  "footer.story": "Our Story",
  "footer.contact": "Contact us",
  "footer.support": "Support",
  "footer.terms": "Terms of Service",
  "footer.privacy": "Privacy Policy",
  "footer.followUs": "Follow us",
  "footer.rights": "HRTera All Rights Reserved.",
  "footer.legal": "© 2025 Legal",
  "footer.newsletter.invalidEmail": "Please enter a valid email address.",
  "footer.newsletter.alreadySubscribed": "You are already subscribed.",
  "footer.newsletter.subscriptionSaved": "Subscription saved.",
  "footer.newsletter.storageNote": "Your email is stored locally in this browser.",

  // Auth Modal
  "auth.welcome": "Welcome to HRTera – your HR marketplace",
  "auth.login": "Log in",
  "auth.signup": "Sign up",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.rememberMe": "Remember me",
  "auth.forgotPassword": "Forgot password?",
  "auth.loggingIn": "Logging in...",
  "auth.noAccount": "Don't have an account?",
  "auth.hasAccount": "Already have an account?",
  "auth.orContinue": "Or continue with",
  "auth.continueWithGoogle": "Continue with Google",
  "auth.fullName": "Full Name",
  "auth.workEmail": "Work Email",
  "auth.phone": "Phone Number",
  "auth.company": "Company (optional)",
  "auth.role": "Role (optional)",
  "auth.confirmPassword": "Confirm Password",
  "auth.invalidPhone": "Please enter a valid phone number",
  "auth.agreeTerms": "I agree to the",
  "auth.termsOfService": "Terms of Service",
  "auth.and": "and",
  "auth.privacyPolicy": "Privacy Policy",
  "auth.creatingAccount": "Creating account...",
  "auth.createAccount": "Create account",

  // Search Bar
  "search.placeholder": "Search products & vendors...",

  // Profile Dropdown
  "profile.profile": "Profile",
  "profile.logout": "Log out",

  // Common
  "common.error": "Error",
  "common.loading": "Loading...",

  // Contact Page
  "contact.title": "Contact HRTera",
  "contact.description":
    "Have a question about listings, partnerships, or the marketplace? Send us a message and we will route it to the right team.",
  "contact.fullName": "Full name",
  "contact.fullNamePlaceholder": "Your name",
  "contact.workEmail": "Work email",
  "contact.workEmailPlaceholder": "you@company.com",
  "contact.company": "Company",
  "contact.companyPlaceholder": "Company name",
  "contact.subject": "Subject",
  "contact.subjectPlaceholder": "How can we help?",
  "contact.message": "Message",
  "contact.messagePlaceholder": "Tell us about your request",
  "contact.sendMessage": "Send message",
  "contact.invalidEmail": "Please enter a valid email address.",
  "contact.messageRequired": "Please add a message.",
  "contact.messageSaved": "Message saved.",

  // Product Detail Page
  "productDetail.loading": "Loading product...",
  "productDetail.notFound": "Product Not Found",
  "productDetail.notFoundDesc": "The product you're looking for doesn't exist.",
  "productDetail.browseAll": "Browse all products",
  "productDetail.home": "Home",
  "productDetail.requestDemo": "Request Demo",
  "productDetail.visitWebsite": "Visit Website",
  "productDetail.downloadBrochure": "Download Brochure",
  "productDetail.contactVendor": "Contact Vendor",
  "productDetail.vendor": "Vendor",
  "productDetail.viewProfile": "View profile →",
  "productDetail.claimPrompt": "Are you part of this organization?",
  "productDetail.claimProduct": "Claim This Product",
  "productDetail.noProductId": "No product ID provided",
  "productDetail.productNotFound": "Product not found",
  "productDetail.loadFailed": "Failed to load product",
  "productDetail.notAvailable": "N/A",
  "productDetail.contact": "Contact",
  "productDetail.viewScreenshot": "View screenshot",

  // Product Tabs
  "productTabs.overview": "Overview",
  "productTabs.features": "Features & Use Cases",
  "productTabs.media": "Media",
  "productTabs.reviews": "Reviews",
  "productTabs.pricing": "Pricing",
  "productTabs.whoIsItFor": "Who is it for?",
  "productTabs.whatDoesItSolve": "What does it solve?",
  "productTabs.keyFeatures": "Key Features",
  "productTabs.noReviews": "No reviews yet",
  "productTabs.beFirstReview": "Be the first to review this product!",
  "productTabs.perMonth": "/month",
  "productTabs.enterprisePricing": "Contact us for custom enterprise pricing and volume discounts.",
  "productTabs.flexiblePricing": "Get started with our flexible pricing plans.",
  "productTabs.getStarted": "Get Started",
  "productTabs.contactForPricing": "Contact for Pricing",
  "productTabs.customizedPricing": "Pricing is customized based on your needs.",

  // Settings Tab
  "settings.nav.account": "Account",
  "settings.nav.vendor": "Vendor Profile",
  "settings.nav.billing": "Billing & Plan",
  "settings.nav.team": "Team",
  "settings.nav.campaigns": "Campaigns",

  "settings.common.saveChanges": "Save changes",
  "settings.common.cancel": "Cancel",

  "settings.toast.saveAccountError": "Unable to save account settings. Please try again.",
  "settings.toast.saveVendorError": "Unable to save vendor profile. Please try again.",
  "settings.toast.saveSuccess": "Settings saved successfully",
  "settings.toast.saveError": "Unable to save settings. Please try again.",

  "settings.account.title": "Account Settings",
  "settings.account.fullName": "Full Name",
  "settings.account.email": "Email",
  "settings.account.password": "Password",
  "settings.account.changePassword": "Change password",
  "settings.account.notificationsTitle": "Notification Preferences",
  "settings.account.notificationsLabel": "Enable email notifications",
  "settings.account.notificationsDesc": "Receive email notifications about your account and activities",

  "settings.vendor.title": "Vendor Profile",
  "settings.vendor.logo.label": "Company Logo",
  "settings.vendor.logo.upload": "Upload logo",
  "settings.vendor.logo.placeholder": "Upload an image file or enter a logo URL",
  "settings.vendor.logo.alt": "Company logo",
  "settings.vendor.logo.aria": "Upload company logo",
  "settings.vendor.logo.success": "Image uploaded successfully",
  "settings.vendor.logo.errors.invalidType": "Please select a valid image file",
  "settings.vendor.logo.errors.tooLarge": "Image size must be less than 5MB",
  "settings.vendor.logo.errors.readFailed": "Failed to read image file",
  "settings.vendor.companyName": "Company Name",
  "settings.vendor.companyNamePlaceholder": "Your Company Name",
  "settings.vendor.companyMotto": "Company Tagline / Motto",
  "settings.vendor.companyMottoPlaceholder": "HR solutions for modern teams",
  "settings.vendor.website": "Website URL",
  "settings.vendor.websitePlaceholder": "https://example.com",
  "settings.vendor.linkedin": "LinkedIn Link",
  "settings.vendor.linkedinPlaceholder": "https://linkedin.com/company/yourcompany",
  "settings.vendor.instagram": "Instagram Link",
  "settings.vendor.instagramPlaceholder": "https://instagram.com/yourcompany",
  "settings.vendor.headquarters": "Headquarters",
  "settings.vendor.headquartersPlaceholder": "San Francisco, USA",
  "settings.vendor.foundedAt": "Founded At",
  "settings.vendor.companySize": "Company Size",
  "settings.vendor.companySizePlaceholder": "e.g., 1-10, 11-50, 51-200, 201-500, 500+",

  "settings.billing.title": "Billing & Plan",
  "settings.billing.planPrefix": "",
  "settings.billing.nextBilling": "Next billing",
  "settings.billing.upgrade": "Upgrade",
  "settings.billing.freemiumNote": "Your current plan is free and cannot be downgraded.",
  "settings.billing.unlockPlusTitle": "Unlock with Plus:",
  "settings.billing.unlockPlus1": "Multiple categories and detailed descriptions",
  "settings.billing.unlockPlus2": "Product galleries and screenshots",
  "settings.billing.unlockPlus3": "Customer reviews management",
  "settings.billing.unlockPremiumTitle": "Unlock with Premium:",
  "settings.billing.unlockPremium1": "Case studies and featured content",
  "settings.billing.unlockPremium2": "Product analytics and insights",
  "settings.billing.unlockPremium3": "Team management and campaigns",
  "settings.billing.products": "Products",
  "settings.billing.totalViews": "Total Views",
  "settings.billing.invoiceHistory": "View invoice history",
  "settings.billing.paymentMethod": "Payment Method",
  "settings.billing.updatePayment": "Update",

  "settings.team.title": "Team Management",
  "settings.team.subtitle": "Add team members who can help manage your products.",
  "settings.team.admin": "Admin",
  "settings.team.invite": "Invite team member",

  "settings.campaigns.title": "Campaigns & Promotions",
  "settings.campaigns.subtitle": "Create promotional campaigns for your products.",
  "settings.campaigns.empty": "No active campaigns. Create one to boost your product visibility.",
  "settings.campaigns.create": "Create campaign",

  "settings.password.dialogTitle": "Change Password",
  "settings.password.dialogDesc": "Enter your current password and choose a new one.",
  "settings.password.current": "Current Password",
  "settings.password.currentPlaceholder": "Enter current password",
  "settings.password.new": "New Password",
  "settings.password.newPlaceholder": "Enter new password (min. 6 characters)",
  "settings.password.confirm": "Confirm New Password",
  "settings.password.confirmPlaceholder": "Confirm new password",
  "settings.password.change": "Change Password",
  "settings.password.changing": "Changing...",

  "settings.password.errors.fillAll": "Please fill in all password fields",
  "settings.password.errors.minLength": "New password must be at least 6 characters long",
  "settings.password.errors.mismatch": "New passwords do not match",
  "settings.password.errors.sameAsCurrent": "New password must be different from current password",
  "settings.password.errors.currentIncorrect": "Current password is incorrect",
  "settings.password.errors.updateFailed": "Unable to change password. Please try again.",
  "settings.password.errors.generic": "Unable to change password. Please try again.",
  "settings.password.success": "Password changed successfully",
};

// Turkish translations
const tr: Record<string, string> = {
  // Navbar
  "nav.products": "Ürünler",
  "nav.vendors": "Satıcılar",
  "nav.blog": "Blog",
  "nav.pricing": "Fiyatlandırma",
  "nav.login": "Giriş Yap / Kayıt Ol",
  "nav.profile": "Profilim",

  // Hero Section
  "hero.badge": "Kapsamlı İK Çözümleri",
  "hero.title1": "Potansiyeli Açığa Çıkarın",
  "hero.title2": "50+ İK Ürünü",
  "hero.subtitle": "İş gücünüzü güçlendirmek için yüksek kaliteli, özelleştirilebilir İK çözümlerini keşfedin.",
  "hero.searchPlaceholder": "Ürün veya Satıcı Ara",
  "hero.stat1.title": "50+ Ürün",
  "hero.stat1.desc": "Her ihtiyaç için ücretsiz ve premium İK çözümleri",
  "hero.stat2.title": "1.000+ Memnun Müşteri",
  "hero.stat2.desc": "İK profesyonelleri pazaryerimize güveniyor",
  "hero.stat3.title": "30+ Satıcı",
  "hero.stat3.desc": "Güvenilir İK hizmet sağlayıcıları",

  // Products Section
  "products.title": "Popüler Ürünler",
  "products.subtitle": "Lider şirketlerin güvendiği premium seviye çözümler",
  "products.browseAll": "Tümünü gör",
  "products.searchPlaceholder": "Ürün Ara",
  "products.showing": "Gösterilen",
  "products.of": ", toplam",
  "products.productsCount": "ürün",
  "products.loading": "Ürünler yükleniyor...",
  "products.noProducts": "Ürün bulunamadı.",
  "products.clearFilters": "Filtreleri temizle",
  "products.retry": "Tekrar dene",
  "products.vendorTier": "Satıcı Seviyesi",
  "products.category": "Kategori",
  "products.allTiers": "Tüm Seviyeler",
  "products.premium": "Premium",
  "products.plus": "Plus",
  "products.free": "Ücretsiz",
  "products.allProducts": "Tüm Ürünler",
  "products.clearAllFilters": "Tüm filtreleri temizle",

  // Vendors Section
  "vendors.title": "Satıcılar",
  "vendors.subtitle": "Pazaryerindeki en yüksek puanlı premium satıcılar",
  "vendors.browseAll": "Tümünü gör",
  "vendors.searchPlaceholder": "Satıcı Ara",
  "vendors.showing": "Gösterilen",
  "vendors.vendorsCount": "satıcı",
  "vendors.noVendors": "Satıcı bulunamadı.",
  "vendors.vendorTier": "Satıcı Seviyesi",
  "vendors.vendorType": "Satıcı Türü",
  "vendors.allVendors": "Tüm Satıcılar",
  "vendors.from": "Başlangıç",

  // Blog Section
  "blog.title": "Blogdan",
  "blog.subtitle": "İK teknolojisindeki son gelişmeler ve trendler",
  "blog.viewAll": "Tüm makaleleri gör",

  // Testimonials Section
  "testimonials.title": "Fiyatlandırma Planı",

  // Pricing Section
  "pricing.title": "Fiyatlandırma Planı",
  "pricing.subtitle": "Görünürlük ve destek ihtiyacınıza uygun paketi seçin.",
  "pricing.monthly": "Aylık",
  "pricing.yearly": "Yıllık",
  "pricing.choosePlan": "Planı Seç",
  "pricing.free": "Ücretsiz",
  "pricing.save": "Tasarruf",
  "pricing.comingSoon": "Plan detayları yakında.",

  // Ownership Request
  "ownership.title": "Tedarikçi",
  "ownership.unclaimedBadge": "Sahipsiz ürün",
  "ownership.promptTitle": "Bu ürünün tedarikçisi siz misiniz?",
  "ownership.promptDesc":
    "Bu ürünün doğrulanmış bir tedarikçisi yok. Başvurunuzu gönderin, inceleme sonrası sahiplik size atanır.",
  "ownership.loginRequired": "Bu ürünün tedarikçisi olarak başvurmak için giriş yapmalısınız.",
  "ownership.loginCta": "Giriş yap",
  "ownership.formTitle": "Tedarikçi Başvurusu",
  "ownership.formDesc": "Bilgilerinizi doğrulayın ve sahiplik başvurunuzu gönderin.",
  "ownership.companyName": "Şirket adı",
  "ownership.companySize": "Şirket büyüklüğü",
  "ownership.website": "Web sitesi",
  "ownership.messageLabel": "Mesaj (opsiyonel)",
  "ownership.messagePlaceholder": "Bu tedarikçinin size ait olduğunu kısaca açıklayın.",
  "ownership.paymentTitle": "Ödeme (yakında)",
  "ownership.paymentDesc": "Freemium başvurularda ödeme gerekmiyor.",
  "ownership.paymentComingSoon": "Ücretli paketlerde ödeme gerekecek. Online ödeme yakında.",
  "ownership.submit": "Başvuruyu gönder",
  "ownership.submitting": "Gönderiliyor...",
  "ownership.vendorMissing": "Tedarikçi bilgisi bulunamadı.",
  "ownership.fullNameRequired": "İsim alanı zorunludur.",
  "ownership.companyRequired": "Şirket adı zorunludur.",
  "ownership.companySizeHint": "1-10 gibi bir aralık girin.",
  "ownership.companySizeInvalid": "Şirket büyüklüğü 1-10 gibi bir aralık olmalıdır.",
  "ownership.websiteInvalid": "Web sitesi http:// veya https:// ile başlamalıdır.",
  "ownership.vendorUpdateFailed": "Tedarikçi profili güncellenemedi.",
  "ownership.requestFailed": "Sahiplik başvurusu gönderilemedi.",
  "ownership.requestSuccessTitle": "Başvuru gönderildi",
  "ownership.requestSuccessDesc": "Sahiplik talebiniz alındı. İnceleme sonrası bilgilendirileceksiniz.",
  "ownership.profileUpdateNote": "Bu bilgiler profilinizde güncellenecektir.",
  "ownership.requestedTierLabel": "Talep edilen paket",
  "ownership.tierTitle": "Paketini seç",
  "ownership.tierSubtitle": "Başvurmak istediğin görünürlük seviyesini seç.",
  "ownership.tierFreemiumLabel": "Freemium",
  "ownership.tierFreemiumSubtitle": "Hızlı başlangıç",
  "ownership.tierFreemiumPrice": "Ücretsiz",
  "ownership.tierFreemiumDesc": "Temel listeleme, ödeme gerekmez.",
  "ownership.tierPlusLabel": "Plus",
  "ownership.tierPlusSubtitle": "Öne çıkan görünürlük",
  "ownership.tierPlusPrice": "$99 / ay",
  "ownership.tierPlusDesc": "Daha yüksek görünürlük ve analitik.",
  "ownership.tierPremiumLabel": "Premium",
  "ownership.tierPremiumSubtitle": "Premium erişim",
  "ownership.tierPremiumPrice": "$199 / ay",
  "ownership.tierPremiumDesc": "En üst görünürlük ve öncelikli destek.",
  "ownership.previewTitle": "Önizleme",
  "ownership.previewDesc": "Satıcı kartınız böyle görünecek.",
  "ownership.previewCompanyFallback": "Şirketiniz",
  "ownership.previewWebsiteFallback": "Web sitesi bekleniyor",
  "ownership.previewStatus": "İncelemede",
  "ownership.previewTierLabel": "Paket",

  // FAQ Section
  "faq.title1": "Sıkça Sorulan",
  "faq.title2": "Sorular",
  "faq.subtitle":
    "Premium ürünler ve satıcılardan oluşan tüm kütüphanemize sınırsız erişim sunan bir üyelikle İK'nızın tam potansiyelini açığa çıkarın.",
  "faq.q1": "Ücretsiz plana neler dahil?",
  "faq.a1":
    "Ücretsiz plan, başlamanıza yardımcı olmak için sınırlı bir ürün ve satıcı seçimine erişim sağlar. Ayrıca ücretsiz kütüphaneye temel güncellemeler de alacaksınız. Takım Planımız 5 kullanıcıya kadar tam kütüphaneye erişim, projelerde işbirliği ve kaynak paylaşımı imkanı sunar. Büyüyen İK ekipleri için mükemmeldir.",
  "faq.q2": "Pro Plan ile ne alırım?",
  "faq.a2":
    "Pro Plan, tüm premium İK ürünlerine erişim, öncelikli satıcı eşleştirme, gelişmiş analitikler ve özel destek içerir. Ayrıca yeni ürün ve özelliklere erken erişim elde edersiniz.",
  "faq.q3": "Planımı istediğim zaman yükseltebilir veya düşürebilir miyim?",
  "faq.a3":
    "Evet! Planınızı istediğiniz zaman yükseltebilir veya düşürebilirsiniz. Değişiklikler bir sonraki fatura döngünüze yansıtılacaktır. Döngü ortasında yükseltme yaparsanız, orantılı bir tutar tahsil edilecektir.",
  "faq.q4": "Birden fazla kullanıcı için takım planı sunuyor musunuz?",
  "faq.a4":
    "Kesinlikle! Kurumsal planımız her büyüklükteki ekip için tasarlanmıştır. Çoklu kullanıcı erişimi, takım yönetimi özellikleri, paylaşılan kaynaklar ve toplu indirimler içerir.",
  "faq.q5": "Ne sıklıkla yeni ürünler ekleniyor?",
  "faq.a5":
    "Pazaryerimize haftalık olarak yeni ürünler ve satıcılar ekliyoruz. Premium üyeler tüm yeni eklemelere erken erişim elde eder ve yaklaşan özellikler için oy kullanabilir.",

  // Footer
  "footer.newsletter.title": "Bültenimize Abone Olun",
  "footer.newsletter.desc": "Profil oluşturun, satıcılarla bağlantı kurun veya İK topluluğunuzu oluşturun.",
  "footer.newsletter.placeholder": "E-postanızı girin",
  "footer.newsletter.button": "Abone Ol",
  "footer.company": "Şirket",
  "footer.blog": "Blog",
  "footer.products": "Ürünler",
  "footer.vendors": "Satıcılar",
  "footer.pricing": "Fiyatlandırma",
  "footer.story": "Hikayemiz",
  "footer.contact": "İletişim",
  "footer.support": "Destek",
  "footer.terms": "Hizmet Şartları",
  "footer.privacy": "Gizlilik Politikası",
  "footer.followUs": "Bizi Takip Edin",
  "footer.rights": "HRTera Tüm Hakları Saklıdır.",
  "footer.legal": "© 2025 Yasal",
  "footer.newsletter.invalidEmail": "Lütfen geçerli bir e-posta adresi girin.",
  "footer.newsletter.alreadySubscribed": "Zaten abone oldunuz.",
  "footer.newsletter.subscriptionSaved": "Abonelik kaydedildi.",
  "footer.newsletter.storageNote": "E-postanız bu tarayıcıda yerel olarak saklanmaktadır.",

  // Auth Modal
  "auth.welcome": "HRTera'a hoş geldiniz – İK pazaryeriniz",
  "auth.login": "Giriş Yap",
  "auth.signup": "Kayıt Ol",
  "auth.email": "E-posta",
  "auth.password": "Şifre",
  "auth.rememberMe": "Beni hatırla",
  "auth.forgotPassword": "Şifremi unuttum?",
  "auth.loggingIn": "Giriş yapılıyor...",
  "auth.noAccount": "Hesabınız yok mu?",
  "auth.hasAccount": "Zaten hesabınız var mı?",
  "auth.orContinue": "Veya şununla devam edin",
  "auth.continueWithGoogle": "Google ile devam et",
  "auth.fullName": "Ad Soyad",
  "auth.workEmail": "İş E-postası",
  "auth.phone": "Telefon Numarası",
  "auth.company": "Şirket (isteğe bağlı)",
  "auth.role": "Pozisyon (isteğe bağlı)",
  "auth.confirmPassword": "Şifre Tekrar",
  "auth.invalidPhone": "Geçerli bir telefon numarası girin",
  "auth.agreeTerms": "Kabul ediyorum",
  "auth.termsOfService": "Hizmet Şartları",
  "auth.and": "ve",
  "auth.privacyPolicy": "Gizlilik Politikası",
  "auth.creatingAccount": "Hesap oluşturuluyor...",
  "auth.createAccount": "Hesap Oluştur",

  // Search Bar
  "search.placeholder": "Ürün ve satıcı ara...",

  // Profile Dropdown
  "profile.profile": "Profil",
  "profile.logout": "Çıkış Yap",

  // Common
  "common.error": "Hata",
  "common.loading": "Yükleniyor...",

  // Contact Page
  "contact.title": "HRTera ile İletişime Geçin",
  "contact.description":
    "Ürün listeleme, abonelik veya pazaryeri hakkında bir sorunuz mu var? Bize bir mesaj gönderin, doğru ekibe yönlendirelim.",
  "contact.fullName": "Ad Soyad",
  "contact.fullNamePlaceholder": "Adınız",
  "contact.workEmail": "İş e-postası",
  "contact.workEmailPlaceholder": "siz@sirket.com",
  "contact.company": "Şirket",
  "contact.companyPlaceholder": "Şirket adı",
  "contact.subject": "Konu",
  "contact.subjectPlaceholder": "Size nasıl yardımcı olabiliriz?",
  "contact.message": "Mesaj",
  "contact.messagePlaceholder": "Talebiniz hakkında bize bilgi verin",
  "contact.sendMessage": "Mesaj gönder",
  "contact.invalidEmail": "Lütfen geçerli bir e-posta adresi girin.",
  "contact.messageRequired": "Lütfen bir mesaj ekleyin.",
  "contact.messageSaved": "Mesaj kaydedildi.",

  // Product Detail Page
  "productDetail.loading": "Ürün yükleniyor...",
  "productDetail.notFound": "Ürün Bulunamadı",
  "productDetail.notFoundDesc": "Aradığınız ürün mevcut değil.",
  "productDetail.browseAll": "Tüm ürünleri görüntüle",
  "productDetail.home": "Ana Sayfa",
  "productDetail.requestDemo": "Demo Talep Et",
  "productDetail.visitWebsite": "Web Sitesini Ziyaret Et",
  "productDetail.downloadBrochure": "Broşür İndir",
  "productDetail.contactVendor": "Satıcı ile İletişime Geç",
  "productDetail.vendor": "Şirket Bilgileri",
  "productDetail.viewProfile": "Profili görüntüle →",
  "productDetail.claimPrompt": "Bu şirket size mi ait?",
  "productDetail.claimProduct": "Birlikte güncelleyelim →",
  "productDetail.noProductId": "Ürün ID'si sağlanmadı",
  "productDetail.productNotFound": "Ürün bulunamadı",
  "productDetail.loadFailed": "Ürün yüklenemedi",
  "productDetail.notAvailable": "Mevcut Değil",
  "productDetail.contact": "İletişim",
  "productDetail.viewScreenshot": "Ekran görüntüsünü görüntüle",

  // Product Tabs
  "productTabs.overview": "Genel Bakış",
  "productTabs.features": "Ürün Özellikleri",
  "productTabs.media": "Medya",
  "productTabs.reviews": "Değerlendirmeler",
  "productTabs.pricing": "Fiyatlandırma",
  "productTabs.whoIsItFor": "Kimler için?",
  "productTabs.whatDoesItSolve": "Ne çözüyor?",
  "productTabs.keyFeatures": "Temel Özellikler",
  "productTabs.noReviews": "Henüz değerlendirme yok",
  "productTabs.beFirstReview": "Bu ürünü ilk değerlendiren siz olun!",
  "productTabs.perMonth": "/ay",
  "productTabs.enterprisePricing":
    "Özel kurumsal fiyatlandırma ve toplu indirimler için bizimle iletişime geçin.",
  "productTabs.flexiblePricing": "Esnek fiyatlandırma planlarımızla başlayın.",
  "productTabs.getStarted": "Başlayın",
  "productTabs.contactForPricing": "Fiyatlandırma İçin İletişime Geçin",
  "productTabs.customizedPricing": "Fiyatlandırma ihtiyaçlarınıza göre özelleştirilir.",

  // Settings Tab
  "settings.nav.account": "Hesap",
  "settings.nav.vendor": "Tedarikçi Profili",
  "settings.nav.billing": "Faturalandırma & Paket",
  "settings.nav.team": "Ekip",
  "settings.nav.campaigns": "Kampanyalar",

  "settings.common.saveChanges": "Değişiklikleri kaydet",
  "settings.common.cancel": "İptal",

  "settings.toast.saveAccountError": "Hesap ayarları kaydedilemedi. Lütfen tekrar deneyin.",
  "settings.toast.saveVendorError": "Tedarikçi profili kaydedilemedi. Lütfen tekrar deneyin.",
  "settings.toast.saveSuccess": "Ayarlar başarıyla kaydedildi",
  "settings.toast.saveError": "Ayarlar kaydedilemedi. Lütfen tekrar deneyin.",

  "settings.account.title": "Hesap Ayarları",
  "settings.account.fullName": "Ad Soyad",
  "settings.account.email": "E-posta",
  "settings.account.password": "Şifre",
  "settings.account.changePassword": "Şifre değiştir",
  "settings.account.notificationsTitle": "Bildirim Tercihleri",
  "settings.account.notificationsLabel": "E-posta bildirimlerini etkinleştir",
  "settings.account.notificationsDesc": "Hesabınız ve aktiviteleriniz hakkında e-posta bildirimleri alın",

  "settings.vendor.title": "Tedarikçi Profili",
  "settings.vendor.logo.label": "Şirket Logosu",
  "settings.vendor.logo.upload": "Logo yükle",
  "settings.vendor.logo.placeholder": "Bir görsel yükleyin veya logo URL'i girin",
  "settings.vendor.logo.alt": "Şirket logosu",
  "settings.vendor.logo.aria": "Şirket logosu yükle",
  "settings.vendor.logo.success": "Görsel başarıyla yüklendi",
  "settings.vendor.logo.errors.invalidType": "Lütfen geçerli bir görsel dosyası seçin",
  "settings.vendor.logo.errors.tooLarge": "Görsel boyutu 5MB'den küçük olmalıdır",
  "settings.vendor.logo.errors.readFailed": "Görsel dosyası okunamadı",
  "settings.vendor.companyName": "Şirket Adı",
  "settings.vendor.companyNamePlaceholder": "Şirket adınız",
  "settings.vendor.companyMotto": "Şirket Sloganı / Motto",
  "settings.vendor.companyMottoPlaceholder": "Modern ekipler için İK çözümleri",
  "settings.vendor.website": "Web Sitesi",
  "settings.vendor.websitePlaceholder": "https://example.com",
  "settings.vendor.linkedin": "LinkedIn Bağlantısı",
  "settings.vendor.linkedinPlaceholder": "https://linkedin.com/company/sirketiniz",
  "settings.vendor.instagram": "Instagram Bağlantısı",
  "settings.vendor.instagramPlaceholder": "https://instagram.com/sirketiniz",
  "settings.vendor.headquarters": "Merkez Ofis",
  "settings.vendor.headquartersPlaceholder": "İstanbul, Türkiye",
  "settings.vendor.foundedAt": "Kuruluş Tarihi",
  "settings.vendor.companySize": "Şirket Büyüklüğü",
  "settings.vendor.companySizePlaceholder": "örn. 1-10, 11-50, 51-200, 201-500, 500+",

  "settings.billing.title": "Faturalandırma & Paket",
  "settings.billing.planPrefix": "",
  "settings.billing.nextBilling": "Sonraki fatura",
  "settings.billing.upgrade": "Yükselt",
  "settings.billing.freemiumNote": "Mevcut paketiniz ücretsizdir ve düşürülemez.",
  "settings.billing.unlockPlusTitle": "Plus ile açılır:",
  "settings.billing.unlockPlus1": "Birden çok kategori ve detaylı açıklamalar",
  "settings.billing.unlockPlus2": "Ürün galerileri ve ekran görüntüleri",
  "settings.billing.unlockPlus3": "Müşteri yorumlarını yönetme",
  "settings.billing.unlockPremiumTitle": "Premium ile açılır:",
  "settings.billing.unlockPremium1": "Vaka çalışmaları ve öne çıkan içerikler",
  "settings.billing.unlockPremium2": "Ürün analitiği ve içgörüler",
  "settings.billing.unlockPremium3": "Ekip yönetimi ve kampanyalar",
  "settings.billing.products": "Ürünler",
  "settings.billing.totalViews": "Toplam Görüntülenme",
  "settings.billing.invoiceHistory": "Fatura geçmişini görüntüle",
  "settings.billing.paymentMethod": "Ödeme Yöntemi",
  "settings.billing.updatePayment": "Güncelle",

  "settings.team.title": "Ekip Yönetimi",
  "settings.team.subtitle": "Ürünlerinizi yönetmenize yardımcı olacak ekip üyeleri ekleyin.",
  "settings.team.admin": "Yönetici",
  "settings.team.invite": "Ekip üyesi davet et",

  "settings.campaigns.title": "Kampanyalar & Promosyonlar",
  "settings.campaigns.subtitle": "Ürünleriniz için promosyon kampanyaları oluşturun.",
  "settings.campaigns.empty": "Aktif kampanya yok. Görünürlüğü artırmak için bir kampanya oluşturun.",
  "settings.campaigns.create": "Kampanya oluştur",

  "settings.password.dialogTitle": "Şifre Değiştir",
  "settings.password.dialogDesc": "Mevcut şifrenizi girin ve yeni bir şifre belirleyin.",
  "settings.password.current": "Mevcut Şifre",
  "settings.password.currentPlaceholder": "Mevcut şifrenizi girin",
  "settings.password.new": "Yeni Şifre",
  "settings.password.newPlaceholder": "Yeni şifre (en az 6 karakter)",
  "settings.password.confirm": "Yeni Şifre (Tekrar)",
  "settings.password.confirmPlaceholder": "Yeni şifreyi tekrar girin",
  "settings.password.change": "Şifreyi Değiştir",
  "settings.password.changing": "Değiştiriliyor...",

  "settings.password.errors.fillAll": "Lütfen tüm şifre alanlarını doldurun",
  "settings.password.errors.minLength": "Yeni şifre en az 6 karakter olmalıdır",
  "settings.password.errors.mismatch": "Yeni şifreler eşleşmiyor",
  "settings.password.errors.sameAsCurrent": "Yeni şifre mevcut şifreden farklı olmalıdır",
  "settings.password.errors.currentIncorrect": "Mevcut şifre yanlış",
  "settings.password.errors.updateFailed": "Şifre değiştirilemedi. Lütfen tekrar deneyin.",
  "settings.password.errors.generic": "Şifre değiştirilemedi. Lütfen tekrar deneyin.",
  "settings.password.success": "Şifre başarıyla değiştirildi",
};

const translations: Record<Language, Record<string, string>> = { en, tr };

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem("hr-hub-language");
    if (saved === "tr" || saved === "en") {
      return saved;
    }
    // Default to Turkish
    return "tr";
  });

  useEffect(() => {
    localStorage.setItem("hr-hub-language", language);
    // Update document lang attribute
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
