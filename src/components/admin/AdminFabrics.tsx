import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Loader2, Upload, Check, AlertCircle, Database, FolderSync, Trash2 } from 'lucide-react';
import { fabricApi, type Fabric } from '../../utils/fabricApi';

export default function AdminFabrics() {
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [storageBuckets, setStorageBuckets] = useState<any[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string>('');
  const [bucketFiles, setBucketFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFabrics();
    loadStorageBuckets();
  }, []);

  const loadFabrics = async () => {
    try {
      setLoading(true);
      const allFabrics = await fabricApi.getFabrics();
      setFabrics(allFabrics);
    } catch (error) {
      console.error('Failed to load fabrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStorageBuckets = async () => {
    try {
      const buckets = await fabricApi.getStorageBuckets();
      setStorageBuckets(buckets);
      console.log('Available storage buckets:', buckets);
      
      // Auto-select first bucket that contains "sunproof" in the name
      const sunproofBucket = buckets.find((b: any) => 
        b.name?.toLowerCase().includes('sunproof')
      );
      if (sunproofBucket) {
        setSelectedBucket(sunproofBucket.name);
        loadBucketFiles(sunproofBucket.name);
      }
    } catch (error) {
      console.error('Failed to load storage buckets:', error);
    }
  };

  const loadBucketFiles = async (bucketName: string) => {
    try {
      const files = await fabricApi.getStorageFiles(bucketName);
      setBucketFiles(files);
      console.log(`Files in bucket "${bucketName}":`, files);
    } catch (error) {
      console.error(`Failed to load files from bucket "${bucketName}":`, error);
    }
  };

  const syncFromStorage = async () => {
    setIsSyncing(true);
    setSyncMessage('');
    
    try {
      console.log('Starting fabric sync from storage...');
      const result = await fabricApi.syncFabricsFromStorage();
      
      let message = `✓ Synchronisatie succesvol!\n\n`;
      message += `✅ Geïmporteerd: ${result.imported || 0} stoffen\n`;
      message += `🔄 Bijgewerkt: ${result.updated || 0} stoffen\n`;
      message += `⏭️  Overgeslagen: ${result.skipped || 0} bestanden\n`;
      
      if (result.errors && result.errors.length > 0) {
        message += `\n⚠️  Fouten: ${result.errors.length}\n`;
        message += result.errors.slice(0, 3).join('\n');
        if (result.errors.length > 3) {
          message += `\n... en ${result.errors.length - 3} meer fouten`;
        }
      }
      
      if (result.processedFiles && result.processedFiles.length > 0) {
        message += `\n\n📋 Verwerkte bestanden:\n${result.processedFiles.slice(0, 20).join(', ')}`;
        if (result.processedFiles.length > 20) {
          message += `... en ${result.processedFiles.length - 20} meer`;
        }
      }
      
      setSyncMessage(message);
      
      // Reload fabrics and buckets after sync
      setTimeout(() => {
        loadFabrics();
        loadStorageBuckets();
      }, 1000);
    } catch (error: any) {
      let errorMessage = 'Onbekende fout';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Check if the error message contains JSON with more details
        try {
          const jsonMatch = error.message.match(/\{.*\}/);
          if (jsonMatch) {
            const errorData = JSON.parse(jsonMatch[0]);
            if (errorData.message) {
              errorMessage = errorData.message;
            }
            if (errorData.availableBuckets && errorData.availableBuckets.length > 0) {
              errorMessage += `\n\nBeschikbare buckets: ${errorData.availableBuckets.join(', ')}`;
            }
          }
        } catch (parseError) {
          // Keep original error message
        }
      }
      
      setSyncMessage(`✗ Fout bij synchroniseren:\n${errorMessage}`);
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCleanupDefaults = async () => {
    if (!confirm('Weet je zeker dat je alle default (outdoor/indoor/premium) fabrics wilt verwijderen? Alleen Sunproof stoffen blijven over.')) {
      return;
    }
    
    try {
      const result = await fabricApi.cleanupDefaultFabrics();
      setSyncMessage(`✓ ${result.message}\n\nVerwijderd: ${result.deleted} fabrics\nOvergebleven: ${result.remaining} fabrics`);
      setTimeout(() => loadFabrics(), 1000);
    } catch (err: any) {
      setSyncMessage(`✗ Fout bij opruimen: ${err.message}`);
    }
  };

  const handleDeleteFabric = async (fabricId: string) => {
    if (!confirm(`Weet je zeker dat je deze stof wilt verwijderen?`)) {
      return;
    }
    
    try {
      await fabricApi.deleteFabric(fabricId);
      setSyncMessage(`✓ Stof verwijderd`);
      setTimeout(() => loadFabrics(), 500);
    } catch (err: any) {
      setSyncMessage(`✗ Fout bij verwijderen: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-zinc-100 mb-2">Stoffen Beheer</h1>
        <p className="text-zinc-400">
          Beheer stoffen uit Supabase Storage voor de 3D configurator.
        </p>
      </div>

      {/* Actions */}
      <Card className="bg-zinc-800 border-zinc-700 p-6">
        <h3 className="text-lg text-zinc-100 mb-4">Acties</h3>
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={syncFromStorage}
            disabled={isSyncing}
            className="bg-stone-600 hover:bg-stone-700 text-white"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Synchroniseren...
              </>
            ) : (
              <>
                <FolderSync className="w-4 h-4 mr-2" />
                Sync vanuit Storage
              </>
            )}
          </Button>

          <Button 
            onClick={() => {
              fabricApi.initializeFabrics().then(() => {
                setSyncMessage('✓ Default fabrics geïnitialiseerd');
                setTimeout(() => loadFabrics(), 1000);
              }).catch(err => {
                setSyncMessage(`✗ Fout: ${err.message}`);
              });
            }}
            variant="outline"
            className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
          >
            <Database className="w-4 h-4 mr-2" />
            Init Default Fabrics
          </Button>

          <Button 
            onClick={handleCleanupDefaults}
            variant="outline"
            className="border-red-800 text-red-400 hover:bg-red-950"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Verwijder Default Fabrics
          </Button>
        </div>
      </Card>

      {/* Status Message */}
      {syncMessage && (
        <Card className={`border ${
          syncMessage.startsWith('✓') 
            ? 'bg-green-950/20 border-green-800 text-green-400' 
            : 'bg-red-950/20 border-red-800 text-red-400'
        } p-4`}>
          <pre className="whitespace-pre-wrap font-mono text-sm">{syncMessage}</pre>
        </Card>
      )}

      {/* Storage Info */}
      {storageBuckets.length === 0 && (
        <Card className="bg-amber-950/20 border-amber-800 p-6">
          <h3 className="text-lg text-amber-400 mb-2">⚠️ Geen Storage Buckets Gevonden</h3>
          <p className="text-sm text-amber-300 mb-4">
            Er zijn geen storage buckets gevonden in je Supabase project.
          </p>
          <div className="space-y-2 text-sm text-amber-200">
            <p className="font-medium">Stappen om een bucket aan te maken:</p>
            <ol className="list-decimal list-inside ml-2 space-y-1">
              <li>Ga naar je Supabase Dashboard</li>
              <li>Klik op "Storage" in het menu</li>
              <li>Klik op "Create a new bucket"</li>
              <li>Noem de bucket "SUNPROOF SELECTIE"</li>
              <li>Maak de bucket Public</li>
              <li>Upload je stof afbeeldingen</li>
              <li>Klik op "Sync vanuit Storage"</li>
            </ol>
          </div>
        </Card>
      )}

      {/* Storage Bucket Info */}
      {selectedBucket && (
        <Card className="bg-zinc-800 border-zinc-700 p-6">
          <h3 className="text-lg text-zinc-100 mb-4">
            Storage Bucket: <span className="text-stone-400">{selectedBucket}</span>
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-zinc-400">
              <span>Totaal bestanden:</span>
              <span className="text-zinc-100">{bucketFiles.length}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Afbeeldingen:</span>
              <span className="text-zinc-100">
                {bucketFiles.filter(f => f.name?.match(/\.(jpg|jpeg|png|webp)$/i)).length}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Fabrics List */}
      <Card className="bg-zinc-800 border-zinc-700">
        <div className="p-6 border-b border-zinc-700">
          <h3 className="text-lg text-zinc-100">
            Huidige Stoffen ({fabrics.length})
          </h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
            </div>
          ) : fabrics.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Geen stoffen gevonden</p>
              <p className="text-sm mt-2">Klik op "Sync vanuit Storage" om stoffen te laden</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fabrics.map((fabric) => (
                <Card key={fabric.id} className="bg-zinc-700 border-zinc-600 p-4">
                  <div className="space-y-3">
                    {/* Fabric Preview */}
                    <div className="aspect-square rounded-lg overflow-hidden bg-zinc-800">
                      {fabric.textureUrl ? (
                        <img 
                          src={fabric.textureUrl} 
                          alt={fabric.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-full h-full" 
                          style={{ backgroundColor: fabric.color }}
                        />
                      )}
                    </div>

                    {/* Fabric Info */}
                    <div>
                      <h4 className="text-zinc-100 font-medium">{fabric.name}</h4>
                      <p className="text-xs text-zinc-400 mt-1">{fabric.id}</p>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                        {fabric.category}
                      </Badge>
                      {fabric.waterResistant && (
                        <Badge variant="outline" className="border-blue-800 text-blue-400">
                          Waterproof
                        </Badge>
                      )}
                      {fabric.uvResistant && (
                        <Badge variant="outline" className="border-yellow-800 text-yellow-400">
                          UV-proof
                        </Badge>
                      )}
                    </div>

                    {/* PBR Maps Status */}
                    {(fabric.normalMapUrl || fabric.roughnessMapUrl || fabric.aoMapUrl) && (
                      <div className="text-xs space-y-1">
                        <p className="text-zinc-400">PBR Maps:</p>
                        <div className="flex gap-2">
                          {fabric.normalMapUrl && (
                            <Badge className="bg-green-900/50 text-green-400 text-xs">Normal</Badge>
                          )}
                          {fabric.roughnessMapUrl && (
                            <Badge className="bg-green-900/50 text-green-400 text-xs">Roughness</Badge>
                          )}
                          {fabric.aoMapUrl && (
                            <Badge className="bg-green-900/50 text-green-400 text-xs">AO</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    <div className="text-sm text-zinc-300">
                      €{fabric.pricePerMeter} / meter
                    </div>

                    {/* Delete Button */}
                    <Button
                      onClick={() => handleDeleteFabric(fabric.id)}
                      variant="outline"
                      size="sm"
                      className="w-full border-red-800 text-red-400 hover:bg-red-950"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Verwijderen
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
