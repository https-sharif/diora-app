export interface Comment {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  postId?: string;
  text: string;
  createdAt: string;
  replies?: Comment[];
}
