# Shizuku 集成

## 目的与范围

本文档说明了 Operit 与 Shizuku 的集成，Shizuku 是一个框架，使 Android 应用程序能够通过 ADB/root 权限使用系统 API，而无需连接 PC。Shizuku 集成是 **DEBUGGER** 权限级别的关键组件(权限系统概述见 [8.1](/AAswordman/Operit/8.1-database-architecture))，为高级系统操作提供 ADB 级别的访问权限。

有关基于 root 的权限提升，请参阅 [8.3](/AAswordman/Operit/8.3-chat-data-persistence)。有关基于无障碍的 UI 自动化，请参阅 [8.4](/AAswordman/Operit/8.4-configuration-storage)。

---

## 概述

### 什么是 Shizuku？

Shizuku 是一个第三方框架，允许 Android 应用程序通过利用 ADB(Android Debug Bridge)或 root 权限来执行系统级操作。一旦 Shizuku 运行，应用程序可以请求使用其服务的权限，从而实现通常需要以下条件的操作：

- 连接 PC 并启用 ADB
- Root 访问权限
- 系统级权限

Operit 使用 Shizuku 提供 **DEBUGGER** 级别的能力，包括：
能力描述**Shell 命令执行**使用 ADB 权限执行 shell 命令**系统设置修改**无需用户交互即可更改系统设置**应用安装/卸载**以编程方式安装或删除应用程序**文件系统访问**使用提升的权限读写系统文件**进程管理**检查和管理系统进程

### 集成架构

```
Setup & UI

Android System

Shizuku Service

Operit Application

State Change Events

AIToolHandler
Tool Registry

DebuggerFileSystemTools
Elevated File Access

ShizukuAuthorizer
Permission Manager

Shizuku Server
Privileged Process

Shizuku API
IPC Bridge

ADB Service
system_server

Shell Commands
/system/bin/sh

ShizukuDemoScreen
Setup Interface

ShizukuWizardCard
Guided Setup

ShizukuInstaller
APK Management

DemoStateManager
State Tracking
```

---

## ShizukuAuthorizer：核心集成点

`ShizukuAuthorizer` 类是 Operit 中所有 Shizuku 操作的主要接口。它提供了一个集中式 API，用于检查 Shizuku 状态、请求权限和监控状态变化。

### 主要职责

```
State Management

ShizukuAuthorizer API

isShizukuInstalled(context)
Package Detection

isShizukuServiceRunning()
Service Status

hasShizukuPermission()
Permission Check

requestShizukuPermission(callback)
Permission Request

add/removeStateChangeListener()
Event Notifications

Version Cache
clearCache()

State Change Events
Listener Invocation
```

### 使用模式

使用 `ShizukuAuthorizer` 的典型流程：

1. **检查安装**：验证 Shizuku 应用是否已安装
2. **检查服务**：确保 Shizuku 服务正在运行
3. **检查权限**：验证权限是否已授予
4. **按需请求**：如果未授予权限则请求权限
5. **监控变化**：监听状态变化

**来自 DemoStateManager 的示例：**

```
// Check Shizuku installation, running and permission status
val isShizukuInstalled = ShizukuAuthorizer.isShizukuInstalled(context)
val isShizukuRunning = ShizukuAuthorizer.isShizukuServiceRunning()
┬Ā
// Shizuku permission check
val hasShizukuPermission = if (isShizukuInstalled && isShizukuRunning) {
    ShizukuAuthorizer.hasShizukuPermission()
} else {
    false
}
```

---

## 设置与安装

### Shizuku 安装流程

Operit 为 Shizuku 提供多种安装选项：

```
No

Online

Bundled

Yes

No

Yes

No

Yes

Yes

No

User Opens
Permission Guide

Shizuku
Installed?

Display ShizukuWizardCard

Installation
Method

Open Download Link
shizuku.rikka.app

ShizukuInstaller
extractApkFromAssets()

Generate FileProvider URI
packageName.fileprovider

Launch Package Installer
Intent.ACTION_VIEW

Shizuku
Running?

Open Shizuku App
packageManager.getLaunchIntent

Permission
Granted?

ShizukuAuthorizer
requestShizukuPermission()

Update
Needed?

Show Update Option
in Wizard

Setup Complete
```

