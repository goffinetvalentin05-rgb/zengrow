-- DEV / LOCAL SEED ONLY
-- Fictional people. is_seed = true. Do not treat as production users.
-- Apply with: supabase db query -f scripts/seed-discovery-profiles.sql
-- Or POST /api/discovery/dev-seed when DISCOVERY_ALLOW_SEED=1
--
-- Never uses real public personalities.

insert into public.profiles (
  display_name, username, bio, location, country, profile_type, role_label,
  audience_size, audience_size_source, claim_status, is_seed, is_public,
  onboarding_completed, completeness, is_featured, editor_pick, featured_rank, avatar_url
)
select * from (
  values
  ('Maya Chen', 'mayachen', 'Building tools for indie SaaS founders who want cleaner analytics.', 'Singapore', 'Singapore', 'builder', 'SaaS Builder', 2400, 'self_reported', 'unclaimed', true, true, true, 80, true, true, 1, 'https://api.dicebear.com/9.x/notionists/svg?seed=MayaChen'),
  ('Jonas Hale', 'jonashale', 'Onboarding systems for B2B products that still feel human.', 'Berlin', 'Germany', 'founder', 'SaaS Founder', 1800, 'self_reported', 'unclaimed', true, true, true, 78, true, false, 2, 'https://api.dicebear.com/9.x/notionists/svg?seed=JonasHale'),
  ('Priya Shah', 'priyashah', 'Simplifying invoicing for tiny software teams.', 'London', 'United Kingdom', 'builder', 'SaaS Builder', 900, 'self_reported', 'unclaimed', true, true, true, 74, false, true, null, 'https://api.dicebear.com/9.x/notionists/svg?seed=PriyaShah'),
  ('Luca Ferrer', 'lucaferrer', 'Status pages and incident notes for small product teams.', 'Barcelona', 'Spain', 'operator', 'SaaS Operator', 4200, 'self_reported', 'unclaimed', true, true, true, 70, false, false, null, 'https://api.dicebear.com/9.x/notionists/svg?seed=LucaFerrer'),
  ('Nora Vidal', 'noravidal', 'Home goods brand built around slow, useful objects.', 'Lisbon', 'Portugal', 'founder', 'E-commerce Founder', 3100, 'self_reported', 'unclaimed', true, true, true, 82, true, false, 3, 'https://api.dicebear.com/9.x/notionists/svg?seed=NoraVidal'),
  ('Samir Benali', 'samirbenali', 'Fashion ops without the chaos. Inventory, suppliers, shipping.', 'Paris', 'France', 'operator', 'E-commerce Operator', 760, 'self_reported', 'unclaimed', true, true, true, 68, false, true, null, 'https://api.dicebear.com/9.x/notionists/svg?seed=SamirBenali'),
  ('Hana Okada', 'hanaokada', 'Small-batch snacks, sold direct, photographed simply.', 'Kyoto', 'Japan', 'creator', 'E-commerce Creator', 12500, 'self_reported', 'unclaimed', true, true, true, 76, false, false, null, 'https://api.dicebear.com/9.x/notionists/svg?seed=HanaOkada'),
  ('Theo Marcs', 'theomarcs', 'Shipping tools for shops that outgrew spreadsheets.', 'Amsterdam', 'Netherlands', 'builder', 'E-commerce Builder', 540, 'self_reported', 'unclaimed', true, true, true, 64, false, false, null, 'https://api.dicebear.com/9.x/notionists/svg?seed=TheoMarcs'),
  ('Camille Roux', 'camilleroux', 'Brand studio for companies that want less noise, more craft.', 'Lyon', 'France', 'founder', 'Agency Founder', 2100, 'self_reported', 'unclaimed', true, true, true, 80, true, true, 4, 'https://api.dicebear.com/9.x/notionists/svg?seed=CamilleRoux'),
  ('Drew Patel', 'drewpatel', 'Product design studio for early B2B teams.', 'Toronto', 'Canada', 'founder', 'Agency Founder', 4300, 'self_reported', 'unclaimed', true, true, true, 72, false, false, null, 'https://api.dicebear.com/9.x/notionists/svg?seed=DrewPatel'),
  ('Ines Costa', 'inescosta', 'Art direction and websites for independent hospitality brands.', 'Porto', 'Portugal', 'freelancer', 'Agency Freelancer', 890, 'self_reported', 'unclaimed', true, true, true, 66, false, false, null, 'https://api.dicebear.com/9.x/notionists/svg?seed=InesCosta'),
  ('Alex Rivera', 'ariveraops', 'Building operator systems in OFM. Quiet, practical, no hype.', 'Miami', 'United States', 'operator', 'OFM Operator', 2800, 'self_reported', 'unclaimed', true, true, true, 75, true, false, 5, 'https://api.dicebear.com/9.x/notionists/svg?seed=AlexRivera'),
  ('Jordan Blake', 'jordanblake', 'Hiring, SOPs and offer structure for creator-led ops.', 'Austin', 'United States', 'founder', 'OFM Founder', 6400, 'self_reported', 'unclaimed', true, true, true, 73, false, true, null, 'https://api.dicebear.com/9.x/notionists/svg?seed=JordanBlake'),
  ('Riley Quinn', 'rileyquinn', 'Night-shift operator. Systems over personality.', 'Dubai', 'United Arab Emirates', 'operator', 'OFM Operator', 1500, 'self_reported', 'unclaimed', true, true, true, 62, false, false, null, 'https://api.dicebear.com/9.x/notionists/svg?seed=RileyQuinn'),
  ('Elise Moreau', 'elisemoreau', 'Writing about building slowly, in public, without the performance.', 'Geneva', 'Switzerland', 'creator', 'Creator', 9800, 'self_reported', 'unclaimed', true, true, true, 84, true, true, 6, 'https://api.dicebear.com/9.x/notionists/svg?seed=EliseMoreau'),
  ('Marcus Lane', 'marcuslane', 'Short notes from a desk. Tools, routines, unfinished products.', 'Manchester', 'United Kingdom', 'creator', 'Creator', 3200, 'self_reported', 'unclaimed', true, true, true, 70, false, false, null, 'https://api.dicebear.com/9.x/notionists/svg?seed=MarcusLane'),
  ('Sofia Berg', 'sofiaberg', 'Sunday systems for people who make things on the internet.', 'Stockholm', 'Sweden', 'creator', 'Creator', 450, 'self_reported', 'unclaimed', true, true, true, 60, false, false, null, 'https://api.dicebear.com/9.x/notionists/svg?seed=SofiaBerg'),
  ('Kenji Mori', 'kenjimori', 'Small models, useful evals, no demo-ware.', 'Tokyo', 'Japan', 'builder', 'AI Builder', 1900, 'self_reported', 'unclaimed', true, true, true, 77, true, false, 7, 'https://api.dicebear.com/9.x/notionists/svg?seed=KenjiMori'),
  ('Amira Soltane', 'amirasoltane', 'Applied AI for document-heavy teams.', 'Tunis', 'Tunisia', 'founder', 'AI Founder', 700, 'self_reported', 'unclaimed', true, true, true, 69, false, true, null, 'https://api.dicebear.com/9.x/notionists/svg?seed=AmiraSoltane'),
  ('Owen Drake', 'owendrake', 'Tiny models that run on a laptop and still help.', 'Dublin', 'Ireland', 'builder', 'AI Builder', 220, 'self_reported', 'unclaimed', true, true, true, 58, false, false, null, 'https://api.dicebear.com/9.x/notionists/svg?seed=OwenDrake'),
  ('Lea Hoffmann', 'leahoffmann', 'Growth notes for B2B products that refuse gimmicks.', 'Zurich', 'Switzerland', 'operator', 'Marketing Operator', 5600, 'self_reported', 'unclaimed', true, true, true, 71, false, false, null, 'https://api.dicebear.com/9.x/notionists/svg?seed=LeaHoffmann'),
  ('Nico Alvarez', 'nicoalvarez', 'Outbound that does not feel like spam. Still figuring it out.', 'Madrid', 'Spain', 'founder', 'Sales Founder', 1100, 'self_reported', 'unclaimed', true, true, true, 63, false, false, null, 'https://api.dicebear.com/9.x/notionists/svg?seed=NicoAlvarez'),
  ('Tara Nguyen', 'taranguyen', 'Independent product designer for early-stage tools.', 'Melbourne', 'Australia', 'freelancer', 'Freelancer', 800, 'self_reported', 'unclaimed', true, true, true, 67, false, false, null, 'https://api.dicebear.com/9.x/notionists/svg?seed=TaraNguyen'),
  ('Hugo Bergstrom', 'hugoberg', 'Training notes and a small coaching practice on the side.', 'Oslo', 'Norway', 'coach', 'Sport Coach', 2700, 'self_reported', 'unclaimed', true, true, true, 61, false, false, null, 'https://api.dicebear.com/9.x/notionists/svg?seed=HugoBerg'),
  ('Amina El Fassi', 'aminaelfassi', 'Writing about allocation, patience and boring compounding.', 'Casablanca', 'Morocco', 'investor', 'Investor', 4100, 'self_reported', 'unclaimed', true, true, true, 72, false, true, null, 'https://api.dicebear.com/9.x/notionists/svg?seed=AminaElFassi'),
  ('Paul Morel', 'paulmorel', 'Small residential deals and a newsletter on local markets.', 'Lausanne', 'Switzerland', 'operator', 'Real Estate Operator', 1500, 'self_reported', 'unclaimed', true, true, true, 59, false, false, null, 'https://api.dicebear.com/9.x/notionists/svg?seed=PaulMorel')
) as v(
  display_name, username, bio, location, country, profile_type, role_label,
  audience_size, audience_size_source, claim_status, is_seed, is_public,
  onboarding_completed, completeness, is_featured, editor_pick, featured_rank, avatar_url
)
where not exists (select 1 from public.profiles p where p.username = v.username);

