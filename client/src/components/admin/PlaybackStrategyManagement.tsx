import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Check, Zap, Users, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PlaybackStrategyManagement() {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    displayMode: 'all' as 'all' | 'core_bones' | 'company_showcase',
    description: '',
    autoPlayInterval: 5000,
  });

  const utils = trpc.useUtils();
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

  const deleteMutation = trpc.playback.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const setActiveMutation = trpc.playback.setActive.useMutation({
    onSuccess: () => {
      refetch();
      utils.playback.getActive.invalidate();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(formData);
  };

  const displayModeLabel = {
    all: '全部员工',
    core_bones: '核心骨干',
    company_showcase: '公司风采',
  };

  const displayModeIcon = {
    all: Users,
    core_bones: Zap,
    company_showcase: Trophy,
  };

  const displayModeColor = {
    all: 'from-blue-500 to-blue-600',
    core_bones: 'from-yellow-500 to-yellow-600',
    company_showcase: 'from-purple-500 to-purple-600',
  };

  // 快速切换预设策略
  const quickSwitchModes = [
    { mode: 'all' as const, label: '普通工作日', description: '展示全部员工' },
    { mode: 'core_bones' as const, label: '参观接待-核心骨干', description: '仅展示核心骨干' },
    { mode: 'company_showcase' as const, label: '参观接待-公司风采展示', description: '展示公司风采照片' },
  ];

  const handleQuickSwitch = async (mode: 'all' | 'core_bones' | 'company_showcase') => {
    let strategy = strategies.find(s => s.displayMode === mode);
    
    if (!strategy) {
      const newStrategy = await createMutation.mutateAsync({
        name: quickSwitchModes.find(m => m.mode === mode)?.label || '',
        displayMode: mode,
        description: quickSwitchModes.find(m => m.mode === mode)?.description || '',
        autoPlayInterval: 5000,
      });
      strategy = newStrategy;
      await refetch();
    }
    
    if (strategy) {
      await setActiveMutation.mutateAsync({ id: strategy.id });
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* 快速切换区域 */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">快速切换模式</h2>
        <p className="text-sm text-gray-600">点击下方按钮快速切换展示模式</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickSwitchModes.map((item) => {
            const Icon = displayModeIcon[item.mode];
            const isActive = activeStrategy?.displayMode === item.mode;
            
            return (
              <motion.button
                key={item.mode}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickSwitch(item.mode)}
                className={`relative p-6 rounded-xl transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-br ${displayModeColor[item.mode]} text-white shadow-lg ring-2 ring-offset-2 ${
                        item.mode === 'all' ? 'ring-blue-500' : item.mode === 'core_bones' ? 'ring-yellow-500' : 'ring-purple-500'
                      }`
                    : 'bg-white border-2 border-gray-200 text-gray-900 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
                    <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-700'}`} />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className={`font-bold text-base ${isActive ? 'text-white' : 'text-gray-900'}`}>
                      {item.label}
                    </h3>
                    <p className={`text-sm mt-1 ${isActive ? 'text-white/80' : 'text-gray-600'}`}>
                      {item.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="flex-shrink-0">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 分割线 */}
      <div className="border-t border-gray-200" />

      {/* 策略列表区域 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">策略列表</h2>
            <p className="text-sm text-gray-600 mt-1">管理所有轮播策略</p>
          </div>
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
            className="flex items-center gap-2 hidden"
          >
            <Plus className="w-4 h-4" />
            添加自定义策略
          </Button>
        </div>

        {isAddingNew && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg space-y-4 border border-gray-200"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">策略名称</label>
              <Input
                placeholder="例如：周一工作日、周末接待"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">展示模式</label>
              <select
                value={formData.displayMode}
                onChange={e => setFormData({ ...formData, displayMode: e.target.value as 'all' | 'core_bones' | 'company_showcase' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全部员工</option>
                <option value="core_bones">核心骨干</option>
                <option value="company_showcase">公司风采</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">策略描述</label>
              <textarea
                placeholder="描述这个策略的用途和特点"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">轮播间隔（秒）</label>
              <Input
                type="number"
                placeholder="5"
                value={formData.autoPlayInterval / 1000}
                onChange={e => setFormData({ ...formData, autoPlayInterval: parseInt(e.target.value) * 1000 })}
                min="1"
                step="1"
              />
              <p className="text-xs text-gray-500 mt-1">建议值：5秒</p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" variant="default">
                创建策略
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

        {/* 策略表格 */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">策略名称</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">展示模式</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">轮播间隔</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">状态</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {strategies.map((strategy) => {
                const Icon = displayModeIcon[strategy.displayMode as keyof typeof displayModeIcon];
                return (
                  <tr key={strategy.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{strategy.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="w-4 h-4 text-gray-600" />}
                        <span className="text-gray-700">
                          {displayModeLabel[strategy.displayMode as keyof typeof displayModeLabel]}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{strategy.autoPlayInterval / 1000}s</td>
                    <td className="px-6 py-4">
                      {strategy.isActive ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          <Check className="w-3 h-3" />
                          活跃
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                          未激活
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {!strategy.isActive && (
                          <button
                            onClick={() => setActiveMutation.mutate({ id: strategy.id })}
                            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                            title="激活策略"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteMutation.mutate({ id: strategy.id })}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors hidden"
                          title="删除策略"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {strategies.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>暂无轮播策略，请先创建一个</p>
          </div>
        )}
      </div>
    </div>
  );
}
