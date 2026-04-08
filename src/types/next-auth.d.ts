import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name: string;
      email: string;
      username: string;
      accessToken?: string;
    } & DefaultSession['user'];
  }

  interface User {
    _id?: string;
    username?: string;
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    _id?: string;
    username?: string;
    accessToken?: string;
  }
}
