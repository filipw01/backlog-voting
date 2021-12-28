export {};

declare global {
  interface Window {
    ENV: {
      GOOGLE_CLIENT_ID: string;
    };
  }
}
