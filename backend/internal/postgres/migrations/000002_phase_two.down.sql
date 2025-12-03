ALTER TABLE "reactors" DROP CONSTRAINT "reactors_devices_device_id_key";
ALTER TABLE "experiments" DROP CONSTRAINT "experiments_reactors_reactor_id_fkey";

DROP TABLE "experiments";
DROP TABLE "reactors";
DROP TABLE "users";