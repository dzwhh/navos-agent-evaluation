/**
 * 默认题目数据配置
 * 当数据加载失败时为admin用户提供示例数据
 */

export interface DefaultQuestion {
  id: number;
  title: string;
  answers: {
    id: string;
    title: string;
    imageUrl: string;
  }[];
}

export interface DefaultTopicInfo {
  name: string;
  row_num: number;
  isDefault: boolean;
}

/**
 * 默认题集信息
 */
export const DEFAULT_TOPIC_INFO: DefaultTopicInfo = {
  name: "示例题集 (默认数据)",
  row_num: 999,
  isDefault: true
};

/**
 * 默认题目数据
 * 包含5道示例题目，每题5个答案选项
 */
export const DEFAULT_QUESTIONS: DefaultQuestion[] = [
  {
    id: 1,
    title: "请设计一个智能客服系统的对话流程，要求能够处理用户的常见问题并提供个性化服务。",
    answers: [
      {
        id: "1-a",
        title: "A",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20customer%20service%20chatbot%20interface%20with%20clean%20design%20and%20blue%20theme&image_size=square"
      },
      {
        id: "1-b",
        title: "B",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=intelligent%20customer%20support%20system%20dashboard%20with%20conversation%20flow&image_size=square"
      },
      {
        id: "1-c",
        title: "C",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20chatbot%20conversation%20interface%20with%20personalized%20responses&image_size=square"
      },
      {
        id: "1-d",
        title: "D",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=customer%20service%20AI%20assistant%20with%20professional%20layout&image_size=square"
      },
      {
        id: "1-e",
        title: "E",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=advanced%20customer%20service%20bot%20with%20smart%20workflow%20design&image_size=square"
      }
    ]
  },
  {
    id: 2,
    title: "开发一个数据分析报告生成工具，能够自动处理Excel文件并生成可视化图表。",
    answers: [
      {
        id: "2-a",
        title: "A",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=data%20analysis%20dashboard%20with%20charts%20and%20graphs%20modern%20interface&image_size=square"
      },
      {
        id: "2-b",
        title: "B",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Excel%20data%20visualization%20tool%20with%20interactive%20charts&image_size=square"
      },
      {
        id: "2-c",
        title: "C",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=automated%20report%20generation%20system%20with%20data%20processing&image_size=square"
      },
      {
        id: "2-d",
        title: "D",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=business%20intelligence%20dashboard%20with%20analytics%20charts&image_size=square"
      },
      {
        id: "2-e",
        title: "E",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=smart%20data%20analysis%20platform%20with%20visualization%20tools&image_size=square"
      }
    ]
  },
  {
    id: 3,
    title: "设计一个在线教育平台的学习路径推荐算法，根据学生的学习历史和能力水平提供个性化课程。",
    answers: [
      {
        id: "3-a",
        title: "A",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=online%20education%20platform%20with%20personalized%20learning%20paths&image_size=square"
      },
      {
        id: "3-b",
        title: "B",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=adaptive%20learning%20system%20with%20course%20recommendations&image_size=square"
      },
      {
        id: "3-c",
        title: "C",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20powered%20education%20platform%20with%20smart%20curriculum&image_size=square"
      },
      {
        id: "3-d",
        title: "D",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=intelligent%20tutoring%20system%20with%20learning%20analytics&image_size=square"
      },
      {
        id: "3-e",
        title: "E",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=personalized%20education%20AI%20with%20adaptive%20learning%20paths&image_size=square"
      }
    ]
  },
  {
    id: 4,
    title: "构建一个智能客服系统，能够理解用户意图并提供准确的问题解答和服务引导。",
    answers: [
      {
        id: "4-a",
        title: "A",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=intelligent%20customer%20service%20chatbot%20interface%20modern%20design&image_size=square"
      },
      {
        id: "4-b",
        title: "B",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20customer%20support%20system%20with%20natural%20language%20processing&image_size=square"
      },
      {
        id: "4-c",
        title: "C",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=smart%20helpdesk%20automation%20with%20intent%20recognition&image_size=square"
      },
      {
        id: "4-d",
        title: "D",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=conversational%20AI%20assistant%20for%20customer%20service&image_size=square"
      },
      {
        id: "4-e",
        title: "E",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=advanced%20customer%20service%20AI%20with%20multilingual%20support&image_size=square"
      }
    ]
  },
  {
    id: 5,
    title: "开发一个多语言实时翻译应用，支持语音输入和文本翻译，并能保持上下文连贯性。",
    answers: [
      {
        id: "5-a",
        title: "A",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=multilingual%20translation%20app%20with%20voice%20input%20interface&image_size=square"
      },
      {
        id: "5-b",
        title: "B",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=real%20time%20language%20translator%20with%20speech%20recognition&image_size=square"
      },
      {
        id: "5-c",
        title: "C",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20translation%20system%20with%20contextual%20understanding&image_size=square"
      },
      {
        id: "5-d",
        title: "D",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=intelligent%20language%20bridge%20app%20with%20conversation%20flow&image_size=square"
      },
      {
        id: "5-e",
        title: "E",
        imageUrl: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=advanced%20multilingual%20AI%20translator%20with%20cultural%20adaptation&image_size=square"
      }
    ]
  }
];

/**
 * 获取默认数据
 */
export function getDefaultData() {
  return {
    questions: DEFAULT_QUESTIONS,
    topicInfo: DEFAULT_TOPIC_INFO
  };
}

/**
 * 检查是否为admin用户
 */
export function isAdminUser(username?: string): boolean {
  return username === 'admin';
}

/**
 * 为admin用户提供默认数据的提示信息
 */
export const DEFAULT_DATA_MESSAGE = {
  title: "使用默认数据",
  description: "数据加载失败，当前显示示例数据供测试使用。",
  action: "重新加载数据"
};