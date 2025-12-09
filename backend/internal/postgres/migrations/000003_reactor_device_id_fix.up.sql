ALTER TABLE reactors DROP CONSTRAINT reactors_devices_device_id_key;
ALTER TABLE reactors DROP COLUMN device_id;
ALTER TABLE device ADD COLUMN reactor_id bigint NULL;
ALTER TABLE device ADD CONSTRAINT device_reactors_reactor_id_fkey FOREIGN KEY(reactor_id) REFERENCES reactors(id);