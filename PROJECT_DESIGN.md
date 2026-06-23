# Meal Memory Project Design Specification

## 1. Product Summary

Meal Memory is a mobile-first Progressive Web App for remembering restaurant meals, dishes, preferences, photos, ratings, dining companions, and ordering notes. The app helps a user answer questions like:

- What did I order here last time?
- Did I like it?
- What should I change when ordering next time?
- Who was with me?
- Which photos, notes, and ratings belong to that meal?
- Where is the restaurant, and how do I get back there?

The first version should run cheaply as a static PWA with local-first storage. The architecture should allow cloud sync, authentication, and third-party restaurant metadata providers to be added later without rewriting the application.

## 2. Primary Goals

- Make it very fast to capture a meal from a phone.
- Store meals, restaurants, dishes, people, ratings, notes, and photos.
- Work offline or with unreliable mobile connectivity.
- Keep initial deployment cheap: static hosting plus browser storage.
- Design storage behind interfaces so the app can later use Supabase, Firebase, SQLite sync, S3-compatible photo storage, or another provider.
- Support restaurant metadata enrichment through provider adapters, starting with manually entered restaurant data.

## 3. Non-Goals For MVP

- Public social sharing.
- Real-time collaboration.
- Full Yelp/Google Maps integration in the first implementation.
- Payment tracking or receipt scanning.
- Nutrition tracking.
- Complex recommendation algorithms.
- Native mobile apps.

## 4. Target Users

### Primary User

An individual who eats out and wants a private memory system for meals, restaurants, favorite dishes, and ordering preferences.

### Associated Profiles

The app should support lightweight profiles for people the primary user eats with, such as:

- Self
- Partner
- Children
- Friends
- Family members

Profiles are not full login accounts in the MVP. They are local entities that can be attached to meal visits, ratings, notes, and preferences.

## 5. Core User Stories

- As a user, I can add a restaurant with name, address, website, phone number, tags, and notes.
- As a user, I can record a visit to a restaurant on a specific date.
- As a user, I can add one or more dishes ordered during a visit.
- As a user, I can rate a restaurant, visit, and dish.
- As a user, I can attach photos to a visit or dish.
- As a user, I can write notes about what to order again or what to modify next time.
- As a user, I can attach people to a meal visit.
- As a user, I can track each person's opinion about a dish.
- As a user, I can quickly search restaurants, dishes, notes, and people.
- As a user, I can open a restaurant detail page and see my meal history there.
- As a user, I can install the app to my phone home screen.
- As a user, I can use the core app offline.
- As a user, I can export my data as JSON for backup.
- As a user, I can import a previous JSON backup.

## 6. MVP Feature Set

### 6.1 Dashboard

The dashboard should prioritize fast recall and fast entry.

Recommended elements:

- Search input across restaurants, dishes, notes, and profiles.
- Quick action to add a meal.
- Recent meals list.
- Favorite or highest-rated restaurants.
- "Need to remember" notes, such as dishes with modification notes.
- List of close restaurants for easy selection

### 6.2 Restaurant Management

Each restaurant should include:

- Name
- Address
- Neighborhood or city
- Cuisine tags
- Website URL
- Phone number
- Map/directions URL
- Notes
- Optional external metadata provider IDs
- Optional imported image URL
- Created and updated timestamps

Restaurant detail page should show:

- Restaurant info
- Visit history
- Dishes tried there
- Favorite dishes
- Photos
- Ordering notes
- People who have joined meals there

### 6.3 Meal Visit Tracking

A meal visit represents one restaurant experience.

Fields:

- Restaurant
- Visit date and optional time
- Meal type: breakfast, brunch, lunch, dinner, snack, dessert, drinks, other
- Attendees
- Overall rating
- Cost impression: cheap, moderate, expensive, splurge
- Occasion tags: date night, family, solo, work, travel, celebration, takeout, delivery
- Freeform notes
- Photos

### 6.4 Dish Tracking

A dish belongs to a restaurant and can appear in many visits.

Fields:

