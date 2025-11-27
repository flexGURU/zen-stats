ALTER TABLE "sensor_readings" DROP CONSTRAINT "fk_device_id";

DROP TABLE IF EXISTS "sensor_readings";
DROP TABLE IF EXISTS "device";