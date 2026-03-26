import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DepartmentManagement() {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', order: 0 });

  const { data: departments = [], refetch } = trpc.departments.list.useQuery();

  const createMutation = trpc.departments.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddingNew(false);
      setFormData({ name: '', description: '', order: 0 });
    },
  });

  const updateMutation = trpc.departments.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingId(null);
      setFormData({ name: '', description: '', order: 0 });
    },
  });

  const deleteMutation = trpc.departments.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        ...formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">部门列表</h2>
        <Button
          onClick={() => {
            setIsAddingNew(!isAddingNew);
            setFormData({ name: '', description: '', order: 0 });
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加部门
        </Button>
      </div>

      {(isAddingNew || editingId) && (
        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-muted p-6 rounded-lg space-y-4"
        >
          <Input
            placeholder="部门名称"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <textarea
            placeholder="部门描述"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
          />
          <Input
            type="number"
            placeholder="排序"
            value={formData.order}
            onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
          />
          <div className="flex gap-2">
            <Button type="submit" variant="default">
              {editingId ? '保存修改' : '添加部门'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddingNew(false);
                setEditingId(null);
                setFormData({ name: '', description: '', order: 0 });
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
              <th className="px-4 py-2 text-left">部门名称</th>
              <th className="px-4 py-2 text-left">描述</th>
              <th className="px-4 py-2 text-left">排序</th>
              <th className="px-4 py-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(dept => (
              <tr key={dept.id} className="border-b hover:bg-muted/50">
                <td className="px-4 py-2">{dept.name}</td>
                <td className="px-4 py-2 text-muted-foreground">{dept.description}</td>
                <td className="px-4 py-2">{dept.order}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(dept.id);
                      setFormData({ name: dept.name, description: dept.description || '', order: dept.order });
                      setIsAddingNew(false);
                    }}
                    className="p-1 hover:bg-blue-100 rounded"
                  >
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate({ id: dept.id })}
                    className="p-1 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {departments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          暂无部门信息
        </div>
      )}
    </div>
  );
}