- Restaurant
- Dish name
- Category: appetizer, entree, dessert, drink, side, special, other
- Description
- Photos
- Default rating
- Order-again status: yes, maybe, no
- Modification notes
- Tags: spicy, vegetarian, kid-friendly, gluten-free, favorite, seasonal, shareable

During a visit, the user can create a dish entry that records:

- Dish ordered
- Who ate or shared it
- Per-person ratings
- Visit-specific notes
- Visit-specific modifications
- Photos

### 6.5 Profiles

Profiles are lightweight people records.

Fields:

- Display name
- Relationship label
- Avatar color or image
- Food preferences
- Allergies or restrictions
- Notes
- Archived status

Profiles should support:

- Attaching people to a meal visit.
- Recording a person's rating for a dish.
- Filtering memories by person.
- Remembering person-specific preferences, such as "likes mild spice" or "order sauce on side."

### 6.6 Photos

MVP photo behavior:

- Allow upload from camera roll or mobile camera.
- Store images locally in IndexedDB as blobs or compressed data.
- Generate thumbnails for list views.
- Attach photos to restaurants, visits, and visit dishes.

Important implementation note:

Photo storage should be abstracted behind a `PhotoStorageProvider` interface so local IndexedDB storage can later be swapped or extended with cloud object storage.

### 6.7 Search And Filters

Search should cover:

- Restaurant name
- Dish name
- Notes
- Tags
- People
- Cuisine
- Location text

Useful filters:

- Person
- Restaurant
- Rating
- Order-again status
- Cuisine tag
- Meal type
- Date range
- Has photos

### 6.8 Backup, Import, And Export

The MVP should include:

- Export all non-binary data as JSON.
- Export photo references and metadata.
- Optional separate photo export can be deferred.
- Import JSON backup into local storage.
- Show import warnings before overwriting or merging data.

Recommended MVP behavior:

- Use merge import by stable IDs.
- Keep `createdAt`, `updatedAt`, and `deletedAt` fields for future sync compatibility.

## 7. Future Feature Ideas

- Cloud sync across devices.
- User authentication.
- Shared household account.
- Restaurant lookup using Yelp Fusion API, Google Places API, Foursquare, or OpenStreetMap/Nominatim.
- Directions integration.
- Receipt scanning.
- Menu photo OCR.
- AI-generated ordering recommendations.
- "What should I order here?" assistant.
- Travel mode for meals in a city.
- Calendar timeline.
- Map view.
- Push reminders for "try this next time."

## 8. Information Architecture

Recommended navigation:

- Home
- Restaurants
- Meals
- Dishes
- People
- Settings

Recommended routes:

- `/`
- `/restaurants`
- `/restaurants/new`
- `/restaurants/:restaurantId`
- `/restaurants/:restaurantId/edit`
- `/meals`
- `/meals/new`
- `/meals/:mealId`
- `/meals/:mealId/edit`
- `/dishes`
- `/dishes/:dishId`
- `/people`
- `/people/:profileId`
- `/settings`
- `/settings/backup`

## 9. Data Model

Use stable string IDs generated on the client. Prefer UUID v4, ULID, or another collision-resistant ID.

All persisted records should include:

- `id`
- `createdAt`
- `updatedAt`
- `deletedAt`
- `schemaVersion`

Soft deletion is recommended to make future sync easier.

### 9.1 TypeScript Domain Types

