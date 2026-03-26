import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PlaybackStrategyManagement() {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    displayMode: 'all' as 'all' | 'core_bones' | 'honors',
    description: '',
    autoPlayInterval: 5000,
  });

  const { data: strategies = [], refetch } = trpc.playback.list.useQuery();
  const { data: activeStrategy } = trpc.playback.getActive.useQuery();

  const createMutation = trpc.playback.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddingNew(false);
      setFormData({
        name: '',
        displayMode: 'all',
        description: '',
        autoPlayInterval: 5000,
      });
    },
  });

  const updateMutation = trpc.playback.delete.useMutation({
    onSuccess: () => {
      refetch();
      setEditingId(null);
      setFormData({
        name: '',
        displayMode: 'all',
        description: '',
        autoPlayInterval: 5000,
      });
    },
  });

  const deleteMutation = trpc.playback.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const setActiveMutation = trpc.playback.setActive.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createMutation.mutateAsync(formData);
  };

  const displayModeLabel = {
    all: '全部员工',
    core_bones: '核心骨干',
    honors: '荣誉榜',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">轮播策略列表</h2>
        <Button
          onClick={() => {
            setIsAddingNew(!isAddingNew);
            setFormData({
              name: '',
              displayMode: 'all',
              description: '',
              autoPlayInterval: 5000,
            });
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加策略
        </Button>
      </div>

      {isAddingNew && (
        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-muted p-6 rounded-lg space-y-4"
        >
          <Input
            placeholder="策略名称"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <select
            value={formData.displayMode}
            onChange={e => setFormData({ ...formData, displayMode: e.target.value as 'all' | 'core_bones' | 'honors' })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="all">全部员工</option>
            <option value="core_bones">核心骨干</option>
            <option value="honors">荣誉榜</option>
          </select>
          <textarea
            placeholder="策略描述"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
          />
          <Input
            type="number"
            placeholder="自动轮播间隔（毫秒）"
            value={formData.autoPlayInterval}
            onChange={e => setFormData({ ...formData, autoPlayInterval: parseInt(e.target.value) })}
          />
          <div className="flex gap-2">
            <Button type="submit" variant="default">
              添加策略
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddingNew(false);
                setFormData({
                  name: '',
                  displayMode: 'all',
                  description: '',
                  autoPlayInterval: 5000,
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
              <th className="px-4 py-2 text-left">策略名称</th>
              <th className="px-4 py-2 text-left">展示模式</th>
              <th className="px-4 py-2 text-left">轮播间隔</th>
              <th className="px-4 py-2 text-left">状态</th>
              <th className="px-4 py-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {strategies.map(strategy => (
              <tr key={strategy.id} className="border-b hover:bg-muted/50">
                <td className="px-4 py-2">{strategy.name}</td>
                <td className="px-4 py-2">{displayModeLabel[strategy.displayMode as keyof typeof displayModeLabel]}</td>
                <td className="px-4 py-2">{strategy.autoPlayInterval}ms</td>
                <td className="px-4 py-2">
                  {strategy.isActive ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold flex items-center gap-1 w-fit">
                      <Check className="w-3 h-3" />
                      活跃
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold">
                      未激活
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 flex gap-2">
                  {!strategy.isActive && (
                    <button
                      onClick={() => setActiveMutation.mutate({ id: strategy.id })}
                      className="p-1 hover:bg-green-100 rounded"
                      title="设为活跃"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteMutation.mutate({ id: strategy.id })}
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

      {strategies.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          暂无轮播策略
        </div>
      )}
    </div>
  );
}
