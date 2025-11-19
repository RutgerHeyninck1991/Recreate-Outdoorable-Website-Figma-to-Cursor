# PBR Texture Maps Gids voor Outdoorable

## Overzicht

De 3D configurator ondersteunt nu volledige **PBR (Physically Based Rendering)** voor realistische stof weergave. Dit betekent dat je meerdere texture maps kunt gebruiken voor ultra-realistische stof visualisatie.

## Ondersteunde Texture Maps

### 1. **Albedo/Diffuse Map** (verplicht)
- **Bestandsnaam**: `stofnaam.png` of `stofnaam.jpg`
- **Doel**: De basis kleur/textuur van de stof
- **Resolutie**: Minimaal 1024x1024px, aanbevolen 2048x2048px
- **Formaat**: PNG, JPG, of WebP

### 2. **Normal Map** (aanbevolen)
- **Bestandsnaam**: `stofnaam_normal.png`
- **Doel**: Geeft oppervlakte details en structuur zonder extra geometrie
- **Kleur**: Blauwachtig (RGB encoded normal vectors)
- **Export vanuit Substance**: Normal Map (OpenGL format)

### 3. **Roughness Map** (aanbevolen)
- **Bestandsnaam**: `stofnaam_roughness.png` of `stofnaam_roughness.jpg`
- **Doel**: Bepaalt hoe glad (zwart) of ruw (wit) elk deel van de stof is
- **Kleur**: Grayscale (zwart = glad/glanzend, wit = ruw/mat)
- **Stof tip**: Meestal medium tot high roughness (0.7-0.9)

### 4. **Ambient Occlusion (AO) Map** (optioneel)
- **Bestandsnaam**: `stofnaam_ao.png` of `stofnaam_ambient.png`
- **Doel**: Voegt schaduw detail toe in vouwen en hoeken
- **Kleur**: Grayscale (wit = normaal, donker = schaduw)

### 5. **Displacement/Height Map** (optioneel)
- **Bestandsnaam**: `stofnaam_displacement.png` of `stofnaam_height.png`
- **Doel**: Geeft daadwerkelijke hoogteverschillen (subtiel voor stof)
- **Kleur**: Grayscale (wit = hoger, zwart = lager)

## Bestandsstructuur Voorbeeld

Upload naar Supabase Storage bucket "SUNPROOF SELECTIE":

```
SUNPROOF SELECTIE/
├── fabric-beige.png                    # Albedo
├── fabric-beige_normal.png             # Normal map
├── fabric-beige_roughness.png          # Roughness map
├── fabric-beige_ao.png                 # AO map
├── fabric-terracotta.png               # Albedo
├── fabric-terracotta_normal.png        # Normal map
├── fabric-terracotta_roughness.png     # Roughness map
└── ...
```

## Export vanuit Adobe Substance 3D

### Substance Painter / Sampler Export Settings:

1. **Albedo/Base Color**
   - Map: Base Color
   - Format: PNG of JPG (8-bit)
   - SRGB color space

2. **Normal**
   - Map: Normal
   - Format: PNG (16-bit of 8-bit)
   - OpenGL format (niet DirectX!)
   - Linear color space

3. **Roughness**
   - Map: Roughness
   - Format: PNG of JPG (8-bit)
   - Linear color space

4. **Ambient Occlusion**
   - Map: Ambient Occlusion
   - Format: PNG of JPG (8-bit)
   - Linear color space

5. **Height/Displacement**
   - Map: Height
   - Format: PNG (16-bit voor beste kwaliteit)
   - Linear color space

### Export Template

Gebruik de **"PBR MetalRough"** export preset in Substance Painter en pas aan:
- Output size: 2048x2048 (of 4096x4096 voor ultra kwaliteit)
- Format: PNG voor maps met detail, JPG voor file size

## Workflow

1. **Upload textures** naar Supabase Storage bucket "SUNPROOF SELECTIE"
2. **Naming convention**: Gebruik consistente namen met underscore scheidingen
3. **Sync fabrics**: Klik op "Sync from Storage" in Fabric Manager
4. **Automatische detectie**: Het systeem vindt automatisch alle texture maps
5. **Test in 3D viewer**: Zoom in om de textuur kwaliteit te zien

## Tips voor Beste Resultaten

✅ **DO:**
- Gebruik hoge resolutie textures (2048x2048 of hoger)
- Exporteer Normal maps in OpenGL format
- Gebruik PNG voor maps met veel detail (normal, AO)
- Test verschillende roughness waarden (stof = meestal 0.8-0.9)
- Gebruik consistente naming conventions

❌ **DON'T:**
- DirectX normal maps gebruiken (verkeerde kleuren)
- Te lage resolutie (<1024px) - ziet pixelig uit bij inzoomen
- Compression artifacts in normal maps
- Vergeten om displacement subtiel te houden (0.01-0.05 scale)

## Debugging

De 3D viewer toont een status indicator (linksboven) met welke maps geladen zijn:
- 🟢 Groen = Map is geladen
- ⚪ Grijs = Map niet beschikbaar

## Console Logs

Open de browser console (F12) om te zien:
- Welke textures worden geladen
- Of er errors zijn bij het laden
- Welke PBR properties worden toegepast

## Zonder Texture Maps

Als je **geen** texture maps upload, gebruikt het systeem:
- Alleen de kleur uit de fabric database
- Default roughness waarde (0.85)
- Geen normal/ao/displacement detail

Dit werkt prima voor simpele kleur previews, maar PBR maps geven veel realistischere resultaten!

---

**Vragen?** Check de console logs en de PBR status indicator in de 3D viewer.