### 捆绑 APK 安装

Operit 在其资源文件中捆绑了 Shizuku APK 以供离线安装。安装过程：

**步骤 1：从资源文件中提取 APK**

```
// Extract APK from assets (ShizukuInstaller)
val apkFile = ShizukuInstaller.extractApkFromAssets(context)
if (apkFile == null) {
    // Handle extraction failure
    return
}
```

**步骤 2：生成 Content URI**

```
// Generate URI using FileProvider for Android N+
val apkUri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
    FileProvider.getUriForFile(
        context,
        "${context.packageName}.fileprovider",
        apkFile
    )
} else {
    Uri.fromFile(apkFile)
}
```

**步骤 3：启动包安装器**

```
// Create installation intent
val installIntent = Intent(Intent.ACTION_VIEW).apply {
    setDataAndType(apkUri, "application/vnd.android.package-archive")
    flags = Intent.FLAG_ACTIVITY_NEW_TASK
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
}
┬Ā
context.startActivity(installIntent)
```

### 版本管理

Operit 跟踪已安装和捆绑的 Shizuku 版本，以检测何时有可用更新：
方法用途`ShizukuInstaller.getInstalledShizukuVersion()`获取已安装 Shizuku 应用的版本代码`ShizukuInstaller.getBundledShizukuVersion()`获取 assets 中捆绑的 APK 版本代码`ShizukuInstaller.isShizukuUpdateNeeded()`比较版本并检测是否有可用更新`ShizukuInstaller.clearCache()`清除缓存的版本信息以进行全新检查
**版本缓存模式：**

```
// Cache version checks to avoid repeated PackageManager queries
val (installedVersion, bundledVersion, isUpdateNeeded) = remember(uiState.isRefreshing.value) {
    val installed = ShizukuInstaller.getInstalledShizukuVersion(context)
    val bundled = ShizukuInstaller.getBundledShizukuVersion(context)
    val needsUpdate = ShizukuInstaller.isShizukuUpdateNeeded(context)
    Triple(installed, bundled, needsUpdate)
}
```

---

## 权限管理

### 权限请求流程

Shizuku 权限独立于 Android 权限，必须显式请求：

```
User
Shizuku Service
ShizukuAuthorizer
ShizukuDemoScreen
User
Shizuku Service
ShizukuAuthorizer
ShizukuDemoScreen
alt
[Permission Granted]
[Permission Denied]
requestShizukuPermission(callback)
Request Permission
Show Permission Dialog
Grant/Deny
Permission Result
callback(granted: Boolean)
Show Success Toast
Trigger State Refresh
Show Denial Toast
```

**ShizukuDemoScreen 中的实现：**

```
onRequestPermission = {
    scope.launch {
        ShizukuAuthorizer.requestShizukuPermission { granted ->
            scope.launch(Dispatchers.Main) {
                if (granted) {
                    Toast.makeText(context,
                        context.getString(R.string.shizuku_demo_shizuku_permission_granted),
                        Toast.LENGTH_SHORT
                    ).show()
                } else {
                    Toast.makeText(context,
                        context.getString(R.string.shizuku_demo_shizuku_permission_denied),
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
            scope.launch(Dispatchers.IO) {
                viewModel.refreshStatus(context)
            }
        }
    }
}
```

### 权限状态层级

Shizuku 权限需要满足三个条件：

```
No

Yes

No

Yes

No

Yes

Check Shizuku Permission

App
Installed?

Permission: DENIED
Reason: Not Installed

Service
Running?

Permission: DENIED
Reason: Service Not Running

API Permission
Granted?

Permission: DENIED
Reason: Permission Not Granted

Permission: GRANTED
```

**在 DemoStateManager 中的实现：**

