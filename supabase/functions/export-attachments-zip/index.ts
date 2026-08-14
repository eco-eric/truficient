// export-attachments-zip — recursively zip everything in the `attachments` bucket
// and return a short-lived signed download URL.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { BlobWriter, BlobReader, ZipWriter } from "https://deno.land/x/zipjs@v2.7.45/index.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SOURCE_BUCKET = "attachments";
const DEST_BUCKET = "attachment-exports";
const MAX_FILES = 2000;

async function listRecursive(
  supabase: ReturnType<typeof createClient>,
  prefix: string,
  out: string[],
  depth = 0,
): Promise<void> {
  if (depth > 8 || out.length >= MAX_FILES) return;

  let offset = 0;
  const limit = 100;
  while (true) {
    const { data, error } = await supabase.storage
      .from(SOURCE_BUCKET)
      .list(prefix, { limit, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(`list("${prefix}") failed: ${error.message}`);
    if (!data || data.length === 0) break;

    for (const entry of data) {
      if (entry.name === ".emptyFolderPlaceholder") continue;
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      // Folders come back with a null id / no metadata
      if (entry.id === null || !entry.metadata) {
        await listRecursive(supabase, path, out, depth + 1);
      } else if (out.length < MAX_FILES) {
        out.push(path);
      }
    }

    if (data.length < limit) break;
    offset += limit;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // --- Auth: must be an authenticated admin or manager ---
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    const user = userData?.user;
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [isAdmin, isManager] = await Promise.all([
      admin.rpc("has_role", { _user_id: user.id, _role: "admin" }),
      admin.rpc("has_role", { _user_id: user.id, _role: "manager" }),
    ]);
    if (!(isAdmin.data === true || isManager.data === true)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional body: { prefix?: string, expiresIn?: number }
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const rawPrefix = typeof body.prefix === "string" ? body.prefix : "";
    const prefix = rawPrefix.replace(/^\/+|\/+$/g, "").slice(0, 200);
    const expiresIn = typeof body.expiresIn === "number" && body.expiresIn > 0 && body.expiresIn <= 86400
      ? Math.floor(body.expiresIn)
      : 3600;

    // --- 1. Recursively enumerate files ---
    const paths: string[] = [];
    await listRecursive(admin, prefix, paths);

    if (paths.length === 0) {
      return new Response(JSON.stringify({ error: "No files found in the attachments bucket", prefix }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- 2. Download + zip ---
    const zipWriter = new ZipWriter(new BlobWriter("application/zip"));
    const skipped: { path: string; reason: string }[] = [];
    let added = 0;

    for (const path of paths) {
      const { data: file, error: dlErr } = await admin.storage.from(SOURCE_BUCKET).download(path);
      if (dlErr || !file) {
        skipped.push({ path, reason: dlErr?.message ?? "download failed" });
        continue;
      }
      await zipWriter.add(path, new BlobReader(file), { level: 6 });
      added++;
    }

    const zipBlob: Blob = await zipWriter.close();

    if (added === 0) {
      return new Response(JSON.stringify({ error: "All downloads failed", skipped }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- 3. Upload to the temporary export bucket ---
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const zipPath = `${user.id}/attachments-${stamp}.zip`;
    const { error: upErr } = await admin.storage
      .from(DEST_BUCKET)
      .upload(zipPath, zipBlob, { contentType: "application/zip", upsert: true });
    if (upErr) throw new Error(`Zip upload failed: ${upErr.message}`);

    // --- 4. Signed download URL ---
    const { data: signed, error: signErr } = await admin.storage
      .from(DEST_BUCKET)
      .createSignedUrl(zipPath, expiresIn, { download: `attachments-${stamp}.zip` });
    if (signErr || !signed?.signedUrl) {
      throw new Error(`Signed URL failed: ${signErr?.message ?? "unknown"}`);
    }

    return new Response(
      JSON.stringify({
        url: signed.signedUrl,
        path: zipPath,
        file_count: added,
        total_found: paths.length,
        size_bytes: zipBlob.size,
        expires_in: expiresIn,
        skipped,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("export-attachments-zip error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
