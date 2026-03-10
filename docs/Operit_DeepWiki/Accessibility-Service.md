# 无障碍服务

## 目的与范围

Operit 中的无障碍服务系统通过利用 Android 的 Accessibility Service API 提供 UI 层级检查和交互能力。该系统支持高级功能，如 UI 自动化、屏幕内容分析以及 PhoneAgent AI 驱动的自动化系统。

与典型的无障碍实现不同，Operit 使用**双应用架构**，其中一个独立的"Accessibility Provider"应用托管实际的无障碍服务，而主 Operit 应用与该提供者通信以访问 UI 层级数据。这种设计将无障碍服务生命周期与主应用隔离，并提供更稳健的权限边界。

有关使用此服务的 UI 自动化功能的信息，请参阅 [UI Automation](/AAswordman/Operit/6-ui-automation)。有关无障碍如何融入更广泛的权限系统的详细信息，请参阅 [Permission System](/AAswordman/Operit/8.1-database-architecture)。

---

## 系统架构

### 双应用设计

```
Android System

Accessibility Provider App

Main Operit App

Install/Check

Query UI Hierarchy

Get Screen Content

Access UI Elements

Track Status

Register

UI Events

Query

Window Info

Cache

UIHierarchyManager

PhoneAgent

StandardUITools

DemoStateManager

Android Accessibility Service

UI Hierarchy Cache

Accessibility Service API

Window Manager

AccessibilityProviderInstaller
(Version Management)
```

**双应用架构图**

系统由以下部分组成：

- **主 Operit 应用**：包含 `UIHierarchyManager` 和消费者功能
- **Accessibility Provider 应用**：实现无障碍服务的独立 APK
- **通信层**：主应用向提供者应用查询 UI 层级数据

---

## 核心组件

### UIHierarchyManager

`UIHierarchyManager` 类作为所有无障碍相关操作的中央协调器。它管理无障碍提供者应用的生命周期，并提供查询 UI 层级的 API。
职责描述**提供者安装**检查提供者应用是否已安装，并在需要时启动安装**状态监控**跟踪系统设置中是否启用了无障碍服务**UI 查询接口**提供从提供者检索 UI 层级数据的方法**IPC 协调**处理与提供者应用的进程间通信
关键操作：

- `UIHierarchyManager.isProviderAppInstalled(context)` - 检查提供者是否已安装
- `UIHierarchyManager.launchProviderInstall(context)` - 启动 provider 安装

### AccessibilityProviderInstaller

`AccessibilityProviderInstaller` 管理 provider 应用的版本控制和更新。它确保已安装的 provider 版本与主应用兼容。

```
Outdated

Up-to-date

AccessibilityProviderInstaller.isUpdateNeeded()

getInstalledVersion()

getBundledVersion()

Compare Versions

Launch Update

Skip Update
```

**版本检查流程**

关键方法：

- `AccessibilityProviderInstaller.getInstalledVersion(context)` - 获取已安装的 provider 版本
- `AccessibilityProviderInstaller.getBundledVersion(context)` - 获取主应用内置的版本
- `AccessibilityProviderInstaller.isUpdateNeeded(context)` - 比较版本并判断是否需要更新
- `AccessibilityProviderInstaller.clearCache()` - 清除版本缓存以强制重新检查

---

## 安装和设置工作流

### 安装流程

```
"Provider App"
"Android System"
UIHierarchyManager
DemoStateManager
"Permission Guide UI"
User
"Provider App"
"Android System"
UIHierarchyManager
DemoStateManager
"Permission Guide UI"
User
Navigate to setup
Check status
isProviderAppInstalled()
Query package manager
Not installed
false
Show install wizard
Click Install
launchProviderInstall()
Launch APK install intent
Show install dialog
Confirm install
Install APK
Enable in Settings
Enable accessibility service
refreshStatus()
Check again
Installed & Enabled
```

**Provider 安装序列**

安装过程包括：

1. **检测**：检查 provider 应用是否已安装
2. **安装**：使用内置 APK 启动系统安装器
3. **激活**：用户在 Android 设置中手动启用服务
4. **验证**：确认安装和激活状态

### 设置向导集成

无障碍设置已集成到权限引导向导中：
设置步骤组件操作**状态检查**`DemoStateManager`查询安装和服务启用状态**向导显示**`AccessibilityWizardCard`如需要则显示引导设置**安装**`UIHierarchyManager`提取并安装提供者 APK**服务启用**用户 + Android 系统用户打开无障碍设置并启用**验证**`DemoStateManager`重新检查状态并更新 UI

---

## 权限级别集成

### 无障碍权限级别

无障碍是层级结构中的第二个权限级别，UI 自动化功能需要此权限：

```
Upgrade

Upgrade

Upgrade

Enables

Enables

Enables

STANDARD
Basic permissions

ACCESSIBILITY
+ Accessibility Service

DEBUGGER
+ Shizuku

ROOT
+ Root Access

UI Automation Tools

PhoneAgent

UI Hierarchy Inspection
```

**权限级别层级**

当 `ACCESSIBILITY` 级别激活时，以下功能将可用：

- UI 元素检测和交互
- 屏幕内容分析
- PhoneAgent AI 驱动的自动化
- UI 调试和检查工具

### 权限状态跟踪

系统跟踪三种不同的状态：
状态变量含义检查方法`isAccessibilityProviderInstalled`Provider 应用已安装在设备上`UIHierarchyManager.isProviderAppInstalled()``hasAccessibilityServiceEnabled`服务已在 Android 设置中启用系统无障碍设置检查`isAccessibilityUpdateNeeded`已安装版本已过时`AccessibilityProviderInstaller.isUpdateNeeded()`
必须满足所有三个条件才能实现完整的无障碍功能。