update public.profiles p
set primary_category_id = c.id
from public.categories c
where p.is_seed = true and p.username in ('mayachen','jonashale','priyashah','lucaferrer') and c.slug = 'saas';

update public.profiles p
set primary_category_id = c.id
from public.categories c
where p.is_seed = true and p.username in ('noravidal','samirbenali','hanaokada','theomarcs') and c.slug = 'ecommerce';

update public.profiles p
set primary_category_id = c.id
from public.categories c
where p.is_seed = true and p.username in ('camilleroux','drewpatel','inescosta') and c.slug = 'agency';

update public.profiles p
set primary_category_id = c.id
from public.categories c
where p.is_seed = true and p.username in ('ariveraops','jordanblake','rileyquinn') and c.slug = 'ofm';

update public.profiles p
set primary_category_id = c.id
from public.categories c
where p.is_seed = true and p.username in ('elisemoreau','marcuslane','sofiaberg') and c.slug = 'creators';

update public.profiles p
set primary_category_id = c.id
from public.categories c
where p.is_seed = true and p.username in ('kenjimori','amirasoltane','owendrake') and c.slug = 'ai';

update public.profiles p
set primary_category_id = c.id
from public.categories c
where p.is_seed = true and p.username = 'leahoffmann' and c.slug = 'marketing';

