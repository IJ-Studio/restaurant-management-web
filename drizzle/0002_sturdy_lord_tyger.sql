CREATE TABLE "backups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"size_bytes" bigint DEFAULT 0 NOT NULL,
	"drive_file_id" varchar(200),
	"drive_url" varchar(500),
	"type" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL,
	"error_message" text,
	"tables" jsonb,
	"row_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventario_mermas" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer,
	"product_name" text NOT NULL,
	"quantity" numeric(10, 3) NOT NULL,
	"unit" varchar(20) NOT NULL,
	"reason" varchar(50) NOT NULL,
	"justification" text NOT NULL,
	"reported_by" text DEFAULT '' NOT NULL,
	"cost" numeric(10, 2) DEFAULT '0' NOT NULL,
	"date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inventario_productos" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sku" varchar(50) DEFAULT '' NOT NULL,
	"category" varchar(50) NOT NULL,
	"unit" varchar(20) DEFAULT 'pza' NOT NULL,
	"stock" numeric(10, 3) DEFAULT '0' NOT NULL,
	"min_stock" numeric(10, 3) DEFAULT '0' NOT NULL,
	"max_stock" numeric(10, 3) DEFAULT '100' NOT NULL,
	"cost_per_unit" numeric(10, 2) DEFAULT '0' NOT NULL,
	"supplier" text DEFAULT '' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inventario_ordenes" (
	"id" serial PRIMARY KEY NOT NULL,
	"folio" varchar(30) NOT NULL,
	"supplier_id" integer,
	"supplier_name" text NOT NULL,
	"status" varchar(30) DEFAULT 'borrador' NOT NULL,
	"items" json DEFAULT '[]'::json NOT NULL,
	"total" numeric(10, 2) DEFAULT '0' NOT NULL,
	"expected_at" text,
	"received_at" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inventario_proveedores" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"contact" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"website" text,
	"address" text,
	"category" text DEFAULT '' NOT NULL,
	"products" json DEFAULT '[]'::json NOT NULL,
	"payment_terms" text DEFAULT 'Contado' NOT NULL,
	"delivery_days" integer DEFAULT 1 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "inventario_mermas" ADD CONSTRAINT "inventario_mermas_product_id_inventario_productos_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."inventario_productos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventario_ordenes" ADD CONSTRAINT "inventario_ordenes_supplier_id_inventario_proveedores_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."inventario_proveedores"("id") ON DELETE no action ON UPDATE no action;