```ts
type EntityId = string;
type ISODateTime = string;
type ISODate = string;

interface BaseEntity {
  id: EntityId;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  deletedAt?: ISODateTime | null;
  schemaVersion: number;
}

interface Restaurant extends BaseEntity {
  name: string;
  address?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  neighborhood?: string;
  phone?: string;
  websiteUrl?: string;
  directionsUrl?: string;
  cuisineTags: string[];
  notes?: string;
  externalRefs: ExternalRestaurantRef[];
  primaryPhotoId?: EntityId;
}

interface ExternalRestaurantRef {
  provider: 'yelp' | 'google_places' | 'foursquare' | 'openstreetmap' | 'manual';
  providerId: string;
  url?: string;
  lastImportedAt?: ISODateTime;
  rawSnapshot?: unknown;
}

interface Profile extends BaseEntity {
  displayName: string;
  relationship?: string;
  avatarColor?: string;
  avatarPhotoId?: EntityId;
  preferences?: string;
  allergies?: string;
  notes?: string;
  archived: boolean;
}

interface MealVisit extends BaseEntity {
  restaurantId: EntityId;
  visitedAt: ISODateTime;
  mealType?: 'breakfast' | 'brunch' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'drinks' | 'other';
  attendeeProfileIds: EntityId[];
  overallRating?: number;
  costImpression?: 'cheap' | 'moderate' | 'expensive' | 'splurge';
  occasionTags: string[];
  notes?: string;
  photoIds: EntityId[];
}

interface Dish extends BaseEntity {
  restaurantId: EntityId;
  name: string;
  category?: 'appetizer' | 'entree' | 'dessert' | 'drink' | 'side' | 'special' | 'other';
  description?: string;
  defaultRating?: number;
  orderAgain?: 'yes' | 'maybe' | 'no';
  modificationNotes?: string;
  tags: string[];
  primaryPhotoId?: EntityId;
}

interface MealDish extends BaseEntity {
  mealVisitId: EntityId;
  dishId: EntityId;
  eaterProfileIds: EntityId[];
  sharedByProfileIds: EntityId[];
  rating?: number;
  perPersonRatings: PersonDishRating[];
  notes?: string;
  modificationNotes?: string;
  photoIds: EntityId[];
}

interface PersonDishRating {
  profileId: EntityId;
  rating: number;
  notes?: string;
}

interface PhotoAsset extends BaseEntity {
  ownerType: 'restaurant' | 'meal_visit' | 'dish' | 'meal_dish' | 'profile';
  ownerId: EntityId;
  storageProvider: 'local_indexeddb' | 'remote_url';
  storageKey: string;
  mimeType: string;
  width?: number;
  height?: number;
  thumbnailStorageKey?: string;
  altText?: string;
  capturedAt?: ISODateTime;
}
```

## 10. Storage Architecture

The app should be local-first.

Recommended MVP storage:

- IndexedDB for structured app data.
- IndexedDB for local photo blobs and thumbnails.
- LocalStorage only for simple preferences, never primary data.

Recommended library options:

- Dexie for IndexedDB ergonomics.
- Zod or Valibot for runtime validation and import validation.
- TanStack Query can be used later, but direct local repositories may be simpler for MVP.

### 10.1 Repository Interfaces

The UI should not call IndexedDB directly. Use repository interfaces.

```ts
interface RestaurantRepository {
  list(): Promise<Restaurant[]>;
  get(id: EntityId): Promise<Restaurant | null>;
  save(input: Restaurant): Promise<Restaurant>;
  softDelete(id: EntityId): Promise<void>;
  search(query: string): Promise<Restaurant[]>;
}

interface MealRepository {
  listRecent(limit: number): Promise<MealVisit[]>;
  listByRestaurant(restaurantId: EntityId): Promise<MealVisit[]>;
  get(id: EntityId): Promise<MealVisit | null>;
  save(input: MealVisit): Promise<MealVisit>;
  softDelete(id: EntityId): Promise<void>;
}

interface PhotoStorageProvider {
  put(file: File | Blob, options?: PhotoPutOptions): Promise<PhotoAsset>;
  getBlob(photo: PhotoAsset): Promise<Blob | null>;
  getObjectUrl(photo: PhotoAsset): Promise<string | null>;
  delete(photo: PhotoAsset): Promise<void>;
}
```

### 10.2 Future Sync Provider

Plan for a future `SyncProvider`:

```ts
interface SyncProvider {
  pull(since?: ISODateTime): Promise<SyncPullResult>;
  push(changes: LocalChangeSet): Promise<SyncPushResult>;
}
```

Future sync will be easier if every entity has:

- Stable client-generated ID.
- `createdAt`
- `updatedAt`
- `deletedAt`
- `schemaVersion`

## 11. Restaurant Metadata Provider Architecture

Third-party metadata should be optional and adapter-based.

