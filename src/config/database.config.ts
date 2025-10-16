import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.DATABASE_URL,
  name: process.env.DATABASE_NAME,
}));