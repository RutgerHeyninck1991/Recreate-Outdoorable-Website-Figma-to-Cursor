import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  CheckCircle, 
  Info, 
  Search, 
  Filter, 
  Palette, 
  Loader2, 
  RefreshCw,
  Droplets,
  Sun,
  Layers,
  AlertCircle
} from 'lucide-react';
import { useFabrics, useFabricCategories, fabricApi, type Fabric } from '../utils/fabricApi';

interface FabricStepProps {
  selectedFabric: Fabric | null;
  onSelect: (fabric: Fabric) => void;
}

const FabricStep: React.FC<FabricStepProps> = ({ selectedFabric, onSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Fetch fabric categories
  const { categories, loading: categoriesLoading, error: categoriesError } = useFabricCategories();
  
  // Fetch fabrics with filters
  const { fabrics, loading: fabricsLoading, error: fabricsError, refetch } = useFabrics({
    category: selectedCategory || undefined,
    active: true
  });

  // Auto-retry logic for transient errors
  useEffect(() => {
    if (fabricsError && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Retrying fabric fetch (attempt ${retryCount + 1})`);
        setRetryCount(prev => prev + 1);
        refetch();
      }, 1000 + retryCount * 1000); // Exponential backoff

      return () => clearTimeout(timer);
    }
  }, [fabricsError, retryCount, refetch]);

  // Initialize fabrics on first load if none exist
  useEffect(() => {
    const initializeFabrics = async () => {
      if (!fabricsLoading && fabrics.length === 0 && !isInitializing && !fabricsError) {
        try {
          setIsInitializing(true);
          console.log('No fabrics found, initializing default fabrics...');
          await fabricApi.initializeFabrics();
          setTimeout(() => {
            refetch();
          }, 500); // Small delay to ensure database consistency
        } catch (error) {
          console.error('Failed to initialize fabrics:', error);
        } finally {
          setIsInitializing(false);
        }
      }
    };

    initializeFabrics();
  }, [fabrics.length, fabricsLoading, isInitializing, fabricsError, refetch]);

  // Filter fabrics by search query (memoized for performance)
  const filteredFabrics = React.useMemo(() => {
    if (!searchQuery) return fabrics;
    
    const query = searchQuery.toLowerCase();
    return fabrics.filter(fabric =>
      fabric.name.toLowerCase().includes(query) ||
      fabric.description.toLowerCase().includes(query) ||
      fabric.tags.some(tag => tag.toLowerCase().includes(query)) ||
      fabric.composition.toLowerCase().includes(query)
    );
  }, [fabrics, searchQuery]);

  const isLoading = fabricsLoading || categoriesLoading || isInitializing;
  const hasError = fabricsError || categoriesError;

  // Optimized fabric card render function
  const renderFabricCard = React.useCallback((fabric: Fabric) => (
    <motion.div
      key={fabric.id}
      className={`group cursor-pointer rounded-xl border-2 transition-all duration-300 overflow-hidden ${
        selectedFabric?.id === fabric.id
          ? 'border-stone-800 bg-stone-50 shadow-lg scale-105'
          : 'border-stone-200 hover:border-stone-400 hover:shadow-md hover:scale-102'
      }`}
      whileHover={{ scale: selectedFabric?.id === fabric.id ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(fabric)}
      layout
    >
      {/* Color Preview */}
      <div 
        className="h-24 w-full relative"
        style={{ backgroundColor: fabric.color }}
      >
        {fabric.textureUrl && (
          <div 
            className="absolute inset-0 opacity-30"
            style={{ 
              backgroundImage: `url(${fabric.textureUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 space-y-1">
          {fabric.tags.includes('premium') && (
            <Badge className="bg-amber-500 text-white text-xs">Premium</Badge>
          )}
          {fabric.tags.includes('ibiza') && (
            <Badge className="bg-purple-500 text-white text-xs">Ibiza</Badge>
          )}
        </div>
        
        {/* Properties Icons */}
        <div className="absolute top-2 right-2 flex space-x-1">
          {fabric.waterResistant && (
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <Droplets className="w-3 h-3 text-white" />
            </div>
          )}
          {fabric.uvResistant && (
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <Sun className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-stone-800 group-hover:text-stone-900">
            {fabric.name}
          </h3>
          <div className="text-right">
            <div className="text-sm font-medium text-stone-700">
              €{fabric.pricePerMeter}/m
            </div>
            <div className="text-xs text-stone-500 uppercase tracking-wide">
              {fabric.category}
            </div>
          </div>
        </div>
        
        <p className="text-sm text-stone-600 mb-3 line-clamp-2">
          {fabric.description}
        </p>
        
        {fabric.composition && (
          <div className="text-xs text-stone-500 mb-3">
            {fabric.composition}
          </div>
        )}
        
        {/* Tags */}
        {fabric.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {fabric.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {fabric.tags.length > 3 && (
              <span className="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded-full">
                +{fabric.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {selectedFabric?.id === fabric.id && (
          <div className="flex items-center text-green-600 mt-3">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Geselecteerd</span>
          </div>
        )}
      </div>
    </motion.div>
  ), [selectedFabric, onSelect]);

  // Handle manual retry
  const handleRetry = () => {
    setRetryCount(0);
    fabricApi.clearCache(); // Clear cache to force fresh data
    refetch();
  };

  if (hasError) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-medium text-stone-800 mb-4">Stof en kleur kiezen</h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto mb-6">
            Selecteer uit onze uitgebreide collectie van premium outdoor stoffen.
          </p>
        </div>

        <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
          <div className="text-red-600 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
            <h3 className="text-lg font-medium mb-2">Kan stoffen niet laden</h3>
            <p className="text-sm mb-2">
              {fabricsError || categoriesError}
            </p>
            {retryCount > 0 && (
              <p className="text-xs text-red-500">
                Geprobeerd: {retryCount} keer
              </p>
            )}
          </div>
          <Button 
            onClick={handleRetry}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Opnieuw proberen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-medium text-stone-800 mb-4">Stof en kleur kiezen</h2>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          Selecteer uit onze uitgebreide collectie van premium outdoor stoffen. 
          Alle stoffen zijn speciaal geselecteerd voor duurzaamheid en luxe uitstraling.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Zoek stoffen op naam, beschrijving of eigenschappen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => {
            setSelectedCategory('');
            setSearchQuery('');
          }}
          className="border-stone-300 text-stone-700 hover:bg-stone-50"
        >
          <Filter className="w-4 h-4 mr-2" />
          Reset filters
        </Button>
        
        <Button
          variant="outline"
          onClick={handleRetry}
          disabled={isLoading}
          className="border-stone-300 text-stone-700 hover:bg-stone-50"
          title="Ververs de lijst met stoffen"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Ververs
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-stone-600 mx-auto animate-spin mb-4" />
          <p className="text-stone-600">
            {isInitializing ? 'Stoffen worden geïnitialiseerd...' : 'Stoffen worden geladen...'}
          </p>
          {isInitializing && (
            <p className="text-sm text-stone-500 mt-2">
              Dit kan enkele seconden duren...
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-4 bg-stone-100">
              <TabsTrigger value="" className="data-[state=active]:bg-white">
                Alle ({filteredFabrics.length})
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.name} 
                  value={category.name}
                  className="data-[state=active]:bg-white"
                >
                  {category.displayName} ({category.count})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory || ''} className="mt-6">
              {filteredFabrics.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 rounded-xl">
                  <Layers className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-stone-600 mb-2">
                    Geen stoffen gevonden
                  </h3>
                  <p className="text-stone-500">
                    {searchQuery 
                      ? `Geen resultaten voor "${searchQuery}"`
                      : 'Er zijn geen stoffen beschikbaar in deze categorie.'
                    }
                  </p>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery('')}
                      className="mt-4"
                    >
                      Zoekterm wissen
                    </Button>
                  )}
                </div>
              ) : (
                <motion.div 
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                  layout
                >
                  <AnimatePresence mode="popLayout">
                    {filteredFabrics.map(renderFabricCard)}
                  </AnimatePresence>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>

          {/* Selected Fabric Details */}
          {selectedFabric && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-stone-50 rounded-xl p-6 border border-stone-200"
            >
              <h3 className="text-lg font-medium text-stone-800 mb-4">
                Geselecteerde stof: {selectedFabric.name}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-stone-700 mb-2">Details</h4>
                  <ul className="space-y-2 text-sm text-stone-600">
                    <li><strong>Categorie:</strong> {selectedFabric.category}</li>
                    <li><strong>Samenstelling:</strong> {selectedFabric.composition}</li>
                    <li><strong>Prijs per meter:</strong> €{selectedFabric.pricePerMeter}</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-stone-700 mb-2">Eigenschappen</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFabric.waterResistant && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        <Droplets className="w-3 h-3 mr-1" />
                        Waterbestendig
                      </Badge>
                    )}
                    {selectedFabric.uvResistant && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                        <Sun className="w-3 h-3 mr-1" />
                        UV-bestendig
                      </Badge>
                    )}
                    {selectedFabric.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-stone-600 mt-4">
                {selectedFabric.description}
              </p>
            </motion.div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Stof informatie</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Alle outdoor stoffen zijn behandeld voor UV- en waterbestendigheid</li>
                  <li>• Premium stoffen hebben een langere garantieperiode</li>
                  <li>• Stalen zijn op aanvraag beschikbaar voor €5 per stuk</li>
                  <li>• Kleuren kunnen afwijken van uw scherm - vraag altijd een staal aan</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FabricStep;