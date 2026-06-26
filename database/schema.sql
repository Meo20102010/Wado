-- PostgreSQL Database Schema for Wado Platform

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  bio TEXT DEFAULT '',
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  banned BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(500),
  reset_token VARCHAR(500),
  reset_token_expires TIMESTAMP,
  social_links JSONB DEFAULT '{}',
  badges TEXT[] DEFAULT '{}',
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('apk', 'exe')),
  category VARCHAR(50) NOT NULL,
  version VARCHAR(20) DEFAULT '1.0.0',
  price DECIMAL(10,2) DEFAULT 0,
  file_url VARCHAR(500),
  file_size BIGINT DEFAULT 0,
  screenshots TEXT[] DEFAULT '{}',
  downloads INT DEFAULT 0,
  views INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  contact JSONB DEFAULT '{}',
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project comments
CREATE TABLE IF NOT EXISTS project_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project ratings
CREATE TABLE IF NOT EXISTS project_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, user_id)
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) DEFAULT 'system',
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ads
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'banner',
  code TEXT NOT NULL,
  position VARCHAR(50) NOT NULL DEFAULT 'top',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Site settings
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AdSense settings (Google AdSense configuration)
CREATE TABLE IF NOT EXISTS adsense_settings (
  id SERIAL PRIMARY KEY,
  client_id VARCHAR(100) NOT NULL DEFAULT '',
  ad_code VARCHAR(200) NOT NULL DEFAULT '',
  position VARCHAR(50) NOT NULL DEFAULT 'home_top',
  is_active BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Root files table (served at site root: sw.js, ads.txt, etc.)
CREATE TABLE IF NOT EXISTS root_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  content_type VARCHAR(100) DEFAULT 'text/plain',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
  ('Android Uygulamaları', 'android', 'Android işletim sistemi için geliştirilmiş uygulamalar'),
  ('Windows Programları', 'windows', 'Windows işletim sistemi için geliştirilmiş programlar'),
  ('Oyunlar', 'games', 'Her türlü dijital oyun'),
  ('Araçlar', 'tools', 'Günlük kullanım için pratik araçlar'),
  ('Eğitim Yazılımları', 'education', 'Eğitim amaçlı yazılımlar')
ON CONFLICT (slug) DO NOTHING;

-- Insert default admin user (password: 20102010)
INSERT INTO users (username, email, password, role, email_verified) VALUES
  ('admin', 'ibrahimseleme0@gmail.com', '$2a$10$z9YBNOUyB3mfmCTfjV3hQOa81tdFyTuRlXtajc1iCzsMsq/8OqjQG', 'admin', true)
ON CONFLICT (username) DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
  ('site_name', 'Wado'),
  ('site_description', 'APK, EXE ve Yazılım Dünyası'),
  ('site_keywords', 'wado, apk, exe, yazılım, uygulama'),
  ('site_url', 'http://localhost:3000'),
  ('contact_email', ''),
  ('maintenance_mode', 'false'),
  ('allow_registration', 'true')
ON CONFLICT (key) DO NOTHING;
