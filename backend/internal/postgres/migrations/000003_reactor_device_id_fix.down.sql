ALTER TABLE device DROP CONSTRAINT device_reactors_reactor_id_fkey;
ALTER TABLE device DROP COLUMN reactor_id;
ALTER TABLE reactors ADD COLUMN device_id bigint UNIQUE NOT NULL DEFAULT 1;
ALTER TABLE reactors ADD CONSTRAINT reactors_devices_device_id_key FOREIGN KEY (device_id) REFERENCES device (id);