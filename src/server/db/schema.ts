import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `dans-lists_${name}`);

const commonFields = {
  id: varchar("id").primaryKey(),
  createdAt: timestamp("created_at", { mode: "date", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", precision: 3 })
    .$onUpdate(() => new Date())
    .notNull(),
};

export const lists = createTable(
  "list",
  {
    ...commonFields,

    title: text("title").notNull(),
    rank: text("rank").notNull(),

    repeatsMon: boolean("repeats_mon").default(true).notNull(),
    repeatsTue: boolean("repeats_tue").default(true).notNull(),
    repeatsWed: boolean("repeats_wed").default(true).notNull(),
    repeatsThu: boolean("repeats_thu").default(true).notNull(),
    repeatsFri: boolean("repeats_fri").default(true).notNull(),
    repeatsSat: boolean("repeats_sat").default(true).notNull(),
    repeatsSun: boolean("repeats_sun").default(true).notNull(),

    startMinutes: integer("start_minutes"),
    endMinutes: integer("end_minutes"),

    ownerId: varchar("owner_id")
      .references(() => users.id)
      .notNull(),
  },
  (list) => ({
    ownerIdx: index("list_owner_idx").on(list.ownerId),
    rankIdx: index("list_rank_idx").on(list.rank),
  }),
);

export const listRelations = relations(lists, ({ one, many }) => ({
  user: one(users, { fields: [lists.ownerId], references: [users.id] }),
  items: many(items),
}));

export const items = createTable(
  "item",
  {
    ...commonFields,

    title: text("title").notNull(),
    rank: text("rank").notNull(),
    shuffleMode: boolean("shuffle_mode").default(false).notNull(),

    listId: varchar("list_id")
      .references(() => lists.id, { onDelete: "cascade" })
      .notNull(),
  },
  (item) => ({
    listIdx: index("item_list_idx").on(item.listId),
    rankIdx: index("item_rank_idx").on(item.rank),
  }),
);

export const itemRelations = relations(items, ({ one, many }) => ({
  list: one(lists, { fields: [items.listId], references: [lists.id] }),
  shuffleChoices: many(shuffleChoices),
  events: many(events),
}));

export const shuffleChoices = createTable(
  "shuffle_choice",
  {
    ...commonFields,

    title: text("title").notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),

    itemId: varchar("item_id")
      .references(() => items.id, { onDelete: "cascade" })
      .notNull(),
  },
  (shuffleChoice) => ({
    itemIdx: index("shuffle_choice_item_idx").on(shuffleChoice.itemId),
  }),
);

export const shuffleChoicesRelations = relations(
  shuffleChoices,
  ({ one, many }) => ({
    item: one(items, {
      fields: [shuffleChoices.itemId],
      references: [items.id],
    }),
    events: many(events),
  }),
);

export const events = createTable(
  "event",
  {
    ...commonFields,

    streak: integer("streak").default(0).notNull(),

    itemId: varchar("item_id")
      .references(() => items.id, { onDelete: "cascade" })
      .notNull(),
    statusId: varchar("status_id")
      .references(() => statuses.id)
      .notNull(),
    shuffleChoiceId: varchar("shuffle_choice_id").references(
      () => shuffleChoices.id,
    ),
  },
  (event) => ({
    itemIdx: index("event_item_idx").on(event.itemId),
    statusIdx: index("event_status_idx").on(event.statusId),
  }),
);

export const eventRelations = relations(events, ({ one }) => ({
  item: one(items, { fields: [events.itemId], references: [items.id] }),
  status: one(statuses, {
    fields: [events.statusId],
    references: [statuses.id],
  }),
  shuffleChoice: one(shuffleChoices, {
    fields: [events.shuffleChoiceId],
    references: [shuffleChoices.id],
  }),
}));

export const statuses = createTable("status", {
  id: varchar("id").primaryKey(),
  name: text("name").unique().notNull(),
});

export const users = createTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  lists: many(lists),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);
