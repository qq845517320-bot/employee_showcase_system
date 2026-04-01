# 员工风采大屏展示系统 - 轮播策略详细解析

## 📚 目录
1. [轮播策略概述](#轮播策略概述)
2. [核心骨干的工作原理](#核心骨干的工作原理)
3. [荣誉榜的工作原理](#荣誉榜的工作原理)
4. [轮播流程详解](#轮播流程详解)
5. [代码实现分析](#代码实现分析)
6. [用户交互流程](#用户交互流程)

---

## 🎯 轮播策略概述

系统采用**分层轮播策略**，将员工展示分为两个主要维度：

| 维度 | 说明 | 触发条件 |
|------|------|--------|
| **批次轮播** | 将所有员工分成多个批次（每批10人），按批次循环展示 | 用户无操作 30 秒后自动启动 |
| **详情轮播** | 在单个批次内，依次展示每个员工的详细信息卡片 | 批次轮播启动后自动进行 |
| **部门筛选** | 按部门或荣誉榜筛选员工，只展示符合条件的员工 | 用户点击部门按钮或荣誉榜按钮 |

---

## 🏆 核心骨干的工作原理

### 1. 定义

**核心骨干** 在本系统中指的是**在轮播中优先展示的关键员工**。虽然代码中没有明确的"核心骨干"标签，但系统通过以下机制实现了优先展示：

### 2. 优先展示机制

#### 方式 1：中心排序（Center-Out Sorting）

```typescript
// 第 342-352 行：centerSortedEmployees 的实现
const centerSortedEmployees = (() => {
  if (displayEmployees.length === 0) return [];
  const sorted: any[] = [];
  const middle = Math.floor(displayEmployees.length / 2);
  sorted.push(displayEmployees[middle]);  // 先添加中间的员工
  
  // 然后按照从中间向两侧扩展的方式添加
  for (let i = 1; i <= middle; i++) {
    if (middle - i >= 0) sorted.push(displayEmployees[middle - i]);
    if (middle + i < displayEmployees.length) sorted.push(displayEmployees[middle + i]);
  }
  return sorted;
})();
```

**工作原理：**
- 找到员工列表的中间位置
- 将中间的员工作为"核心"首先展示
- 然后依次向两侧扩展，形成"中心向外"的展示顺序

**示例：**
```
原始列表：[A, B, C, D, E, F, G, H, I, J]
中间位置：5（E 和 F）
排序后：[E, D, F, C, G, B, H, A, I, J]
        ↑  ↑  ↑  ↑  ↑  ↑  ↑  ↑  ↑  ↑
        1  2  3  4  5  6  7  8  9  10
```

#### 方式 2：批次分配

```typescript
// 第 354-357 行：将员工分配到四个展示列
const leftColumn = currentBatch.slice(0, 2);        // 左侧列（2人）
const leftMiddleColumn = currentBatch.slice(2, 5);  // 左中间列（3人）
const rightMiddleColumn = currentBatch.slice(5, 8); // 右中间列（3人）
const rightColumn = currentBatch.slice(8, 10);      // 右侧列（2人）
```

**布局结构：**
```
┌─────────────────────────────────────────────────┐
│  左侧(2)  │  左中(3)  │  中心详情  │  右中(3)  │  右侧(2)  │
│  ★★      │  ★★★    │  ★★★★★  │  ★★★    │  ★★      │
└─────────────────────────────────────────────────┘
```

**核心骨干优先展示原理：**
- 中间位置的员工被排序到最前面
- 最前面的员工会被分配到**中心详情卡片**（5个位置）
- 中心详情卡片是整个大屏最醒目的位置
- 因此中间位置的员工（通常是公司核心管理层或重要员工）得到最优先的展示

### 3. 核心骨干的自动轮播流程

```
用户无操作 30 秒
        ↓
启动自动轮播（isAutoPlayDetail = true）
        ↓
停止批次轮播（stopBatchRotation）
        ↓
启动详情轮播（startDetailRotation）
        ↓
每 5 秒切换一个员工的详情卡片
        ↓
循环展示当前批次的所有员工
        ↓
用户有操作（点击、搜索、滚轮）
        ↓
重置计时器，返回批次轮播模式
```

### 4. 代码实现

```typescript
// 第 252-264 行：详情轮播实现
const startDetailRotation = () => {
  if (detailIntervalRef.current) clearInterval(detailIntervalRef.current);
  let index = currentDetailIndex;
  
  if (filteredEmployees.length > 0) {
    setSelectedEmployee(filteredEmployees[index]);
  }
  
  // 每 5 秒切换一个员工
  detailIntervalRef.current = setInterval(() => {
    if (filteredEmployees.length === 0) return;
    index = (index + 1) % filteredEmployees.length;  // 循环轮播
    setCurrentDetailIndex(index);
    setSelectedEmployee(filteredEmployees[index]);
  }, 5000);  // 5 秒间隔
};
```

---

## 🌟 荣誉榜的工作原理

### 1. 定义

**荣誉榜** 是一个特殊的筛选视图，用于展示所有获得过荣誉/奖励的员工。

### 2. 荣誉榜的筛选逻辑

```typescript
// 第 336-340 行：荣誉榜筛选
const displayEmployees = selectedDepartment === null
  ? filteredEmployees                    // 显示所有员工
  : selectedDepartment === 'honors'
  ? filteredEmployees.filter(emp => emp.honors && emp.honors.length > 0)  // 只显示有荣誉的员工
  : filteredEmployees.filter(emp => emp.departmentId === selectedDepartment);  // 显示特定部门
```

**关键点：**
- 当用户点击"★荣誉榜★"按钮时，`selectedDepartment` 被设置为 `'honors'`
- 系统自动过滤出所有 `honors` 数组不为空的员工
- 只有获得过荣誉的员工才会在荣誉榜中显示

### 3. 荣誉数据的获取

```typescript
// 第 179-182 行：获取员工详细信息（包括荣誉）
const { data: selectedEmployeeDetail } = trpc.employees.get.useQuery(
  { id: selectedEmployee?.id || 0 },
  { enabled: !!selectedEmployee?.id }
);
```

**后端返回数据结构：**
```typescript
{
  id: 1,
  name: "张三",
  position: "总经理",
  departmentId: 1,
  workPhoto: "https://...",
  workResponsibilities: "负责公司整体运营管理",
  workCredo: "诚信、创新、卓越",
  honors: [
    { id: 1, title: "2024年度优秀管理者" },
    { id: 2, title: "2023年度先进工作者" },
    { id: 3, title: "2022年度杰出贡献奖" }
  ]
}
```

### 4. 荣誉的前端展示

```typescript
// 第 137-143 行：在详情卡片中显示荣誉
<div className="flex-1">
  <div className="font-semibold mb-2 text-xl">{"奖励荣誉："}</div>
  <div className="text-base space-y-1">
    {selectedEmployeeDetail?.honors && selectedEmployeeDetail.honors.length > 0 ? (
      selectedEmployeeDetail.honors.map((honor: any, idx: number) => (
        <div key={idx} className="text-sm leading-relaxed">• {honor.title}</div>
      ))
    ) : (
      <div className="text-sm text-gray-300">暂无荣誉记录</div>
    )}
  </div>
</div>
```

### 5. 荣誉榜的轮播流程

```
用户点击"★荣誉榜★"按钮
        ↓
selectedDepartment = 'honors'
        ↓
过滤出所有有荣誉的员工
        ↓
重新计算批次（只包含有荣誉的员工）
        ↓
显示荣誉员工的六边形照片
        ↓
用户无操作 30 秒
        ↓
启动自动轮播，依次展示荣誉员工的详情卡片
        ↓
每张卡片显示员工的荣誉列表
```

---

## 🔄 轮播流程详解

### 1. 批次轮播流程（Batch Rotation）

```
初始状态：currentBatchIndex = 0
        ↓
计算当前批次的员工（每批 10 人）
        ↓
将员工分配到 4 个展示列
        ↓
显示六边形照片阵列
        ↓
每 5 秒自动切换到下一批次
        ↓
currentBatchIndex = (currentBatchIndex + 1) % totalBatches
        ↓
循环回到第一批次
```

**代码实现：**
```typescript
// 第 238-246 行：批次轮播
const startBatchRotation = () => {
  if (batchIntervalRef.current) clearInterval(batchIntervalRef.current);
  batchIntervalRef.current = setInterval(() => {
    setCurrentBatchIndex(prev => {
      const total = Math.ceil(filteredEmployees.length / 10);
      return total > 0 ? (prev + 1) % total : 0;
    });
  }, 5000);  // 每 5 秒切换一次
};
```

### 2. 详情轮播流程（Detail Rotation）

```
启动详情轮播
        ↓
selectedEmployee = filteredEmployees[0]
        ↓
显示第一个员工的详情卡片
        ↓
每 5 秒切换到下一个员工
        ↓
selectedEmployee = filteredEmployees[(index + 1) % length]
        ↓
循环显示所有员工的详情
```

### 3. 无操作自动启动流程

```
用户操作（点击、搜索、滚轮等）
        ↓
resetInactivityTimer() 被调用
        ↓
清除旧的无操作计时器
        ↓
启动新的 30 秒无操作计时器
        ↓
如果 30 秒内没有新操作
        ↓
自动启动详情轮播
        ↓
停止批次轮播
        ↓
开始循环展示员工详情卡片
```

**代码实现：**
```typescript
// 第 226-236 行：无操作计时器
const resetInactivityTimer = () => {
  if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
  setIsAutoPlayDetail(false);
  if (detailIntervalRef.current) clearInterval(detailIntervalRef.current);
  startBatchRotation();
  
  // 30 秒无操作后自动启动详情轮播
  inactivityTimeoutRef.current = setTimeout(() => {
    setIsAutoPlayDetail(true);
    stopBatchRotation();
    startDetailRotation();
  }, 30000);  // 30 秒
};
```

---

## 💻 代码实现分析

### 1. 关键状态变量

| 变量 | 类型 | 说明 |
|------|------|------|
| `selectedDepartment` | number \| string \| null | 当前选中的部门（null=全部, 'honors'=荣誉榜） |
| `selectedEmployee` | Employee \| null | 当前选中的员工 |
| `isAutoPlayDetail` | boolean | 是否在自动轮播详情卡片 |
| `currentBatchIndex` | number | 当前批次索引 |
| `currentDetailIndex` | number | 当前详情索引 |
| `filteredEmployees` | Employee[] | 经过搜索/筛选后的员工列表 |

### 2. 关键函数

| 函数 | 功能 |
|------|------|
| `startBatchRotation()` | 启动批次轮播（每 5 秒切换一批） |
| `stopBatchRotation()` | 停止批次轮播 |
| `startDetailRotation()` | 启动详情轮播（每 5 秒切换一个员工） |
| `resetInactivityTimer()` | 重置无操作计时器 |
| `handleDepartmentClick()` | 处理部门/荣誉榜点击 |
| `handleEmployeeClick()` | 处理员工点击 |

### 3. 时间配置

| 事件 | 时间 | 说明 |
|------|------|------|
| 批次切换间隔 | 5 秒 | 每 5 秒显示下一批员工 |
| 详情切换间隔 | 5 秒 | 每 5 秒显示下一个员工的详情 |
| 无操作自动启动 | 30 秒 | 30 秒无操作后自动启动详情轮播 |

---

## 👥 用户交互流程

### 场景 1：用户进入页面（默认状态）

```
1. 页面加载
   ↓
2. 显示第一批员工的六边形照片（批次轮播）
   ↓
3. 启动无操作计时器（30 秒）
   ↓
4. 每 5 秒自动切换到下一批员工
   ↓
5. 如果 30 秒无操作
   ↓
6. 自动启动详情轮播
   ↓
7. 显示员工详情卡片，每 5 秒切换一个员工
```

### 场景 2：用户点击员工照片

```
1. 用户点击六边形照片
   ↓
2. 停止批次轮播
   ↓
3. 显示该员工的详情卡片
   ↓
4. 重置无操作计时器
   ↓
5. 用户可以通过上一个/下一个按钮或鼠标滚轮切换员工
   ↓
6. 如果 30 秒无操作
   ↓
7. 自动启动详情轮播
```

### 场景 3：用户点击荣誉榜

```
1. 用户点击"★荣誉榜★"按钮
   ↓
2. selectedDepartment = 'honors'
   ↓
3. 过滤出所有有荣誉的员工
   ↓
4. 重新计算批次
   ↓
5. 显示荣誉员工的六边形照片
   ↓
6. 启动批次轮播（只包含荣誉员工）
   ↓
7. 用户可以点击照片查看详情
   ↓
8. 详情卡片会显示该员工的所有荣誉
```

### 场景 4：用户搜索员工

```
1. 用户输入搜索词
   ↓
2. 过滤员工列表
   ↓
3. 自动选中第一个搜索结果
   ↓
4. 显示该员工的详情卡片
   ↓
5. 重置无操作计时器
   ↓
6. 用户可以通过按钮切换搜索结果中的其他员工
```

---

## 🎨 视觉效果

### 批次轮播时的布局

```
┌──────────────────────────────────────────────────────────────┐
│                                                                │
│  ◆◆      ◆◆◆      ◆◆◆◆◆      ◆◆◆      ◆◆                │
│  ◆◆      ◆◆◆      ◆◆◆◆◆      ◆◆◆      ◆◆                │
│          ◆◆◆      ◆◆◆◆◆      ◆◆◆                          │
│                    ◆◆◆◆◆                                      │
│                    ◆◆◆◆◆                                      │
│                                                                │
│  左侧(2)  左中(3)  中心(5)    右中(3)  右侧(2)                │
│                                                                │
│  ← 搜索 →                                                      │
│  页码: 1/2                                                      │
└──────────────────────────────────────────────────────────────┘
```

### 详情轮播时的布局

```
┌──────────────────────────────────────────────────────────────┐
│                                                                │
│  ◆◆      ◆◆◆    ┌─────────────────────┐    ◆◆◆      ◆◆    │
│  ◆◆      ◆◆◆    │  员工详情卡片       │    ◆◆◆      ◆◆    │
│          ◆◆◆    │  名字、部门、职位   │    ◆◆◆            │
│                  │  工作职责           │                      │
│                  │  工作信条           │                      │
│                  │  奖励荣誉           │                      │
│                  │  [自动轮播中...]    │                      │
│                  └─────────────────────┘                      │
│                                                                │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 数据流向图

```
员工数据库
    ↓
获取所有员工 (employees)
    ↓
搜索/部门筛选
    ↓
filteredEmployees
    ↓
├─ 批次轮播模式
│  ├─ 计算批次
│  ├─ 分配到 4 列
│  └─ 显示六边形照片
│
└─ 详情轮播模式
   ├─ 获取详细信息 (honors)
   ├─ 显示详情卡片
   └─ 循环切换员工
```

---

## 🔑 关键设计特点

1. **中心优先展示**：通过中心排序算法，确保重要员工（通常在中间位置）优先展示
2. **自动启动**：30 秒无操作自动启动详情轮播，适合大屏展示场景
3. **灵活筛选**：支持部门筛选和荣誉榜筛选，方便不同场景使用
4. **平滑过渡**：使用 Framer Motion 动画库实现流畅的过渡效果
5. **用户友好**：支持多种交互方式（点击、滚轮、键盘、按钮）

---

**最后更新**: 2026-03-30
**版本**: 1.0.0
