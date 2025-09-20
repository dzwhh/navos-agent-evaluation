import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// 题目集数据操作API函数
export const topicListAPI = {
  // 获取所有题目集
  async getAll() {
    console.log('🔍 topicListAPI.getAll() 开始执行...');
    const { data, error } = await supabase
      .from('topic_list_data')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ 获取题目集列表失败:', error)
      throw error
    }
    console.log('✅ topicListAPI.getAll() 成功，返回数据:', data);
    return data
  },

  // 根据ID获取题目集
  async getById(id: number) {
    const { data, error } = await supabase
      .from('topic_list_data')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('获取题目集失败:', error)
      throw error
    }
    return data
  },

  // 创建新题目集
  async create(topicData: Database['public']['Tables']['topic_list_data']['Insert']) {
    // 获取下一个可用的序号
    const { data: maxRowData, error: maxRowError } = await supabase
      .from('topic_list_data')
      .select('row_num')
      .order('row_num', { ascending: false })
      .limit(1)
    
    if (maxRowError) {
      console.error('获取最大序号失败:', maxRowError)
      throw maxRowError
    }
    
    // 计算下一个序号
    const nextRowNum = (maxRowData && maxRowData.length > 0 && (maxRowData[0] as any).row_num) 
      ? (maxRowData[0] as any).row_num + 1 
      : 1
    
    // 添加序号到数据中
    const dataWithRowNum = {
      ...topicData,
      row_num: nextRowNum
    }
    
    const { data, error } = await supabase
      .from('topic_list_data')
      .insert(dataWithRowNum as any)
      .select()
      .single()
    
    if (error) {
      console.error('创建题目集失败:', error)
      throw error
    }
    return data
  },

  // 更新题目集
  async update(id: number, updates: any) {
    const { data, error } = await (supabase as any)
      .from('topic_list_data')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('更新题目集失败:', error)
      throw error
    }
    return data
  },

  // 删除题目集
  async delete(id: number) {
    const { error } = await supabase
      .from('topic_list_data')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('删除题目集失败:', error)
      throw error
    }
    return true
  },

  // 根据创建者获取题目集
  async getByCreator(creator: string) {
    const { data, error } = await supabase
      .from('topic_list_data')
      .select('*')
      .eq('creator', creator)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('获取创建者题目集失败:', error)
      throw error
    }
    return data
  },

  // 根据状态获取题目集
  async getByStatus(status: boolean) {
    const { data, error } = await supabase
      .from('topic_list_data')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('获取状态题目集失败:', error)
      throw error
    }
    return data
  }
}

// 用户-题目集映射数据操作API函数
export const userTopicMappingAPI = {
  // 获取所有用户题目集映射
  async getAllMappings(): Promise<Database['public']['Tables']['navos_user_topic_mapping']['Row'][]> {
    console.log('Getting all user topic mappings');
    const { data, error } = await supabase
      .from('navos_user_topic_mapping')
      .select('*');
    
    if (error) {
      console.error('Error getting all mappings:', error);
      throw error;
    }
    
    return data || [];
  },

  // 获取用户的题目集权限
  async getUserTopics(userId: number): Promise<Database['public']['Tables']['navos_user_topic_mapping']['Row'][]> {
    console.log('Getting topics for user:', userId);
    const { data, error } = await supabase
      .from('navos_user_topic_mapping')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error getting user topics:', error);
      throw error;
    }
    
    return data || [];
  },

  // 添加用户题目集权限
  async addUserTopic(userId: number, userName: string, topicId: number, topicName: string): Promise<void> {
    console.log('Adding topic permission:', { userId, userName, topicId, topicName });
    const { error } = await (supabase as any)
      .from('navos_user_topic_mapping')
      .insert({
        user_id: userId,
        user_name: userName,
        topic_id: topicId,
        topic_name: topicName
      });
    
    if (error) {
      console.error('Error adding user topic:', error);
      throw error;
    }
  },

  // 删除用户题目集权限
  async removeUserTopic(userId: number, topicId: number): Promise<void> {
    console.log('Removing topic permission:', { userId, topicId });
    const { error } = await supabase
      .from('navos_user_topic_mapping')
      .delete()
      .eq('user_id', userId)
      .eq('topic_id', topicId);
    
    if (error) {
      console.error('Error removing user topic:', error);
      throw error;
    }
  },

  // 批量更新用户题目集权限
  async updateUserTopics(userId: number, userName: string, topicIds: number[], topicNames: string[]): Promise<void> {
    console.log('Updating user topics:', { userId, userName, topicIds, topicNames });
    
    // 先删除现有权限
    const { error: deleteError } = await supabase
      .from('navos_user_topic_mapping')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error('Error deleting existing user topics:', deleteError);
      throw deleteError;
    }
    
    // 添加新权限
    if (topicIds.length > 0) {
      const insertData = topicIds.map((topicId, index) => ({
        user_id: userId,
        user_name: userName,
        topic_id: topicId,
        topic_name: topicNames[index]
      }));
      
      const { error: insertError } = await (supabase as any)
        .from('navos_user_topic_mapping')
        .insert(insertData);
      
      if (insertError) {
        console.error('Error inserting new user topics:', insertError);
        throw insertError;
      }
    }
  },

  // 根据用户ID获取用户对应的topic_id（用于evaluation页面）
  async getUserTopicId(userId: number): Promise<number | null> {
    console.log('Getting topic_id for user:', userId);
    const { data, error } = await supabase
      .from('navos_user_topic_mapping')
      .select('topic_id')
      .eq('user_id', userId)
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error getting user topic_id:', error);
      // 如果没有找到映射记录，返回null而不是抛出错误
      if (error.code === 'PGRST116') {
        console.log('No topic mapping found for user:', userId);
        return null;
      }
      throw error;
    }
    
    return (data as any)?.topic_id || null;
  }
};

