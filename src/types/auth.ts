export interface User {
  id: string;
  email?: string;
  app_metadata: {
    provider?: string;
    [key: string]: unknown;
  };
  user_metadata: {
    username?: string;
    [key: string]: unknown;
  };
  aud: string;
}
