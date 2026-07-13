import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';

dotenv.config();

// Session-mode pooler (port 5432) for migrations — password URL-encoded (@ → %40)
const MIGRATION_URL = "postgresql://postgres.wjsbehweqjcduksmains:Saathi%40123ANSH@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

export default defineConfig({
  datasource: {
    url: MIGRATION_URL,
  },
});
