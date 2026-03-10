# Root 授权

## 目的和范围

本文档介绍 Operit 中的 Root 授权系统，该系统为已 root 的 Android 设备提供检测、权限管理和命令执行功能。Root 访问权限代表 Android 权限层级中的最高特权级别，可执行系统级操作，这些操作在其他情况下是受限的。

有关其他权限级别的信息，请参阅：

- 标准权限、无障碍权限和设备管理员权限：[Permission System](/AAswordman/Operit/7.1-permission-system)
- 基于 Shizuku 的 ADB 操作：[Shizuku Integration](/AAswordman/Operit/7.2-shizuku-integration)
- 工具特定的权限检查：[Tool Permissions](/AAswordman/Operit/5.9-tool-permissions)

Root 授权系统主要通过 `RootAuthorizer` 类实现，该类负责管理 root 检测、权限请求和命令执行。

---

## Root 授权架构

root 授权系统由多个关键组件组成，这些组件协同工作以提供安全且受控的 root 访问：

### 组件概览图

```
State Management

Root Operations

Core Root System

UI Layer

RootWizardCard
User Permission UI

RootPermissionSection
Status Display

ShizukuDemoViewModel
State Management

RootAuthorizer
Singleton Manager

StateFlow Properties
isRooted, hasRootAccess

State Change Listeners
Callback System

Device Root Detection
su binary check

Permission Request
Interactive su prompt

Command Execution
Root shell execution

DemoStateManager
UI State Coordination

AndroidPermissionLevel.ROOT
Permission Level Enum
```

该架构在 UI 状态管理、root 操作逻辑和响应式状态传播之间实现了清晰的分离。

---

## RootAuthorizer 类

`RootAuthorizer` 类是一个单例，用于管理所有与 root 相关的操作。虽然源文件中未提供完整实现，但可以从使用模式推断其公共 API。

### 关键方法和属性

```
RootAuthorizer

+isRooted: StateFlow<Boolean>

+hasRootAccess: StateFlow<Boolean>

+initialize(context: Context)

+isDeviceRooted() : : Boolean

+checkRootStatus(context: Context) : : Boolean

+requestRootPermission(callback:(Boolean)->Unit)

+executeRootCommand(command: String, context: Context) : : Pair<Boolean, String>

+addStateChangeListener(listener:()->Unit)

+removeStateChangeListener(listener:()->Unit)
```

### 属性

属性类型描述`isRooted``StateFlow<Boolean>`响应式状态，指示设备是否具有 root 能力(su 二进制文件存在)`hasRootAccess``StateFlow<Boolean>`响应式状态，指示应用当前是否已获得 root 访问权限

### 核心方法

方法返回类型描述`initialize(context)``Unit`初始化 root 授权器，必须在其他操作之前调用`isDeviceRooted()``Boolean`同步检查设备是否具有 root 能力`checkRootStatus(context)``Boolean`检查应用是否具有 root 访问权限并更新状态`requestRootPermission(callback)``Unit`请求 root 权限，使用授权结果调用回调`executeRootCommand(command, context)``Pair<Boolean, String>`以 root 权限执行命令，返回(成功状态，输出)`addStateChangeListener(listener)``Unit`注册状态变化回调`removeStateChangeListener(listener)``Unit`注销状态变化回调

---

## 初始化和状态管理

### 初始化序列

`RootAuthorizer` 必须在使用前进行初始化，通常在应用启动期间或进入与 root 相关的界面时进行：

```
DemoStateManager
RootAuthorizer
ShizukuDemoViewModel
DemoStateManager
RootAuthorizer
ShizukuDemoViewModel
Detect root capability
Check existing access
initialize(context)
Update isRooted StateFlow
Update hasRootAccess StateFlow
Read isRooted.value
Read hasRootAccess.value
updateRootStatus(isRooted, hasAccess)
Update UI state
```

**代码中的初始化示例：**

在中：

