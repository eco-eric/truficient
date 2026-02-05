type AuthProbeResult = {
  ok: boolean;
  status: number;
  contentType: string | null;
  preview: string;
};

async function probeAuthHealth(): Promise<AuthProbeResult> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/health`;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  const contentType = res.headers.get("content-type");
  const text = await res.text();
  const preview = text.slice(0, 250);

  return {
    ok: res.ok,
    status: res.status,
    contentType,
    preview,
  };
}

/**
 * Best-effort diagnostic for network-level auth failures.
 * Logs extra detail without exposing secrets.
 */
export async function diagnoseAuthFetchFailure(context: string) {
  try {
    const probe = await probeAuthHealth();

    // Intentionally verbose in console only.
    console.error(`[auth] Network failure during: ${context}`);
    console.error(`[auth] /auth/v1/health -> status=${probe.status} ok=${probe.ok}`);
    console.error(`[auth] content-type:`, probe.contentType);
    console.error(`[auth] response preview:`, probe.preview);

    const looksHtml =
      probe.preview.trim().startsWith("<!") ||
      probe.preview.toLowerCase().includes("<html");

    if (looksHtml) {
      return new Error(
        "Login failed due to a network/proxy issue (auth endpoint returned HTML). Try disabling any VPN/ad-blocker, then retry."
      );
    }

    return new Error(
      "Login failed due to a network connectivity issue. Please check your connection (or VPN/ad-blocker) and try again."
    );
  } catch (e) {
    console.error(`[auth] Diagnostic probe failed (${context}):`, e);
    return new Error(
      "Login failed due to a network connectivity issue. Please try again in a moment."
    );
  }
}
