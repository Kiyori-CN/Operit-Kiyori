# 主应用布局

本页面记录了 Operit 的主要应用程序结构，包括入口点（`MainActivity`）、主要 Compose UI 结构（`OperitApp`）、导航系统和屏幕架构。有关特定屏幕实现（如聊天界面）的信息，请参阅 [3.1](/AAswordman/Operit/3.1-chat-ui-architecture)。有关设置 UI 的详细信息，请参阅 [4.4](/AAswordman/Operit/4.4-settings-screens)。

---

## 应用程序入口点

应用程序的入口点是 `MainActivity`，这是一个 Android `ComponentActivity`，负责协调初始化、权限管理以及根据应用程序状态显示相应的 UI。

### MainActivity 职责

`MainActivity` 处理：
职责实现**初始设置**组件初始化、语言配置、工具处理器设置**权限管理**通知权限(Android 13+)、权限级别验证**数据迁移**通过 `ChatHistoryMigrationManager` 检测并执行数据库迁移**Intent 处理**GitHub OAuth 回调、文件共享(ACTION_VIEW、ACTION_SEND)、深度链接**更新管理**通过 `UpdateManager` 自动检查更新**插件加载**通过 `PluginLoadingState` 初始化 MCP 插件**状态管理**协议接受、权限指南、迁移屏幕

### 初始化流程

```
Yes

No

MainActivity.onCreate()

initializeComponents()

cleanTemporaryFiles()

setupPreferencesListener()

configureDisplaySettings()

setAppContent()

Check Notification
Permission

Check Permission
Level Set

Check Migration
Needed

showMigrationScreen = true

startPluginLoading()

Wait for migration complete

pluginLoadingState.initializeMCPServer()

Display OperitApp
```

### 组件初始化

以下组件在 `MainActivity` 中初始化：

- **`AIToolHandler`**：单例工具执行引擎
- **`UserPreferencesManager`**：用户设置和偏好
- **`AgreementPreferences`**：协议接受跟踪
- **`ChatHistoryMigrationManager`**：数据迁移管理
- **`UpdateManager`**：应用更新检测
- **`MCPRepository`**：MCP 插件仓库访问
- **`AnrMonitor`**：ANR(应用无响应)检测

### Intent 处理

`MainActivity` 处理多种 intent 类型：
Intent 动作用途处理器`operit://github-oauth-callback`GitHub OAuth 登录回调`handleGitHubOAuthCode()``ACTION_VIEW`打开文件或 URL存储在 `pendingSharedFileUris` 或 `pendingSharedLinks``ACTION_SEND`分享单个文件/文本存储在 `pendingSharedFileUris` 或 `pendingSharedLinks``ACTION_SEND_MULTIPLE`分享多个文件存储在 `pendingSharedFileUris`

---

## 主界面结构

主要的 Compose UI 定义在 `OperitApp` 中，它提供了整体应用程序结构、导航管理以及针对不同设备类型的布局适配。

### OperitApp 架构

```
No

Yes

OperitApp
(Main Composable)

Navigation State
currentScreen
backStack
selectedItem

Screen Width
>= 600dp?

PhoneLayout
(DrawerScaffold)

TabletLayout
(Sidebar + Content)

Screen.Content()
(Active Screen)

CompositionLocal
LocalTopBarActions
```

### 导航状态管理

`OperitApp` 使用自定义的返回栈实现来管理导航，而非使用 Jetpack Navigation：
状态变量类型用途`selectedItem``NavItem`当前选中的抽屉/侧边栏项`currentScreen``Screen`当前显示的屏幕`backStack``MutableList<Screen>`用于导航历史的自定义返回栈`isNavigatingBack``Boolean`跟踪导航是否为返回操作
**导航函数：**

- **`navigateTo(newScreen: Screen, fromDrawer: Boolean)`**：导航到新屏幕，适当管理返回栈
- **`goBack()`**：从返回栈导航到上一个屏幕
- **`navigateToTokenConfig()`**：用于 token 配置的专用子导航

### 返回栈管理逻辑

返回栈遵循以下特定规则：

1. **主屏幕导航**：导航到主屏幕(非 `isSecondaryScreen`)时，返回栈会被清空，但如果存在 AI Chat 则保留
2. **次级屏幕导航**：次级屏幕会正常压入返回栈
3. **抽屉导航**：从抽屉导航会清空整个返回栈
4. **返回导航**：如果返回栈为空且不在 AI Chat 界面，则返回到 AI Chat 而非退出应用

---

## 屏幕架构