```
// Check Shizuku API_V23 permission
if (_uiState.value.isShizukuInstalled.value && _uiState.value.isShizukuRunning.value) {
    _uiState.value.hasShizukuPermission.value = ShizukuAuthorizer.hasShizukuPermission()

    if (!_uiState.value.hasShizukuPermission.value) {
        AppLogger.d(TAG, "ń╝║Õ░æShizuku API_V23µØāķÖÉ’╝īµśŠńż║ShizukuÕÉæÕ»╝ÕŹĪńēć")
        _uiState.value.showShizukuWizard.value = true
    }
} else {
    _uiState.value.hasShizukuPermission.value = false
    _uiState.value.showShizukuWizard.value = true
}
```

---

## 状态管理和监听器

### 状态变化监听器模式

`ShizukuAuthorizer` 实现了状态变化的观察者模式。组件可以注册监听器，以便在 Shizuku 状态变化时(例如服务启动/停止、权限授予/撤销)收到通知。

**监听器注册：**

```
Event Sources

ShizukuAuthorizer

Component Lifecycle

Callback

DisposableEffect(Unit)
Register Listener

onDispose
Unregister Listener

CopyOnWriteArrayList
State Change Listeners

notifyStateChanged()
Invoke All Listeners

Shizuku Service
Start/Stop

Permission
Grant/Revoke
```

**在 ShizukuDemoScreen 中的使用：**

```
// Register state change listeners
DisposableEffect(Unit) {
    val shizukuListener: () -> Unit = {
        scope.launch(Dispatchers.IO) {
            viewModel.refreshStatus(context)
        }
    }

    ShizukuAuthorizer.addStateChangeListener(shizukuListener)

    onDispose {
        ShizukuAuthorizer.removeStateChangeListener(shizukuListener)
    }
}
```

### DemoStateManager 中的状态管理

`DemoStateManager` 维护 Shizuku 状态并协调刷新：
状态字段类型描述`isShizukuInstalled``MutableState<Boolean>`Shizuku 应用是否已安装`isShizukuRunning``MutableState<Boolean>`Shizuku 服务是否正在运行`hasShizukuPermission``MutableState<Boolean>`是否已授予 API 权限`showShizukuWizard``MutableState<Boolean>`是否显示设置向导
**状态刷新逻辑：**

```
private suspend fun refreshStatusAsync() {
    _uiState.update { currentState ->
        currentState.copy(isRefreshing = mutableStateOf(true))
    }

    try {
        // Refresh permissions and status
        refreshPermissionsAndStatus(
            context = context,
            updateShizukuInstalled = { _uiState.value.isShizukuInstalled.value = it },
            updateShizukuRunning = { _uiState.value.isShizukuRunning.value = it },
            updateShizukuPermission = { _uiState.value.hasShizukuPermission.value = it },
            // ... other updates
        )

        // Additional permission checks...

        delay(300) // UI refresh delay
    } finally {
        _uiState.update { currentState ->
            currentState.copy(isRefreshing = mutableStateOf(false))
        }
    }
}
```

---

## 与权限级别的集成

### DEBUGGER 权限级别

Shizuku 是 **DEBUGGER** 权限级别的核心组件，在 Operit 的权限层级中位于 **ACCESSIBILITY** 和 **ROOT** 之间：

```
DEBUGGER Capabilities

DEBUGGER Requirements

Permission Levels

STANDARD
Basic Android Permissions

ACCESSIBILITY
+ UI Automation

ADMIN
+ Device Admin

DEBUGGER
+ ADB-level Access

ROOT
+ Root Shell Access

Shizuku Service
Running + Permission

Accessibility Service
Enabled

Standard Permissions
Storage, Overlay, etc.

DebuggerFileSystemTools
Elevated File Access

Shell Command Execution
via Shizuku

System Settings
Modification

Package Management
Install/Uninstall
```

### 条件化向导显示

设置向导根据权限级别和 Shizuku 状态显示：

```
val needShizukuSetupGuide =
    currentDisplayedPermissionLevel == AndroidPermissionLevel.DEBUGGER &&
    ((!uiState.isShizukuInstalled.value ||
        !uiState.isShizukuRunning.value ||
        !uiState.hasShizukuPermission.value) ||
        // Also show if update available
        (uiState.isShizukuInstalled.value &&
            uiState.isShizukuRunning.value &&
            uiState.hasShizukuPermission.value &&
            isUpdateNeeded))
```

