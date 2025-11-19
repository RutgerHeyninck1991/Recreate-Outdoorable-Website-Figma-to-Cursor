# 🔧 Texture Troubleshooting - Waarom ziet mijn stof er niet realistisch uit?

## Diagnose: Check de PBR Status Indicator

Kijk linksboven in de 3D viewer naar de "PBR Maps" indicator:

```
PBR Maps:
● Albedo        ← Welke bolletjes zijn GROEN?
● Normal
● Roughness
● AO
```

---

## Scenario 1: Alleen ALBEDO is groen 🟢⚪⚪⚪

**Symptomen:**
- ✅ Kleur/patroon is zichtbaar
- ❌ Ziet er plat/cartoon-achtig uit
- ❌ Geen textuur detail
- ❌ Te glanzend of plastic-achtig
- ❌ Geen diepte in de stof

**Oorzaak:** 
Je hebt alleen een foto/kleur geüpload, geen PBR texture maps.

**Oplossing:**
1. Open de stof in Adobe Substance 3D
2. Exporteer deze maps:
   - ✅ Normal map (`stofnaam_normal.png`)
   - ✅ Roughness map (`stofnaam_roughness.png`)
   - ✅ AO map (`stofnaam_ao.png`)
3. Upload naar Supabase Storage (zelfde bucket)
4. Klik "Sync from Storage" in Fabric Manager
5. Check: nu moeten 3-4 bolletjes groen zijn

**Impact zonder maps:**
- **Normal**: Geen weefsel structuur, ziet er gestreken/glad uit
- **Roughness**: Uniform glans, plastic-achtig
- **AO**: Geen schaduw detail, plat

---

## Scenario 2: Texture ziet er VERKEERD uit 🎨❌

**Symptomen:**
- Quilted patroon waar het niet hoort
- Houtnerf op de stof
- Vervormd patroon
- Texture lijkt 'stretched' of 'squashed'

**Voorbeeld:** Zoals op jouw screenshot - de bovenkant heeft een quilted patroon en de zijkanten hebben houtnerf.

**Oorzaak:** 
**UV Mapping probleem** in het GLB 3D model. De texture weet niet hoe hij over het model gemapped moet worden.

**Oplossing:**

### Optie A: Fix in Blender (aanbevolen)
1. Open je GLB model in Blender
2. Selecteer het kussen mesh
3. Tab → Edit Mode
4. UV Editing workspace (boven)
5. Check of de UV layout logisch is:
   ```
   Goed:  Vlakke unwrap, alle faces zichtbaar
   Fout:  Overlappende UVs, faces buiten 0-1 grid
   ```
6. Als verkeerd: Select All → U → Smart UV Project
7. Pas seam edges aan voor betere unwrap
8. File → Export → glTF 2.0 (.glb)
9. Upload nieuwe GLB naar Supabase

### Optie B: Simplere GLB gebruiken
Als je geen Blender ervaring hebt:
1. Gebruik een simpel box model met correcte UVs
2. Test eerst met die voordat je complexe modellen gebruikt

### Optie C: Texture repeat aanpassen (tijdelijke fix)
In `/components/GLBCushionViewer.tsx` regel 47, pas aan:
```tsx
// Was:
const textureSizeInCm = 20;

// Probeer:
const textureSizeInCm = 10; // Kleiner patroon
// of
const textureSizeInCm = 40; // Groter patroon
```

---

## Scenario 3: Alle maps GROEN maar nog steeds niet mooi 🟢🟢🟢🟢

**Symptomen:**
- Alle PBR maps laden
- Maar stof ziet er nog niet goed uit

**Mogelijke oorzaken:**

### A. Verkeerde Normal Map Format
**Check:** Open `stofnaam_normal.png` → moet BLAUWACHTIG zijn
- ✅ Correct: Hemelsblauw met subtiele variaties
- ❌ Fout: Rood/groen, of zwart/wit

**Oplossing:** Re-export normal map met **OpenGL** format (niet DirectX)

### B. Roughness te laag (te glanzend)
**Check:** Open `stofnaam_roughness.png` → moet LICHT GRIJS zijn
- ✅ Stof: 70-90% grijs (mat)
- ❌ Te glanzend: Donker grijs/zwart

