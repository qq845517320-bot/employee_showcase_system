import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HonorManagement() {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    employeeId: 0,
    title: '',
    description: '',
    awardDate: new Date().toISOString().split('T')[0],
    icon: 'trophy',
  });

  const { data: employees = [] } = trpc.employees.list.useQuery({});
  const { data: honors = [], refetch } = trpc.honors.listNew.useQuery();

  const createMutation = trpc.honors.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddingNew(false);
      setFormData({
        employeeId: 0,
        title: '',
        description: '',
        awardDate: new Date().toISOString().split('T')[0],
        icon: 'trophy',
      });
    },
  });

  const updateMutation = trpc.honors.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingId(null);
      setFormData({
        employeeId: 0,
        title: '',
        description: '',
        awardDate: new Date().toISOString().split('T')[0],
        icon: 'trophy',
      });
    },
  });

  const deleteMutation = trpc.honors.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        title: formData.title,
        description: formData.description,
        awardDate: new Date(formData.awardDate),
        icon: formData.icon,
      });
    } else {
      await createMutation.mutateAsync({
        employeeId: formData.employeeId,
        title: formData.title,
        description: formData.description,
        awardDate: new Date(formData.awardDate),
        icon: formData.icon,
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">荣誉列表</h2>
        <Button
          onClick={() => {
            setIsAddingNew(!isAddingNew);
            setFormData({
              employeeId: 0,
              title: '',
              description: '',
              awardDate: new Date().toISOString().split('T')[0],
              icon: 'trophy',
            });
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加荣誉
        </Button>
      </div>

      {(isAddingNew || editingId) && (
        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-muted p-6 rounded-lg space-y-4"
        >
          <select
            value={formData.employeeId}
            onChange={e => setFormData({ ...formData, employeeId: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="">选择员工</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
          <Input
            placeholder="荣誉名称"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <textarea
            placeholder="荣誉描述"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
          />
          <Input
            type="date"
            value={formData.awardDate}
            onChange={e => setFormData({ ...formData, awardDate: e.target.value })}
            required
          />
          <div className="flex gap-2">
            <Button type="submit" variant="default">
              {editingId ? '保存修改' : '添加荣誉'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddingNew(false);
                setEditingId(null);
                setFormData({
                  employeeId: 0,
                  title: '',
                  description: '',
                  awardDate: new Date().toISOString().split('T')[0],
                  icon: 'trophy',
                });
              }}
            >
              取消
            </Button>
          </div>
        </motion.form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left">员工</th>
              <th className="px-4 py-2 text-left">荣誉名称</th>
              <th className="px-4 py-2 text-left">获奖时间</th>
              <th className="px-4 py-2 text-left">状态</th>
              <th className="px-4 py-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {honors.map(honor => {
              const emp = employees.find(e => e.id === honor.employeeId);
              const statusClass = honor.isNew ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700';
              return (
                <tr key={honor.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-2">{emp?.name}</td>
                  <td className="px-4 py-2">{honor.title}</td>
                  <td className="px-4 py-2">{new Date(honor.awardDate).toLocaleDateString('zh-CN')}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${statusClass}`}>
                      {honor.isNew ? 'New' : 'Old'}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(honor.id);
                        setFormData({
                          employeeId: honor.employeeId,
                          title: honor.title,
                          description: honor.description || '',
                          awardDate: new Date(honor.awardDate).toISOString().split('T')[0],
                          icon: honor.icon,
                        });
                        setIsAddingNew(false);
                      }}
                      className="p-1 hover:bg-blue-100 rounded"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate({ id: honor.id })}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {honors.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          暂无荣誉信息
        </div>
      )}
    </div>
  );
}
