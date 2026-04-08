import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { toBackendUrl } from '@/lib/backend-api';

type BackendMeUser = {
  userId?: string;
  id?: string;
  _id?: string;
  email?: string;
  username?: string;
  name?: string;
  image?: string;
  provider?: string;
};

const extractMeUser = (payload: unknown): BackendMeUser | undefined => {
  if (!payload || typeof payload !== 'object') return undefined;

  const record = payload as Record<string, unknown>;
  const nestedUser = record.user;
  if (nestedUser && typeof nestedUser === 'object') {
    return nestedUser as BackendMeUser;
  }

  const legacyData = record.data;
  if (legacyData && typeof legacyData === 'object') {
    return legacyData as BackendMeUser;
  }

  return record as BackendMeUser;
};

const fetchCurrentUser = async (accessToken: string): Promise<BackendMeUser | undefined> => {
  const meRes = await fetch(toBackendUrl('/v1/auth/me'), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!meRes.ok) return undefined;

  const mePayload = await meRes.json();
  return extractMeUser(mePayload);
};

declare module 'next-auth' {
  interface User {
    authProvider?: string;
    accessToken?: string;
  }

  interface Session {
    accessToken?: string;
    user: User & {
      authProvider?: string;
      accessToken?: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      //@ts-expect-error : Ignoring type error here
      async authorize(credentials) {
        if (!credentials || !credentials.identifier || !credentials.password) {
          throw new Error('Missing credentials');
        }

        try {
          const response = await fetch(toBackendUrl('/v1/auth/login'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.identifier,
              password: credentials.password,
            }),
          });

          const payload = await response.json();

          if (!response.ok) {
            throw new Error(payload?.message || 'Invalid credentials');
          }

          const accessToken = payload?.access_token || payload?.accessToken || payload?.token;

          if (!accessToken) throw new Error('Invalid login response from backend');

          let meData: BackendMeUser | undefined;
          try {
            meData = await fetchCurrentUser(accessToken);
          } catch {
            // Keep graceful fallback if profile hydration fails.
          }

          const id = String(
            (meData?.userId as string) ||
            (meData?.id as string) ||
            (meData?._id as string) ||
            credentials.identifier
          );
          const username =
            (meData?.username as string) ||
            (meData?.name as string) ||
            credentials.identifier;
          const email =
            (meData?.email as string) || credentials.identifier;

          return {
            _id: id,
            username,
            email,
            name: (meData?.name as string) || username,
            image: meData?.image,
            authProvider: 'User',
            accessToken,
          };
        } catch (err) {
          if (err instanceof Error) {
            throw new Error(err.message || 'An error occurred during authentication');
          } else {
            // Fallback in case the error doesn't have the expected shape
            throw new Error('An unknown error occurred during authentication');
          }
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const idToken = (account as Record<string, unknown>)?.id_token;
        console.log('[auth][google] signIn start', {
          hasIdToken: typeof idToken === 'string' && idToken.length > 0,
          provider: account?.provider,
          email: user?.email,
        });

        if (typeof idToken !== 'string' || !idToken) {
          console.error('[auth][google] Missing id_token in account payload');
          return false;
        }

        try {
          const backendUrl = toBackendUrl('/v1/auth/google');
          console.log('[auth][google] Calling backend', { backendUrl });

          const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
          });

          const rawText = await response.text();
          let payload: Record<string, unknown> | null = null;
          try {
            payload = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : null;
          } catch {
            // keep rawText for diagnostics
          }

          if (!response.ok) {
            console.error('[auth][google] Backend rejected token', {
              status: response.status,
              statusText: response.statusText,
              body: payload ?? rawText,
            });
            return false;
          }

          const accessToken =
            (payload?.access_token as string | undefined) ||
            (payload?.accessToken as string | undefined) ||
            (payload?.token as string | undefined);
          const backendUser = payload?.user as BackendMeUser | undefined;

          if (!accessToken || !backendUser) {
            console.error('[auth][google] Invalid backend payload', {
              hasAccessToken: Boolean(accessToken),
              hasUser: Boolean(backendUser),
              payload,
            });
            return false;
          }

          let meUser: BackendMeUser | undefined;
          try {
            meUser = await fetchCurrentUser(accessToken);
          } catch {
            // If /me fails, continue with payload.user for compatibility.
          }

          const hydratedUser = meUser || (backendUser as BackendMeUser);

          user.id = String(
            hydratedUser.userId ||
              hydratedUser.id ||
              hydratedUser._id ||
              user.id ||
              user.email ||
              ''
          );
          user.username = hydratedUser.username || hydratedUser.name || user.name || '';
          user.name = hydratedUser.name || user.name || user.username;
          user.email = hydratedUser.email || user.email || '';
          user.image = hydratedUser.image || user.image;
          user.authProvider = hydratedUser.provider === 'google' ? 'AuthUser' : 'User';
          user.accessToken = accessToken;

          console.log('[auth][google] Sign-in success', {
            userId: user.id,
            email: user.email,
          });
        } catch (error) {
          console.error('[auth][google] Exception in signIn callback', error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user?._id || user?.id;
        token.username = user.username;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.authProvider = user.authProvider;
        token.accessToken = user.accessToken;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username;
        session.user.name = (token.name as string) || session.user.name;
        session.user.email = (token.email as string) || session.user.email;
        session.user.image = (token.picture as string) || session.user.image;
        session.user.authProvider = token.authProvider as string;
        session.accessToken = token.accessToken as string | undefined;
        session.user.accessToken = token.accessToken as string | undefined;
      }
      return session;
    },

    async redirect({ baseUrl }) {
      return baseUrl;
    },
  },

  session: {
    strategy: 'jwt',
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/sign-in',
  },
};
