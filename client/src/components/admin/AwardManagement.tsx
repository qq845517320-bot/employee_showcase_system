'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AwardManagement() {
  const { data: honors = [] } = trpc.honors.list.useQuery();
  const { data: categoriesData = [] } = trpc.honors.listCategories.useQuery();
  const utils = trpc.useUtils();
  
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const categories = categoriesData.map(cat => cat.name);
  const [formData, setFormData] = useState({
    title: '',
    category: '班组之星' as string,
    description: '',
  });

  const createMutation = trpc.honors.create.useMutation({
    onSuccess: () => {
      utils.honors.list.invalidate();
      setFormData({ title: '', category: '班组之星', description: '' });
      setIsAddingNew(false);
    },
  });

  const updateMutation = trpc.honors.update.useMutation({
    onSuccess: () => {
      utils.honors.list.invalidate();
      setFormData({ title: '', category: '班组之星', description: '' });
      setEditingId(null);
    },
  });

  const deleteMutation = trpc.honors.delete.useMutation({
    onSuccess: () => {
      utils.honors.list.invalidate();
    },
  });

  const createCategoryMutation = trpc.honors.createCategory.useMutation({
    onSuccess: () => {
      utils.honors.listCategories.invalidate();
      setNewCategoryName('');
      setIsAddingCategory(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        title: formData.title,
        category: formData.category,
        description: formData.description,
      });
    } else {
      await createMutation.mutateAsync({
        employeeId: 0,
        title: formData.title,
        category: formData.category,
        description: formData.description,
        awardDate: new Date(),
        icon: 'trophy',
      });
    }
  };

  const handleEdit = (honor: any) => {
    setEditingId(honor.id);
    setFormData({
      title: honor.title,
      category: honor.category,
      description: honor.description || '',
    });
    setIsAddingNew(true);
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setFormData({ title: '', category: '班组之星', description: '' });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await createCategoryMutation.mutateAsync({ category: newCategoryName });
      console.log('分类创建成功，新分类名称:', newCategoryName);
    } catch (error) {
      console.error('创建分类失败:', error);
    }
  };

  const groupedByCategory = categories.map(category => ({
    category,
    awards: honors.filter((h: any) => h.category === category),
  }));

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">奖项管理</h2>
          <p className="text-gray-600">管理系统中的所有奖项，支持按分类组织</p>
        </div>
        <div className="flex gap-2">
          {!isAddingNew && !isAddingCategory && (
            <>
              <Button
                onClick={() => setIsAddingNew(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                新增奖项
              </Button>
              <Button
                onClick={() => setIsAddingCategory(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                新增分类
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 新增分类表单 */}
      {isAddingCategory && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-6"
        >
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">分类名称</label>
              <Input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="例如：部门级奖项、个人奖励"
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={createCategoryMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                创建分类
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName('');
                }}
                variant="outline"
              >
                取消
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* 新增/编辑表单 */}
      {isAddingNew && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">奖项名称</label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="例如：优秀员工、技术创新奖"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">奖项分类</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">奖项描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="可选：描述该奖项的含义和要求"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {editingId ? '更新奖项' : '创建奖项'}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
              >
                取消
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* 按分类显示奖项 */}
      <div className="space-y-8">
        {groupedByCategory.map(({ category, awards }) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
              <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                {awards.length}
              </span>
            </div>

            {awards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {awards.map((award: any) => (
                  <motion.div
                    key={award.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{award.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{category}</p>
                      </div>
                    </div>
                    {award.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{award.description}</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(award)}
                        className="flex-1"
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        编辑
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMutation.mutateAsync({ id: award.id })}
                        disabled={deleteMutation.isPending}
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        删除
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">暂无该分类的奖项</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
