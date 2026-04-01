export type User = {
  username: string;
  email: string;
  telegramId?: string;
  isOnBoarded: boolean;
  budget?: number;
  createdAt: Date;
};