---

## 设置向导 UI

### ShizukuWizardCard 组件

`ShizukuWizardCard` 提供分步引导设置界面：

```
User Actions

Wizard States

User Choice

User Choice

Help

Help

State 1:
Shizuku Not Installed

State 2:
Shizuku Not Running

State 3:
Permission Not Granted

State 4:
Update Available

State 5:
Setup Complete

Install from Online
shizuku.rikka.app

Install Bundled APK
extractApkFromAssets()

Open Shizuku App
Start Service

Request Permission
requestShizukuPermission()

Update from Bundled
Install Newer Version

Watch Tutorial
Setup Guide
```

**向导卡片实现：**

```
ShizukuWizardCard(
    isShizukuInstalled = uiState.isShizukuInstalled.value,
    isShizukuRunning = uiState.isShizukuRunning.value,
    hasShizukuPermission = uiState.hasShizukuPermission.value,
    showWizard = uiState.showShizukuWizard.value,
    onToggleWizard = { viewModel.toggleShizukuWizard() },
    onInstallFromStore = { /* Open download link */ },
    onInstallBundled = { /* Extract and install APK */ },
    onOpenShizuku = { /* Launch Shizuku app */ },
    onWatchTutorial = { /* Open setup guide */ },
    onRequestPermission = { /* Request permission */ },
    updateNeeded = isUpdateNeeded,
    onUpdateShizuku = { /* Install updated APK */ },
    installedVersion = installedVersion,
    bundledVersion = bundledVersion
)
```

### PermissionLevelCard 集成

`PermissionLevelCard` 显示 DEBUGGER 权限级别的 Shizuku 状态：

**状态显示表：**
权限项状态指示器操作存储权限✓ / ✗打开设置悬浮窗权限✓ / ✗打开设置电池优化✓ / ✗请求豁免位置权限✓ / ✗请求权限无障碍提供者✓ / ✗安装/更新提供者无障碍服务✓ / ✗启用服务**Shizuku(综合)\*\***✓ / ✗\***\*显示向导**
**Shizuku 综合状态逻辑：**

```
PermissionStatusItem(
    title = stringResource(R.string.shizuku_permission),
    isGranted = isShizukuInstalled && isShizukuRunning && hasShizukuPermission,
    onClick = onShizukuClick
)
```

---

## 在工具系统中的使用

### DebuggerFileSystemTools

Shizuku 通过 `DebuggerFileSystemTools` 实现提升的文件系统访问权限，该工具以 ADB 级别权限扩展了标准文件工具：

```
Operations

Shizuku Bridge

Tool Hierarchy

FileSystemTools
Base Interface

StandardFileSystemTools
Android File API

DebuggerFileSystemTools
Shizuku-powered

ShizukuAuthorizer
Permission Check

Shell Command Executor
via Shizuku IPC

Read System Files
/system, /data

Write System Files
Elevated Access

List Package Contents
Private Directories
```

工具注册系统检查权限级别，并根据 Shizuku 可用性注册相应的工具实现。

---

## 总结

Operit 中的 Shizuku 集成提供：

1. **ADB 级别访问**：无需连接 PC 即可执行系统操作
2. **ShizukuAuthorizer**：用于状态检查和权限请求的集中式 API
3. **自动化安装**：基于 FileProvider 的捆绑 APK 安装
4. **版本管理**：更新检测和无缝升级
5. **状态管理**：通过监听器通知进行响应式状态跟踪
6. **引导式设置**：用户友好配置的分步向导
7. **权限层级**：与 DEBUGGER 权限级别集成
8. **工具启用**：解锁提升的文件系统和 shell 访问能力

该集成通过全面的状态管理和引导式设置流程，在保持流畅用户体验的同时实现强大的系统级自动化。

**关键文件：**

- 核心：`ShizukuAuthorizer`(在整个项目中引用)
- 安装：`ShizukuInstaller`中引用
- UI：
- 状态：
- 向导：`ShizukuWizardCard`中引用
