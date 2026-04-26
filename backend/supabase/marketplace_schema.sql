-- 5. marketplace_products (Toko/Marketplace)
CREATE TABLE marketplace_products (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_name    TEXT NOT NULL,
  seller_phone   TEXT NOT NULL,
  seller_avatar  TEXT,
  title          TEXT NOT NULL,
  description    TEXT,
  price          INTEGER NOT NULL,
  stock          INTEGER NOT NULL DEFAULT 0,
  unit           TEXT NOT NULL DEFAULT 'kg',
  category       TEXT NOT NULL, -- sayuran, buah, bibit, pupuk
  image_url      TEXT,
  location       TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read products" ON marketplace_products FOR SELECT TO anon USING (true);
CREATE POLICY "public insert products" ON marketplace_products FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public update products" ON marketplace_products FOR UPDATE TO anon USING (true);

-- Seed data awal untuk marketplace
INSERT INTO marketplace_products (seller_name, seller_phone, title, description, price, stock, unit, category, location, image_url)
VALUES 
  ('Pak Budi', '6281234567890', 'Cabai Merah Keriting Segar (Panen Hari Ini)', 'Cabai merah keriting kualitas super, petik langsung dari kebun di Lembang. Cocok untuk restoran atau rumah makan.', 42000, 50, 'kg', 'sayuran', 'Lembang, Jawa Barat', 'https://images.unsplash.com/photo-1596647963473-b26a6c23cecc?auto=format&fit=crop&q=80&w=400'),
  ('Bu Siti Farm', '628987654321', 'Bawang Merah Brebes Pilihan', 'Bawang merah Brebes asli, ukuran besar dan kering. Tahan disimpan lama.', 32000, 100, 'kg', 'sayuran', 'Brebes, Jawa Tengah', 'https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?auto=format&fit=crop&q=80&w=400'),
  ('Agro Mandiri', '628111222333', 'Bibit Padi Inpari 32 (Sertifikat)', 'Bibit padi unggul Inpari 32 tahan wereng. Kemasan 5kg bersertifikat.', 75000, 20, 'sak (5kg)', 'bibit', 'Subang, Jawa Barat', 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?auto=format&fit=crop&q=80&w=400'),
  ('Toko Tani Makmur', '628555666777', 'Pupuk NPK Mutiara 16-16-16', 'Pupuk NPK Mutiara asli kemasan ecer. Cocok untuk masa vegetatif tanaman.', 18000, 200, 'kg', 'pupuk', 'Malang, Jawa Timur', 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&q=80&w=400');
