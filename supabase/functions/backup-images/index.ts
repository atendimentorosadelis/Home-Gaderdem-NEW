import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BackupResult {
  total: number;
  backedUp: number;
  failed: number;
  skipped: number;
  errors: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Use EXTERNAL Supabase for data operations
    const supabaseUrl = Deno.env.get("EXTERNAL_SUPABASE_URL") || Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("[backup-images] Starting image backup process...");

    // Create a log entry
    const { data: logEntry, error: logError } = await supabase
      .from("image_backup_logs")
      .insert({ status: "running" })
      .select()
      .single();

    if (logError) {
      console.error("[backup-images] Failed to create log entry:", logError);
    }

    const logId = logEntry?.id;

    // Fetch all articles with images
    const { data: articles, error: articlesError } = await supabase
      .from("content_articles")
      .select("id, title, cover_image, gallery_images");

    if (articlesError) {
      throw new Error(`Failed to fetch articles: ${articlesError.message}`);
    }

    console.log(`[backup-images] Found ${articles?.length || 0} articles to process`);

    const result: BackupResult = {
      total: 0,
      backedUp: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };

    // Process each article
    for (const article of articles || []) {
      const imagesToBackup: { url: string; type: string; index: number }[] = [];

      // Add cover image
      if (article.cover_image) {
        imagesToBackup.push({ url: article.cover_image, type: "cover", index: 0 });
      }

      // Add gallery images
      const galleryImages = article.gallery_images as string[] | null;
      if (galleryImages && Array.isArray(galleryImages)) {
        galleryImages.forEach((url, index) => {
          if (url && typeof url === "string") {
            imagesToBackup.push({ url, type: "gallery", index });
          }
        });
      }

      result.total += imagesToBackup.length;

      // Backup each image
      for (const img of imagesToBackup) {
        try {
          // Generate backup path
          const timestamp = new Date().toISOString().split("T")[0];
          const extension = img.url.split(".").pop()?.split("?")[0] || "webp";
          const backupPath = `${timestamp}/${article.id}/${img.type}-${img.index}.${extension}`;

          // Check if backup already exists today
          const { data: existingFile } = await supabase.storage
            .from("article-images-backup")
            .list(`${timestamp}/${article.id}`, {
              search: `${img.type}-${img.index}`,
            });

          if (existingFile && existingFile.length > 0) {
            console.log(`[backup-images] Skipping existing backup: ${backupPath}`);
            result.skipped++;
            continue;
          }

          // Download the image
          const response = await fetch(img.url);
          if (!response.ok) {
            throw new Error(`Failed to download: ${response.status}`);
          }

          const imageBlob = await response.blob();
          const imageBuffer = await imageBlob.arrayBuffer();

          // Upload to backup bucket
          const { error: uploadError } = await supabase.storage
            .from("article-images-backup")
            .upload(backupPath, imageBuffer, {
              contentType: imageBlob.type || "image/webp",
              upsert: true,
            });

          if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`);
          }

          console.log(`[backup-images] Backed up: ${backupPath}`);
          result.backedUp++;
        } catch (error) {
          const errorMsg = `Article ${article.id}, ${img.type}-${img.index}: ${error instanceof Error ? error.message : "Unknown error"}`;
          console.error(`[backup-images] Error: ${errorMsg}`);
          result.errors.push(errorMsg);
          result.failed++;
        }
      }
    }

    const durationMs = Date.now() - startTime;

    // Update log entry
    if (logId) {
      await supabase
        .from("image_backup_logs")
        .update({
          status: result.failed > 0 ? "completed_with_errors" : "completed",
          total_images: result.total,
          backed_up: result.backedUp,
          failed: result.failed,
          duration_ms: durationMs,
          error_message: result.errors.length > 0 ? result.errors.slice(0, 10).join("\n") : null,
        })
        .eq("id", logId);
    }

    console.log(`[backup-images] Backup complete. Total: ${result.total}, Backed up: ${result.backedUp}, Skipped: ${result.skipped}, Failed: ${result.failed}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Backup completed",
        stats: {
          total: result.total,
          backedUp: result.backedUp,
          skipped: result.skipped,
          failed: result.failed,
          durationMs,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[backup-images] Fatal error:", errorMessage);

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
