'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CoreBoneManagement() {
  const { data: employees = [] } = trpc.employees.list.useQuery({});
  const utils = trpc.useUtils();
  
  const updateMutation = trpc.employees.update.useMutation({
    onSuccess: () => {
      utils.employees.list.invalidate();
    },
  });

  const coreEmployees = employees.filter(emp => emp.isCoreBone);
  const nonCoreEmployees = employees.filter(emp => !emp.isCoreBone);

  const handleToggleCoreBone = async (employeeId: number, isCoreBone: boolean) => {
    await updateMutation.mutateAsync({
      id: employeeId,
      isCoreBone: !isCoreBone,
    });
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">核心骨干管理</h2>
        <p className="text-gray-600">管理核心骨干员工，核心骨干员工将在轮播中单独展示</p>
      </div>

      {/* 核心骨干列表 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            核心骨干 ({coreEmployees.length})
          </h3>
          <span className="text-sm text-gray-500">共 {employees.length} 名员工</span>
        </div>

        {coreEmployees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreEmployees.map((employee) => (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{employee.name}</h4>
                    <p className="text-sm text-gray-600">{employee.position}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-200 text-green-700 rounded-full text-xs font-semibold">
                    <Check className="w-3 h-3" />
                    核心
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3">部门: {employee.departmentId}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleCoreBone(employee.id, true)}
                  disabled={updateMutation.isPending}
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <X className="w-3 h-3 mr-1" />
                  取消核心骨干
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">暂无核心骨干员工</p>
          </div>
        )}
      </div>

      {/* 非核心骨干列表 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          普通员工 ({nonCoreEmployees.length})
        </h3>

        {nonCoreEmployees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nonCoreEmployees.map((employee) => (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{employee.name}</h4>
                    <p className="text-sm text-gray-600">{employee.position}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3">部门: {employee.departmentId}</p>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleToggleCoreBone(employee.id, false)}
                  disabled={updateMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-3 h-3 mr-1" />
                  设为核心骨干
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">所有员工都是核心骨干</p>
          </div>
        )}
      </div>
    </div>
  );
}
