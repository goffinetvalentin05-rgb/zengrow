export type WorldPoint = {
  id: string;
  filter: string;
  lat: number;
  lng: number;
  count: number;
};

type GeoEntry = {
  id: string;
  filter: string;
  lat: number;
  lng: number;
  aliases: string[];
};

const GEO: GeoEntry[] = [
  { id: "switzerland", filter: "Switzerland", lat: 46.8, lng: 8.2, aliases: ["switzerland", "suisse", "schweiz", "swiss"] },
  { id: "france", filter: "France", lat: 46.2, lng: 2.2, aliases: ["france"] },
  { id: "belgium", filter: "Belgium", lat: 50.5, lng: 4.5, aliases: ["belgium", "belgique"] },
  { id: "germany", filter: "Germany", lat: 51.2, lng: 10.4, aliases: ["germany", "allemagne", "deutschland"] },
  { id: "spain", filter: "Spain", lat: 40.4, lng: -3.7, aliases: ["spain", "espagne", "espana"] },
  { id: "portugal", filter: "Portugal", lat: 39.4, lng: -8.2, aliases: ["portugal"] },
  { id: "netherlands", filter: "Netherlands", lat: 52.1, lng: 5.3, aliases: ["netherlands", "pays-bas", "holland"] },
  { id: "united-kingdom", filter: "United Kingdom", lat: 54.0, lng: -2.0, aliases: ["united kingdom", "uk", "england", "royaume-uni"] },
  { id: "united-states", filter: "United States", lat: 39.8, lng: -98.5, aliases: ["united states", "usa", "us", "etats-unis", "états-unis"] },
  { id: "uae", filter: "United Arab Emirates", lat: 24.5, lng: 54.4, aliases: ["united arab emirates", "uae", "emirats", "emirats arabes unis"] },
  { id: "dubai", filter: "Dubai", lat: 25.2, lng: 55.3, aliases: ["dubai", "doubai"] },
  { id: "singapore", filter: "Singapore", lat: 1.35, lng: 103.8, aliases: ["singapore", "singapour"] },
  { id: "japan", filter: "Japan", lat: 36.2, lng: 138.3, aliases: ["japan", "japon"] },
  { id: "canada", filter: "Canada", lat: 56.1, lng: -106.3, aliases: ["canada"] },
  { id: "brazil", filter: "Brazil", lat: -14.2, lng: -51.9, aliases: ["brazil", "bresil", "brasil"] },
  { id: "mexico", filter: "Mexico", lat: 23.6, lng: -102.5, aliases: ["mexico", "mexique"] },
  { id: "italy", filter: "Italy", lat: 41.9, lng: 12.6, aliases: ["italy", "italie"] },
  { id: "sweden", filter: "Sweden", lat: 60.1, lng: 18.6, aliases: ["sweden", "suede"] },
  { id: "norway", filter: "Norway", lat: 60.5, lng: 8.5, aliases: ["norway", "norvege"] },
  { id: "denmark", filter: "Denmark", lat: 56.3, lng: 9.5, aliases: ["denmark", "danemark"] },
  { id: "austria", filter: "Austria", lat: 47.5, lng: 14.6, aliases: ["austria", "autriche"] },
  { id: "poland", filter: "Poland", lat: 51.9, lng: 19.1, aliases: ["poland", "pologne"] },
  { id: "india", filter: "India", lat: 20.6, lng: 79.0, aliases: ["india", "inde"] },
  { id: "australia", filter: "Australia", lat: -25.3, lng: 133.8, aliases: ["australia", "australie"] },
  { id: "south-korea", filter: "South Korea", lat: 35.9, lng: 127.8, aliases: ["south korea", "korea", "coree", "coree du sud"] },
  { id: "israel", filter: "Israel", lat: 31.0, lng: 34.9, aliases: ["israel"] },
  { id: "morocco", filter: "Morocco", lat: 31.8, lng: -7.1, aliases: ["morocco", "maroc"] },
  { id: "nigeria", filter: "Nigeria", lat: 9.1, lng: 8.7, aliases: ["nigeria"] },
  { id: "south-africa", filter: "South Africa", lat: -30.6, lng: 22.9, aliases: ["south africa", "afrique du sud"] },
  { id: "argentina", filter: "Argentina", lat: -38.4, lng: -63.6, aliases: ["argentina", "argentine"] },
  { id: "chile", filter: "Chile", lat: -35.7, lng: -71.5, aliases: ["chile", "chili"] },
  { id: "colombia", filter: "Colombia", lat: 4.6, lng: -74.3, aliases: ["colombia", "colombie"] },
  { id: "ireland", filter: "Ireland", lat: 53.1, lng: -8.2, aliases: ["ireland", "irlande"] },
  { id: "finland", filter: "Finland", lat: 61.9, lng: 25.7, aliases: ["finland", "finlande"] },
  { id: "czechia", filter: "Czechia", lat: 49.8, lng: 15.5, aliases: ["czechia", "czech republic", "republique tcheque"] },
  { id: "turkey", filter: "Turkey", lat: 39.0, lng: 35.2, aliases: ["turkey", "turkiye", "turquie"] },
  { id: "indonesia", filter: "Indonesia", lat: -0.8, lng: 113.9, aliases: ["indonesia", "indonesie"] },
  { id: "philippines", filter: "Philippines", lat: 12.9, lng: 121.8, aliases: ["philippines"] },
  { id: "vietnam", filter: "Vietnam", lat: 14.1, lng: 108.3, aliases: ["vietnam"] },
  { id: "egypt", filter: "Egypt", lat: 26.8, lng: 30.8, aliases: ["egypt", "egypte"] },
  { id: "kenya", filter: "Kenya", lat: -0.02, lng: 37.9, aliases: ["kenya"] },
  { id: "new-zealand", filter: "New Zealand", lat: -40.9, lng: 174.9, aliases: ["new zealand", "nouvelle-zelande"] },
];

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const BY_ALIAS = new Map<string, GeoEntry>();
for (const entry of GEO) {
  for (const alias of entry.aliases) BY_ALIAS.set(fold(alias), entry);
}

