# 员工风采大屏展示系统 - 轮播功能测试指南

## 📋 目录
1. [测试准备](#测试准备)
2. [手动测试](#手动测试)
3. [浏览器开发者工具调试](#浏览器开发者工具调试)
4. [自动化测试](#自动化测试)
5. [常见问题排查](#常见问题排查)

---

## 🔧 测试准备

### 1. 确保系统正常运行

```bash
# 启动开发服务器
cd /home/ubuntu/employee_showcase_system
pnpm dev

# 打开浏览器访问
http://localhost:3000/showcase
```

### 2. 确保数据库有足够的测试数据

```bash
# 查看员工数量
mysql -u root -p employee_showcase -e "SELECT COUNT(*) as 员工总数 FROM employees;"

# 查看荣誉数据
mysql -u root -p employee_showcase -e "SELECT e.name, COUNT(h.id) as 荣誉数 FROM employees e LEFT JOIN honors h ON e.id = h.employeeId GROUP BY e.id HAVING 荣誉数 > 0;"
```

### 3. 打开浏览器开发者工具

```
Windows/Linux: F12 或 Ctrl + Shift + I
macOS: Cmd + Option + I
```

---

## 🧪 手动测试

### 测试场景 1：批次轮播功能

**目标**：验证批次轮播是否每 5 秒自动切换一次

**步骤**：

1. 打开大屏展示页面
2. 观察左下角的页码显示（格式：`X / Y`）
3. 记录初始页码，例如 `1 / 3`
4. **等待 5 秒**，观察页码是否变化
5. 继续等待，观察是否循环（最后一页后回到第一页）

**预期结果**：
- ✅ 页码每 5 秒自动增加 1
- ✅ 显示的六边形照片阵列每 5 秒更新
- ✅ 到达最后一页后，下一次切换回到第一页
- ✅ 左下角 ← 按钮和右下角 → 按钮可以手动翻页

**验证清单**：
- [ ] 初始页码正确显示
- [ ] 页码每 5 秒自动递增
- [ ] 循环翻页功能正常
- [ ] 手动翻页按钮有效

---

### 测试场景 2：详情轮播功能

**目标**：验证 30 秒无操作后是否自动启动详情轮播

**步骤**：

1. 打开大屏展示页面
2. **不进行任何操作**（不点击、不搜索、不移动鼠标）
3. 观察右上角的状态指示
4. **等待 30 秒**
5. 观察是否出现详情卡片和"自动轮播中"提示
6. 继续观察，详情卡片是否每 5 秒切换一个员工

**预期结果**：
- ✅ 30 秒后自动显示详情卡片
- ✅ 右上角显示"自动轮播中"标签
- ✅ 详情卡片每 5 秒切换一个员工
- ✅ 显示员工的名字、部门、职位、工作职责、工作信条、荣誉等信息

**验证清单**：
- [ ] 30 秒无操作后自动启动轮播
- [ ] 显示"自动轮播中"提示
- [ ] 详情卡片每 5 秒自动切换
- [ ] 员工信息完整显示
- [ ] 循环轮播所有员工

---

### 测试场景 3：用户操作中断轮播

**目标**：验证用户操作是否能中断自动轮播

**步骤**：

1. 启动自动轮播（等待 30 秒）
2. 详情卡片开始自动切换
3. **点击一个六边形照片**
4. 观察是否停止自动轮播
5. 观察是否显示该员工的详情卡片
6. **再等待 30 秒**，观察是否重新启动自动轮播

**预期结果**：
- ✅ 点击照片后立即停止自动轮播
- ✅ 显示被点击员工的详情卡片
- ✅ 右上角"自动轮播中"标签消失
- ✅ 30 秒后重新启动自动轮播

**验证清单**：
- [ ] 点击照片停止轮播
- [ ] 显示正确的员工详情
- [ ] 轮播标签消失
- [ ] 30 秒后重新启动轮播

---

### 测试场景 4：荣誉榜筛选功能

**目标**：验证荣誉榜是否正确过滤和展示有荣誉的员工

**步骤**：

1. 打开大屏展示页面
2. 记录初始显示的员工总数（通过页码计算：`总数 = (当前页-1) × 10 + 当前页显示数`）
3. **点击"★荣誉榜★"按钮**
4. 观察页码是否变化
5. 观察显示的六边形照片是否减少
6. **点击一个照片**查看详情
7. 验证详情卡片中是否显示该员工的荣誉列表

**预期结果**：
- ✅ 点击荣誉榜按钮后，页码重置为 `1 / X`
- ✅ 显示的员工数量减少（只显示有荣誉的员工）
- ✅ 详情卡片显示该员工的所有荣誉
- ✅ 荣誉按列表格式显示（每行一个荣誉）

**验证清单**：
- [ ] 荣誉榜按钮点击有效
- [ ] 员工数量减少
- [ ] 页码正确显示
- [ ] 详情卡片显示荣誉列表
- [ ] 没有荣誉的员工不显示

---

### 测试场景 5：部门筛选与轮播

**目标**：验证部门筛选后轮播是否正常工作

**步骤**：

1. 打开大屏展示页面
2. **点击一个部门按钮**（例如"工程部"）
3. 观察显示的员工是否只来自该部门
4. 观察页码是否更新
5. **等待 30 秒**，观察详情轮播是否只显示该部门的员工
6. **点击其他部门**，重复步骤 3-5

**预期结果**：
- ✅ 部门筛选后只显示该部门的员工
- ✅ 页码根据部门员工数更新
- ✅ 详情轮播只循环该部门的员工
- ✅ 切换部门后，轮播重置

**验证清单**：
- [ ] 部门筛选有效
- [ ] 员工数量正确
- [ ] 轮播范围正确
- [ ] 部门切换流畅

---

### 测试场景 6：搜索功能与轮播

**目标**：验证搜索后轮播是否正常工作

**步骤**：

1. 打开大屏展示页面
2. **在搜索框输入员工名字**（例如"张三"）
3. **点击搜索按钮**
4. 观察是否显示搜索结果
5. 观察是否自动显示第一个搜索结果的详情卡片
6. **使用上一个/下一个按钮**切换搜索结果中的其他员工
7. **等待 30 秒**，观察是否在搜索结果中轮播

**预期结果**：
- ✅ 搜索有效，显示匹配的员工
- ✅ 自动显示第一个结果的详情
- ✅ 可以使用按钮切换搜索结果
- ✅ 30 秒后在搜索结果中轮播

**验证清单**：
- [ ] 搜索功能有效
- [ ] 自动显示第一个结果
- [ ] 按钮切换正常
- [ ] 轮播范围正确

---

## 🔍 浏览器开发者工具调试

### 1. 使用 Console 监控轮播状态

打开浏览器开发者工具的 **Console** 标签，输入以下代码：

```javascript
// 监控 React 组件状态变化
// 在 Showcase.tsx 中添加以下代码用于调试

// 方法 1：使用 localStorage 存储状态
window.showcaseDebug = {
  getState: () => {
    console.log('当前状态：', {
      isAutoPlayDetail: localStorage.getItem('isAutoPlayDetail'),
      currentBatchIndex: localStorage.getItem('currentBatchIndex'),
      currentDetailIndex: localStorage.getItem('currentDetailIndex'),
      selectedDepartment: localStorage.getItem('selectedDepartment'),
    });
  }
};

// 调用查看状态
window.showcaseDebug.getState();
```

### 2. 监控网络请求

1. 打开 **Network** 标签
2. 刷新页面
3. 观察以下请求：
   - `GET /api/trpc/employees.list` - 获取员工列表
   - `GET /api/trpc/employees.get` - 获取员工详情（包括荣誉）
   - `GET /api/trpc/departments.list` - 获取部门列表

**验证清单**：
- [ ] 请求状态为 200
- [ ] 响应数据包含完整的员工信息
- [ ] 荣誉数据正确返回

### 3. 使用 Performance 标签测试性能

1. 打开 **Performance** 标签
2. 点击录制按钮
3. 执行轮播操作（等待 30 秒自动轮播）
4. 停止录制
5. 分析性能指标

**关注指标**：
- FCP (First Contentful Paint) - 首次内容绘制
- LCP (Largest Contentful Paint) - 最大内容绘制
- CLS (Cumulative Layout Shift) - 累积布局偏移

### 4. 使用 React DevTools 检查组件状态

1. 安装 [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/) 浏览器扩展
2. 打开扩展
3. 选中 Showcase 组件
4. 在右侧面板查看实时状态变化

**关键状态**：
- `selectedDepartment` - 当前部门
- `selectedEmployee` - 当前员工
- `isAutoPlayDetail` - 是否自动轮播
- `currentBatchIndex` - 当前批次
- `filteredEmployees` - 过滤后的员工列表

---

## 🤖 自动化测试

### 1. 使用 Vitest 编写单元测试

创建 `client/src/pages/Showcase.test.tsx`：

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Showcase from './Showcase';

describe('Showcase - 轮播功能测试', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 测试 1：批次轮播
  it('应该每 5 秒自动切换批次', async () => {
    render(<Showcase />);
    
    // 初始页码应该是 1/X
    expect(screen.getByText(/1 \/ \d+/)).toBeInTheDocument();
    
    // 推进 5 秒
    vi.advanceTimersByTime(5000);
    
    // 页码应该变化
    await waitFor(() => {
      expect(screen.getByText(/2 \/ \d+/)).toBeInTheDocument();
    });
  });

  // 测试 2：30 秒后启动详情轮播
  it('应该在 30 秒无操作后启动详情轮播', async () => {
    render(<Showcase />);
    
    // 初始状态不应该显示"自动轮播中"
    expect(screen.queryByText('自动轮播中')).not.toBeInTheDocument();
    
    // 推进 30 秒
    vi.advanceTimersByTime(30000);
    
    // 应该显示"自动轮播中"标签
    await waitFor(() => {
      expect(screen.getByText('自动轮播中')).toBeInTheDocument();
    });
  });

  // 测试 3：点击照片停止轮播
  it('应该在点击照片后停止自动轮播', async () => {
    const user = userEvent.setup({ delay: null });
    render(<Showcase />);
    
    // 启动自动轮播
    vi.advanceTimersByTime(30000);
    
    // 点击一个照片
    const photo = screen.getByRole('button', { name: /员工照片/ });
    await user.click(photo);
    
    // 应该隐藏"自动轮播中"标签
    expect(screen.queryByText('自动轮播中')).not.toBeInTheDocument();
  });

  // 测试 4：荣誉榜筛选
  it('应该在点击荣誉榜后只显示有荣誉的员工', async () => {
    const user = userEvent.setup({ delay: null });
    render(<Showcase />);
    
    // 点击荣誉榜按钮
    const honorsButton = screen.getByRole('button', { name: /★荣誉榜★/ });
    await user.click(honorsButton);
    
    // 应该重新计算批次
    // 验证只显示有荣誉的员工
    await waitFor(() => {
      // 这里需要根据实际数据验证
      expect(screen.getByText(/\d+ \/ \d+/)).toBeInTheDocument();
    });
  });

  // 测试 5：部门筛选
  it('应该在选择部门后只显示该部门的员工', async () => {
    const user = userEvent.setup({ delay: null });
    render(<Showcase />);
    
    // 点击工程部按钮
    const engineeringButton = screen.getByRole('button', { name: /工程部/ });
    await user.click(engineeringButton);
    
    // 应该重新计算批次
    await waitFor(() => {
      expect(screen.getByText(/\d+ \/ \d+/)).toBeInTheDocument();
    });
  });

  // 测试 6：循环翻页
  it('应该在最后一页后循环回到第一页', async () => {
    render(<Showcase />);
    
    // 获取总页数
    const pageText = screen.getByText(/\d+ \/ (\d+)/);
    const totalPages = parseInt(pageText.textContent!.split('/')[1]);
    
    // 推进到最后一页
    for (let i = 0; i < totalPages; i++) {
      vi.advanceTimersByTime(5000);
    }
    
    // 再推进一次，应该回到第一页
    vi.advanceTimersByTime(5000);
    
    await waitFor(() => {
      expect(screen.getByText(/1 \/ \d+/)).toBeInTheDocument();
    });
  });
});
```

### 2. 运行自动化测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test Showcase.test.tsx

# 监视模式（文件变化时自动重新运行）
pnpm test --watch

# 生成覆盖率报告
pnpm test --coverage
```

### 3. 使用 Cypress 进行 E2E 测试

创建 `cypress/e2e/carousel.cy.ts`：

```typescript
describe('轮播功能 E2E 测试', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/showcase');
  });

  it('应该显示初始页码', () => {
    cy.contains(/\d+ \/ \d+/).should('be.visible');
  });

  it('应该每 5 秒自动切换批次', () => {
    // 获取初始页码
    cy.contains(/1 \/ \d+/).should('be.visible');
    
    // 等待 5 秒
    cy.wait(5000);
    
    // 页码应该变化
    cy.contains(/2 \/ \d+/).should('be.visible');
  });

  it('应该在 30 秒后启动自动轮播', () => {
    // 等待 30 秒
    cy.wait(30000);
    
    // 应该显示"自动轮播中"
    cy.contains('自动轮播中').should('be.visible');
  });

  it('应该能点击照片查看详情', () => {
    // 点击第一个照片
    cy.get('[data-testid="hex-photo"]').first().click();
    
    // 应该显示详情卡片
    cy.get('[data-testid="detail-panel"]').should('be.visible');
    
    // 应该显示员工信息
    cy.contains(/名字|部门|职位/).should('be.visible');
  });

  it('应该能筛选荣誉榜', () => {
    // 点击荣誉榜按钮
    cy.contains('★荣誉榜★').click();
    
    // 页码应该更新
    cy.contains(/\d+ \/ \d+/).should('be.visible');
  });

  it('应该能手动翻页', () => {
    // 点击右下角的下一页按钮
    cy.get('[data-testid="next-page-btn"]').click();
    
    // 页码应该增加
    cy.contains(/2 \/ \d+/).should('be.visible');
  });

  it('应该能搜索员工', () => {
    // 输入搜索词
    cy.get('[placeholder="搜索员工..."]').type('张三');
    
    // 点击搜索按钮
    cy.contains('搜索').click();
    
    // 应该显示搜索结果
    cy.contains('张三').should('be.visible');
  });
});
```

### 4. 运行 E2E 测试

```bash
# 打开 Cypress 测试运行器
pnpm exec cypress open

# 运行 E2E 测试（headless 模式）
pnpm exec cypress run --spec "cypress/e2e/carousel.cy.ts"
```

---

## 🐛 常见问题排查

### 问题 1：轮播不工作

**症状**：页码不变，详情卡片不切换

**排查步骤**：

1. 检查浏览器控制台是否有错误
   ```bash
   # 打开 F12，查看 Console 标签
   ```

2. 检查员工数据是否加载
   ```javascript
   // 在 Console 中输入
   fetch('/api/trpc/employees.list').then(r => r.json()).then(console.log)
   ```

3. 检查计时器是否启动
   ```javascript
   // 在 Showcase.tsx 中添加调试代码
   console.log('批次轮播启动:', batchIntervalRef.current);
   console.log('详情轮播启动:', detailIntervalRef.current);
   ```

**解决方案**：
- 检查数据库连接是否正常
- 检查 API 是否返回数据
- 检查浏览器是否支持定时器

### 问题 2：30 秒后没有自动启动轮播

**症状**：等待 30 秒后没有显示"自动轮播中"

**排查步骤**：

1. 检查是否有用户操作中断计时器
   ```javascript
   // 在 Console 中输入
   console.log('无操作计时器:', inactivityTimeoutRef.current);
   ```

2. 检查是否有其他事件监听器
   ```javascript
   // 检查是否有 mousemove、click 等事件
   document.addEventListener('mousemove', () => console.log('鼠标移动'));
   ```

**解决方案**：
- 确保不进行任何操作（包括鼠标移动）
- 检查是否有其他脚本干扰
- 检查浏览器是否被激活

### 问题 3：荣誉榜显示为空

**症状**：点击荣誉榜后没有显示任何员工

**排查步骤**：

1. 检查数据库中是否有荣誉数据
   ```sql
   SELECT COUNT(*) FROM honors;
   SELECT DISTINCT employeeId FROM honors;
   ```

2. 检查 API 是否返回荣誉数据
   ```javascript
   // 在 Console 中输入
   fetch('/api/trpc/employees.get?id=1').then(r => r.json()).then(console.log)
   ```

3. 检查前端过滤逻辑
   ```javascript
   // 在 Showcase.tsx 中添加调试代码
   console.log('有荣誉的员工:', filteredEmployees.filter(e => e.honors?.length > 0));
   ```

**解决方案**：
- 在数据库中添加测试荣誉数据
- 检查后端 API 是否正确返回荣誉数据
- 检查前端过滤条件是否正确

### 问题 4：轮播速度不对

**症状**：轮播速度过快或过慢

**排查步骤**：

1. 检查计时器间隔
   ```typescript
   // 在 Showcase.tsx 中查看
   setInterval(..., 5000);  // 应该是 5000 毫秒
   setTimeout(..., 30000);  // 应该是 30000 毫秒
   ```

2. 检查系统时间是否正确
   ```javascript
   // 在 Console 中输入
   console.log(new Date());
   ```

**解决方案**：
- 调整 `setInterval` 和 `setTimeout` 的时间参数
- 检查系统时间设置
- 检查浏览器是否有性能问题

---

## 📊 测试检查清单

### 功能测试
- [ ] 批次轮播每 5 秒自动切换
- [ ] 30 秒无操作后启动详情轮播
- [ ] 用户操作中断轮播
- [ ] 荣誉榜筛选正常工作
- [ ] 部门筛选正常工作
- [ ] 搜索功能正常工作
- [ ] 循环翻页功能正常
- [ ] 手动翻页按钮有效
- [ ] 上一个/下一个按钮有效
- [ ] 鼠标滚轮切换员工

### 性能测试
- [ ] 页面加载时间 < 3 秒
- [ ] 轮播切换流畅无卡顿
- [ ] 内存占用稳定
- [ ] CPU 占用正常

### 兼容性测试
- [ ] Chrome 最新版本
- [ ] Firefox 最新版本
- [ ] Safari 最新版本
- [ ] Edge 最新版本
- [ ] 移动设备浏览器

### 数据测试
- [ ] 员工数据完整
- [ ] 荣誉数据完整
- [ ] 部门数据完整
- [ ] 搜索结果准确
- [ ] 筛选结果准确

---

## 🎯 快速测试命令

```bash
# 启动开发服务器
pnpm dev

# 运行单元测试
pnpm test

# 运行 E2E 测试
pnpm exec cypress run

# 生成覆盖率报告
pnpm test --coverage

# 检查 TypeScript 类型
pnpm check

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

---

**最后更新**: 2026-03-30
**版本**: 1.0.0