```
fun initializeAsync(context: Context) {
    viewModelScope.launch(Dispatchers.IO) {
        // Initialize Root authorizer
        RootAuthorizer.initialize(context)

        // Get current state
        val isDeviceRooted = RootAuthorizer.isRooted.value
        val hasRootAccess = RootAuthorizer.hasRootAccess.value

        // Update state
        withContext(Dispatchers.Main) {
            stateManager.updateRootStatus(isDeviceRooted, hasRootAccess)
        }
    }
}
```

### 响应式状态监听器

系统使用监听器模式进行状态变更通知：

在中：

```
// Root state change listener
private val rootListener: () -> Unit = { refreshStatus() }
 
init {
    // Register listeners for state changes
    RootAuthorizer.addStateChangeListener(rootListener)
}
```

清理操作在中：

```
fun cleanup() {
    // Remove listeners
    RootAuthorizer.removeStateChangeListener(rootListener)
}
```

---

## Root 检测

Root 检测用于判断 Android 设备是否具有 root 能力(通常通过检查 `su` 二进制文件)。

### 检测流程

```
Found

Not Found

Start Detection

RootAuthorizer.isDeviceRooted()

Check for su binary
in PATH

isRooted = true

isRooted = false

Update StateFlow

Notify State Listeners

End
```

### 在 ViewModel 中的使用

来自：

```
fun checkRootStatus(context: Context) {
    viewModelScope.launch {
        val isDeviceRooted = RootAuthorizer.isDeviceRooted()
        val hasRootAccess = RootAuthorizer.checkRootStatus(context)
        stateManager.updateRootStatus(isDeviceRooted, hasRootAccess)
        AppLogger.d(
            "ShizukuDemoViewModel",
            "Root状态更新: 设备已Root=$isDeviceRooted, 应用有Root权限=$hasRootAccess"
        )
    }
}
```

**检测区分以下情况：**

- **设备已 root**：设备上存在 `su` 二进制文件
- **应用拥有 root 权限**：应用已被授予使用 root 的权限

---

## Root 权限请求

当设备已 root 但应用尚未获得访问权限时，用户可以通过交互式流程请求 root 权限。

### 权限请求流程

```
SuperUser App
RootAuthorizer
ShizukuDemoViewModel
RootWizardCard
User
SuperUser App
RootAuthorizer
ShizukuDemoViewModel
RootWizardCard
User
Execute test command
Execute test command
alt
[Permission Granted]
[Permission Denied]
Refresh status
alt
[App Already Has Root]
[No Root Access]
Click "Request Root"
requestRootPermission(context)
Check hasRootAccess.value
true
executeRootCommand("id", context)
Show "Requesting root permission" toast
requestRootPermission { granted -> }
Request root access
Show root permission dialog
Grant/Deny
Return result
Invoke callback(granted)
Show "Root permission granted" toast
executeRootCommand("id", context)
Show "Root permission denied" toast
checkRootStatus(context)
```

### 实现

来自：

```
fun requestRootPermission(context: Context) {
    viewModelScope.launch {
        // If already has root, execute test command
        if (RootAuthorizer.hasRootAccess.value) {
            executeRootCommand("id", context)
            return@launch
        }

        // Request permission
        Toast.makeText(context, "Requesting root permission", Toast.LENGTH_SHORT).show()

        RootAuthorizer.requestRootPermission { granted ->
            viewModelScope.launch {
                if (granted) {
                    Toast.makeText(context, "Root permission granted", Toast.LENGTH_SHORT).show()
                    // Execute test command
                    executeRootCommand("id", context)
                } else {
                    Toast.makeText(context, "Root permission denied", Toast.LENGTH_SHORT).show()
                }
                // Refresh status
                checkRootStatus(context)
            }
        }
    }
}
```

---

## Root 命令执行

一旦获得 root 访问权限，应用即可以提升的权限执行命令。

### 命令执行流程

```
Yes

No

executeRootCommand(cmd, context)

RootAuthorizer.executeRootCommand()

Execute in root shell

Success?

Show success toast
Display output

Show error toast
Display error

Update result text in state

Return result
```

### 执行实现

来自：

