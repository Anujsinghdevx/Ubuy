import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      username: string;
    } & DefaultSession['user'];
  }

  interface User {
    _id?: string;
    username?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    _id?: string;
    username?: string;
  }
}