**Oplossing:** Re-export met hogere roughness (0.8-0.9 voor stof)

### C. Texture resolutie te laag
**Check:** Zoom in op de stof, is het pixelig?
- ✅ Scherp: 2048x2048 of hoger
- ❌ Pixelig: 512x512 of lager

**Oplossing:** Re-export met 2048x2048 of 4096x4096

### D. AO map te donker
**Check:** Open `stofnaam_ao.png` → moet LICHT zijn
- ✅ Subtiel: Meeste pixels bijna wit
- ❌ Te veel schaduw: Veel donkere gebieden

**Oplossing:** Verlaag AO intensity in Substance export

---

## Scenario 4: Maps niet gedetecteerd (blijven grijs) ⚪⚪⚪⚪

**Symptomen:**
- Je hebt maps geüpload
- Na sync blijven bolletjes grijs
- Console errors?

**Mogelijke oorzaken:**

### A. Verkeerde bestandsnamen
**Check naming convention:**
```
✅ CORRECT:
fontelina-180-beige.png
fontelina-180-beige_normal.png
fontelina-180-beige_roughness.png
fontelina-180-beige_ao.png

❌ FOUT:
fontelina-180-beige.png
fontelina-180-beige-normal.png     ← streepje i.p.v. underscore
fontelinanormal.png                ← geen underscore
Fontelina_Normal.png               ← hoofdletters mismatch
```

**Oplossing:** Hernoem bestanden met underscore: `basename_maptype.png`

### B. Verkeerde bucket
**Check:** Staan alle files in de SUNPROOF SELECTIE bucket?

**Oplossing:** 
1. Supabase Storage → SUNPROOF SELECTIE
2. Upload alle maps naar dezelfde bucket
3. Re-sync

### C. Sync niet uitgevoerd
**Oplossing:** Klik "Sync from Storage" button na upload

---

## Quick Diagnostic Checklist

Open Browser Console (F12) en check:

```
=== PBR Texture Loading ===
Selected fabric: { textureUrl: "...", normalMapUrl: null, ... }
Texture maps loaded: { albedo: true, normal: false, ... }
```

**Als je ziet:**
- `normalMapUrl: null` → Map niet gevonden, check bestandsnaam
- `Texture loaded: ...` → Map laadt, check formaat
- `404 error` → Bestand bestaat niet in Storage
- `CORS error` → Bucket permissions probleem

---

## Test Procedure: Van 0 naar Perfect

### Stap 1: Test met alleen Albedo
1. Upload alleen `stofnaam.png`
2. Sync fabrics
3. Check: kleur is zichtbaar, maar plat

### Stap 2: Voeg Normal Map toe
1. Export + upload `stofnaam_normal.png` (OpenGL!)
2. Sync fabrics
3. Check: stof heeft nu textuur/weving detail

### Stap 3: Voeg Roughness toe
1. Export + upload `stofnaam_roughness.png`
2. Sync fabrics
3. Check: stof is nu mat i.p.v. glanzend

### Stap 4: Voeg AO toe (optioneel)
1. Export + upload `stofnaam_ao.png`
2. Sync fabrics
3. Check: extra diepte in vouwen

---

## Jouw Specifieke Situatie: "Fontelina 180 Beige"

**Wat je hebt:** 🟢 Albedo only  
**Wat je mist:** 🔴 Normal, Roughness, AO

**Actieplan:**

1. **Open Fontelina 180 Beige in Substance 3D**

2. **Export deze 3 maps:**
   - `fontelina-180-beige_normal.png` (2048x2048, OpenGL)
   - `fontelina-180-beige_roughness.png` (2048x2048, 0.85 roughness)
   - `fontelina-180-beige_ao.png` (2048x2048, subtiel)

3. **Upload naar Supabase:**
   - Storage → SUNPROOF SELECTIE
   - Upload alle 3 nieuwe bestanden

4. **Sync:**
   - App → Fabric Manager → "Sync from Storage"

5. **Check result:**
   - 3D viewer → Alle 4 bolletjes moeten groen zijn 🟢🟢🟢🟢
   - Zoom in → Stof heeft nu detail en ziet mat uit

---

**Nog vragen?** Check de console (F12) voor gedetailleerde texture loading info!
