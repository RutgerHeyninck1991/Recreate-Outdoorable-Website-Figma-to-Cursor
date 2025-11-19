import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from './kv_store.tsx';

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-ecff565c/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize storage bucket and sync fabrics from storage
async function initializeStorage() {
  try {
    // List all buckets to see what's available
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
    } else {
      console.log('Available storage buckets:', buckets?.map(b => b.name));
    }
    
    // Create storage bucket for fabric textures if needed
    const bucketName = 'make-ecff565c-fabric-textures';
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: true, // Make textures publicly accessible
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      });
      console.log('Created fabric textures bucket');
    }
    
  } catch (error) {
    console.error('Storage initialization error:', error);
  }
}

// Sync fabrics from Supabase Storage "sunproof selectie" folder
async function syncFabricsFromStorage() {
  try {
    console.log('Syncing fabrics from storage...');
    
    // Try to list files from different possible bucket names
    const possibleBuckets = ['sunproof selectie', 'sunproof-selectie', 'fabrics', 'textures'];
    
    for (const bucketName of possibleBuckets) {
      try {
        const { data: files, error } = await supabase.storage
          .from(bucketName)
          .list('', {
            limit: 100,
            offset: 0,
          });
        
        if (!error && files && files.length > 0) {
          console.log(`Found ${files.length} files in bucket "${bucketName}"`);
          
          // Process each file and create fabric entries
          for (const file of files) {
            if (file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
              const fabricId = `sunproof-${file.name.replace(/\.(jpg|jpeg|png|webp)$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
              
              // Check if fabric already exists
              const existing = await kv.get(`fabric:${fabricId}`);
              if (!existing) {
                // Get public URL for the texture
                const { data: urlData } = supabase.storage
                  .from(bucketName)
                  .getPublicUrl(file.name);
                
                const fabric = {
                  id: fabricId,
                  name: file.name.replace(/\.(jpg|jpeg|png|webp)$/i, '').replace(/[-_]/g, ' '),
                  category: 'sunproof',
                  color: '#E8DCC6', // Default color
                  texturePattern: null,
                  textureUrl: urlData.publicUrl,
                  description: `Premium Sunproof stof - ${file.name.replace(/\.(jpg|jpeg|png|webp)$/i, '')}`,
                  pricePerMeter: 45,
                  composition: '100% Solution Dyed Acrylic',
                  waterResistant: true,
                  uvResistant: true,
                  active: true,
                  order: 100,
                  tags: ['sunproof', 'premium', 'outdoor'],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                
                await kv.set(`fabric:${fabricId}`, fabric);
                console.log(`Created fabric from storage: ${fabricId}`);
              }
            }
          }
          
          break; // Stop after finding the first valid bucket
        }
      } catch (err) {
        // Continue to next bucket
        continue;
      }
    }
    
  } catch (error) {
    console.error('Error syncing fabrics from storage:', error);
  }
}

// Initialize on startup
initializeStorage().then(() => syncFabricsFromStorage());

// FABRIC MANAGEMENT ENDPOINTS using KV Store

// Get all fabrics with optional filtering
app.get("/make-server-ecff565c/fabrics", async (c) => {
  try {
    const category = c.req.query("category");
    const active = c.req.query("active");
    
    console.log("Fetching fabrics with filters:", { category, active });
    
    // Get all fabrics from KV store
    const allFabrics = await kv.getByPrefix('fabric:');
    
    if (!allFabrics || allFabrics.length === 0) {
      console.log("No fabrics found, returning empty array");
      return c.json([]);
    }
    
    let fabrics = allFabrics; // getByPrefix already returns just the values
    
    // Apply filters
    if (category) {
      fabrics = fabrics.filter(f => f.category === category);
    }
    
    if (active !== undefined) {
      const isActive = active === "true";
      fabrics = fabrics.filter(f => f.active === isActive);
    }
    
    // Sort by order and then by name
    fabrics.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.name.localeCompare(b.name);
    });
    
    console.log(`Returning ${fabrics.length} fabrics`);
    return c.json(fabrics);
    
  } catch (error) {
    console.error("Error fetching fabrics:", error);
    return c.json({ error: "Failed to fetch fabrics" }, 500);
  }
});

// Get single fabric by ID
app.get("/make-server-ecff565c/fabrics/:id", async (c) => {
  try {
    const id = c.req.param("id");
    console.log("Fetching fabric:", id);
    
    const fabric = await kv.get(`fabric:${id}`);
    
    if (!fabric) {
      return c.json({ error: "Fabric not found" }, 404);
    }
    
    return c.json(fabric);
    
  } catch (error) {
    console.error("Error fetching fabric:", error);
    return c.json({ error: "Failed to fetch fabric" }, 500);
  }
});

// Create new fabric
app.post("/make-server-ecff565c/fabrics", async (c) => {
  try {
    const fabricData = await c.req.json();
    console.log("Creating fabric:", fabricData);
    
    // Validate required fields
    if (!fabricData.id || !fabricData.name || !fabricData.category) {
      return c.json({ error: "Missing required fields: id, name, category" }, 400);
    }
    
    // Check if fabric already exists
    const existing = await kv.get(`fabric:${fabricData.id}`);
    if (existing) {
      return c.json({ error: "Fabric with this ID already exists" }, 409);
    }
    
    // Create fabric object
    const fabric = {
      id: fabricData.id,
      name: fabricData.name,
      category: fabricData.category,
      color: fabricData.color || "#E8DCC6",
      texturePattern: fabricData.texturePattern || null,
      textureUrl: fabricData.textureUrl || null,
      description: fabricData.description || "",
      pricePerMeter: fabricData.pricePerMeter || 0,
      composition: fabricData.composition || "",
      waterResistant: fabricData.waterResistant || false,
      uvResistant: fabricData.uvResistant || false,
      active: fabricData.active !== false,
      order: fabricData.order || 999,
      tags: fabricData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Store in KV
    await kv.set(`fabric:${fabric.id}`, fabric);
    
    console.log("Fabric created successfully:", fabricData.id);
    return c.json({ 
      message: "Fabric created successfully",
      fabric: fabric
    }, 201);
    
  } catch (error) {
    console.error("Error creating fabric:", error);
    return c.json({ error: "Failed to create fabric" }, 500);
  }
});

// Update fabric
app.put("/make-server-ecff565c/fabrics/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    console.log("Updating fabric:", id, updates);
    
    // Get existing fabric
    const existing = await kv.get(`fabric:${id}`);
    if (!existing) {
      return c.json({ error: "Fabric not found" }, 404);
    }
    
    // Merge updates with existing fabric
    const fabric = {
      ...existing,
      ...updates,
      id: id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    // Store updated fabric
    await kv.set(`fabric:${id}`, fabric);
    
    console.log("Fabric updated successfully:", id);
    return c.json({
      message: "Fabric updated successfully",
      fabric: fabric
    });
    
  } catch (error) {
    console.error("Error updating fabric:", error);
    return c.json({ error: "Failed to update fabric" }, 500);
  }
});

// Initialize fabrics endpoint - no longer creates default fabrics
// Only Supabase Storage fabrics will be shown (synced via /fabrics/sync-storage)
app.post("/make-server-ecff565c/fabrics/initialize", async (c) => {
  try {
    console.log("Checking fabric count...");
    
    // Check if any fabrics exist
    const existingFabrics = await kv.getByPrefix('fabric:');
    
    return c.json({ 
      message: "No default fabrics. Use 'Sync from Storage' to load fabrics from Supabase.", 
      count: existingFabrics?.length || 0,
      hint: "Upload fabric images to Supabase Storage bucket 'SUNPROOF SELECTIE' and click 'Sync from Storage'"
    });
    
  } catch (error) {
    console.error("Error initializing fabrics:", error);
    return c.json({ error: "Failed to initialize fabrics" }, 500);
  }
});

// Get fabric categories
app.get("/make-server-ecff565c/fabric-categories", async (c) => {
  try {
    // Get all fabrics from KV store
    const allFabrics = await kv.getByPrefix('fabric:');
    
    if (!allFabrics || allFabrics.length === 0) {
      console.log("No fabrics found, returning empty categories");
      return c.json([]);
    }
    
    const fabrics = allFabrics; // getByPrefix already returns just the values
    
    const categories = [...new Set(fabrics.map(f => f.category))].sort();
    
    const categoriesWithCounts = categories.map(category => ({
      name: category,
      count: fabrics.filter(f => f.category === category && f.active).length || 0,
      displayName: category === 'outdoor' ? 'Outdoor' : 
                   category === 'indoor' ? 'Indoor' :
                   category === 'premium' ? 'Premium' :
                   category === 'sunproof' ? 'Sunproof' : category
    }));
    
    console.log("Returning categories:", categoriesWithCounts);
    return c.json(categoriesWithCounts);
  } catch (error) {
    console.error("Error fetching fabric categories:", error);
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
});

// Delete all default (non-Sunproof) fabrics
app.post("/make-server-ecff565c/fabrics/cleanup-defaults", async (c) => {
  try {
    console.log('Cleaning up default fabrics...');
    
    // Get all fabrics
    const allFabrics = await kv.getByPrefix('fabric:');
    
    if (!allFabrics || allFabrics.length === 0) {
      return c.json({ 
        message: "No fabrics found",
        count: 0
      });
    }
    
    // Delete all non-Sunproof fabrics
    const fabricsToDelete = allFabrics.filter(f => 
      f.category !== 'sunproof'
    );
    
    const keysToDelete = fabricsToDelete.map(f => `fabric:${f.id}`);
    
    if (keysToDelete.length > 0) {
      await kv.mdel(keysToDelete);
      console.log(`Deleted ${keysToDelete.length} default fabrics`);
    }
    
    return c.json({
      message: `Deleted ${keysToDelete.length} default fabrics. Only Sunproof fabrics remain.`,
      deleted: keysToDelete.length,
      remaining: allFabrics.length - keysToDelete.length,
      deletedIds: fabricsToDelete.map(f => f.id)
    });
    
  } catch (error) {
    console.error('Error cleaning up default fabrics:', error);
    return c.json({ error: 'Failed to cleanup default fabrics' }, 500);
  }
});

// Sync fabrics from storage (manual trigger endpoint)
app.post("/make-server-ecff565c/fabrics/sync-storage", async (c) => {
  try {
    console.log('Manual sync fabrics from storage triggered...');
    
    // Get bucket name from request body if provided
    const body = await c.req.json().catch(() => ({}));
    const requestedBucket = body.bucket;
    
    // First, get all available buckets
    const { data: allBuckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return c.json({ 
        error: 'Failed to list storage buckets',
        details: bucketsError.message 
      }, 500);
    }
    
    console.log('Available buckets:', allBuckets?.map(b => ({ name: b.name, id: b.id, public: b.public })));
    
    let syncedCount = 0;
    let updatedCount = 0;
    let createdCount = 0;
    let skippedCount = 0;
    let processedFiles: string[] = [];
    
    let bucketToUse = null;
    
    // If a specific bucket was requested, use that
    if (requestedBucket) {
      bucketToUse = allBuckets?.find(b => b.name === requestedBucket);
      console.log(`Requested bucket "${requestedBucket}":`, bucketToUse ? 'Found' : 'Not found');
    }
    
    // Otherwise, try to find a bucket with "sunproof" in the name
    if (!bucketToUse) {
      bucketToUse = allBuckets?.find(b => 
        b.name.toLowerCase().includes('sunproof')
      );
      console.log('Looking for sunproof bucket:', bucketToUse?.name || 'Not found');
    }
    
    if (!bucketToUse) {
      return c.json({ 
        error: 'No suitable bucket found',
        availableBuckets: allBuckets?.map(b => ({ name: b.name, id: b.id, public: b.public })) || [],
        requestedBucket: requestedBucket || null,
        message: requestedBucket 
          ? `Bucket "${requestedBucket}" niet gevonden. Kies een bucket uit de lijst.`
          : 'Geen bucket met "sunproof" in de naam gevonden. Selecteer een bucket handmatig.'
      }, 404);
    }
    
    const bucketName = bucketToUse.name;
    console.log(`Using bucket: "${bucketName}"`);
    
    try {
      // List ALL files from the bucket with higher limit and pagination
      let allFiles: any[] = [];
      let offset = 0;
      const limit = 1000; // Much higher limit
      
      while (true) {
        const { data: files, error } = await supabase.storage
          .from(bucketName)
          .list('', {
            limit: limit,
            offset: offset,
            sortBy: { column: 'name', order: 'asc' }
          });
        
        if (error) {
          console.error(`Error listing files from bucket "${bucketName}":`, error);
          break;
        }
        
        if (!files || files.length === 0) {
          break;
        }
        
        allFiles = allFiles.concat(files);
        
        // If we got fewer files than the limit, we've reached the end
        if (files.length < limit) {
          break;
        }
        
        offset += limit;
      }
      
      console.log(`Found ${allFiles.length} total items in bucket "${bucketName}"`);
      
      if (allFiles.length === 0) {
        return c.json({ 
          error: 'No files found in bucket',
          bucket: bucketName,
          message: 'Upload afbeeldingen naar de bucket in Supabase Storage'
        }, 404);
      }
      
      // Process each file
      for (const file of allFiles) {
        // Skip directories and non-files
        if (!file.name || file.id === null) {
          console.log(`Skipping directory/invalid: ${file.name || 'unnamed'}`);
          skippedCount++;
          continue;
        }
        
        // Check if it's an image file (support more formats)
        const imageExtensions = /\.(jpg|jpeg|png|webp|gif|bmp|tiff|tif)$/i;
        if (!file.name.match(imageExtensions)) {
          console.log(`Skipping non-image file: ${file.name}`);
          skippedCount++;
          continue;
        }
        
        // Skip texture map files (they'll be linked separately)
        const isTextureMap = /_normal|_roughness|_ao|_ambient|_displacement|_height/i.test(file.name);
        if (isTextureMap) {
          console.log(`Skipping texture map file (will be linked): ${file.name}`);
          skippedCount++;
          continue;
        }
        
        // Create fabric ID from filename
        const fabricId = `sunproof-${file.name
          .replace(imageExtensions, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')}`;
        
        // Check if fabric already exists
        const existing = await kv.get(`fabric:${fabricId}`);
        
        // Get public URL for the texture
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(file.name);
        
        // Clean up the name for display
        const displayName = file.name
          .replace(imageExtensions, '')
          .replace(/[-_]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Look for associated texture maps
        const baseFileName = file.name.replace(imageExtensions, '');
        
        // Search for normal map
        const normalMapFile = allFiles.find(f => 
          f.name && (
            f.name.startsWith(baseFileName + '_normal') ||
            f.name.startsWith(baseFileName + '_Normal')
          ) && f.name.match(imageExtensions)
        );
        
        // Search for roughness map
        const roughnessMapFile = allFiles.find(f => 
          f.name && (
            f.name.startsWith(baseFileName + '_roughness') ||
            f.name.startsWith(baseFileName + '_Roughness')
          ) && f.name.match(imageExtensions)
        );
        
        // Search for AO map
        const aoMapFile = allFiles.find(f => 
          f.name && (
            f.name.startsWith(baseFileName + '_ao') ||
            f.name.startsWith(baseFileName + '_AO') ||
            f.name.startsWith(baseFileName + '_ambient')
          ) && f.name.match(imageExtensions)
        );
        
        // Search for displacement/height map
        const displacementMapFile = allFiles.find(f => 
          f.name && (
            f.name.startsWith(baseFileName + '_displacement') ||
            f.name.startsWith(baseFileName + '_height') ||
            f.name.startsWith(baseFileName + '_Height')
          ) && f.name.match(imageExtensions)
        );
        
        // Get public URLs for texture maps
        const normalMapUrl = normalMapFile ? supabase.storage.from(bucketName).getPublicUrl(normalMapFile.name).data.publicUrl : null;
        const roughnessMapUrl = roughnessMapFile ? supabase.storage.from(bucketName).getPublicUrl(roughnessMapFile.name).data.publicUrl : null;
        const aoMapUrl = aoMapFile ? supabase.storage.from(bucketName).getPublicUrl(aoMapFile.name).data.publicUrl : null;
        const displacementMapUrl = displacementMapFile ? supabase.storage.from(bucketName).getPublicUrl(displacementMapFile.name).data.publicUrl : null;
        
        console.log(`Fabric ${fabricId} texture maps found:`, {
          normal: normalMapFile?.name || 'none',
          roughness: roughnessMapFile?.name || 'none',
          ao: aoMapFile?.name || 'none',
          displacement: displacementMapFile?.name || 'none'
        });
        
        const fabric = {
          id: fabricId,
          name: displayName,
          category: 'sunproof',
          color: existing?.color || '#E8DCC6', // Preserve custom color if exists
          texturePattern: null,
          textureUrl: urlData.publicUrl,
          normalMapUrl: normalMapUrl,
          roughnessMapUrl: roughnessMapUrl,
          aoMapUrl: aoMapUrl,
          displacementMapUrl: displacementMapUrl,
          description: existing?.description || `Premium Sunproof stof - ${displayName}`,
          pricePerMeter: existing?.pricePerMeter || 45,
          composition: existing?.composition || '100% Solution Dyed Acrylic',
          waterResistant: existing?.waterResistant !== undefined ? existing.waterResistant : true,
          uvResistant: existing?.uvResistant !== undefined ? existing.uvResistant : true,
          active: existing?.active !== undefined ? existing.active : true,
          order: existing?.order || (100 + syncedCount),
          tags: existing?.tags || ['sunproof', 'premium', 'outdoor'],
          createdAt: existing?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await kv.set(`fabric:${fabricId}`, fabric);
        processedFiles.push(file.name);
        syncedCount++;
        
        if (existing) {
          updatedCount++;
          console.log(`✓ Updated fabric: ${fabricId} (${file.name})`);
        } else {
          createdCount++;
          console.log(`✓ Created fabric: ${fabricId} (${file.name})`);
        }
      }
      
      console.log(`Sync complete: ${syncedCount} synced (${createdCount} new, ${updatedCount} updated), ${skippedCount} skipped`);
      
      return c.json({ 
        message: `Successfully synced ${syncedCount} fabrics from storage bucket "${bucketName}"`,
        count: syncedCount,
        created: createdCount,
        updated: updatedCount,
        skipped: skippedCount,
        bucket: bucketName,
        processedFiles: processedFiles,
        totalFilesInBucket: allFiles.length
      });
      
    } catch (err) {
      console.error(`Error processing bucket "${bucketName}":`, err);
      return c.json({ 
        error: `Failed to process bucket "${bucketName}"`,
        details: err instanceof Error ? err.message : 'Unknown error'
      }, 500);
    }
    
  } catch (error) {
    console.error('Error syncing fabrics from storage:', error);
    return c.json({ 
      error: 'Failed to sync fabrics from storage',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get list of storage buckets (for debugging)
app.get("/make-server-ecff565c/storage/buckets", async (c) => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      return c.json({ error: 'Failed to list buckets' }, 500);
    }
    
    return c.json({ buckets: buckets || [] });
  } catch (error) {
    console.error('Error listing buckets:', error);
    return c.json({ error: 'Failed to list buckets' }, 500);
  }
});

// Get files from a specific bucket (for debugging)
app.get("/make-server-ecff565c/storage/files/:bucket", async (c) => {
  try {
    const bucketName = c.req.param('bucket');
    
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list('', {
        limit: 100,
        offset: 0,
      });
    
    if (error) {
      return c.json({ error: `Failed to list files in bucket "${bucketName}"` }, 500);
    }
    
    return c.json({ 
      bucket: bucketName,
      files: files || [] 
    });
  } catch (error) {
    console.error('Error listing files:', error);
    return c.json({ error: 'Failed to list files' }, 500);
  }
});

// ============================================
// ADMIN ROLE MANAGEMENT ENDPOINTS
// ============================================

// Check if user is admin
app.get("/make-server-ecff565c/admin/check/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const role = await kv.get(`user:${userId}:role`);
    
    return c.json({ 
      isAdmin: role === 'admin',
      role: role || 'customer'
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return c.json({ error: 'Failed to check admin status' }, 500);
  }
});

// Get user role
app.get("/make-server-ecff565c/admin/role/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const role = await kv.get(`user:${userId}:role`);
    
    return c.json({ 
      role: role || 'customer'
    });
  } catch (error) {
    console.error('Error getting user role:', error);
    return c.json({ error: 'Failed to get user role' }, 500);
  }
});

// Set admin role (requires admin permission or first-time setup)
app.post("/make-server-ecff565c/admin/set-role", async (c) => {
  try {
    const { userId, email, role } = await c.req.json();
    
    if (!userId || !role) {
      return c.json({ error: 'userId and role are required' }, 400);
    }
    
    // Set user role
    await kv.set(`user:${userId}:role`, role);
    
    // If admin, add to admin users list
    if (role === 'admin') {
      const adminUsers = await kv.get('admin:users') || [];
      if (!adminUsers.includes(userId)) {
        adminUsers.push(userId);
        await kv.set('admin:users', adminUsers);
      }
      
      // Store admin email mapping
      if (email) {
        await kv.set(`admin:email:${email}`, userId);
      }
    }
    
    return c.json({ 
      success: true,
      userId,
      role
    });
  } catch (error) {
    console.error('Error setting admin role:', error);
    return c.json({ error: 'Failed to set admin role' }, 500);
  }
});

// Remove admin role
app.post("/make-server-ecff565c/admin/remove-role", async (c) => {
  try {
    const { userId } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }
    
    // Set role back to customer
    await kv.set(`user:${userId}:role`, 'customer');
    
    // Remove from admin users list
    const adminUsers = await kv.get('admin:users') || [];
    const filtered = adminUsers.filter((id: string) => id !== userId);
    await kv.set('admin:users', filtered);
    
    return c.json({ 
      success: true,
      userId,
      role: 'customer'
    });
  } catch (error) {
    console.error('Error removing admin role:', error);
    return c.json({ error: 'Failed to remove admin role' }, 500);
  }
});

// List all admins
app.get("/make-server-ecff565c/admin/list", async (c) => {
  try {
    const adminUsers = await kv.get('admin:users') || [];
    
    const admins = await Promise.all(
      adminUsers.map(async (userId: string) => {
        const role = await kv.get(`user:${userId}:role`);
        return {
          id: userId,
          role: role || 'customer'
        };
      })
    );
    
    return c.json({ admins });
  } catch (error) {
    console.error('Error listing admins:', error);
    return c.json({ error: 'Failed to list admins' }, 500);
  }
});

// Initialize first admin by email
app.post("/make-server-ecff565c/admin/initialize", async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      return c.json({ error: 'email is required' }, 400);
    }
    
    // Check if any admins exist
    const adminUsers = await kv.get('admin:users') || [];
    
    if (adminUsers.length > 0) {
      return c.json({ 
        error: 'Admins already exist. Use set-role endpoint instead.',
        existingAdmins: adminUsers.length
      }, 400);
    }
    
    // Store email for first admin setup
    await kv.set('admin:setup:email', email);
    
    return c.json({ 
      success: true,
      message: 'Admin email registered. User will be promoted to admin on first login.',
      email
    });
  } catch (error) {
    console.error('Error initializing admin:', error);
    return c.json({ error: 'Failed to initialize admin' }, 500);
  }
});

Deno.serve(app.fetch);