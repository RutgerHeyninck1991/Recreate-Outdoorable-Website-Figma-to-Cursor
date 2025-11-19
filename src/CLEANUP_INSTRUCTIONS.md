# Default Fabrics Opruimen - Instructies

## Wat is er veranderd?

De app gebruikt nu **alleen stoffen uit Supabase Storage**. Default/placeholder stoffen zijn verwijderd uit de initialize functie.

## Hoe werkt het nu?

### 1. Geen Default Fabrics Meer
- De "Initialize Default Fabrics" button creëert **geen** stoffen meer
- In plaats daarvan zie je een melding: "Use 'Sync from Storage' to load fabrics"

### 2. Alleen Supabase Storage Fabrics
- Upload stof afbeeldingen naar Supabase Storage bucket "SUNPROOF SELECTIE"
- Klik op **"Sync vanuit Storage"** button
- Alleen deze stoffen worden geladen en getoond

## Oude Default Fabrics Verwijderen

Als je de app eerder hebt gebruikt, kunnen er nog oude default fabrics in de database staan:

### Stap 1: Open Fabric Manager
- Ga naar `/fabric-manager` in de app
- Of klik "Fabric Manager" in de navigatie

### Stap 2: Klik "Verwijder Default Fabrics"
- Rode button onderaan de actieknoppen
- Bevestig de actie
- Dit verwijdert alle `outdoor`, `indoor`, en `premium` categorie stoffen
- Alleen `sunproof` stoffen blijven over

### Stap 3: Check Resultaat
- Scroll naar beneden naar "Huidige Fabrics"
- Je zou nu alleen Sunproof stoffen moeten zien

## Workflow voor Fresh Start

Als je wilt beginnen met een schone lei:

```
1. Klik "Verwijder Default Fabrics" 
   → Alle oude placeholder stoffen worden verwijderd

2. Upload stoffen naar Supabase Storage
   → Ga naar Supabase Dashboard → Storage → SUNPROOF SELECTIE
   → Upload je stof afbeeldingen met PBR maps

3. Klik "Sync vanuit Storage"
   → Laadt alle stoffen uit de bucket
   → Detecteert automatisch texture maps (_normal, _roughness, _ao)

4. Check de 3D viewer
   → Test een stof in de configurator
   → Zie de PBR status indicator (linksbovenin)
```

## Welke Fabrics worden Verwijderd?

De cleanup functie verwijdert alle stoffen met deze categorieën:
- ❌ `outdoor` (outdoor-canvas-beige, outdoor-canvas-sand, etc.)
- ❌ `indoor` (indoor-linen-natural, indoor-cotton-white, etc.)
- ❌ `premium` (premium-sunbrella-navy, premium-sunbrella-charcoal, etc.)

Deze worden **NIET** verwijderd:
- ✅ `sunproof` (alle stoffen uit Supabase Storage sync)

## Backend Changes

### Initialize Endpoint
**Voor:** Creëerde 10 default fabrics  
**Nu:** Retourneert alleen een bericht dat je Sync from Storage moet gebruiken

```typescript
// /supabase/functions/server/index.tsx
app.post("/fabrics/initialize", async (c) => {
  return c.json({ 
    message: "No default fabrics. Use 'Sync from Storage'...",
    count: existingFabrics?.length || 0
  });
});
```

### Nieuwe Cleanup Endpoint
```typescript
app.post("/fabrics/cleanup-defaults", async (c) => {
  // Verwijdert alle non-Sunproof fabrics
  // Retourneert aantal verwijderde + overgebleven fabrics
});
```

## API Usage

Je kunt de cleanup ook programmatisch aanroepen:

```typescript
import { fabricApi } from './utils/fabricApi';

const result = await fabricApi.cleanupDefaultFabrics();
console.log(result);
// {
//   message: "Deleted 10 default fabrics...",
//   deleted: 10,
//   remaining: 12,
//   deletedIds: ["outdoor-canvas-beige", ...]
// }
```

## Troubleshooting

### "Ik zie nog steeds oude fabrics"
- Klik "Verwijder Default Fabrics" button in Fabric Manager
- Of refresh de pagina na cleanup

### "Ik zie helemaal geen fabrics"
- Check of je stoffen hebt geüpload naar Supabase Storage
- Klik "Sync vanuit Storage"
- Check de console voor errors

### "Sync from Storage werkt niet"
- Check of de bucket "SUNPROOF SELECTIE" bestaat in Supabase
- Check of de bucket **Public** is
- Check of er afbeeldingen in de bucket staan
- Zie de console (F12) voor details

---

**TL;DR:** Gebruik "Verwijder Default Fabrics" button om oude placeholder stoffen te verwijderen, en gebruik "Sync vanuit Storage" om je echte stoffen te laden.
