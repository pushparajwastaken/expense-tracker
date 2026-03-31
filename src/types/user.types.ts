export type User = {
  username: string;
  email: string;
  telegramId?: string;
  isOnboarded: boolean;
  budget?: number;
  createdAt: Date;
};
