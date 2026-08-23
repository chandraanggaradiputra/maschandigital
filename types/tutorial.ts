export interface TutorialChapter {
  slug: string;
  title: string;
  shortDescription: string;
  estimatedMinutes: number;
  content: {
    overview: string;
    steps: {
      title: string;
      description: string;
      tips?: string;
    }[];
    proTip?: string;
    faq?: { question: string; answer: string }[];
  };
}

export interface TutorialModule {
  id: string;
  moduleNumber: number;
  title: string;
  description: string;
  iconName: string;
  chapters: TutorialChapter[];
}
