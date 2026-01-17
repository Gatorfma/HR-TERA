import { supabase } from "@/api/supabaseClient";

export const getProducts = async ({ n, page, productFilter = null, vendorFilter = null, categoryFilter = null, tierFilter = null }) => {
    const { data, error } = await supabase.rpc('get_product_cards', {
        n,
        page,
        product_filter: productFilter,
        vendor_filter: vendorFilter,
        category_filter: categoryFilter,
        tier_filter: tierFilter,
    });

    if (error) throw error;
    return data ?? [];
};

export const getProductCountFiltered = async ({ productFilter = null, vendorFilter = null, categoryFilter = null, tierFilter = null }) => {
    const { data, error } = await supabase.rpc('get_product_count_filtered', {
        product_filter: productFilter,
        vendor_filter: vendorFilter,
        category_filter: categoryFilter,
        tier_filter: tierFilter,
    });

    if (error) throw error;
    return data ?? 0;
};

export const getProductDetails = async (productId) => {
    const { data, error } = await supabase.rpc("get_product_details", {
        p_product_id: productId,
    });

    if (error) throw error;

    return data?.[0] ?? null;
};

export const getProductCount = async () => {
    const { data, error } = await supabase.rpc("get_product_count");

    if (error) throw error;
    return data ?? 0;
};

export const getVendorCount = async () => {
    const { data, error } = await supabase.rpc("get_vendor_count");

    if (error) throw error;
    return data ?? 0;
};

export const getSimilarProducts = async (productId, limit = 4) => {
    const { data, error } = await supabase.rpc("get_similar_products", {
        p_product_id: productId,
        p_limit: limit,
    });

    if (error) throw error;
    return data ?? [];
};

export const getVendors = async ({ n, page, searchQuery = null }) => {
    const { data, error } = await supabase.rpc('get_vendor_cards', {
        n,
        page,
        search_query: searchQuery,
    });

    if (error) throw error;
    return data ?? [];
};

export const getVendorDetails = async (vendorId) => {
    const { data, error } = await supabase.rpc("get_vendor_details", {
        p_vendor_id: vendorId,
    });

    if (error) throw error;
    return data?.[0] ?? null;
};

export const getVendorProductsApi = async (vendorId) => {
    const { data, error } = await supabase.rpc("get_vendor_products", {
        p_vendor_id: vendorId,
    });

    if (error) throw error;
    return data ?? [];
};

export const getMyProducts = async () => {
    const { data, error } = await supabase.rpc("get_my_products");

    if (error) throw error;
    return data ?? [];
};

export const submitProductRequest = async ({
    productName,
    shortDesc,
    logo,
    mainCategory,
    websiteLink = null,
    longDesc = null,
    categories = null,
    features = null,
    videoUrl = null,
    gallery = null,
    pricing = null,
    languages = null,
    demoLink = null,
}) => {
    const { data, error } = await supabase.rpc("submit_product_request", {
        p_product_name: productName,
        p_short_desc: shortDesc,
        p_logo: logo,
        p_main_category: mainCategory,
        p_website_link: websiteLink,
        p_long_desc: longDesc,
        p_categories: categories,
        p_features: features,
        p_video_url: videoUrl,
        p_gallery: gallery,
        p_pricing: pricing,
        p_languages: languages,
        p_demo_link: demoLink,
    });

    if (error) throw error;
    return data ?? null;
};

export const submitOwnershipRequest = async ({ claimedVendorId, message = null }) => {
    const { data, error } = await supabase.rpc("submit_ownership_request", {
        p_claimed_vendor_id: claimedVendorId,
        p_message: message,
    });

    if (error) throw error;
    return data ?? null;
};

export const updateMyVendorProfile = async ({
    companyName = null,
    websiteLink = null,
    companySize = null,
}) => {
    const { data, error } = await supabase.rpc("update_my_vendor_profile", {
        p_company_name: companyName,
        p_website_link: websiteLink,
        p_company_size: companySize,
    });

    if (error) throw error;
    return data ?? null;
};

export const getVendorProducts = async (vendorId) => {
    const { data, error } = await supabase.rpc("get_vendor_products", {
        p_vendor_id: vendorId,
    });

    if (error) throw error;
    return data ?? [];
};

export const updateMyProduct = async ({
    productId,
    productName = null,
    shortDesc = null,
    logo = null,
    mainCategory = null,
    websiteLink = null,
    longDesc = null,
    categories = null,
    features = null,
    videoUrl = null,
    gallery = null,
    pricing = null,
    languages = null,
    demoLink = null,
}) => {
    const { data, error } = await supabase.rpc("update_my_product", {
        p_product_id: productId,
        p_product_name: productName,
        p_short_desc: shortDesc,
        p_logo: logo,
        p_main_category: mainCategory,
        p_website_link: websiteLink,
        p_long_desc: longDesc,
        p_categories: categories,
        p_features: features,
        p_video_url: videoUrl,
        p_gallery: gallery,
        p_pricing: pricing,
        p_languages: languages,
        p_demo_link: demoLink,
    });

    if (error) throw error;
    return data ?? false;
};

export const updateMyVendor = async ({
    companyName = null,
    logo = null,
    websiteLink = null,
    headquarters = null,
    companyMotto = null,
    instagramLink = null,
    linkedinLink = null,
    foundedAt = null,      // "YYYY-MM-DD" string is fine, or a Date converted to that
    companySize = null,
}) => {
    const { data, error } = await supabase.rpc("update_my_vendor", {
        p_company_name: companyName,
        p_logo: logo,
        p_website_link: websiteLink,
        p_headquarters: headquarters,
        p_company_motto: companyMotto,
        p_instagram_link: instagramLink,
        p_linkedin_link: linkedinLink,
        p_founded_at: foundedAt,
        p_company_size: companySize,
    });

    if (error) throw error;

    // The SQL returns a single row (vendors), Supabase often returns it as an object
    // but depending on settings it can come back as [row]. This handles both.
    return Array.isArray(data) ? (data[0] ?? null) : (data ?? null);
};

export const getAllProductsWithDetails = async () => {
    // Call the new RPC that returns a flat structure with joined data
    const { data, error } = await supabase.rpc('get_all_products_with_details');

    if (error) throw error;

    // Map to the structure expected by the frontend
    // The RPC already returns flat fields, but we need to match the property names
    // used in Products.tsx (which expects some fields like vendor_subscription mapped from subscription)
    return (data ?? []).map(p => ({
        ...p,
        // RPC returns 'subscription', but frontend might expect 'vendor_subscription' based on previous map
        vendor_subscription: p.subscription,
        // Ensure arrays are not null
        categories: p.categories || [p.main_category],
        languages: p.languages || [],
    }));
};