```
fun executeRootCommand(command: String, context: Context) {
    viewModelScope.launch {
        val result = RootAuthorizer.executeRootCommand(command, context)
        if (result.first) {
            Toast.makeText(context, "Command execution success", Toast.LENGTH_SHORT).show()
            stateManager.updateResultText("Command execution success:\n${result.second}")
        } else {
            Toast.makeText(context, "Command execution failed", Toast.LENGTH_SHORT).show()
            stateManager.updateResultText("Command execution failed:\n${result.second}")
        }
    }
}
```

### 返回值结构

`executeRootCommand` 方法返回一个 `Pair<Boolean, String>`：

- **第一项(Boolean)**：成功状态 - 命令执行成功时为 `true`，否则为 `false`
- **第二项(String)**：命令输出或错误消息

---

## UI 集成

root 授权系统通过多个组件与权限管理 UI 集成。

### UI 组件层次结构

```
ROOT selected

Wizard shown when needed

ShizukuDemoScreen
Main Permission Screen

PermissionLevelCard
Permission Level Selector

Permission Level Tabs
STANDARD/ACCESSIBILITY/ADMIN/DEBUGGER/ROOT

RootPermissionSection
Root-specific UI

Permission Status Items
Storage/Overlay/Battery/Location/Terminal

Root Access Status Item

RootWizardCard
Setup Wizard

Device Rooted?

Access Granted?

Request Root Button

Watch Tutorial Button
```

### Root 权限部分

`RootPermissionSection` 在选择 ROOT 权限级别时显示所有必需权限的状态：

来自：

```
AndroidPermissionLevel.ROOT -> {
    PermissionSectionContainer(
        isActive = preferredPermissionLevel.value == AndroidPermissionLevel.ROOT,
        isCurrentlyDisplayed = true,
        content = {
            RootPermissionSection(
                hasStoragePermission = hasStoragePermission,
                hasOverlayPermission = hasOverlayPermission,
                hasBatteryOptimizationExemption = hasBatteryOptimizationExemption,
                hasLocationPermission = hasLocationPermission,
                isOperitTerminalInstalled = isOperitTerminalInstalled,
                isDeviceRooted = isDeviceRooted,
                hasRootAccess = hasRootAccess,
                onStoragePermissionClick = onStoragePermissionClick,
                onOverlayPermissionClick = onOverlayPermissionClick,
                onBatteryOptimizationClick = onBatteryOptimizationClick,
                onLocationPermissionClick = onLocationPermissionClick,
                onOperitTerminalClick = onOperitTerminalClick,
                onRootClick = onRootClick
            )
        }
    )
}
```

### Root 向导卡片

`RootWizardCard` 在需要但尚未获得 root 访问权限时提供引导式设置：

来自:

```
if (needRootSetupGuide) {
    RootWizardCard(
        isDeviceRooted = uiState.isDeviceRooted.value,
        hasRootAccess = uiState.hasRootAccess.value,
        showWizard = uiState.showRootWizard.value,
        onToggleWizard = { viewModel.toggleRootWizard() },
        onRequestRoot = {
            scope.launch(Dispatchers.IO) {
                viewModel.requestRootPermission(context)
            }
        },
        onWatchTutorial = {
            try {
                val videoUrl = "https://magiskmanager.com/"
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(videoUrl))
                context.startActivity(intent)
            } catch (e: Exception) {
                Toast.makeText(context, "Cannot open root tutorial", Toast.LENGTH_SHORT).show()
            }
        }
    )
}
```

**向导在以下情况显示：**

- 用户正在浏览 ROOT 权限级别(`currentDisplayedPermissionLevel == AndroidPermissionLevel.ROOT`)
- 且设备没有 root 访问权限(`!uiState.hasRootAccess.value`)

---

## 状态管理模式

root 授权系统使用响应式状态管理模式，结合 StateFlows 和监听器。

### State Flow 架构

```
UI Components

UI State Manager

ViewModel State

RootAuthorizer State

observe

observe

updateRootStatus

collectAsState

collectAsState

isRooted
StateFlow<Boolean>

hasRootAccess
StateFlow<Boolean>

ShizukuDemoViewModel
State Properties

DemoStateManager
DemoScreenState

_uiState
MutableStateFlow

RootWizardCard

RootPermissionSection
```

