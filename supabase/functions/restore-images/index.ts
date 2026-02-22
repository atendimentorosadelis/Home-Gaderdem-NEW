import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RestoreRequest {
  action: "list-dates" | "list-articles" | "restore";
  date?: string;
  articleId?: string;
  imageType?: "cover" | "gallery";
  imageIndex?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use EXTERNAL Supabase for data operations
    const supabaseUrl = Deno.env.get("EXTERNAL_SUPABASE_URL") || Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: RestoreRequest = await req.json();
    console.log("[restore-images] Request:", body);

    // List available backup dates
    if (body.action === "list-dates") {
      const { data: folders, error } = await supabase.storage
        .from("article-images-backup")
        .list("", { limit: 100 });

      if (error) throw error;

      const dates = folders
        ?.filter((f) => f.id && /^\d{4}-\d{2}-\d{2}$/.test(f.name))
        .map((f) => f.name)
        .sort((a, b) => b.localeCompare(a)) || [];

      return new Response(
        JSON.stringify({ success: true, dates }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // List articles with backups for a specific date
    if (body.action === "list-articles" && body.date) {
      const { data: articleFolders, error } = await supabase.storage
        .from("article-images-backup")
        .list(body.date, { limit: 1000 });

      if (error) throw error;

      const articleIds = articleFolders
        ?.filter((f) => f.id)
        .map((f) => f.name) || [];

      // Get article titles
      const { data: articles } = await supabase
        .from("content_articles")
        .select("id, title")
        .in("id", articleIds);

      const articlesWithBackups = [];

      for (const articleId of articleIds) {
        const { data: files } = await supabase.storage
          .from("article-images-backup")
          .list(`${body.date}/${articleId}`);

        const article = articles?.find((a) => a.id === articleId);
        
        articlesWithBackups.push({
          id: articleId,
          title: article?.title || "Artigo removido",
          backupDate: body.date,
          images: files?.map((f) => ({
            name: f.name,
            path: `${body.date}/${articleId}/${f.name}`,
            type: f.name.startsWith("cover") ? "cover" : "gallery",
            index: f.name.startsWith("gallery") 
              ? parseInt(f.name.split("-")[1]) 
              : 0,
          })) || [],
        });
      }

      return new Response(
        JSON.stringify({ success: true, articles: articlesWithBackups }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Restore specific image or all images for an article
    if (body.action === "restore" && body.date && body.articleId) {
      const basePath = `${body.date}/${body.articleId}`;
      
      // List all backup files for this article
      const { data: backupFiles, error: listError } = await supabase.storage
        .from("article-images-backup")
        .list(basePath);

      if (listError) throw listError;

      if (!backupFiles || backupFiles.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: "No backup files found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
        );
      }

      // Filter files if specific image requested
      let filesToRestore = backupFiles;
      if (body.imageType !== undefined) {
        const prefix = body.imageType === "cover" ? "cover" : `gallery-${body.imageIndex}`;
        filesToRestore = backupFiles.filter((f) => f.name.startsWith(prefix));
      }

      console.log(`[restore-images] Restoring ${filesToRestore.length} files for article ${body.articleId}`);

      let restoredCover: string | null = null;
      const restoredGallery: string[] = [];

      for (const file of filesToRestore) {
        try {
          // Download from backup
          const { data: fileData, error: downloadError } = await supabase.storage
            .from("article-images-backup")
            .download(`${basePath}/${file.name}`);

          if (downloadError) {
            console.error(`[restore-images] Download error: ${downloadError.message}`);
            continue;
          }

          // Upload to main storage with new path
          const timestamp = Date.now();
          const extension = file.name.split(".").pop() || "webp";
          const newPath = `${body.articleId}/${timestamp}-${file.name}`;

          const { error: uploadError } = await supabase.storage
            .from("article-images")
            .upload(newPath, fileData, {
              contentType: `image/${extension === "jpg" ? "jpeg" : extension}`,
              upsert: true,
            });

          if (uploadError) {
            console.error(`[restore-images] Upload error: ${uploadError.message}`);
            continue;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from("article-images")
            .getPublicUrl(newPath);

          const publicUrl = urlData.publicUrl;

          // Track restored images
          if (file.name.startsWith("cover")) {
            restoredCover = publicUrl;
          } else {
            const indexMatch = file.name.match(/gallery-(\d+)/);
            const index = indexMatch ? parseInt(indexMatch[1]) : restoredGallery.length;
            restoredGallery[index] = publicUrl;
          }

          console.log(`[restore-images] Restored: ${file.name} -> ${newPath}`);
        } catch (err) {
          console.error(`[restore-images] Error restoring ${file.name}:`, err);
        }
      }

      // Update article with restored images
      const updateData: Record<string, unknown> = {};
      
      if (restoredCover) {
        updateData.cover_image = restoredCover;
      }
      
      if (restoredGallery.length > 0) {
        // Get current gallery and merge
        const { data: article } = await supabase
          .from("content_articles")
          .select("gallery_images")
          .eq("id", body.articleId)
          .maybeSingle();

        const currentGallery = (article?.gallery_images as string[] | null) || [];
        const mergedGallery = [...currentGallery];
        
        restoredGallery.forEach((url, index) => {
          if (url) {
            mergedGallery[index] = url;
          }
        });

        updateData.gallery_images = mergedGallery.filter(Boolean);
      }

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from("content_articles")
          .update(updateData)
          .eq("id", body.articleId);

        if (updateError) {
          console.error("[restore-images] Update error:", updateError);
          throw updateError;
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          restored: {
            cover: restoredCover ? 1 : 0,
            gallery: restoredGallery.filter(Boolean).length,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Invalid action" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  } catch (error) {
    console.error("[restore-images] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
