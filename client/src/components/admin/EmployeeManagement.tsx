import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Upload, X, ChevronUp, ChevronDown, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { PhotoUpload } from '@/components/PhotoUpload';
import type { Employee } from '../../../../drizzle/schema';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export default function EmployeeManagement() {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [selectedHonors, setSelectedHonors] = useState<number[]>([]);
  const [showHonorSelector, setShowHonorSelector] = useState(false);
  const [showImportHelp, setShowImportHelp] = useState(false);

  const { data: employees = [], refetch } = trpc.employees.list.useQuery({});
  const { data: departments = [] } = trpc.departments.list.useQuery();
  const { data: honors = [] } = trpc.honors.list.useQuery();

  const createMutation = trpc.employees.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddingNew(false);
      setFormData({});
      setUploadedPhotoUrl(null);
    },
  });

  const updateMutation = trpc.employees.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingId(null);
      setFormData({});
      setUploadedPhotoUrl(null);
    },
  });

  const deleteMutation = trpc.employees.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const reorderMutation = trpc.employees.reorder.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const uploadMutation = trpc.upload.uploadPhoto.useMutation();
  const importMutation = trpc.employees.import.useMutation({
    onSuccess: (result: any) => {
      refetch();
      setIsImporting(false);
      setImportProgress(null);
      setImportError(null);
      setImportSuccess(`成功导入 ${result.successCount} 条员工信息${result.errorCount > 0 ? `，失败 ${result.errorCount} 条` : ''}`);
      setTimeout(() => setImportSuccess(null), 5000);
    },
    onError: (error: any) => {
      setIsImporting(false);
      setImportProgress(null);
      setImportError(error.message || '导入失败，请检查文件格式');
      setTimeout(() => setImportError(null), 5000);
    },
  });

  const handleUploadPhoto = async (file: File) => {
    // 读取文件为 base64
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

    if (editingId) {
      // 编辑模式 - 包含照片
      await updateMutation.mutateAsync({
        id: editingId,
        name: formData.name,
        departmentId: formData.departmentId,
        position: formData.position,
        level: formData.level,
        joinDate: formData.joinDate,
        systemJoinDate: formData.systemJoinDate || null,
        jobResponsibilities: formData.jobResponsibilities || undefined,
        workTenet: formData.workTenet || undefined,
        workPhoto: uploadedPhotoUrl || undefined,
        isCoreBone: formData.isCoreBone,
        isPartyMember: formData.isPartyMember,
      });
    } else {
      // 新增模式 - 包含照片
      await createMutation.mutateAsync({
        name: formData.name || '',
        departmentId: formData.departmentId || 1,
        position: formData.position || '',
        level: formData.level || '',
        joinDate: formData.joinDate || new Date(),
        systemJoinDate: formData.systemJoinDate || undefined,
        jobResponsibilities: formData.jobResponsibilities || undefined,
        workTenet: formData.workTenet || undefined,
        workPhoto: uploadedPhotoUrl || undefined,
        isCoreBone: formData.isCoreBone,
        isPartyMember: formData.isPartyMember,
      });
    }
  };

  const handleEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setFormData(emp);
    setUploadedPhotoUrl(null);
    setIsAddingNew(false);
  };

  const handleImportFile = async (file: File) => {
    setImportError(null);
    setImportSuccess(null);
    setIsImporting(true);
    setImportProgress({ current: 0, total: 0 });

    try {
      let data: any[] = [];

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // 处理 Excel 文件
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(worksheet);
      } else if (file.name.endsWith('.csv')) {
        // 处理 CSV 文件
        return new Promise<void>((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results: any) => {
              try {
                data = results.data as any[];
                await processImportData(data);
                resolve();
              } catch (error) {
                reject(error);
              }
            },
            error: (error: any) => reject(new Error(`CSV 解析失败: ${error.message}`)),
          });
        });
      } else {
        throw new Error('不支持的文件格式，请上传 .xlsx 或 .csv 文件');
      }

      await processImportData(data);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : '导入失败');
      setIsImporting(false);
      setImportProgress(null);
    }
  };

  const processImportData = async (data: any[]) => {
    if (data.length === 0) {
      throw new Error('文件中没有数据');
    }

    // 验证列名
    const requiredColumns = ['姓名', '部门', '岗位', '职级', '入职时间'];
    const headers = Object.keys(data[0] || {});
    const missingColumns = requiredColumns.filter(col => !headers.some(h => h.includes(col)));
    
    if (missingColumns.length > 0) {
      throw new Error(`缺少必要列: ${missingColumns.join(', ')}`);
    }

    // 转换数据格式
    const employees = data.map((row: any) => ({
      name: row['姓名']?.trim() || '',
      departmentName: row['部门']?.trim() || '',
      position: row['岗位']?.trim() || '',
      level: row['职级']?.trim() || '',
      joinDate: row['入职时间'] || '',
      jobResponsibilities: row['工作职责']?.trim() || '',
      workTenet: row['工作信条']?.trim() || '',
    }));

    setImportProgress({ current: 0, total: employees.length });

    // 调用后端导入接口
    try {
      await importMutation.mutateAsync({ employees });
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 添加按钮和导入按钮 */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">员工列表</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setIsAddingNew(!isAddingNew);
              setFormData({});
              setUploadedPhotoUrl(null);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加员工
          </Button>
          <label className="flex items-center gap-2">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImportFile(file);
                }
              }}
              disabled={isImporting}
              className="hidden"
            />
            <Button
              variant="outline"
              className="flex items-center gap-2 cursor-pointer"
              disabled={isImporting}
              onClick={() => {
                const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                input?.click();
              }}
            >
              <Upload className="w-4 h-4" />
              {isImporting ? '导入中...' : '批量导入'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImportHelp(true)}
              className="p-0 h-auto"
              title="查看批量导入帮助"
            >
              <HelpCircle className="w-4 h-4 text-gray-500 hover:text-gray-700" />
            </Button>
          </label>
        </div>
      </div>

      {/* 导入进度和消息 */}
      {importProgress && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              正在导入: {importProgress.current} / {importProgress.total}
            </span>
            <div className="w-48 bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(importProgress.current / importProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {importError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-900"
        >
          {importError}
        </motion.div>
      )}

      {importSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-900"
        >
          {importSuccess}
        </motion.div>
      )}

      {/* 添加/编辑表单 */}
      {(isAddingNew || editingId) && (
        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-muted p-6 rounded-lg space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="姓名"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <select
              value={String(formData.departmentId || '')}
              onChange={(e) =>
                setFormData({ ...formData, departmentId: parseInt(e.target.value) })
              }
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">选择部门</option>
              {departments.map((dept) => (
                <option key={dept.id} value={String(dept.id)}>
                  {dept.name}
                </option>
              ))}
            </select>
            <Input
              placeholder="岗位"
              value={formData.position || ''}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              required
            />
            <Input
              placeholder="职级"
              value={formData.level || ''}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              required
            />
            <Input
              type="date"
              value={
                formData.joinDate
                  ? new Date(formData.joinDate as any)
                      .toISOString()
                      .split('T')[0]
                  : ''
              }
              onChange={(e) =>
                setFormData({ ...formData, joinDate: new Date(e.target.value) })
              }
              required
            />
            <Input
              type="date"
              placeholder="入职深国际系统时间（可选）"
              value={
                formData.systemJoinDate
                  ? new Date(formData.systemJoinDate as any)
                      .toISOString()
                      .split('T')[0]
                  : ''
              }
              onChange={(e) =>
                setFormData({ ...formData, systemJoinDate: e.target.value ? new Date(e.target.value) : undefined })
              }
            />
          </div>

          {/* 照片上传 */}
          <div>
            <label className="block text-sm font-medium mb-2">工作照</label>
            <PhotoUpload
              onUpload={handleUploadPhoto}
              onPhotoSelected={setUploadedPhotoUrl}
              currentPhotoUrl={uploadedPhotoUrl || (formData.workPhoto as string | undefined)}
              isLoading={uploadMutation.isPending || createMutation.isPending || updateMutation.isPending}
            />
          </div>

          <textarea
            placeholder="工作职责"
            value={(formData.jobResponsibilities as string) || ''}
            onChange={(e) =>
              setFormData({ ...formData, jobResponsibilities: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
          />
          <textarea
            placeholder="工作信条"
            value={(formData.workTenet as string) || ''}
            onChange={(e) => setFormData({ ...formData, workTenet: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={2}
          />

          {/* 荣誉选择器 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">关联荣誉</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowHonorSelector(!showHonorSelector)}
                className="w-full px-3 py-2 border rounded-lg text-left bg-white hover:bg-gray-50 transition-colors"
              >
                {selectedHonors.length > 0 ? `已选择 ${selectedHonors.length} 个荣誉` : '选择荣誉...'}
              </button>
              {showHonorSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-1 left-0 right-0 bg-white border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
                >
                  {honors.map((honor: any) => (
                    <label
                      key={honor.id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedHonors.includes(honor.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedHonors([...selectedHonors, honor.id]);
                          } else {
                            setSelectedHonors(selectedHonors.filter(id => id !== honor.id));
                          }
                        }}
                        className="w-4 h-4 rounded"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{honor.title}</div>
                        <div className="text-xs text-muted-foreground">{honor.category}</div>
                      </div>
                    </label>
                  ))}
                </motion.div>
              )}
            </div>
            {selectedHonors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedHonors.map(honorId => {
                  const honor = honors.find((h: any) => h.id === honorId);
                  return honor ? (
                    <div
                      key={honorId}
                      className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                    >
                      <span>{honor.title}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedHonors(selectedHonors.filter(id => id !== honorId))}
                        className="hover:text-red-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* 复选框选项 */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isCoreBone || false}
                onChange={(e) => setFormData({ ...formData, isCoreBone: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">核心骨干</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPartyMember || false}
                onChange={(e) => setFormData({ ...formData, isPartyMember: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">党员</span>
            </label>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              variant="default"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingId ? '保存修改' : '添加员工'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddingNew(false);
                setEditingId(null);
                setFormData({});
                setUploadedPhotoUrl(null);
              }}
            >
              取消
            </Button>
          </div>
        </motion.form>
      )}

      {/* 员工列表 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left w-16">序号</th>
              <th className="px-4 py-2 text-left">照片</th>
              <th className="px-4 py-2 text-left">姓名</th>
              <th className="px-4 py-2 text-left">部门</th>
              <th className="px-4 py-2 text-left">岗位</th>
              <th className="px-4 py-2 text-left">职级</th>
              <th className="px-4 py-2 text-left">入职时间</th>
              <th className="px-4 py-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, index) => (
              <tr key={emp.id} className="border-b hover:bg-muted/50">
                <td className="px-4 py-2 font-medium text-gray-600">{index + 1}</td>
                <td className="px-4 py-2">
                  {emp.workPhoto ? (
                    <img
                      src={emp.workPhoto}
                      alt={emp.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs">
                      无
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">{emp.name}</td>
                <td className="px-4 py-2">{departments.find(d => d.id === emp.departmentId)?.name || emp.departmentId}</td>
                <td className="px-4 py-2">{emp.position}</td>
                <td className="px-4 py-2">{emp.level}</td>
                <td className="px-4 py-2">
                  {new Date(emp.joinDate).toLocaleDateString('zh-CN')}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => reorderMutation.mutate({ id: emp.id, direction: 'up' })}
                      disabled={reorderMutation.isPending}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-40"
                      title="上移"
                    >
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => reorderMutation.mutate({ id: emp.id, direction: 'down' })}
                      disabled={reorderMutation.isPending}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-40"
                      title="下移"
                    >
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleEdit(emp)}
                      className="p-1 hover:bg-blue-100 rounded"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate({ id: emp.id })}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {employees.length === 0 && !isAddingNew && (
        <div className="text-center py-8 text-muted-foreground">
          暂无员工信息
        </div>
      )}

      {/* 导入帮助弹窗 */}
      {showImportHelp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImportHelp(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">批量导入使用说明</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImportHelp(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">支持的文件格式</h4>
                <p className="text-gray-600">Excel (.xlsx, .xls) 或 CSV 格式</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">必要列（必须包含）</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>姓名 - 员工姓名</li>
                  <li>部门 - 员工所属部门（必须与系统中的部门名称完全一致）</li>
                  <li>岗位 - 员工职位</li>
                  <li>职级 - 员工职级</li>
                  <li>入职时间 - 入职日期 (YYYY-MM-DD 或 YYYY/MM/DD)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">可选列（可选包含）</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>工作职责 - 员工的主要工作职责</li>
                  <li>工作信条 - 员工的工作理念或座右铭</li>
                  <li>照片URL - 员工照片的网络链接 (HTTP/HTTPS)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">使用步骤</h4>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  <li>准备 Excel 或 CSV 文件，包含必要列</li>
                  <li>点击"批量导入"按钮</li>
                  <li>选择您的文件</li>
                  <li>等待导入完成，查看导入结果</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">常见错误</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>部门不存在 - 检查部门名称拼写是否与系统一致</li>
                  <li>日期格式错误 - 使用 YYYY-MM-DD 或 YYYY/MM/DD 格式</li>
                  <li>缺少必要列 - 确保包含：姓名、部门、岗位、职级、入职时间</li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <p className="text-gray-600 mb-2">需要示例文件？</p>
                <a
                  href="/employees_sample.csv"
                  download
                  className="text-blue-600 hover:underline"
                >
                  下载 CSV 示例文件
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
