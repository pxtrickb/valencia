import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, index, unique } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role"),
  banned: integer("banned", { mode: "boolean" }).default(false),
  banReason: text("ban_reason"),
  banExpires: integer("ban_expires", { mode: "timestamp_ms" }),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// Businesses table - for business owners who can manage spots
export const businesses = sqliteTable(
  "businesses",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    identifier: text("identifier").notNull(), // Tax ID or business identifier
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    website: text("website"),
    status: text("status", {
      enum: ["pending", "approved", "rejected"],
    })
      .default("pending")
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("businesses_userId_idx").on(table.userId),
    index("businesses_status_idx").on(table.status),
  ]
);

// Spots table - restaurants, cafes, shops, museums, etc.
export const spots = sqliteTable(
  "spots",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    category: text("category").notNull(), // e.g., "Restaurant", "Café", "Museum", "Shop"
    shortCategory: text("short_category").notNull(), // e.g., "RESTAURANT", "CAFÉ"
    description: text("description").notNull(), // Short description
    fullDescription: text("full_description"), // Full detailed description
    location: text("location").notNull(), // e.g., "Malvarrosa Beach", "El Carmen"
    address: text("address").notNull(), // Full street address
    priceRange: text("price_range"), // "$", "$$", "$$$"
    hours: text("hours"), // JSON string: {"monday": "10:00 - 20:00", ...}
    phone: text("phone"),
    website: text("website"),
    image: text("image"), // Main/primary image URL
    businessId: text("business_id").references(() => businesses.id, {
      onDelete: "set null",
    }), // Nullable - can be managed by business or admin
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("spots_category_idx").on(table.category),
    index("spots_location_idx").on(table.location),
    index("spots_businessId_idx").on(table.businessId),
  ]
);

// Landmarks table - historical/cultural sites
export const landmarks = sqliteTable(
  "landmarks",
  {
    id: text("id").primaryKey(),
    category: text("category").notNull(), // e.g., "GOTHIC MASTERPIECE", "UNESCO HERITAGE"
    title: text("title").notNull(),
    description: text("description").notNull(), // Short description
    fullDescription: text("full_description"), // Full detailed description
    location: text("location").notNull(), // e.g., "Old Town", "Turia Gardens"
    address: text("address").notNull(), // Full street address
    hours: text("hours"), // JSON string: {"monday": "10:00 - 18:30", ...}
    admission: text("admission"), // e.g., "€8", "Free", "Varies by attraction"
    website: text("website"),
    image: text("image"), // Main/primary image URL
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("landmarks_category_idx").on(table.category),
    index("landmarks_location_idx").on(table.location),
  ]
);

// Images table - for storing multiple images per spot/landmark
export const images = sqliteTable(
  "images",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    entityType: text("entity_type", { enum: ["spot", "landmark"] }).notNull(),
    entityId: text("entity_id").notNull(), // Can be integer (spot) or CUID (landmark) stored as text
    url: text("url").notNull(),
    isPrimary: integer("is_primary", { mode: "boolean" }).default(false).notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("images_entity_idx").on(table.entityType, table.entityId),
    index("images_primary_idx").on(table.entityType, table.entityId, table.isPrimary),
  ]
);

// Reviews table - user reviews for spots and landmarks
export const reviews = sqliteTable(
  "reviews",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    itemType: text("item_type", { enum: ["spot", "landmark"] }).notNull(),
    itemId: text("item_id").notNull(), // Can be integer (spot) or CUID (landmark) stored as text
    rating: integer("rating").notNull(), // 1-5 stars
    comment: text("comment").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("reviews_userId_idx").on(table.userId),
    index("reviews_item_idx").on(table.itemType, table.itemId),
    unique("reviews_user_item_unique").on(table.userId, table.itemType, table.itemId), // One review per user per item
  ]
);

// Bucket list table - user's bucket list items
export const bucketList = sqliteTable(
  "bucket_list",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    itemType: text("item_type", { enum: ["spot", "landmark"] }).notNull(),
    itemId: text("item_id").notNull(), // Can be integer (spot) or CUID (landmark) stored as text
    status: text("status", { enum: ["bucketlisted", "visited"] })
      .default("bucketlisted")
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("bucketList_userId_idx").on(table.userId),
    index("bucketList_item_idx").on(table.itemType, table.itemId),
    unique("bucketList_user_item_unique").on(table.userId, table.itemType, table.itemId), // One entry per user per item
  ]
);

// Relations

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  user: one(user, {
    fields: [businesses.userId],
    references: [user.id],
  }),
  spots: many(spots),
}));

export const spotsRelations = relations(spots, ({ one }) => ({
  business: one(businesses, {
    fields: [spots.businessId],
    references: [businesses.id],
  }),
}));

export const landmarksRelations = relations(landmarks, () => ({}));

// Note: images, reviews, and bucketList use polymorphic relationships (entityType/itemType + entityId/itemId)
// Drizzle doesn't support polymorphic relations directly, so we define simple relations here
// and handle the polymorphic logic in application code

export const imagesRelations = relations(images, () => ({}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(user, {
    fields: [reviews.userId],
    references: [user.id],
  }),
}));

export const bucketListRelations = relations(bucketList, ({ one }) => ({
  user: one(user, {
    fields: [bucketList.userId],
    references: [user.id],
  }),
}));

// User relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  businesses: many(businesses),
  reviews: many(reviews),
  bucketListItems: many(bucketList),
}));