屏幕在 `OperitScreens.kt` 中定义为密封类层次结构，每个屏幕封装其导航元数据和 UI 内容。

### 屏幕类层次结构

```
Screen

+parentScreen: Screen?

+navItem: NavItem?

+titleRes: Int?

+isSecondaryScreen: Boolean

+Content() : Composable

AiChat

+navItem: NavItem.AiChat

Settings

+navItem: NavItem.Settings

ModelConfig

+parentScreen: Settings

+titleRes: R.string.screen_title_model_config

Toolbox

+navItem: NavItem.Toolbox

Packages

+navItem: NavItem.Packages
```

### 主屏幕与次级屏幕

屏幕根据其导航层次结构进行分类：

**主屏幕**(可从抽屉直接访问)：

- `AiChat`、`MemoryBase`、`Packages`、`Toolbox`、`ShizukuCommands`、`Settings`、`Help`、`About`、`AssistantConfig`、`Workflow`、`UpdateHistory`、`Agreement`

**次级屏幕**(具有父屏幕的子屏幕)：

- `ModelConfig`(父屏幕：Settings)
- `UserPreferencesSettings`(父屏幕：Settings)
- `ToolPermission`(父屏幕：Settings)
- `SkillMarket`(父屏幕：Packages)
- `MCPMarket`(父屏幕：Packages)
- Token 配置屏幕等

### 屏幕内容渲染

每个屏幕实现具有标准化签名的 `Content()` 可组合函数：

```
@Composable
open fun Content(
    navController: NavController,
    navigateTo: ScreenNavigationHandler,
    updateNavItem: NavItemChangeHandler,
    onGoBack: () -> Unit,
    hasBackgroundImage: Boolean,
    onLoading: (Boolean) -> Unit,
    onError: (String) -> Unit,
    onGestureConsumed: (Boolean) -> Unit
)
```

**参数：**

- **`navigateTo`**：导航到另一个屏幕的函数
- **`updateNavItem`**：更新选中导航项的函数
- **`onGoBack`**：返回导航的函数
- **`hasBackgroundImage`**：是否启用背景图片以进行样式设置
- **`onLoading`**：显示/隐藏加载指示器的回调
- **`onError`**：显示错误消息的回调
- **`onGestureConsumed`**: 手势处理的回调

### 屏幕内容示例：AiChat

```
data object AiChat : Screen(navItem = NavItem.AiChat) {
    @Composable
    override fun Content(
        navController: NavController,
        navigateTo: ScreenNavigationHandler,
        updateNavItem: NavItemChangeHandler,
        onGoBack: () -> Unit,
        hasBackgroundImage: Boolean,
        onLoading: (Boolean) -> Unit,
        onError: (String) -> Unit,
        onGestureConsumed: (Boolean) -> Unit
    ) {
        AIChatScreen(
            padding = PaddingValues(0.dp),
            viewModel = null,
            isFloatingMode = false,
            hasBackgroundImage = hasBackgroundImage,
            onNavigateToTokenConfig = { navigateTo(TokenConfig) },
            onNavigateToSettings = {
                navigateTo(Settings)
                updateNavItem(NavItem.Settings)
            },
            // ... other navigation callbacks
        )
    }
}
```

---

## 导航项

导航项(`NavItem`)定义了抽屉/侧边栏条目及其关联的元数据。

### NavItem 结构

```
NavItem
(Sealed Class)

AiChat
route: 'ai_chat'
icon: Email

Settings
route: 'settings'
icon: Settings

Toolbox
route: 'toolbox'
icon: Build

Packages
route: 'packages'
icon: Extension

MemoryBase
route: 'memory_base'
icon: Storage
```

### 导航分组

导航项在 `OperitApp` 中按组织结构组织：
分组标题资源项**AI 功能**`R.string.nav_group_ai_features``AiChat`、`AssistantConfig`、`Packages`、`MemoryBase`**工具**`R.string.nav_group_tools``Toolbox`、`ShizukuCommands`、`Workflow`**系统**`R.string.nav_group_system``Settings`、`Help`、`About`、`UpdateHistory`

---

## 布局模式

`OperitApp` 根据屏幕宽度调整其布局，为手机和平板电脑提供优化的体验。

### 布局决策

```
No

Yes

configuration.screenWidthDp

Width >= 600dp?

PhoneLayout
(Modal Drawer)

TabletLayout
(Permanent Sidebar)
```

### 手机布局特性

**手机布局**(`PhoneLayout`)使用 `ModalNavigationDrawer`：

