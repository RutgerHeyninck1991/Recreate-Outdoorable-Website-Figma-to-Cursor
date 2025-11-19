import React, { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  useTexture,
} from "@react-three/drei";
import { Loader2 } from "lucide-react";
import * as THREE from "three";

interface GLBCushionViewerProps {
  modelUrl: string;
  selectedFabric?: {
    color?: string;
    textureUrl?: string;
    normalMapUrl?: string;
    roughnessMapUrl?: string;
    aoMapUrl?: string;
    displacementMapUrl?: string;
    texturePattern?: string;
  };
  width?: number;
  height?: number;
  depth?: number;
}

// Component to load and display the GLB model with PBR textures
function Model({
  modelUrl,
  selectedFabric,
  width,
  height,
  depth,
}: GLBCushionViewerProps) {
  const gltf = useGLTF(modelUrl);
  const meshRef = useRef<any>(null);
  const [texturesLoaded, setTexturesLoaded] = useState(false);

  // Calculate dynamic scale based on dimensions (for zitkussen-strak)
  // Reference model dimensions: 129cm x 60cm x 12cm
  const calculateDynamicScale = () => {
    const referenceWidth = 129;
    const referenceHeight = 60;
    const referenceDepth = 12;

    const scaleX = (width || 129) / referenceWidth;
    const scaleY = (height || 60) / referenceHeight;
    const scaleZ = (depth || 12) / referenceDepth;

    return {
      x: scaleX,
      y: scaleY,
      z: scaleZ,
    };
  };

  // Calculate texture repeat based on cushion dimensions
  // Assume texture represents ~20cm in real world
  const getTextureRepeat = () => {
    const textureSizeInCm = 20;
    const repeatX = (width || 60) / textureSizeInCm;
    const repeatY = (height || 60) / textureSizeInCm;
    return { x: repeatX, y: repeatY };
  };

  // Load textures with proper configuration
  const loadTexture = (url: string | undefined) => {
    if (!url) return null;
    
    const loader = new THREE.TextureLoader();
    const texture = loader.load(url, () => {
      console.log(`Texture loaded: ${url}`);
    });
    
    const repeat = getTextureRepeat();
    
    // Configure texture for best quality
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeat.x, repeat.y);
    texture.anisotropy = 16; // Maximum anisotropic filtering for sharpness
    
    return texture;
  };

  // Apply PBR materials to the model when fabric changes
  useEffect(() => {
    if (!gltf.scene) return;

    console.log('=== PBR Texture Loading ===');
    console.log('Selected fabric:', selectedFabric);
    console.log('Cushion dimensions:', { width, height, depth });
    console.log('Texture repeat:', getTextureRepeat());
    
    // Load all available textures
    const albedoMap = loadTexture(selectedFabric?.textureUrl);
    const normalMap = loadTexture(selectedFabric?.normalMapUrl);
    const roughnessMap = loadTexture(selectedFabric?.roughnessMapUrl);
    const aoMap = loadTexture(selectedFabric?.aoMapUrl);
    const displacementMap = loadTexture(selectedFabric?.displacementMapUrl);
    
    console.log('Texture maps loaded:', {
      albedo: !!albedoMap,
      normal: !!normalMap,
      roughness: !!roughnessMap,
      ao: !!aoMap,
      displacement: !!displacementMap
    });

    // Configure normal map encoding
    if (normalMap) {
      normalMap.colorSpace = THREE.LinearSRGBColorSpace;
    }

    // Configure AO map
    if (aoMap) {
      aoMap.colorSpace = THREE.LinearSRGBColorSpace;
    }

    // Apply materials to all meshes
    gltf.scene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        // Create or update material as MeshStandardMaterial (PBR)
        if (!(child.material instanceof THREE.MeshStandardMaterial)) {
          child.material = new THREE.MeshStandardMaterial();
        }

        const material = child.material as THREE.MeshStandardMaterial;

        // Base color
        if (!material.color) {
          material.color = new THREE.Color();
        }
        material.color.set(selectedFabric?.color || "#E8DCC6");

        // Apply texture maps
        if (albedoMap) {
          material.map = albedoMap;
          console.log('Applied albedo/diffuse map');
        } else {
          material.map = null;
        }

        if (normalMap) {
          material.normalMap = normalMap;
          material.normalScale = new THREE.Vector2(1.0, 1.0); // Adjust for intensity
          console.log('Applied normal map');
        } else {
          material.normalMap = null;
        }

        if (roughnessMap) {
          material.roughnessMap = roughnessMap;
          material.roughness = 1.0; // Use map fully
          console.log('Applied roughness map');
        } else {
          material.roughnessMap = null;
          material.roughness = 0.85; // Fabric-like roughness
        }

        if (aoMap) {
          material.aoMap = aoMap;
          material.aoMapIntensity = 1.0;
          console.log('Applied AO map');
        } else {
          material.aoMap = null;
        }

        if (displacementMap) {
          material.displacementMap = displacementMap;
          material.displacementScale = 0.05; // Subtle displacement
          console.log('Applied displacement map');
        } else {
          material.displacementMap = null;
        }

        // PBR properties for fabric
        material.metalness = 0.0; // Fabric is non-metallic
        material.envMapIntensity = 0.3; // Subtle environment reflections
        
        // Enable shadows
        material.needsUpdate = true;
        child.castShadow = true;
        child.receiveShadow = true;

        console.log('Material updated with PBR properties');
      }
    });

    setTexturesLoaded(true);

    // Apply dynamic scaling based on dimensions
    if (meshRef.current) {
      const scale = calculateDynamicScale();
      meshRef.current.scale.x = scale.x * 1.5; // 1.5 is base scale
      meshRef.current.scale.y = scale.y * 1.5;
      meshRef.current.scale.z = scale.z * 1.5;
    }
  }, [
    gltf,
    selectedFabric?.color,
    selectedFabric?.textureUrl,
    selectedFabric?.normalMapUrl,
    selectedFabric?.roughnessMapUrl,
    selectedFabric?.aoMapUrl,
    selectedFabric?.displacementMapUrl,
    width,
    height,
    depth,
  ]);

  // Auto-rotate slightly
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  // Get the initial scale to display in the primitive
  const initialScale = calculateDynamicScale();
  const baseScale = 1.5;

  return (
    <group
      ref={meshRef}
      scale={[baseScale * initialScale.x, baseScale * initialScale.y, baseScale * initialScale.z]}
    >
      <primitive object={gltf.scene} />
    </group>
  );
}