---

## 状态管理

### DemoStateManager 集成

`DemoStateManager` 在权限设置 UI 中维护无障碍状态：

```
Initial State

User clicks install

APK installed

User enables in settings

Update available

User clicks update

Update complete

Ready to use

User skips

NotInstalled

Installing

Installed

Enabled

NeedsUpdate

Updating
```

**无障碍状态机**

状态流更新：

1. **初始检查**：屏幕加载时，查询所有状态变量
2. **用户操作**：用户触发安装或配置
3. **状态刷新**：用户返回后，重新检查所有状态
4. **UI 更新**：在向导卡片中反映新状态

### 刷新逻辑

刷新逻辑确保状态表示的准确性：

```
// From DemoStateManager
refreshPermissionsAndStatus(
    context = context,
    updateAccessibilityProviderInstalled = {
        _uiState.value.isAccessibilityProviderInstalled.value = it
    },
    updateAccessibilityServiceEnabled = {
        _uiState.value.hasAccessibilityServiceEnabled.value = it
    }
)
```

系统会定期重新检查：

- 用户离开后返回时(通过 `onResume`)
- 用户点击刷新按钮时
- 安装/更新操作完成后
- 权限级别更改时

### 缓存管理

版本信息会被缓存以避免冗余检查：

```
// Cache clearing on manual refresh
AccessibilityProviderInstaller.clearCache()
```

缓存会在以下情况清除：

- 手动点击刷新按钮
- 安装/更新操作后
- 从系统设置返回时

---

## UI 组件

### AccessibilityWizardCard

`AccessibilityWizardCard` 提供引导式设置体验：
元素用途**状态指示器**显示当前安装和服务状态**版本显示**显示已安装版本与内置版本**安装按钮**启动提供程序安装**设置按钮**打开 Android 无障碍设置**更新按钮**启动提供程序更新(如需要)
向导会在以下情况出现：

- 提供程序应用未安装，或
- 无障碍服务未启用，或
- 有可用更新

### 权限状态显示

权限卡片通过视觉指示器显示无障碍状态：

```
Permission Status Card

Click

Click

Click

Provider Installed
(icon + status)

Service Enabled
(icon + status)

Update Available
(if needed)

Launch Install

Open Settings

Launch Update
```

**权限卡片交互流程**

颜色编码：

- **绿色**：功能已正确配置
- **黄色**：有警告或可用更新
- **红色**：功能缺失或已禁用

---

## 其他系统的使用

### PhoneAgent 集成

PhoneAgent 使用无障碍服务来分析屏幕内容：

```
Request UI Data

Query

UI Tree

Structured Data

Generate Actions

PhoneAgent

UIHierarchyManager

Accessibility Provider

Screen Content Analysis

ActionHandler
```

**PhoneAgent 数据流**

无障碍服务使 PhoneAgent 能够：

- 识别 UI 元素及其属性
- 读取屏幕上的文本内容
- 确定元素位置以进行交互
- 理解 UI 上下文和层次结构

来源：从高层级图表中的系统概述概念性引用

### UI 自动化工具

`StandardUITools` 类使用无障碍功能进行元素检测：

- 通过文本、ID 或描述查找元素
- 查询元素属性(边界、可见性等)
- 遍历 UI 树以进行复杂查询
- 在交互前验证元素是否存在

来源：从工具系统集成概念性引用

---

## 测试和调试

### Tool Tester 集成

在综合工具测试器中验证无障碍服务状态：

```
// From ToolTesterScreen
ToolGroup("System", false, false, listOf(
    ToolTest("check_accessibility", "Accessibility Check",
             "Verify accessibility service is available",
             emptyList())
))
```

测试验证：

1. 提供者应用已安装
2. 服务已启用
3. UI 层次结构查询返回有效数据
4. 未发生权限错误

### 调试工作流

当出现无障碍问题时：

1. **检查安装**：验证 provider 应用是否存在
2. **检查服务**：确认服务已在 Android 设置中启用
3. **检查版本**：确保无需更新
4. **清除缓存**：强制重新检测状态
5. **重新安装**：如果损坏则卸载并重新安装 provider

---

## 安全与隐私

### 隔离架构的优势

双应用设计提供了多项安全优势：
优势说明**进程隔离**Provider 在独立进程中运行，具有不同的权限**生命周期独立**即使主应用崩溃，Provider 服务仍可继续运行**更新灵活性**Provider 可以独立更新**权限边界**无障碍功能与其他功能之间有明确的分离

### 无障碍服务权限

provider 应用需要 `BIND_ACCESSIBILITY_SERVICE` 权限，该权限：

- 必须由用户在系统设置中明确授予
- 无法通过编程方式授予
- 提供对所有应用 UI 的广泛访问权限
- 由 Android 系统监控以确保安全

来源：Android 无障碍服务文档(概念性)

---

## 总结

Operit 中的无障碍服务系统通过双应用架构提供 UI 检查能力：

1. **独立的 Provider 应用**：托管实际的无障碍服务
2. **版本管理**：跟踪和更新 provider 版本
3. **状态跟踪**：监控安装和服务启用状态
4. **权限集成**：ACCESSIBILITY 权限级别的一部分
5. **消费者 API**：由 PhoneAgent 和 UI 自动化工具使用

该架构在保持清晰的权限边界和生命周期管理的同时，实现了强大的 UI 自动化功能。

**关键类**：

- `UIHierarchyManager` - 中央协调器
- `AccessibilityProviderInstaller` - 版本管理
- `DemoStateManager` - 状态跟踪
- `AccessibilityWizardCard` - 设置 UI