- **抽屉宽度**：屏幕宽度的 75%
- **抽屉触发**：从左边缘滑动或点击菜单按钮
- **导航**：选择项目后抽屉关闭
- **底部导航**：可选的底部栏用于主要屏幕
- **顶部栏**：标准应用栏，带有返回按钮用于次要屏幕

### 平板布局特性

**平板布局**(`TabletLayout`)使用永久侧边栏：

- **侧边栏宽度**：默认 280dp，可折叠至 64dp
- **展开状态**：通过汉堡图标切换
- **折叠模式**：仅显示图标
- **展开模式**：显示图标 + 标签
- **内容区域**：用屏幕内容填充剩余空间
- **无抽屉**：导航侧边栏始终可见

---

## 顶部栏操作

`OperitApp` 提供了一种机制，允许子屏幕通过 `CompositionLocal` 向顶部应用栏注入操作。

### LocalTopBarActions 机制

```
TopAppBar
OperitApp
LocalTopBarActions
Child Screen
TopAppBar
OperitApp
LocalTopBarActions
Child Screen
Provide actions composable
Update topBarActions state
Render topBarActions
Display actions in app bar
```

**在屏幕中使用：**

```
// Inside a screen's Content()
val setTopBarActions = LocalTopBarActions.current
setTopBarActions {
    IconButton(onClick = { /* action */ }) {
        Icon(Icons.Default.MoreVert, "More")
    }
}
```

---

## 应用清单配置

Android 清单定义了应用的组件、权限和入口点。

### 主 Activity 配置

配置值用途**名称**`.ui.main.MainActivity`完全限定的 Activity 类**导出**`true`可从其他应用访问**主题**`@style/Theme.Operit`应用主题**启动模式**`singleTask`每个任务单一实例**配置变更**`orientation|keyboardHidden|screenSize|screenLayout`处理时不重新创建**窗口软输入模式**`adjustPan`键盘出现时平移内容

### Intent 过滤器

`MainActivity` 声明了多个 intent 过滤器：

**1. 主启动器：**

```
<intent-filter>
    <action android:name="android.intent.action.MAIN" />
    <category android:name="android.intent.category.LAUNCHER" />
</intent-filter>
```

**2. GitHub OAuth 回调：**

```
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="operit" android:host="github-oauth-callback" />
</intent-filter>
```

**3. 文件查看：**

```
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:mimeType="*/*" />
</intent-filter>
```

**4. 文件共享：**

```
<intent-filter>
    <action android:name="android.intent.action.SEND" />
    <category android:name="android.intent.category.DEFAULT" />
    <data android:mimeType="*/*" />
</intent-filter>
 
<intent-filter>
    <action android:name="android.intent.action.SEND_MULTIPLE" />
    <category android:name="android.intent.category.DEFAULT" />
    <data android:mimeType="*/*" />
</intent-filter>
```

---

## 状态管理和生命周期

### Activity 生命周期处理

`MainActivity` 实现了特定的生命周期处理：
生命周期方法实现**`onCreate()`**初始化设置、组件初始化、权限检查**`onNewIntent()`**处理新的 intent(OAuth 回调、文件分享)**`onResume()`**处理待处理的共享文件/链接**`attachBaseContext()`**在创建前应用语言设置**`onConfigurationChanged()`**通过对话框处理方向变化

### 方向变化处理

应用在方向变化时显示对话框以防止意外屏幕旋转：

```
override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    val currentOrientation = newConfig.orientation
    if (lastOrientation != null && lastOrientation != currentOrientation) {
        showOrientationChangeDialog = true
    }
    lastOrientation = currentOrientation
}
```

### 状态持久化

**持久化状态：**

- 导航抽屉/侧边栏状态在配置变化时保持
- 设置通过 `ApiPreferences` 和 `UserPreferencesManager` 存储在 `DataStore` 中
- 聊天历史持久化在 Room 数据库中
- 插件加载状态在旋转期间保持

**临时状态：**

- 当前屏幕由 `OperitApp` 管理
- 应用重启时清除返回栈
- 待处理的共享文件/链接在初始化完成后处理

---

## 概述

主应用布局遵循三层结构：

1. **`MainActivity`**(Android Activity)：入口点、生命周期管理、初始化编排
2. **`OperitApp`**(Compose 根组件)：导航管理、布局适配、状态协调
3. **`Screen` 层级**：具有标准化内容渲染的各个屏幕实现

此架构实现了：

- Android 框架关注点与 UI 逻辑的清晰分离
- 具有自定义返回栈管理的灵活导航
- 针对不同设备类型的响应式布局适配
- 具有一致导航模式的模块化屏幕实现