```ts
interface RestaurantMetadataProvider {
  providerName: string;
  searchRestaurants(query: RestaurantSearchQuery): Promise<RestaurantSearchResult[]>;
  getRestaurantDetails(providerId: string): Promise<RestaurantMetadataDetails>;
}
```

MVP provider:

- Manual entry provider.

Future providers:

- Yelp Fusion API.
- Google Places API.
- Foursquare Places.
- OpenStreetMap/Nominatim for lower-cost geocoding and basic location data.

Important note:

Some providers have terms that restrict caching photos, ratings, or business data. The app should store provider IDs and attribution metadata separately from user-created meal memories.

## 12. PWA Requirements

The app should include:

- Web app manifest.
- Service worker.
- Installable app metadata.
- Offline shell caching.
- Responsive mobile layout.
- App icons.
- Theme color.
- Offline-friendly empty and error states.

Recommended caching:

- Cache application shell and static assets.
- Do not assume remote restaurant metadata or map links are available offline.
- Keep user-created data in IndexedDB.

## 13. UX Principles

- Mobile first.
- Optimize the add-meal flow for one-handed use.
- Minimize required fields.
- Prefer progressive disclosure over long forms.
- Keep restaurant, meal, dish, and profile creation available inline.
- Make ratings quick: tap-based controls, not text entry.
- Make "order this again" and "change this next time" highly visible.
- Preserve drafts when the user navigates away or loses connectivity.

## 14. Key Screens

### 14.1 Add Meal Flow

Recommended flow:

1. Select or create restaurant.
2. Choose date/time and meal type.
3. Add attendees.
4. Add dishes.
5. Add ratings, photos, and notes.
6. Save.

The form should allow saving with only:

- Restaurant
- Visit date

Everything else should be optional.

### 14.2 Restaurant Detail

Should answer:

- Where is this place?
- What did I eat here?
- What should I order again?
- What should I avoid?
- Who came with me?
- What are my best photos from here?

### 14.3 Dish Detail

Should answer:

- Which restaurant is this from?
- How often have I ordered it?
- What rating did it get?
- Who liked it?
- What modifications should I request next time?

### 14.4 Person Detail

Should answer:

- Which meals included this person?
- Which restaurants do they like?
- Which dishes did they rate highly?
- What allergies, restrictions, or preferences matter?

## 15. Recommended Technical Stack

The exact stack can vary, but this is a strong default for implementation:

- Vite
- React
- TypeScript
- React Router
- Dexie
- Zod
- CSS modules, Tailwind, or a small design-system layer
- Vite PWA plugin or custom Workbox setup
- Vitest for unit tests
- Playwright for end-to-end smoke tests

The implementation should avoid requiring a backend for MVP.

## 16. Suggested Source Structure

```text
src/
  app/
    routes/
    layout/
    providers/
  components/
    common/
    forms/
    rating/
    photos/
  domain/
    entities.ts
    validation.ts
  storage/
    db.ts
    repositories/
    photoStorage/
    importExport/
  metadata/
    providers/
    types.ts
  pwa/
  styles/
  tests/
```

## 17. Accessibility Requirements

- All controls must be reachable by keyboard.
- Forms must use labels associated with inputs.
- Rating controls must expose accessible names and selected values.
- Color cannot be the only indicator of state.
- Photo upload controls need visible labels.
- Tap targets should be comfortable on mobile.
- Text should remain readable at mobile widths.

## 18. Security And Privacy

- Treat meal records and companion names as private personal data.
- Keep data local by default.
- Do not send user-created data to third parties unless explicitly requested by the user.
- Store external provider API keys only in a backend or serverless function later, not in the static client.
- Make export and deletion controls clear.

## 19. Testing Strategy

### Unit Tests

- Entity validation.
- Repository CRUD behavior.
- Import/export behavior.
- Search behavior.
- Photo storage helpers.

### Integration Tests

- Add restaurant.
- Add meal visit.
- Add dish to meal.
- Attach person to meal.
- Export and import data.

### E2E Smoke Tests

- App loads offline after first visit.
- User can create a restaurant and meal on mobile viewport.
- Restaurant detail shows the saved meal.
- Search finds saved restaurant and dish.

## 20. Implementation Phases

