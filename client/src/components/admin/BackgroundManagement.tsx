import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { PhotoUpload } from '@/components/PhotoUpload';
import type { ShowcaseBackground } from '../../../../drizzle/schema';

export default function BackgroundManagement() {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<Partial<ShowcaseBackground>>({});
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const { data: backgrounds = [], refetch } = trpc.backgrounds.list.useQuery();

  const createMutation = trpc.backgrounds.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddingNew(false);
      setFormData({});
      setUploadedUrl(null);
    },
  });

  const setActiveMutation = trpc.backgrounds.setActive.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const deleteMutation = trpc.backgrounds.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const uploadMutation = trpc.upload.uploadPhoto.useMutation();

  const handleUploadPhoto = async (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const result = await uploadMutation.mutateAsync({
            fileName: file.name,
            fileData: base64,
            fileType: file.type,
          });
          resolve(result.url);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createMutation.mutateAsync({
      name: formData.name || '',
      backgroundUrl: uploadedUrl || '',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* 添加按钮 */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">背景图片管理</h2>
        <Button
          onClick={() => {
            setIsAddingNew(!isAddingNew);
            setFormData({});
            setUploadedUrl(null);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加背景
        </Button>
      </div>

      {/* 添加表单 */}
      {isAddingNew && (
        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-muted p-6 rounded-lg space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="背景名称"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <select
              value={formData.displayMode || 'all'}
              onChange={(e) =>
                setFormData({ ...formData, displayMode: e.target.value as any })
              }
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">全部展示模式</option>
              <option value="core_bones">核心骨干模式</option>
              <option value="honors">荣誉榜模式</option>
            </select>
          </div>

          <textarea
            placeholder="背景描述"
            value={(formData.description as string) || ''}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            rows={2}
          />

          {/* 照片上传 */}
          <div>
            <label className="block text-sm font-medium mb-2">背景图片</label>
            <PhotoUpload
              onUpload={handleUploadPhoto}
              onPhotoSelected={setUploadedUrl}
              currentPhotoUrl={uploadedUrl || undefined}
              isLoading={uploadMutation.isPending || createMutation.isPending}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="default" disabled={createMutation.isPending}>
              {createMutation.isPending ? '添加中...' : '添加背景'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddingNew(false);
                setFormData({});
                setUploadedUrl(null);
              }}
            >
              取消
            </Button>
          </div>
        </motion.form>
      )}

      {/* 背景列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {backgrounds.map((bg) => (
          <motion.div
            key={bg.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* 背景图片预览 */}
            <div className="relative w-full h-40 bg-muted overflow-hidden">
              <img
                src={bg.backgroundUrl}
                alt={bg.name}
                className="w-full h-full object-cover"
              />
              {bg.isActive && (
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              )}
            </div>

            {/* 背景信息 */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-sm">{bg.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {bg.displayMode === 'all'
                    ? '全部模式'
                    : bg.displayMode === 'core_bones'
                    ? '核心骨干'
                    : '荣誉榜'}
                </p>
              </div>

              {bg.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {bg.description}
                </p>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-2">
                {!bg.isActive && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveMutation.mutate({ id: bg.id })}
                    disabled={setActiveMutation.isPending}
                    className="flex-1"
                  >
                    设为活跃
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate({ id: bg.id })}
                  disabled={deleteMutation.isPending}
                  className="flex-1"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {backgrounds.length === 0 && !isAddingNew && (
        <div className="text-center py-8 text-muted-foreground">
          暂无背景图片
        </div>
      )}
    </div>
  );
}