// 用户数据操作API函数
export const userAPI = {
  // 根据用户名获取用户信息
  async getByUsername(username: string): Promise<Database['public']['Tables']['navos_user_info']['Row'] | null> {
    console.log('Getting user by username:', username);
    const { data, error } = await supabase
      .from('navos_user_info')
      .select('*')
      .eq('user_name', username)
      .single();
    
    if (error) {
      console.error('Error getting user by username:', error);
      // 如果没有找到用户，返回null而不是抛出错误
      if (error.code === 'PGRST116') {
        console.log('No user found with username:', username);
        return null;
      }
      throw error;
    }
    
    return data;
  },

  // 根据用户ID获取用户信息
  async getById(userId: number): Promise<Database['public']['Tables']['navos_user_info']['Row'] | null> {
    console.log('Getting user by ID:', userId);
    const { data, error } = await supabase
      .from('navos_user_info')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error getting user by ID:', error);
      // 如果没有找到用户，返回null而不是抛出错误
      if (error.code === 'PGRST116') {
        console.log('No user found with ID:', userId);
        return null;
      }
      throw error;
    }
    
    return data;
  },

  // 更新用户最后登录时间
  async updateLastLogin(userId: number): Promise<void> {
    console.log('Updating last login for user:', userId);
    const { error } = await supabase
      .from('navos_user_info')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }
};

export type Database = {
  public: {
    Tables: {
      navos_user_info: {
        Row: {
          id: number
          user_name: string | null
          password: string | null
          email: string | null
          full_name: string | null
          role: string | null
          is_active: boolean | null
          last_login: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          user_name?: string | null
          password?: string | null
          email?: string | null
          full_name?: string | null
          role?: string | null
          is_active?: boolean | null
          last_login?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          user_name?: string | null
          password?: string | null
          email?: string | null
          full_name?: string | null
          role?: string | null
          is_active?: boolean | null
          last_login?: string | null
          created_at?: string
          updated_at?: string | null
        }
      },
      navos_test_result: {
        Row: {
          id: number
          q_id: number | null
          q_name: string | null
          title: string | null
          agent_type: string | null
          item_visual: number | null
          item_major: number | null
          item_data: number | null
          item_guide: number | null
          agent_name: string | null
          agent_scene: string | null
          topic_id: number | null
          user_name: string | null
          created_at: string
        }
        Insert: {
          id?: number
          q_id?: number | null
          q_name?: string | null
          title?: string | null
          agent_type?: string | null
          item_visual?: number | null
          item_major?: number | null
          item_data?: number | null
          item_guide?: number | null
          agent_name?: string | null
          agent_scene?: string | null
          topic_id?: number | null
          user_name?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          q_id?: number | null
          q_name?: string | null
          title?: string | null
          agent_type?: string | null
          item_visual?: number | null
          item_major?: number | null
          item_data?: number | null
          item_guide?: number | null
          agent_name?: string | null
          agent_scene?: string | null
          topic_id?: number | null
          user_name?: string | null
          created_at?: string
        }
      },
      navos_question_data: {
        Row: {
          id: number
          q_id: number
          q_name: string
          agent_scene: string
          minimax: string
          qwen: string
          deepseek: string
          chatgpt: string
          manus: string
          navos: string
          created_at: string
        }
        Insert: {
          id?: number
          q_id: number
          q_name: string
          agent_scene: string
          minimax: string
          qwen: string
          deepseek: string
          chatgpt: string
          manus: string
          navos: string
          created_at?: string
        }
        Update: {
          id?: number
          q_id?: number
          q_name?: string
          agent_scene?: string
          minimax?: string
          qwen?: string
          deepseek?: string
          chatgpt?: string
          manus?: string
          navos?: string
          created_at?: string
        }
      },
      topic_list_data: {
        Row: {
          id: number
          name: string
          creator: string
          status: boolean
          description: string | null
          question_count: number
          row_num: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          creator: string
          status?: boolean
          description?: string | null
          question_count?: number
          row_num?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          creator?: string
          status?: boolean
          description?: string | null
          question_count?: number
          row_num?: number
          created_at?: string
          updated_at?: string
        }
      },
      navos_user_topic_mapping: {
        Row: {
          id: number
          user_id: number | null
          user_name: string | null
          topic_id: number | null
          topic_name: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id?: number | null
          user_name?: string | null
          topic_id?: number | null
          topic_name?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: number | null
          user_name?: string | null
          topic_id?: number | null
          topic_name?: string | null
          created_at?: string
        }
      }
    }
  }
}