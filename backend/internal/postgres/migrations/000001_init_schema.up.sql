CREATE TABLE "device" (
    "id" bigserial PRIMARY KEY,
    "name" varchar(100) NOT NULL,
    "status" boolean NOT NULL DEFAULT true,
    "deleted" boolean NOT NULL DEFAULT false,
    "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "sensor_readings" (
    "id" bigserial PRIMARY KEY,
    "device_id" bigint NOT NULL,
    "payload" jsonb,
    "timestamp" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT "fk_device_id" FOREIGN KEY("device_id") REFERENCES "device" ("id")
);

CREATE INDEX idx_sensor_device_ts ON sensor_readings(device_id, timestamp);