// Preload the model
useGLTF.preload(
  "https://iydxusrdnduybpnhozvi.supabase.co/storage/v1/object/public/3D%20MODEL/GLB%20TEST%20ZITKUSSEN%20STRAK.glb",
);

// Loading fallback
function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 via-stone-50 to-stone-200">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-stone-600 mx-auto animate-spin mb-4" />
        <p className="text-stone-600">
          3D model wordt geladen...
        </p>
      </div>
    </div>
  );
}

export default function GLBCushionViewer({
  modelUrl,
  selectedFabric,
  width,
  height,
  depth,
}: GLBCushionViewerProps) {
  return (
    <div className="w-full h-full relative bg-gradient-to-br from-stone-100 via-stone-50 to-stone-200 bg-[rgba(242,224,224,0)]">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 2.5], fov: 50 }}
        className="touch-none"
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <Suspense fallback={null}>
          {/* Enhanced PBR Lighting Setup */}
          <ambientLight intensity={0.4} />
          
          {/* Key light - main light source */}
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0001}
          />
          
          {/* Fill light - softer light from the side */}
          <directionalLight
            position={[-5, 3, -3]}
            intensity={0.4}
            color="#f5f1e8"
          />
          
          {/* Rim light - highlights edges */}
          <directionalLight
            position={[0, 2, -8]}
            intensity={0.3}
            color="#fff5e6"
          />

          {/* Environment for realistic reflections and ambient lighting */}
          <Environment preset="city" environmentIntensity={0.4} />

          {/* The 3D Model */}
          <Model
            modelUrl={modelUrl}
            selectedFabric={selectedFabric}
            width={width}
            height={height}
            depth={depth}
          />

          {/* Camera Controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={0.5}
            maxDistance={10}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
            autoRotate={false}
            autoRotateSpeed={0.5}
            dampingFactor={0.05}
            rotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>

      {/* Dimensions overlay */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
        <p className="text-sm text-stone-600">
          {width} × {height} × {depth} cm
        </p>
      </div>

      {/* Interaction hint */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
        <p className="text-xs text-stone-600">
          Sleep om te roteren • Scroll om te zoomen
        </p>
      </div>

      {/* PBR Texture Status - for testing */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg max-w-xs">
        <p className="text-xs text-stone-800 mb-1">PBR Maps:</p>
        <div className="space-y-0.5">
          <p className="text-xs text-stone-600">
            <span className={selectedFabric?.textureUrl ? "text-green-600" : "text-stone-400"}>●</span> Albedo
          </p>
          <p className="text-xs text-stone-600">
            <span className={selectedFabric?.normalMapUrl ? "text-green-600" : "text-stone-400"}>●</span> Normal
          </p>
          <p className="text-xs text-stone-600">
            <span className={selectedFabric?.roughnessMapUrl ? "text-green-600" : "text-stone-400"}>●</span> Roughness
          </p>
          <p className="text-xs text-stone-600">
            <span className={selectedFabric?.aoMapUrl ? "text-green-600" : "text-stone-400"}>●</span> AO
          </p>
        </div>
        {(!selectedFabric?.normalMapUrl || !selectedFabric?.roughnessMapUrl) && (
          <div className="mt-2 pt-2 border-t border-stone-300">
            <p className="text-xs text-amber-700">
              ⚠️ Voor realistische stof: exporteer Normal + Roughness maps uit Substance
            </p>
          </div>
        )}
      </div>
    </div>
  );
}