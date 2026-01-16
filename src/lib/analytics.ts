import { supabase } from "@/api/supabaseClient";

const SESSION_KEY = "hrhub_analytics_session";

const createSessionId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const getAnalyticsSessionId = () => {
  if (typeof window === "undefined") return null;
  try {
    const existing = window.localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const next = createSessionId();
    window.localStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return null;
  }
};

export const isValidUuid = (value?: string | null): value is string => {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

type LogPageViewInput = {
  path: string;
  productId?: string | null;
  referrer?: string | null;
  metadata?: Record<string, unknown> | null;
};

export const logPageView = async ({
  path,
  productId,
  referrer,
  metadata,
}: LogPageViewInput) => {
  const sessionId = getAnalyticsSessionId();
  const { error } = await supabase.rpc("log_page_view", {
    p_path: path,
    p_product_id: productId ?? null,
    p_referrer: referrer ?? null,
    p_session_id: sessionId,
    p_metadata: metadata ?? {},
  });

  if (error) throw error;
};

type LogProductEventInput = {
  productId: string;
  eventType: "product_cta_click";
  path?: string | null;
  referrer?: string | null;
  metadata?: Record<string, unknown> | null;
};

export const logProductEvent = async ({
  productId,
  eventType,
  path,
  referrer,
  metadata,
}: LogProductEventInput) => {
  const sessionId = getAnalyticsSessionId();
  const { error } = await supabase.rpc("log_product_event", {
    p_product_id: productId,
    p_event_type: eventType,
    p_path: path ?? null,
    p_referrer: referrer ?? null,
    p_session_id: sessionId,
    p_metadata: metadata ?? {},
  });

  if (error) throw error;
};

type LogVendorEventInput = {
  vendorId: string;
  eventType: "vendor_cta_click";
  path?: string | null;
  referrer?: string | null;
  metadata?: Record<string, unknown> | null;
};

export const logVendorEvent = async ({
  vendorId,
  eventType,
  path,
  referrer,
  metadata,
}: LogVendorEventInput) => {
  const sessionId = getAnalyticsSessionId();
  const { error } = await supabase.rpc("log_vendor_event", {
    p_vendor_id: vendorId,
    p_event_type: eventType,
    p_path: path ?? null,
    p_referrer: referrer ?? null,
    p_session_id: sessionId,
    p_metadata: metadata ?? {},
  });

  if (error) throw error;
};
