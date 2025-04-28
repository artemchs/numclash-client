export interface Invite {
  from: {
    id: string;
    email: string;
    name: string | null;
  };
  id: string;
  createdAt: Date;
  updatedAt: Date;
  gameId: string;
  toId: string;
  fromId: string;
}
