'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CompanyManagement() {
  const { data: companies = [] } = trpc.companies.list.useQuery();
  const utils = trpc.useUtils();
  
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [error, setError] = useState<string | null>(null);

  const createMutation = trpc.companies.create.useMutation({
    onSuccess: () => {
      utils.companies.list.invalidate();
      setFormData({ name: '', description: '' });
      setIsAddingNew(false);
      setError(null);
    },
    onError: (err) => {
      const message = err.message || '创建公司失败';
      setError(message);
      console.error('Create company error:', err);
    },
  });

  const updateMutation = trpc.companies.update.useMutation({
    onSuccess: () => {
      utils.companies.list.invalidate();
      setFormData({ name: '', description: '' });
      setEditingId(null);
      setError(null);
    },
    onError: (err) => {
      const message = err.message || '更新公司失败';
      setError(message);
      console.error('Update company error:', err);
    },
  });

  const deleteMutation = trpc.companies.delete.useMutation({
    onSuccess: () => {
      utils.companies.list.invalidate();
    },
    onError: (err) => {
      const message = err.message || '删除公司失败';
      console.error('Delete company error:', err);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        name: formData.name,
        description: formData.description,
      });
    } else {
      await createMutation.mutateAsync({
        name: formData.name,
        description: formData.description,
      });
    }
  };

  const handleEdit = (company: any) => {
    setEditingId(company.id);
    setFormData({
      name: company.name,
      description: company.description || '',
    });
    setIsAddingNew(true);
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">公司管理</h2>
          <p className="text-gray-600">管理系统中的所有公司信息</p>
        </div>
        {!isAddingNew && (
          <Button
            onClick={() => setIsAddingNew(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            新增公司
          </Button>
        )}
      </div>

      {/* 新增/编辑表单 */}
      {isAddingNew && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">公司名称</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：深圳国际港口、江苏靖江港"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">公司描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="可选：描述该公司的相关信息"
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
                {editingId ? '更新公司' : '创建公司'}
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

      {/* 公司列表 */}
      <div className="space-y-4">
        {companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {companies.map((company: any) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{company.name}</h4>
                  </div>
                </div>
                {company.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{company.description}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(company)}
                    className="flex-1"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    编辑
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm(`确定要删除公司"${company.name}"吗？此操作无法撤销。`)) {
                        deleteMutation.mutate({ id: company.id });
                      }
                    }}
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
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">暂无公司信息</p>
          </div>
        )}
      </div>
    </div>
  );
}
