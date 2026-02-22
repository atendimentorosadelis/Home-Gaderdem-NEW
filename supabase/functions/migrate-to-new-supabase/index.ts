import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MigrationResult {
  totalFiles: number;
  migrated: number;
  skipped: number;
  failed: number;
  errors: string[];
  migratedFiles: { oldPath: string; newPath: string; newUrl: string }[];
}

// Background migration function
async function runMigration(): Promise<MigrationResult> {
  console.log('🚀 Starting storage migration to new Supabase...');

  const sourceUrl = Deno.env.get('SUPABASE_URL')!;
  const sourceServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const destUrl = Deno.env.get('NEW_SUPABASE_URL')!;
  const destServiceKey = Deno.env.get('NEW_SUPABASE_SERVICE_KEY')!;

  console.log(`📦 Source: ${sourceUrl}`);
  console.log(`🎯 Destination: ${destUrl}`);

  const sourceClient = createClient(sourceUrl, sourceServiceKey);
  const destClient = createClient(destUrl, destServiceKey);

  const result: MigrationResult = {
    totalFiles: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
    migratedFiles: [],
  };

  // Migrate buckets
  await migrateBucket(sourceClient, destClient, 'article-images', result);
  await migrateBucket(sourceClient, destClient, 'avatars', result);

  console.log('\n✅ Migration complete!');
  console.log(`📊 Total: ${result.totalFiles}, Migrated: ${result.migrated}, Skipped: ${result.skipped}, Failed: ${result.failed}`);

  return result;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const destUrl = Deno.env.get('NEW_SUPABASE_URL');
    const destServiceKey = Deno.env.get('NEW_SUPABASE_SERVICE_KEY');

    if (!destUrl || !destServiceKey) {
      throw new Error('NEW_SUPABASE_URL and NEW_SUPABASE_SERVICE_KEY secrets are required');
    }

    // Use EdgeRuntime.waitUntil for background processing
    const migrationPromise = runMigration();
    
    // @ts-ignore - EdgeRuntime is available in Supabase Edge Functions
    if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
      // @ts-ignore
      EdgeRuntime.waitUntil(migrationPromise);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Migration started in background. Check logs for progress.',
          status: 'running'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 202 
        }
      );
    }

    // Fallback: wait for completion (may timeout for large migrations)
    const result = await migrationPromise;

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
        message: `Migration complete: ${result.migrated}/${result.totalFiles} files migrated`,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Migration error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

// Shutdown handler to log progress
addEventListener('beforeunload', (ev: Event) => {
  const detail = (ev as CustomEvent).detail;
  console.log('Function shutdown:', detail?.reason || 'unknown');
});

async function migrateBucket(
  sourceClient: SupabaseClient,
  destClient: SupabaseClient,
  bucketName: string,
  result: MigrationResult
) {
  const destUrl = Deno.env.get('NEW_SUPABASE_URL')!;
  
  try {
    // Ensure bucket exists on destination
    const { data: buckets } = await destClient.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucketName);
    
    if (!bucketExists) {
      console.log(`  Creating bucket '${bucketName}' on destination...`);
      const { error: createError } = await destClient.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 52428800,
      });
      if (createError && !createError.message.includes('already exists')) {
        console.error(`  Failed to create bucket: ${createError.message}`);
        result.errors.push(`Bucket creation failed: ${createError.message}`);
        return;
      }
    }

    // Get list of existing files in destination to skip already migrated
    const destFiles = await listAllFiles(destClient, bucketName);
    const destFileSet = new Set(destFiles.map(f => f.name));
    console.log(`  Found ${destFileSet.size} files already in destination ${bucketName}`);

    // List all files in the source bucket
    const sourceFiles = await listAllFiles(sourceClient, bucketName);
    console.log(`  Found ${sourceFiles.length} files in source ${bucketName}`);
    result.totalFiles += sourceFiles.length;

    for (const file of sourceFiles) {
      try {
        const filePath = file.name;
        
        // Skip if already exists in destination
        if (destFileSet.has(filePath)) {
          console.log(`  ⏭️ Skipping (exists): ${filePath}`);
          result.skipped++;
          
          // Still add to migrated files for URL mapping
          const { data: urlData } = destClient.storage.from(bucketName).getPublicUrl(filePath);
          result.migratedFiles.push({
            oldPath: `${bucketName}/${filePath}`,
            newPath: `${bucketName}/${filePath}`,
            newUrl: urlData.publicUrl,
          });
          continue;
        }

        console.log(`  📄 Migrating: ${filePath}`);

        // Download from source
        const { data: fileData, error: downloadError } = await sourceClient.storage
          .from(bucketName)
          .download(filePath);

        if (downloadError || !fileData) {
          throw new Error(`Download failed: ${downloadError?.message || 'No data'}`);
        }

        // Upload to destination
        const { error: uploadError } = await destClient.storage
          .from(bucketName)
          .upload(filePath, fileData, {
            contentType: getContentType(filePath),
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Get public URL from destination
        const { data: urlData } = destClient.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        result.migrated++;
        result.migratedFiles.push({
          oldPath: `${bucketName}/${filePath}`,
          newPath: `${bucketName}/${filePath}`,
          newUrl: urlData.publicUrl,
        });
        console.log(`    ✓ Migrated successfully`);

      } catch (fileError: unknown) {
        const errorMessage = fileError instanceof Error ? fileError.message : 'Unknown error';
        result.failed++;
        result.errors.push(`${bucketName}/${file.name}: ${errorMessage}`);
        console.error(`    ✗ Failed: ${errorMessage}`);
      }
    }

  } catch (bucketError: unknown) {
    const errorMessage = bucketError instanceof Error ? bucketError.message : 'Unknown error';
    console.error(`  Bucket error: ${errorMessage}`);
    result.errors.push(`Bucket ${bucketName}: ${errorMessage}`);
  }
}

async function listAllFiles(
  client: SupabaseClient,
  bucketName: string,
  path: string = ''
): Promise<{ name: string }[]> {
  const allFiles: { name: string }[] = [];

  const { data, error } = await client.storage
    .from(bucketName)
    .list(path, { limit: 1000 });

  if (error) {
    console.error(`  Error listing files in ${path}: ${error.message}`);
    return allFiles;
  }

  for (const item of data || []) {
    const itemPath = path ? `${path}/${item.name}` : item.name;
    
    if (item.id === null) {
      const subFiles = await listAllFiles(client, bucketName, itemPath);
      allFiles.push(...subFiles);
    } else {
      allFiles.push({ name: itemPath });
    }
  }

  return allFiles;
}

function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    'webp': 'image/webp',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}
