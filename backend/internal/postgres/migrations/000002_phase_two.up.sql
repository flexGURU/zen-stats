CREATE TYPE role AS ENUM ('admin', 'user');

CREATE TABLE "users" (
  "id" bigserial PRIMARY KEY,
  "name" varchar(50) NOT NULL,
  "email" varchar(50) UNIQUE NOT NULL,
  "phone_number" varchar(50) UNIQUE NULL,
  "password" varchar(255) NOT NULL,
  "role" role NOT NULL DEFAULT 'user',
  "is_active" boolean NOT NULL DEFAULT true,
  "refresh_token" text NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE INDEX "users_email_idx" ON "users" ("email");

CREATE TABLE "reactors" (
    "id" bigserial PRIMARY KEY,
    "device_id" bigint UNIQUE NOT NULL,
    "name" varchar(100) NOT NULL,
    "status" varchar(50) NOT NULL,
    "pathway" varchar(100) NULL,
    "pdf_url" text NULL,
    "deleted_at" timestamptz NULL,
    "created_at" timestamptz NOT NULL DEFAULT (now()),

    CONSTRAINT "reactors_devices_device_id_key" FOREIGN KEY ("device_id") REFERENCES "device" ("id")
);

CREATE TABLE "experiments" (
    "id" bigserial PRIMARY KEY,
    "batch_id" varchar(100) NOT NULL,
    "operator" varchar(100) NOT NULL,
    "date" timestamptz NOT NULL,
    "reactor_id" bigint NOT NULL,
    "block_id" varchar(100) NOT NULL,
    "time_start" time NOT NULL,
    "time_end" time NOT NULL,

    "material_feedstock" jsonb NOT NULL,
    "exposure_conditions" jsonb NOT NULL,
    "analtical_tests" jsonb NOT NULL,

    "deleted_at" timestamptz NULL,
    "created_at" timestamptz NOT NULL DEFAULT (now()),

    CONSTRAINT "experiments_reactors_reactor_id_fkey" FOREIGN KEY ("reactor_id") REFERENCES "reactors" ("id")
);

CREATE INDEX "experiments_reactor_id_idx" ON "experiments" ("reactor_id");
CREATE INDEX "experiments_date_idx" ON "experiments" ("date");
