'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Users, ChevronDown, Shield } from 'lucide-react';
import { User, DatabaseUser, UserInsertData, UserTopicMappingInsertData, UserFormData } from '@/types/evaluation';
import { toast } from 'sonner';
import { supabase, userTopicMappingAPI } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

// 题目集类型定义
interface TopicOption {
  id: number;
  name: string;
  row_num: number;
}

// 用户题目集映射类型
interface UserTopicMapping {
  id: number;
  user_id: number | null;
  user_name: string | null;
  topic_id: number | null;
  topic_name: string | null;
  created_at?: string;
}





export default function UserManagementPage() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [topicOptions, setTopicOptions] = useState<TopicOption[]>([]);
  const [, setUserTopicMappings] = useState<UserTopicMapping[]>([]);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingNewUser, setAddingNewUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    password: '',
    accessibleTopics: [] as number[]
  });
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    questionSets: []
  });
  
  // 内联编辑状态管理
  const [editingCell, setEditingCell] = useState<{userId: string, field: string} | null>(null);
  const [editingValues, setEditingValues] = useState<{[key: string]: string}>({});
  
  // 单选组件状态管理
  const [openDropdowns, setOpenDropdowns] = useState<{[key: string]: boolean}>({});
  const [selectedTopics, setSelectedTopics] = useState<{[userId: string]: number}>({});

  // 加载题目集数据
  const loadTopicOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('topic_list_data')
        .select('id, name, row_num')
        .eq('status', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading topics:', error);
        toast.error('加载题目集数据失败');
        return;
      }

      setTopicOptions(data || []);
    } catch (error) {
      console.error('Error loading topics:', error);
      toast.error('加载题目集数据失败');
    }
  };

  // 加载用户题目集映射
  const loadUserTopicMappings = async () => {
    try {
      const data = await userTopicMappingAPI.getAllMappings();
      setUserTopicMappings(data || []);
      
      // 构建用户选中的题目集映射（单选模式）
      const userTopicsMap: {[userId: string]: number} = {};
      data?.forEach(mapping => {
        if (mapping.user_id !== null && mapping.topic_id !== null) {
          const userId = mapping.user_id.toString();
          // 单选模式：每个用户只保留一个题目集（取最新的）
          userTopicsMap[userId] = mapping.topic_id;
        }
      });
      setSelectedTopics(userTopicsMap);
    } catch (error) {
      console.error('Error loading user topic mappings:', error);
      toast.error('加载用户题目集映射失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 从数据库加载用户数据
  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('navos_user_info')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading users:', error);
        toast.error('加载用户数据失败');
        return;
      }

      // 将数据库字段映射到User类型
      const mappedUsers: User[] = (data as DatabaseUser[]).map((user: DatabaseUser) => ({
        id: user.id.toString(),
        username: user.user_name,
        password: user.password,
        createdAt: new Date(user.created_at)
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('加载用户数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        loadUsers(),
        loadTopicOptions(),
        loadUserTopicMappings()
      ]);
    };
    loadAllData();
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.relative')) {
        setOpenDropdowns({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleBackToHome = () => {
    router.push('/home');
  };

  const handleAddUser = () => {
    setAddingNewUser(true);
    setNewUserData({ username: '', password: '', accessibleTopics: [] });
  };

  // const handleEditUser = (user: User) => {
  //   setEditingUser(user);
  //   setFormData({
  //     username: user.username,
  //     password: user.password
  //   });
  // };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('确定要删除这个用户吗？')) {
      try {
        const { error } = await supabase
          .from('navos_user_info')
          .delete()
          .eq('id', userId);

        if (error) {
          console.error('Error deleting user:', error);
          toast.error('删除用户失败');
          return;
        }

        toast.success('用户删除成功');
        // 重新加载用户列表
        await loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('删除用户失败');
      }
    }
  };

  // 处理题目集选择（单选模式）
  const handleTopicSelection = async (userId: string, topicId: number | null, isSelected: boolean) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) {
        toast.error('用户信息不存在');
        return;
      }

      if (topicId && isSelected) {
        // 使用upsert操作更新题目集权限
        const topic = topicOptions.find(t => t.id === topicId);
        if (!topic) {
          toast.error('题目集信息不存在');
          return;
        }

        await userTopicMappingAPI.upsertUserTopic(
          parseInt(userId),
          user.username,
          topicId,
          topic.name
        );

        // 更新本地状态
        setSelectedTopics(prev => ({
          ...prev,
          [userId]: topicId
        }));
        
        toast.success('题目集权限设置成功');
      } else {
        // 删除用户的题目集权限
        const { error } = await supabase
          .from('navos_user_topic_mapping')
          .delete()
          .eq('user_id', parseInt(userId));

        if (error) {
          console.error('Error removing user topic:', error);
          toast.error('清除权限失败: ' + error.message);
          return;
        }

        // 清除选择
        setSelectedTopics(prev => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });
        
        toast.success('题目集权限已清除');
      }

      // 关闭下拉菜单
      setOpenDropdowns(prev => ({ ...prev, [userId]: false }));
    } catch (error) {
      console.error('Error handling topic selection:', error);
      toast.error('操作失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleCompleteNewUser = async () => {
    if (!newUserData.username.trim()) {
      toast.error('请输入用户名');
      return;
    }

    try {
      console.log('🔄 开始添加新用户:', newUserData);
      
      const insertData: UserInsertData = {
        user_name: newUserData.username.trim(),
        password: newUserData.password || 'default123',
        role: 'user',
        is_active: true
      };
      
      console.log('📝 准备插入的数据:', insertData);
      
      const { data, error } = await supabase
        .from('navos_user_info')
        .insert(insertData as any)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase插入错误:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast.error('添加用户失败: ' + error.message);
        return;
      }

      console.log('✅ 用户添加成功:', data);
      
      // 如果选择了题目集，添加权限映射（单选模式）
      if (newUserData.accessibleTopics.length > 0) {
        const topicId = newUserData.accessibleTopics[0]; // 单选模式只取第一个
        const topic = topicOptions.find(t => t.id === topicId);
        const mappingData: UserTopicMappingInsertData = {
          user_id: (data as any).id,
          user_name: newUserData.username.trim(),
          topic_id: topicId,
          topic_name: topic?.name || ''
        };
        
        const { error: mappingError } = await supabase
          .from('navos_user_topic_mapping')
          .insert(mappingData as any);
          
        if (mappingError) {
          console.error('Error adding topic mapping:', mappingError);
          toast.error('添加题目集权限失败: ' + mappingError.message);
          return;
        }
      }
      
      toast.success('用户添加成功!');
      // 重新加载所有数据
      await Promise.all([
        loadUsers(),
        loadUserTopicMappings()
      ]);
      
      setAddingNewUser(false);
      setNewUserData({ username: '', password: '', accessibleTopics: [] });
    } catch (error) {
      console.error('💥 添加用户时发生未知错误:', error);
      toast.error('添加用户时发生错误: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleCancelNewUser = () => {
    setAddingNewUser(false);
    setNewUserData({ username: '', password: '', accessibleTopics: [] });
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error('请填写用户名和密码');
      return;
    }

    if (!editingUser) {
      return;
    }

    try {
      // 编辑用户
      const { error } = await (supabase
        .from('navos_user_info') as any)
        .update({
          user_name: formData.username,
          password: formData.password
        })
        .eq('id', editingUser.id);

      if (error) {
        console.error('Error updating user:', error);
        toast.error('更新用户失败');
        return;
      }

      toast.success('用户信息更新成功');

      // 重新加载用户列表
      await loadUsers();
      
      setEditingUser(null);
      setFormData({ username: '', password: '', questionSets: [] });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('操作失败');
    }
  };

  // 内联编辑处理函数
  const handleCellClick = (userId: string, field: string, currentValue: string) => {
    setEditingCell({ userId, field });
    setEditingValues({ [`${userId}-${field}`]: currentValue });
  };

  const handleCellChange = (userId: string, field: string, value: string) => {
    setEditingValues({ ...editingValues, [`${userId}-${field}`]: value });
  };

  const handleCellSave = async (userId: string, field: string) => {
    const value = editingValues[`${userId}-${field}`];
    if (!value || !value.trim()) {
      toast.error('值不能为空');
      return;
    }

    try {
      const updateData: Record<string, unknown> = {};
      if (field === 'username') {
        updateData.user_name = value.trim();
      } else if (field === 'password') {
        updateData.password = value.trim();
      }
      // 可访问题目集字段暂时不保存到数据库
      
      if (Object.keys(updateData).length > 0) {
        const { error } = await (supabase
          .from('navos_user_info') as any)
          .update(updateData)
          .eq('id', userId);

        if (error) {
          console.error('Error updating user:', error);
          toast.error('更新失败');
          return;
        }

        toast.success('更新成功');
        await loadUsers();
      }
      
      setEditingCell(null);
      setEditingValues({});
    } catch (error) {
      console.error('Error saving cell:', error);
      toast.error('保存失败');
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditingValues({});
  };

  // 多选组件相关函数
  const toggleDropdown = (userId: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // const closeDropdown = (userId: string) => {
  //   setOpenDropdowns(prev => ({
  //     ...prev,
  //     [userId]: false
  //   }));
  // };

  const isTopicSelected = (userId: string, topicId: number) => {
    return selectedTopics[userId] === topicId;
  };

  const getSelectedTopicName = (userId: string) => {
    const selectedTopicId = selectedTopics[userId];
    if (!selectedTopicId) return null;
    const topic = topicOptions.find(t => t.id === selectedTopicId);
    return topic?.name || null;
  };

  // 单选组件渲染
  const renderTopicSingleSelect = (userId: string) => {
    const selectedName = getSelectedTopicName(userId);
    const isOpen = openDropdowns[userId] || false;

    return (
      <div className="relative">
        <div 
          className="flex items-center justify-between min-w-32 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          onClick={() => toggleDropdown(userId)}
        >
          <div className="flex-1 text-sm text-gray-700">
            {selectedName ? (
              selectedName
            ) : (
              <span className="text-gray-400">选择题目集</span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`} />
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {/* 添加清除选择选项 */}
            <div
              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
              onClick={() => {
                handleTopicSelection(userId, null, false);
              }}
            >
              <span className="text-sm text-gray-500">清除选择</span>
            </div>
            {topicOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">暂无题目集</div>
            ) : (
              topicOptions.map(topic => {
                const isSelected = isTopicSelected(userId, topic.id);
                return (
                  <div
                    key={topic.id}
                    className={`flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      handleTopicSelection(userId, topic.id, true);
                    }}
                  >
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mr-2 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{topic.name}</span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

  // 新用户添加时的单选组件
  const renderNewUserTopicSingleSelect = () => {
    const selectedTopicId = newUserData.accessibleTopics[0] || null;
    const selectedName = selectedTopicId ? topicOptions.find(t => t.id === selectedTopicId)?.name : null;
    const isOpen = openDropdowns['newUser'] || false;

    return (
      <div className="relative">
        <div 
          className="flex items-center justify-between min-w-32 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          onClick={() => toggleDropdown('newUser')}
        >
          <div className="flex-1 text-sm text-gray-700">
            {selectedName ? (
              selectedName
            ) : (
              <span className="text-gray-400">选择题目集</span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`} />
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {/* 添加清除选择选项 */}
            <div
              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
              onClick={() => {
                setNewUserData(prev => ({
                  ...prev,
                  accessibleTopics: []
                }));
                setOpenDropdowns(prev => ({ ...prev, newUser: false }));
              }}
            >
              <span className="text-sm text-gray-500">清除选择</span>
            </div>
            {topicOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">暂无题目集</div>
            ) : (
              topicOptions.map(topic => {
                const isSelected = selectedTopicId === topic.id;
                return (
                  <div
                    key={topic.id}
                    className={`flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      setNewUserData(prev => ({
                        ...prev,
                        accessibleTopics: [topic.id]
                      }));
                      setOpenDropdowns(prev => ({ ...prev, newUser: false }));
                    }}
                  >
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mr-2 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{topic.name}</span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };



  // 权限检查：只有admin用户才能访问
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">未登录</h2>
            <p className="text-gray-600 mb-6">请先登录后再访问用户管理功能</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              前往登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">权限不足</h2>
            <p className="text-gray-600 mb-2">只有管理员才能访问用户管理功能</p>
            <p className="text-sm text-gray-500 mb-6">当前用户：{user?.username} ({user?.role || 'user'})</p>
            <button
              onClick={() => router.push('/home')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={handleBackToHome}
                className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">用户管理</h1>
              </div>
            </div>
            <button
              onClick={handleAddUser}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>添加用户</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 用户列表 */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">用户列表</h2>
            <p className="text-gray-600 mt-1">管理系统用户和权限配置</p>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">加载中...</span>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">密码</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">可访问题目集</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* 新用户编辑行 */}
                  {addingNewUser && (
                    <tr className="bg-blue-50 border-2 border-blue-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                            <Plus className="w-5 h-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <input
                              type="text"
                              value={newUserData.username}
                              onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                              className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32"
                              placeholder="输入用户名"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="password"
                          value={newUserData.password}
                          onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                          className="text-sm text-gray-900 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32"
                          placeholder="输入密码"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        新用户
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderNewUserTopicSingleSelect()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={handleCompleteNewUser}
                            className="text-green-600 hover:text-green-900 px-3 py-1 bg-green-100 hover:bg-green-200 rounded transition-colors text-xs"
                          >
                            完成
                          </button>
                          <button
                            onClick={handleCancelNewUser}
                            className="text-gray-600 hover:text-gray-900 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-xs"
                          >
                            取消
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                  
                  {users.length === 0 && !addingNewUser ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        暂无用户数据
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">{user.username.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="ml-4">
                              {editingCell?.userId === user.id && editingCell?.field === 'username' ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={editingValues[`${user.id}-username`] || ''}
                                    onChange={(e) => handleCellChange(user.id, 'username', e.target.value)}
                                    onBlur={() => handleCellSave(user.id, 'username')}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleCellSave(user.id, 'username');
                                      if (e.key === 'Escape') handleCellCancel();
                                    }}
                                    className="text-sm font-medium text-gray-900 border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32"
                                    autoFocus
                                  />
                                </div>
                              ) : (
                                <div 
                                  className="text-sm font-medium text-gray-900 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
                                  onClick={() => handleCellClick(user.id, 'username', user.username)}
                                >
                                  {user.username}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingCell?.userId === user.id && editingCell?.field === 'password' ? (
                            <input
                              type="text"
                              value={editingValues[`${user.id}-password`] || ''}
                              onChange={(e) => handleCellChange(user.id, 'password', e.target.value)}
                              onBlur={() => handleCellSave(user.id, 'password')}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCellSave(user.id, 'password');
                                if (e.key === 'Escape') handleCellCancel();
                              }}
                              className="text-sm text-gray-900 border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32"
                              autoFocus
                            />
                          ) : (
                            <div 
                              className="text-sm text-gray-500 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
                              onClick={() => handleCellClick(user.id, 'password', user.password)}
                            >
                              ••••••••
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.createdAt.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderTopicSingleSelect(user.id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* 编辑用户表单 - 仅用于编辑现有用户 */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  编辑用户
                </h3>
              </div>
              
              <form onSubmit={handleSubmitForm} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      用户名
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入用户名"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      密码
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入密码"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                  >
                    更新
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}