update public.profiles p
set primary_category_id = c.id
from public.categories c
where p.is_seed = true and p.username = 'nicoalvarez' and c.slug = 'sales';

update public.profiles p
set primary_category_id = c.id
from public.categories c
where p.is_seed = true and p.username = 'taranguyen' and c.slug = 'freelancing';

update public.profiles p
set primary_category_id = c.id
from public.categories c
where p.is_seed = true and p.username = 'hugoberg' and c.slug = 'sport';

update public.profiles p
set primary_category_id = c.id
from public.categories c
where p.is_seed = true and p.username = 'aminaelfassi' and c.slug = 'investing';

update public.profiles p
set primary_category_id = c.id
from public.categories c
where p.is_seed = true and p.username = 'paulmorel' and c.slug = 'real-estate';

insert into public.profile_categories (profile_id, category_id, is_favorite)
select p.id, p.primary_category_id, true
from public.profiles p
where p.is_seed = true and p.primary_category_id is not null
on conflict do nothing;

insert into public.projects (owner_id, name, slug, description, url, category, status, featured_project)
select p.id, v.name, v.slug, v.description, v.url, v.category, 'building', true
from public.profiles p
join (
  values
  ('mayachen', 'Flowly', 'flowly', 'Lightweight product analytics for indie SaaS.', 'https://example.com/flowly', 'SaaS'),
  ('jonashale', 'Northloop', 'northloop', 'Human onboarding sequences for B2B tools.', 'https://example.com/northloop', 'SaaS'),
  ('priyashah', 'Stackmint', 'stackmint', 'Invoicing that stays out of the way.', 'https://example.com/stackmint', 'SaaS'),
  ('lucaferrer', 'Pulsekit', 'pulsekit', 'Status pages for small teams.', 'https://example.com/pulsekit', 'SaaS'),
  ('noravidal', 'Atelier Nori', 'atelier-nori', 'Home objects made to last a long time.', 'https://example.com/nori', 'E-commerce'),
  ('samirbenali', 'Velvet Cart', 'velvet-cart', 'Ops layer for independent fashion shops.', 'https://example.com/velvet', 'E-commerce'),
  ('hanaokada', 'Mini Batch', 'mini-batch', 'Small-batch snacks, sold direct.', 'https://example.com/minibatch', 'E-commerce'),
  ('theomarcs', 'Parcelwise', 'parcelwise', 'Shipping rules without a 40-tab spreadsheet.', 'https://example.com/parcelwise', 'E-commerce'),
  ('camilleroux', 'Atelier Signal', 'atelier-signal', 'Quiet brand work for ambitious companies.', 'https://example.com/signal', 'Agency'),
  ('drewpatel', 'Northbound Studio', 'northbound', 'Product design for early B2B.', 'https://example.com/northbound', 'Agency'),
  ('inescosta', 'Frame & Form', 'frame-form', 'Sites and art direction for hospitality.', 'https://example.com/frame', 'Agency'),
  ('ariveraops', 'Studio Meridian', 'studio-meridian', 'Operator playbooks for OFM teams.', 'https://example.com/meridian', 'OFM'),
  ('jordanblake', 'Operator Desk', 'operator-desk', 'Hiring and SOP kit for creator ops.', 'https://example.com/operatordesk', 'OFM'),
  ('rileyquinn', 'Nightshift Ops', 'nightshift-ops', 'Coverage systems for 24/7 operations.', 'https://example.com/nightshift', 'OFM'),
  ('elisemoreau', 'The Quiet Build', 'quiet-build', 'A newsletter and studio about building slowly.', 'https://example.com/quietbuild', 'Creators'),
  ('marcuslane', 'Desk Notes', 'desk-notes', 'Short public notes from a working desk.', 'https://example.com/desknotes', 'Creators'),
  ('sofiaberg', 'Sunday Systems', 'sunday-systems', 'Simple operating cadence for makers.', 'https://example.com/sunday', 'Creators'),
  ('kenjimori', 'Lattice Labs', 'lattice-labs', 'Eval kits for small models.', 'https://example.com/lattice', 'AI'),
  ('amirasoltane', 'Paperclip AI', 'paperclip-ai', 'Document workflows without the theatre.', 'https://example.com/paperclip', 'AI'),
  ('owendrake', 'Small Model Co', 'small-model-co', 'Local models that stay useful.', 'https://example.com/smallmodel', 'AI'),
  ('leahoffmann', 'North Copy', 'north-copy', 'Positioning and pages for B2B products.', 'https://example.com/northcopy', 'Marketing'),
  ('nicoalvarez', 'Clearline', 'clearline', 'Outbound sequences with a human ceiling.', 'https://example.com/clearline', 'Sales'),
  ('taranguyen', 'Tara Nguyen Studio', 'tara-studio', 'Independent product design.', 'https://example.com/tara', 'Freelancing'),
  ('hugoberg', 'Base Camp Notes', 'base-camp-notes', 'Training logs and a small coaching practice.', 'https://example.com/basecamp', 'Sport'),
  ('aminaelfassi', 'Slow Compound', 'slow-compound', 'Notes on allocation and patience.', 'https://example.com/slowcompound', 'Investing'),
  ('paulmorel', 'Rue des Archives', 'rue-archives', 'Local residential notes and small deals.', 'https://example.com/archives', 'Real Estate')
) as v(username, name, slug, description, url, category)
  on p.username = v.username
where p.is_seed = true
  and not exists (select 1 from public.projects pr where pr.owner_id = p.id);

insert into public.social_links (profile_id, platform, url, sort_index)
select p.id, v.platform, v.url, v.sort_index
from public.profiles p
join (
  values
  ('mayachen', 'x', 'https://x.com/example_maya', 0),
  ('mayachen', 'linkedin', 'https://linkedin.com/in/example-maya', 1),
  ('mayachen', 'website', 'https://example.com/flowly', 2),
  ('elisemoreau', 'instagram', 'https://instagram.com/example_elise', 0),
  ('elisemoreau', 'youtube', 'https://youtube.com/@example_elise', 1),
  ('kenjimori', 'x', 'https://x.com/example_kenji', 0),
  ('kenjimori', 'website', 'https://example.com/lattice', 1),
  ('noravidal', 'instagram', 'https://instagram.com/example_nora', 0),
  ('camilleroux', 'linkedin', 'https://linkedin.com/in/example-camille', 0),
  ('ariveraops', 'x', 'https://x.com/example_alex', 0)
) as v(username, platform, url, sort_index)
  on p.username = v.username
where p.is_seed = true
on conflict do nothing;