### 状态更新流程

来自:

```
fun updateRootStatus(isDeviceRooted: Boolean, hasRootAccess: Boolean) {
    _uiState.update { currentState ->
        currentState.copy(
            isDeviceRooted = mutableStateOf(isDeviceRooted),
            hasRootAccess = mutableStateOf(hasRootAccess)
        )
    }

    // If device is rooted but no access, show Root wizard
    if (isDeviceRooted && !hasRootAccess) {
        _uiState.update { currentState ->
            currentState.copy(showRootWizard = mutableStateOf(true))
        }
    }
}
```

### DemoScreenState 中的状态属性

来自:

```
val isDeviceRooted: MutableState<Boolean> = mutableStateOf(false),
val hasRootAccess: MutableState<Boolean> = mutableStateOf(false),
```

---

## 与工具系统的集成

Root 授权通过 `AndroidPermissionLevel` 层次结构与更广泛的工具系统集成。

### 权限级别层次结构

```
escalates to

escalates to

escalates to

escalates to

AndroidPermissionLevel
Enum

STANDARD
Basic Android permissions

ACCESSIBILITY
Accessibility Service

ADMIN
Device Admin

DEBUGGER
Shizuku/ADB

ROOT
Root Access

Root-level Tools
System modification
Protected file access
Process management
```

### 工具注册与刷新

当权限级别更改为 ROOT 时，工具会重新注册以启用 root 级别的功能：

来自：

```
fun refreshTools(context: Context) {
    AppLogger.d("ShizukuDemoViewModel", "Refreshing all registered tools")
    // Clear current tool execution state
    toolHandler.reset()

    // Re-register all default tools
    toolHandler.registerDefaultTools()

    // Show toast notification
    viewModelScope.launch(Dispatchers.Main) {
        Toast.makeText(context, "All tools reregistered", Toast.LENGTH_SHORT).show()
    }
}
```

在中设置权限级别时调用：

```
onPermissionLevelSet = { _ ->
    // When new permission level is set, refresh tools
    scope.launch { viewModel.refreshTools(context) }
}
```

### 工具系统中的 Root 通道

从高层架构图来看，root 访问权限启用了专用的"Root 通道"用于工具执行，提供以下功能：

- **系统级文件访问**：读写受保护的系统文件
- **进程管理**：管理和终止系统进程
- **系统修改**：修改系统设置和配置
- **硬件控制**：直接访问和控制硬件

---

## Root 命令示例

系统提供用于测试和演示的 root 命令示例。

### 预定义 Root 命令

来自：

```
fun getRootSampleCommands(context: Context) =
    listOf(
        "mount -o rw,remount /system" to "Remount system partition",
        "cat /proc/version" to "Check kernel version",
        "ls -la /data" to "List data directory",
        "getenforce" to "Check SELinux status",
        "ps -A" to "List all processes",
        "cat /proc/meminfo" to "Check memory info",
        "pm list features" to "List device features",
        "dumpsys power" to "Check power status"
    )
```

### 命令分类

命令用途风险级别`mount -o rw,remount /system`以可写方式重新挂载系统分区高`cat /proc/version`读取内核版本低`ls -la /data`列出受保护的数据目录中`getenforce`检查 SELinux 强制模式低`ps -A`列出所有系统进程低`cat /proc/meminfo`读取内存信息低`pm list features`列出设备特性低`dumpsys power`检查电源管理状态低

---

## 总结

Root 授权系统通过以下方式提供全面的 root 访问管理：

1. **RootAuthorizer 单例**：集中管理 root 操作
2. **响应式状态**：基于 StateFlow 的状态传播，用于 UI 更新
3. **权限请求流程**：与 SuperUser 应用集成的交互式用户权限请求
4. **命令执行**：安全执行 root 命令并处理结果
5. **UI 集成**：基于向导的设置和权限管理界面中的状态显示
6. **工具系统集成**：授权后启用 root 级别的工具功能

该系统遵循 Android 权限提升的最佳实践，要求明确的用户同意，并在整个权限生命周期中提供清晰的状态反馈。
