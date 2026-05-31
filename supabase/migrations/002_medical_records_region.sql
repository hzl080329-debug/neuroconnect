-- 就诊经历增加地区字段
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;

-- 地区索引
CREATE INDEX IF NOT EXISTS idx_medical_records_region ON medical_records(region);
CREATE INDEX IF NOT EXISTS idx_medical_records_city ON medical_records(city);