### Phase 1: Static Local MVP

- Create Vite React TypeScript PWA.
- Define domain models and validation.
- Implement IndexedDB storage with Dexie.
- Implement basic routes and navigation.
- Implement restaurants, meals, dishes, people.
- Implement add-meal flow.
- Implement local photo storage.
- Implement search.
- Implement import/export.
- Add PWA manifest and service worker.
- Add focused tests.

### Phase 2: Better Recall And Polish

- Improve restaurant detail timeline.
- Add dish history.
- Add person detail insights.
- Add tags and saved filters.
- Add draft autosave.
- Add better photo gallery.
- Add map/directions links.

### Phase 3: Metadata And Sync Readiness

- Add restaurant metadata provider interface.
- Add first metadata provider behind a safe backend/serverless boundary.
- Add sync provider interface.
- Add change tracking.
- Add optional remote storage provider for photos.

### Phase 4: Cloud Sync

- Add authentication.
- Add remote database.
- Add conflict resolution.
- Add cross-device sync.
- Add shared household or family workspace if desired.

## 21. Open Product Questions

- Should the first version support multiple primary users, or only local profiles?
- Should ratings be 5-star, 10-point, thumbs up/down, or a custom scale?
- Should photos be compressed automatically before storage?
- Should meal visits support takeout and delivery as first-class modes?
- Should restaurant metadata use Yelp, Google Places, or a lower-cost/open provider first?
- Should the app support private notes per person?

Recommended MVP decisions:

- Use a 5-point rating scale with half steps optional later.
- Support takeout and delivery as occasion tags.
- Compress large photos before local storage.
- Use manual restaurant entry first.
- Treat profiles as local people, not login accounts.

## 22. Acceptance Criteria For MVP

- The app can be installed as a PWA.
- The app works on a mobile viewport.
- The app can create, edit, list, view, and soft-delete restaurants.
- The app can create meal visits tied to restaurants.
- The app can attach profiles to meal visits.
- The app can create dishes tied to restaurants.
- The app can attach dishes to meal visits.
- The app can store ratings, notes, modification notes, and tags.
- The app can attach photos locally.
- The app can search across core entities.
- The app can export and import user data.
- The app can be deployed as a static site without a backend.

## 23. Prompt For An AI Coding Agent

Use this prompt to generate the first implementation:

```text
You are building Meal Memory, a mobile-first local-first PWA for tracking restaurant meals.

Read PROJECT_DESIGN.md completely before making changes.

Build the MVP as a static PWA with:
- Vite
- React
- TypeScript
- React Router
- Dexie for IndexedDB
- Zod for validation
- Vitest for unit tests

Do not require a backend. All user-created data must persist locally in IndexedDB.

Implement:
- Restaurant CRUD
- Profile CRUD
- Dish CRUD
- Meal visit CRUD
- Add meal flow
- Dish entries within a meal
- Ratings, notes, modification notes, tags, and attendees
- Local photo upload stored in IndexedDB
- Mobile-first responsive UI
- Search across restaurants, dishes, notes, tags, and people
- JSON export/import for non-binary data
- PWA manifest and offline app shell

Architecture requirements:
- Keep domain types in src/domain.
- Keep storage behind repository interfaces.
- Do not call IndexedDB directly from React components.
- Put restaurant metadata lookup behind a provider interface, but implement only a manual provider for MVP.
- Put photo persistence behind a PhotoStorageProvider interface.
- Use stable client-generated IDs.
- Include createdAt, updatedAt, deletedAt, and schemaVersion on persisted entities.

UX requirements:
- The first screen should be the usable app dashboard, not a marketing landing page.
- The interface must be comfortable on mobile.
- The add-meal form should allow saving with only restaurant and visit date.
- Make "order again" and "modifications for next time" easy to see.
- Keep all fields optional unless required by the data model.

Testing requirements:
- Add unit tests for validation, repositories, search, and import/export.
- Add at least one end-to-end or integration smoke test that creates a restaurant and meal.

After implementation:
- Run typecheck, tests, and build.
- Start the dev server and report the local URL.
- Summarize what was built and any remaining gaps.
```

