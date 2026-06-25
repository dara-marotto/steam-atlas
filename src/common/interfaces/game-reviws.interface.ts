export interface GameReviewsInterface {
  summary: ReviewsSummary;
  reviews: Reviews;
};

export interface Reviews {
  user: ReviewUser;
  reviewContent: ReviewContent;
};

export interface ReviewsSummary {
  reviewScore: number;
  reviewScoreDesc: string;
  totalReviews: number;
  totalPositive: number;
  totalNegative: number;
};

export interface ReviewUser {
  authorId: string;
  authorName: string;
  profileUrl: string;
};

export interface ReviewContent {
    reviewId: string;
    language: string;
    review: string;
    timeCreated: string;
    timeUpdated: string;
    votedUp: boolean;
    votesUp: number;
    votesFunny: number;
    commentCount: number;
};