export function resolveGeo(label: string | null | undefined): GeoEntry | null {
  if (!label) return null;
  const folded = fold(label);
  if (!folded) return null;
  const exact = BY_ALIAS.get(folded);
  if (exact) return exact;
  for (const [alias, entry] of BY_ALIAS) {
    if (alias.length < 5) continue;
    if (
      folded.startsWith(`${alias} `) ||
      folded.endsWith(` ${alias}`) ||
      folded.includes(` ${alias} `)
    ) {
      return entry;
    }
  }
  return null;
}

export function geoMatchesFilter(label: string | null | undefined, filter: string | null | undefined) {
  if (!filter) return false;
  const a = resolveGeo(label);
  const b = resolveGeo(filter);
  if (a && b) return a.id === b.id;
  return fold(label ?? "") === fold(filter);
}

export function collectWorldPoints(
  locations: Array<{ country?: string | null; location?: string | null }>,
  extra: string[] = [],
): WorldPoint[] {
  const grouped = new Map<string, WorldPoint>();
  const add = (raw: string | null | undefined) => {
    const entry = resolveGeo(raw);
    if (!entry) return;
    const current = grouped.get(entry.id);
    if (current) {
      current.count += 1;
      return;
    }
    grouped.set(entry.id, {
      id: entry.id,
      filter: entry.filter,
      lat: entry.lat,
      lng: entry.lng,
      count: 1,
    });
  };
  for (const item of locations) add(item.country || item.location);
  for (const label of extra) {
    const entry = resolveGeo(label);
    if (!entry) continue;
    if (!grouped.has(entry.id)) {
      grouped.set(entry.id, {
        id: entry.id,
        filter: entry.filter,
        lat: entry.lat,
        lng: entry.lng,
        count: 1,
      });
    }
  }
  return [...grouped.values()];
}
