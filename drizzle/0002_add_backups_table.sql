-- create backups table used by frontend and API
CREATE TABLE IF NOT EXISTS backups (
  id serial PRIMARY KEY,
  name varchar(200) NOT NULL,
  size_bytes bigint NOT NULL DEFAULT 0,
  drive_file_id varchar(200),
  drive_url varchar(500),
  type varchar(20) NOT NULL,
  status varchar(20) NOT NULL,
  error_message text,
  tables jsonb,
  row_count integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now()
);
