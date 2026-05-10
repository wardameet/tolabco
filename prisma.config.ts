import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: 'postgresql://studenthub_user:Studenthub123!@localhost:5432/studenthub_db?schema=public'
  },
});
