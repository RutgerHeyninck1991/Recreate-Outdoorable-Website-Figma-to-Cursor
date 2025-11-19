# 🎨 Adobe Substance 3D Export Gids - Outdoorable

## Quick Start: Exporteer PBR Maps voor 1 Stof

### Stap 1: Open je stof in Substance 3D Sampler/Painter

### Stap 2: Export Settings

**File → Export Textures** (of **Export Maps**)

#### Template Selectie:
- Kies: **"PBR MetalRough"** of **"Unreal Engine 4 (Packed)"**
- Output directory: Jouw lokale map

#### Export Configuration:

```
Output Maps:
✅ BaseColor (of Albedo/Diffuse)
✅ Normal
✅ Roughness  
✅ AmbientOcclusion
❌ Metallic (niet nodig voor stof)
❌ Emissive (niet nodig)
```

#### Settings per Map:

**1. Base Color / Albedo**
- Size: `2048 x 2048` (of `4096 x 4096`)
- Format: `PNG` of `JPEG` 
- Bit depth: `8 bit`
- Color space: `sRGB`
- Naam: `fontelina-180-beige.png`

**2. Normal**
- Size: `2048 x 2048`
- Format: `PNG` (16-bit voor beste kwaliteit)
- Normal format: **`OpenGL`** ⚠️ BELANGRIJK! (niet DirectX)
- Color space: `Linear`
- Naam: `fontelina-180-beige_normal.png`

**3. Roughness**
- Size: `2048 x 2048`
- Format: `PNG` of `JPEG`
- Bit depth: `8 bit`
- Color space: `Linear`
- Channel: `R` (kan ook grayscale)
- Naam: `fontelina-180-beige_roughness.png`

**4. Ambient Occlusion**
- Size: `2048 x 2048`
- Format: `PNG` of `JPEG`
- Bit depth: `8 bit`
- Color space: `Linear`
- Naam: `fontelina-180-beige_ao.png`

### Stap 3: Naming Convention

Voor stof **"Fontelina 180 Beige"**, exporteer als:

```
fontelina-180-beige.png              ← Base/Albedo (verplicht)
fontelina-180-beige_normal.png       ← Normal map
fontelina-180-beige_roughness.png    ← Roughness map  
fontelina-180-beige_ao.png           ← AO map
```

⚠️ **Belangrijk**: Gebruik dezelfde base naam, voeg alleen `_normal`, `_roughness`, `_ao` toe!

### Stap 4: Upload naar Supabase

1. Ga naar Supabase dashboard
2. Storage → `SUNPROOF SELECTIE` bucket
3. Upload alle 4 bestanden
4. In de app: klik **"Sync from Storage"** in Fabric Manager

### Stap 5: Check resultaat

In de 3D viewer zie je nu linksboven:
- 🟢 Albedo
- 🟢 Normal  
- 🟢 Roughness
- 🟢 AO

## Alternatief: Bulk Export (alle stoffen tegelijk)

Als je 12 stoffen hebt in Substance Painter:

1. **Batch Export** via File → Export Textures
2. Selecteer output directory
3. Enable "Use $mesh name" voor automatische naamgeving
4. Export all materials
5. Upload hele folder naar Supabase

## Veelvoorkomende Problemen

### ❌ "Texture ziet er vreemd uit"
**Oorzaak**: Verkeerde UV mapping in GLB model
**Oplossing**: 
- Open GLB in Blender
- Check UV unwrapping (moet logisch zijn)
- Re-export GLB met correcte UVs

### ❌ "Normal map werkt niet / ziet blauw uit"
**Oorzaak**: DirectX format i.p.v. OpenGL
**Oplossing**: Re-export normal map met **OpenGL** format

### ❌ "Texture is wazig/pixelig"
**Oorzaak**: Te lage resolutie
**Oplossing**: Export met 2048x2048 of hoger

### ❌ "Stof is te glanzend"
**Oorzaak**: Roughness map ontbreekt of te laag
**Oplossing**: 
- Exporteer roughness map
- Voor stof: waarden tussen 0.75 - 0.95 (wit = ruwer)

### ❌ "Normal/Roughness map niet gedetecteerd"
**Oorzaak**: Verkeerde bestandsnaam
**Oplossing**: Check naming:
```
✅ stofnaam_normal.png
❌ stofnaam-normal.png  
❌ stofnaam.normal.png
❌ stofnaamNormal.png
```

## Test Checklist

Voor "Fontelina 180 Beige":

- [ ] Base color geëxporteerd (2048x2048, PNG)
- [ ] Normal map geëxporteerd (OpenGL format!)
- [ ] Roughness map geëxporteerd
- [ ] AO map geëxporteerd
- [ ] Alle files hebben consistente base naam
- [ ] Geüpload naar Supabase Storage
- [ ] Fabric sync uitgevoerd
- [ ] 4 groene bolletjes in 3D viewer
- [ ] Inzoomen: textuur is scherp en gedetailleerd
- [ ] Stof ziet er mat/natuurlijk uit (niet glanzend)

## Optimale Substance Settings voor Outdoor Stof

In Substance Painter/Sampler:

**Material Properties:**
- Base Color: Scan/foto van echte stof
- Roughness: 0.80 - 0.90 (mat, geen glans)
- Metallic: 0.0 (stof is nooit metallisch)
- Normal: Medium strength (niet te extreem)

**For outdoor fabrics like Sunproof:**
- Higher roughness (0.85+)
- Subtle normal map (stof weving)
- AO for depth in texture

## Snelle Test: Eén Stof

Om te testen of alles werkt, begin met **1 stof**:

1. Export alleen Fontelina 180 Beige (4 maps)
2. Upload naar Supabase
3. Sync fabrics
4. Check 3D viewer
5. Als dit werkt → export rest van collectie

---

**Vragen?** Open browser console (F12) voor gedetailleerde texture loading logs.
