// 用户数据类型定义
export interface User {
  id: string;
  username: string;
  password: string;
  createdAt: Date;
}

// 评测题目的数据类型定义
export interface EvaluationQuestion {
  id: number;
  title: string;
  answers: Answer[];
}

// 答案的数据类型定义
export interface Answer {
  id: string;
  imageUrl: string;
  title: string;
  description?: string;
}

// 评分维度
export interface ScoreDimension {
  key: string;
  name: string;
  description: string;
}

// 单项评分
export interface Score {
  dimension: string;
  value: number; // 1-5分
}

// 答案评分
export interface AnswerRating {
  answerId: string;
  scores: Score[];
  totalScore: number;
}

// 题目评分
export interface QuestionRating {
  questionId: number;
  answerRatings: AnswerRating[];
}

// 用户评测结果
export interface UserEvaluationResult {
  userId: string;
  questionRatings: QuestionRating[];
  completedAt?: Date;
}

// 整体评测结果
export interface EvaluationResult {
  questionRatings: QuestionRating[];
  completedAt?: Date;
}

// 评分维度定义
export const SCORE_DIMENSIONS: ScoreDimension[] = [
  {
    key: 'intuitive',
    name: '结果直观度',
    description: '结果展示是否清晰易懂'
  },
  {
    key: 'professional',
    name: '结果专业度', 
    description: '内容是否专业准确'
  },
  {
    key: 'data_sufficiency',
    name: '数据充分性',
    description: '数据是否全面充分'
  },
  {
    key: 'guidance',
    name: '结果指导性',
    description: '结果是否具有指导价值'
  }
];

// 模拟数据
export const MOCK_EVALUATION_DATA: EvaluationQuestion[] = [
  {
    id: 1,
    title: "请评估以下AI助手对于'如何制定营销策略'问题的回答质量",
    answers: [
      {
        id: "1-1",
        imageUrl: "/api/placeholder/600/400",
        title: "答案A",
        description: "AI助手回答截图A"
      },
      {
        id: "1-2", 
        imageUrl: "/api/placeholder/600/400",
        title: "答案B",
        description: "AI助手回答截图B"
      },
      {
        id: "1-3",
        imageUrl: "/api/placeholder/600/400", 
        title: "答案C",
        description: "AI助手回答截图C"
      },
      {
        id: "1-4",
        imageUrl: "/api/placeholder/600/400",
        title: "答案D", 
        description: "AI助手回答截图D"
      },
      {
        id: "1-5",
        imageUrl: "/api/placeholder/600/400",
        title: "答案E",
        description: "AI助手回答截图E"
      }
    ]
  },
  {
    id: 2,
    title: "请评估以下AI助手对于'数据分析报告撰写'问题的回答质量",
    answers: [
      {
        id: "2-1",
        imageUrl: "/api/placeholder/600/400",
        title: "答案A",
        description: "AI助手回答截图A"
      },
      {
        id: "2-2",
        imageUrl: "/api/placeholder/600/400", 
        title: "答案B",
        description: "AI助手回答截图B"
      },
      {
        id: "2-3",
        imageUrl: "/api/placeholder/600/400",
        title: "答案C", 
        description: "AI助手回答截图C"
      },
      {
        id: "2-4",
        imageUrl: "/api/placeholder/600/400",
        title: "答案D",
        description: "AI助手回答截图D"
      },
      {
        id: "2-5",
        imageUrl: "/api/placeholder/600/400",
        title: "答案E",
        description: "AI助手回答截图E"
      }
    ]
  }
  // 这里可以继续添加更多题目，总共20道题
];

// 生成完整的20道题目
export const generateMockData = (): EvaluationQuestion[] => {
  const topics = [
    "如何制定营销策略",
    "数据分析报告撰写", 
    "项目管理最佳实践",
    "用户体验设计原则",
    "产品需求分析方法",
    "团队协作工具选择",
    "代码质量提升建议",
    "系统架构设计思路",
    "性能优化解决方案",
    "安全防护措施建议",
    "数据库设计规范",
    "API接口设计标准",
    "移动端开发注意事项",
    "前端框架选择依据",
    "后端服务部署方案",
    "测试用例编写指南",
    "版本控制使用技巧",
    "技术文档撰写要求",
    "问题排查解决流程",
    "技术选型评估标准"
  ];

  return topics.map((topic, index) => ({
    id: index + 1,
    title: `请评估以下AI助手对于'${topic}'问题的回答质量`,
    answers: Array.from({ length: 5 }, (_, answerIndex) => ({
      id: `${index + 1}-${answerIndex + 1}`,
      imageUrl: answerIndex === 0 
        ? "https://hwsg-tec-matl-obs-prod-01.obs.ap-southeast-3.myhuaweicloud.com:443/oneInsight/navos%E6%B5%8B%E8%AF%95%E6%96%87%E4%BB%B6.png?AccessKeyId=XPMYZM6XFFM6SWIHHG0W&Expires=1766756704&Signature=ReGAN51tCCxxd%2F2yI%2BiCLNp6Pwc%3D" 
        : `/api/placeholder/600/400?topic=${encodeURIComponent(topic)}&answer=${answerIndex + 1}`,
      title: `答案${String.fromCharCode(65 + answerIndex)}`,
      description: `AI助手回答截图${String.fromCharCode(65 + answerIndex)}`
    }))
  }));
};