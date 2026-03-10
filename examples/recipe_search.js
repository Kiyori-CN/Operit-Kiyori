/* METADATA
{
    "name": "recipe_search",
    "version": "1.0",
    "display_name": {
        "zh": "食谱搜索",
        "en": "Recipe Search"
    },
    "description": {
        "zh": "食谱搜索工具包。完整支持Spoonacular国际食谱API和ShowAPI中餐数据库（1164系列），提供全球食谱检索、详细营养分析、中国菜谱查询及第三方网页提取功能。",
        "en": "Recipe search toolkit. Full support for Spoonacular global recipes and ShowAPI Chinese recipe database (1164 series). Provides global recipe search, detailed nutrition analysis, Chinese recipe queries, and third-party web extraction."
    },
    "env": [
        {
            "name": "SPOONACULAR_API_KEY",
            "description": {
                "zh": "Spoonacular 国际食谱 API Key。申请地址：https://spoonacular.com/food-api → 注册后在控制台获取。免费版每日150次请求额度",
                "en": "Spoonacular global recipe API Key. Apply at: https://spoonacular.com/food-api → register and get from dashboard. Free tier: 150 requests/day."
            },
            "required": false
        },
        {
            "name": "SHOWAPI_APPKEY",
            "description": {
                "zh": "ShowAPI 中餐食谱 API Key（1164接口）。申请地址：https://www.showapi.com → 注册后搜索食谱开通接口。提供中国菜谱数据库",
                "en": "ShowAPI Chinese recipe API Key (1164 interface). Apply at: https://www.showapi.com → register and search for recipe API. Provides Chinese recipe database."
            },
            "required": false
        },
        {
            "name": "JINA_READER_KEY",
            "description": {
                "zh": "Jina Reader API Key（可选）。用于从第三方美食网页提取食谱内容。申请地址：https://jina.ai → 注册后获取。不配置则使用免费匿名模式（有频率限制）",
                "en": "Jina Reader API Key (optional). Used for extracting recipe content from third-party food websites. Apply at: https://jina.ai → register. Without this, uses free anonymous mode with rate limits."
            },
            "required": false
        }
    ],
    "author": "Operit Community",
    "category": "Admin",
    "enabledByDefault": false,
    "tools": [
        {
            "name": "search_global_recipe",
            "description": { 
                "zh": "搜索国际食谱。支持按食材、菜系、营养成分（如最大脂肪）、饮食习惯和过敏源进行高级检索。", 
                "en": "Search global recipes with advanced filters including ingredients, cuisine, nutrients (e.g., max fat), diet types, and intolerances." 
            },
            "parameters": [
                { 
                    "name": "query", 
                    "description": { 
                        "zh": "搜索关键词（例如：pasta, chicken salad）", 
                        "en": "Search query (e.g., pasta, chicken salad)" 
                    }, 
                    "type": "string", 
                    "required": true 
                },
                { 
                    "name": "cuisine", 
                    "description": { 
                        "zh": "菜系（例如：Italian, Chinese, Japanese）。多个值用逗号分隔表示OR关系", 
                        "en": "Cuisine type (e.g., Italian, Chinese, Japanese). Multiple values separated by commas mean OR." 
                    }, 
                    "type": "string", 
                    "required": false 
                },
                { 
                    "name": "diet", 
                    "description": { 
                        "zh": "饮食习惯（例如：vegetarian, vegan, keto, paleo）。多个值用逗号分隔", 
                        "en": "Diet types (e.g., vegetarian, vegan, keto, paleo). Multiple values separated by commas." 
                    }, 
                    "type": "string", 
                    "required": false 
                },
                { 
                    "name": "intolerances", 
                    "description": { 
                        "zh": "过敏源或不耐受成分（例如：gluten, dairy, egg）。多个值用逗号分隔", 
                        "en": "Intolerances (e.g., gluten, dairy, egg). Multiple values separated by commas." 
                    }, 
                    "type": "string", 
                    "required": false 
                },
                { 
                    "name": "maxCalories", 
                    "description": { 
                        "zh": "每份最大卡路里数", 
                        "en": "Maximum calories per serving" 
                    }, 
                    "type": "number", 
                    "required": false 
                },
                { 
                    "name": "maxFat", 
                    "description": { 
                        "zh": "每份最大脂肪含量（克）", 
                        "en": "Maximum fat per serving in grams" 
                    }, 
                    "type": "number", 
                    "required": false 
                },
                { 
                    "name": "maxCarbs", 
                    "description": { 
                        "zh": "每份最大碳水化合物含量（克）", 
                        "en": "Maximum carbohydrates per serving in grams" 
                    }, 
                    "type": "number", 
                    "required": false 
                },
                { 
                    "name": "maxProtein", 
                    "description": { 
                        "zh": "每份最大蛋白质含量（克）", 
                        "en": "Maximum protein per serving in grams" 
                    }, 
                    "type": "number", 
                    "required": false 
                },
                { 
                    "name": "number", 
                    "description": { 
                        "zh": "返回结果数量（1-100，默认10）", 
                        "en": "Number of results to return (1-100, default 10)" 
                    }, 
                    "type": "number", 
                    "required": false, 
                    "default": 10 
                }
            ]
        },
        {
            "name": "get_global_recipe_details",
            "description": { 
                "zh": "获取国际食谱的详细信息，包括完整配料清单、分步操作说明及详细营养成分报告。", 
                "en": "Get comprehensive details for a global recipe including full ingredient list, step-by-step instructions, and detailed nutrition information." 
            },
            "parameters": [
                { 
                    "name": "id", 
                    "description": { 
                        "zh": "食谱唯一标识 ID（从搜索结果中获取）", 
                        "en": "Recipe unique ID (obtained from search results)" 
                    }, 
                    "type": "number", 
                    "required": true 
                }
            ]
        },
        {
            "name": "search_chinese_recipe",
            "description": { 
                "zh": "检索地道中国菜谱。基于 ShowAPI 1164协议，支持分类或关键词查询（至少提供type或cpName）。", 
                "en": "Search authentic Chinese recipes. Based on ShowAPI 1164 protocol. Provide category (type) or name (cpName); at least one is required." 
            },
            "parameters": [
                { 
                    "name": "type", 
                    "description": { 
                        "zh": "菜谱分类（可选）。使用一级或二级分类，例如：蛋类、肉类、家常菜、川菜等。若无则需提供cpName。", 
                        "en": "Recipe category (optional). Use level-1 or level-2 categories, e.g., 蛋类, 肉类, 家常菜, 川菜. Required if no cpName." 
                    }, 
                    "type": "string", 
                    "required": false 
                },
                { 
                    "name": "cpName", 
                    "description": { 
                        "zh": "具体菜谱名称（可选）。例如：黄金鸡蛋盅、宫保鸡丁。若无则需提供type。", 
                        "en": "Specific recipe name (optional). E.g., 黄金鸡蛋盅, 宫保鸡丁. Required if no type." 
                    }, 
                    "type": "string", 
                    "required": false 
                },
                { 
                    "name": "page", 
                    "description": { 
                        "zh": "请求页数（默认1）", 
                        "en": "Page number (default 1)" 
                    }, 
                    "type": "number", 
                    "required": false, 
                    "default": 1 
                },
                { 
                    "name": "maxResults", 
                    "description": { 
                        "zh": "每页返回最大结果数（1-50，默认20）", 
                        "en": "Max results per page (1-50, default 20)" 
                    }, 
                    "type": "number", 
                    "required": false, 
                    "default": 20 
                }
            ]
        },
        {
            "name": "get_chinese_categories",
            "description": { 
                "zh": "获取中国菜谱的完整分类体系。返回三级分类结构，帮助用户选择正确的分类进行搜索。", 
                "en": "Get the complete Chinese recipe category hierarchy. Returns a three-level classification structure to help users select the correct category for searching." 
            },
            "parameters": []
        },
        {
            "name": "extract_recipe_from_url",
            "description": { 
                "zh": "从第三方美食网页链接中提取并解析食谱内容，转换为结构化的 Markdown 格式。支持大多数主流美食网站。", 
                "en": "Extract and parse recipe content from third-party food website URLs, converting to structured Markdown format. Supports most mainstream food websites." 
            },
            "parameters": [
                { 
                    "name": "url", 
                    "description": { 
                        "zh": "网页链接地址（必须是完整的 http/https URL）", 
                        "en": "Web page URL (must be a complete http/https URL)" 
                    }, 
                    "type": "string", 
                    "required": true 
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "测试食谱搜索 API 连通性。检测 Spoonacular、ShowAPI、Jina Reader 三个 API 的配置状态和可用性。验证环境变量配置、网络连通性及服务响应延迟。",
                "en": "Test recipe search API connectivity. Check configuration status and availability of Spoonacular, ShowAPI, and Jina Reader APIs. Verify environment variables, network connectivity, and service response latency."
            },
            "parameters": []
        }
    ]
}
*/

/**
 * ==============================================================================
 * 模块名称：专业食谱搜索工具包 (Recipe search toolkit)
 * ------------------------------------------------------------------------------
 * 功能概述：
 * 本模块整合了Spoonacular国际食谱API和ShowAPI中国菜谱数据库，提供：
 * 1. 全球食谱检索 - 支持多维度过滤（食材、菜系、营养、饮食习惯）
 * 2. 详细食谱信息 - 完整配料、步骤、营养分析
 * 3. 中国菜谱查询 - 地道中餐菜谱及分类体系
 * 4. 网页内容提取 - 从第三方网站解析食谱
 * 
 * 技术特性：
 * - 健壮的错误处理和环境变量验证
 * - 智能参数构建和URL编码
 * - 详细的日志记录和调试信息
 * - 结构化的Markdown输出格式
 * 
 * 版本：1.0
 * 语言：JavaScript (ES8+)
 * 更新日期：2026-02-07
 * ==============================================================================
 */

const recipe_master = (function () {

    // ==========================================================================
    // 第一部分：初始化配置
    // ==========================================================================

    const client = OkHttp.newClient();

    /**
     * 调试模式开关（可通过环境变量控制）
     */
    const DEBUG_MODE = getEnv("RECIPE_DEBUG") === "true";

    /**
     * 调试日志函数
     */
    function debugLog(message, data = null) {
        if (DEBUG_MODE) {
            console.log(`[RecipeMaster Debug] ${message}`);
            if (data) {
                console.log(JSON.stringify(data, null, 2));
            }
        }
    }

    /**
     * API 配置常量
     */
    const API_CONFIG = {
        SPOONACULAR: {
            BASE_URL: "https://api.spoonacular.com",
            ENDPOINTS: {
                SEARCH: "/recipes/complexSearch",
                DETAILS: "/recipes/{id}/information"
            }
        },
        SHOWAPI: {
            BASE_URL: "https://route.showapi.com",
            ENDPOINTS: {
                SEARCH: "/1164-1",      // 按分类查询
                SEARCH_BY_NAME: "/1164-4",  // 按关键词查询
                CATEGORIES: "/1164-2"   // 分类查询
            }
        },
        JINA: {
            BASE_URL: "https://r.jina.ai"
        }
    };

    // ==========================================================================
    // 第二部分：工具函数
    // ==========================================================================

    /**
     * 环境变量安全获取工具
     * 功能：提供灵活的环境变量验证，支持可选参数
     * 
     * @param {string} key - 环境变量名称
     * @param {boolean} required - 是否为必填项（默认true）
     * @returns {string|null} 环境变量值或null
     * @throws {Error} 当必填环境变量未配置时抛出异常
     */
    function safeGetEnv(key, required = true) {
        const value = getEnv(key);

        debugLog(`检查环境变量: ${key}`, { exists: !!value, required });

        if (!value || value.trim().length === 0) {
            if (required) {
                throw new Error(`环境变量缺失: ${key}。请在系统设置中配置此项后重试。提示：检查变量名拼写、确保值不为空。`);
            }
            return null;
        }

        return value.trim();
    }

    /**
     * 核心 HTTP 请求封装
     * 功能：统一处理 GET/POST 请求、错误处理和响应解析，支持json/form body
     * 
     * @param {string} url - 完整的请求URL
     * @param {string} method - HTTP方法（GET/POST）
     * @param {Object} headers - 请求头
     * @param {Object|null} body - 请求体（仅POST有效，form为object）
     * @param {string} bodyType - body类型（'json'或'form'，默认'json'）
     * @returns {Promise<Object>} 解析后的JSON响应
     */
    async function makeRequest(url, method = 'GET', headers = {}, body = null, bodyType = 'json') {
        debugLog(`发起HTTP请求`, { url, method, hasBody: !!body, bodyType });

        try {
            const builder = client.newRequest()
                .url(url)
                .method(method)
                .headers({
                    'User-Agent': 'RecipeMaster/1.0 (Professional Recipe Toolkit)',
                    'Accept': 'application/json',
                    ...headers
                });

            // 处理POST请求体
            if (body && method === 'POST') {
                if (bodyType === 'form') {
                    // 传递form object，让builder自动urlencode
                    builder.body(body, 'form');
                    builder.header('Content-Type', 'application/x-www-form-urlencoded');
                } else {
                    // 默认json body
                    builder.body(JSON.stringify(body), 'json');
                }
            }

            const response = await builder.build().execute();
            const content = response.content || "{}";

            debugLog(`收到HTTP响应`, { statusCode: response.statusCode, contentLength: content.length });

            // HTTP 状态码检查
            if (!response.isSuccessful()) {
                let errorDetail = content;
                try {
                    const errJson = JSON.parse(content);
                    errorDetail = errJson.message || errJson.error || content;
                } catch (e) {}
                throw new Error(`HTTP 请求失败 (状态码: ${response.statusCode}) | 详情: ${errorDetail}`);
            }

            return JSON.parse(content);

        } catch (e) {
            debugLog(`HTTP请求异常`, { error: e.message });
            throw new Error(`网络通讯异常: ${e.message}`);
        }
    }

    /**
     * HTML 标签清理工具
     * 功能：移除所有HTML标签，保留纯文本内容
     * 
     * @param {string} text - 包含HTML的文本
     * @returns {string} 清理后的纯文本
     */
    function cleanHtml(text) {
        if (!text) return "无内容描述";
        return text.replace(/<[^>]+>/g, '').trim();
    }

    /**
     * 查询参数构建工具
     * 功能：将对象转换为 URL 查询字符串，自动过滤空值
     * 
     * @param {Object} params - 参数对象
     * @returns {string} URL编码后的查询字符串
     */
    function buildQueryString(params) {
        return Object.keys(params)
            .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
    }

    /**
     * 文本截断工具
     * 功能：智能截断长文本，添加省略号
     * 
     * @param {string} text - 原始文本
     * @param {number} maxLength - 最大长度
     * @returns {string} 截断后的文本
     */
    function truncateText(text, maxLength = 200) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + "...";
    }

    // ==========================================================================
    // 第三部分：Spoonacular 国际食谱功能
    // ==========================================================================

    /**
     * 功能 1：国际食谱搜索
     * API: Spoonacular complexSearch
     * 
     * @param {Object} params - 搜索参数对象
     */
    async function searchGlobalRecipe(params) {
        try {
            debugLog('开始搜索国际食谱', params);

            // 1. 环境变量验证
            const apiKey = safeGetEnv("SPOONACULAR_API_KEY");

            // 2. 构建查询参数
            const queryParams = {
                apiKey: apiKey,
                query: params.query,
                number: params.number || 10,
                addRecipeInformation: true,
                addRecipeNutrition: false,
                fillIngredients: false
            };

            // 3. 添加可选过滤参数
            if (params.cuisine) queryParams.cuisine = params.cuisine;
            if (params.diet) queryParams.diet = params.diet;
            if (params.intolerances) queryParams.intolerances = params.intolerances;
            if (params.maxCalories) queryParams.maxCalories = params.maxCalories;
            if (params.maxFat) queryParams.maxFat = params.maxFat;
            if (params.maxCarbs) queryParams.maxCarbs = params.maxCarbs;
            if (params.maxProtein) queryParams.maxProtein = params.maxProtein;

            // 4. 构建完整URL
            const url = `${API_CONFIG.SPOONACULAR.BASE_URL}${API_CONFIG.SPOONACULAR.ENDPOINTS.SEARCH}?${buildQueryString(queryParams)}`;

            // 5. 发起请求
            const response = await makeRequest(url);
            const results = response.results || [];

            debugLog('搜索完成', { totalResults: response.totalResults, returnedResults: results.length });

            // 6. 处理空结果
            if (results.length === 0) {
                return complete({
                    success: true,
                    message: `未找到匹配的国际食谱（关键词: ${params.query}）。建议调整过滤条件或尝试其他关键词。`,
                    data: ""
                });
            }

            // 7. 格式化输出
            let output = `# 国际食谱检索结果\n\n`;
            output += `**关键词**: ${params.query}\n`;
            output += `**找到结果**: ${response.totalResults || results.length} 条食谱\n`;
            output += `**当前显示**: ${results.length} 条\n\n`;
            output += `---\n\n`;

            results.forEach((recipe, index) => {
                output += `## ${index + 1}. ${recipe.title}\n\n`;

                // 基本信息
                output += `**ID**: ${recipe.id} (使用此ID获取详情)\n`;
                output += `**准备时间**: ${recipe.readyInMinutes} 分钟\n`;
                output += `**份量**: ${recipe.servings} 份\n\n`;

                // 摘要
                if (recipe.summary) {
                    output += `**简介**: ${truncateText(cleanHtml(recipe.summary))}\n\n`;
                }

                // 菜系和饮食标签
                if (recipe.cuisines && recipe.cuisines.length > 0) {
                    output += `**菜系**: ${recipe.cuisines.join(', ')}\n\n`;
                }
                if (recipe.diets && recipe.diets.length > 0) {
                    output += `**饮食类型**: ${recipe.diets.join(', ')}\n\n`;
                }

                // 配料预览
                if (recipe.extendedIngredients && recipe.extendedIngredients.length > 0) {
                    output += `### 主要配料（预览）\n\n`;
                    recipe.extendedIngredients.slice(0, 5).forEach(ing => {
                        output += `- ${ing.name} (${ing.amount} ${ing.unit})\n`;
                    });
                    if (recipe.extendedIngredients.length > 5) {
                        output += `- ... (完整列表请获取详情)\n`;
                    }
                    output += `\n`;
                }

                // 营养预览
                if (recipe.nutrition && recipe.nutrition.nutrients) {
                    const keyNutrients = recipe.nutrition.nutrients.filter(n => 
                        ['Calories', 'Fat', 'Carbohydrates', 'Protein'].includes(n.name)
                    );
                    if (keyNutrients.length > 0) {
                        output += `### 营养预览（每份）\n\n`;
                        keyNutrients.forEach(n => {
                            output += `- ${n.name}: ${n.amount} ${n.unit}\n`;
                        });
                        output += `\n`;
                    }
                }

                // 图片
                if (recipe.image) {
                    output += `![预览图](${recipe.image})\n\n`;
                }

                output += `---\n\n`;
            });

            // 使用提示
            output += `\n**下一步**: 使用 get_global_recipe_details(id=...) 获取完整细节，包括步骤和营养分析。\n`;

            complete({
                success: true,
                message: `成功检索到 ${results.length} 条国际食谱`,
                data: output
            });

        } catch (err) {
            debugLog('搜索国际食谱失败', { error: err.message });
            complete({
                success: false,
                message: `国际食谱搜索失败: ${err.message}`,
                data: ""
            });
        }
    }

    /**
     * 功能 2：获取国际食谱详情
     * API: Spoonacular recipe information
     * 
     * @param {Object} params - 包含ID的参数对象
     */
    async function getGlobalRecipeDetails(params) {
        try {
            debugLog('开始获取国际食谱详情', params);

            // 1. 参数验证
            if (!params.id) {
                throw new Error("缺少必填参数: id（食谱ID）");
            }

            // 2. 环境变量验证
            const apiKey = safeGetEnv("SPOONACULAR_API_KEY");

            // 3. 构建URL
            const url = `${API_CONFIG.SPOONACULAR.BASE_URL}${API_CONFIG.SPOONACULAR.ENDPOINTS.DETAILS.replace('{id}', params.id)}?apiKey=${apiKey}&includeNutrition=true`;

            // 4. 发起请求
            const recipe = await makeRequest(url);

            debugLog('详情获取成功', { title: recipe.title });

            // 5. 格式化输出
            let output = `# 国际食谱详情: ${recipe.title}\n\n`;

            // 基本信息
            output += `**准备时间**: ${recipe.readyInMinutes} 分钟\n`;
            output += `**份量**: ${recipe.servings} 份\n`;
            if (recipe.cuisines && recipe.cuisines.length > 0) {
                output += `**菜系**: ${recipe.cuisines.join(', ')}\n`;
            }
            if (recipe.diets && recipe.diets.length > 0) {
                output += `**饮食类型**: ${recipe.diets.join(', ')}\n`;
            }
            if (recipe.dishTypes && recipe.dishTypes.length > 0) {
                output += `**菜品类型**: ${recipe.dishTypes.join(', ')}\n\n`;
            }

            // 简介
            if (recipe.summary) {
                output += `## 简介\n\n${cleanHtml(recipe.summary)}\n\n`;
            }

            // 配料
            if (recipe.extendedIngredients && recipe.extendedIngredients.length > 0) {
                output += `## 配料清单\n\n`;
                output += `| 配料 | 数量 | 单位 |\n`;
                output += `|------|------|------|\n`;
                recipe.extendedIngredients.forEach(ing => {
                    output += `| ${ing.name} | ${ing.amount} | ${ing.unit} |\n`;
                });
                output += `\n`;
            }

            // 步骤
            if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
                output += `## 烹饪步骤\n\n`;
                recipe.analyzedInstructions[0].steps.forEach((step, index) => {
                    output += `### 步骤 ${index + 1}\n\n${step.step}\n\n`;
                });
            }

            // 营养信息
            if (recipe.nutrition && recipe.nutrition.nutrients) {
                output += `## 营养分析（每份）\n\n`;

                // 宏营养素
                const macros = recipe.nutrition.nutrients.filter(n => 
                    ['Calories', 'Fat', 'Carbohydrates', 'Protein'].includes(n.name)
                );
                if (macros.length > 0) {
                    output += `### 宏营养素\n\n`;
                    output += `| 营养素 | 含量 | 每日推荐摄入百分比 |\n`;
                    output += `|--------|------|--------------------|\n`;
                    macros.forEach(n => {
                        output += `| ${n.name} | ${n.amount} ${n.unit} | ${n.percentOfDailyNeeds || 'N/A'}% |\n`;
                    });
                    output += `\n`;
                }

                // 维生素和矿物质
                const vitamins = recipe.nutrition.nutrients.filter(n =>
                    n.name.includes('Vitamin') ||
                    ['Calcium', 'Iron', 'Magnesium', 'Potassium', 'Zinc'].includes(n.name)
                );

                if (vitamins.length > 0) {
                    output += `### 维生素和矿物质\n\n`;
                    output += `| 营养素 | 含量 | 每日推荐摄入百分比 |\n`;
                    output += `|--------|------|--------------------|\n`;
                    vitamins.forEach(n => {
                        output += `| ${n.name} | ${n.amount} ${n.unit} | ${n.percentOfDailyNeeds || 'N/A'}% |\n`;
                    });
                    output += `\n`;
                }
            } else {
                output += `暂无详细营养信息\n\n`;
            }

            // 添加图片
            if (recipe.image) {
                output += `## 成品图\n\n`;
                output += `![${recipe.title}](${recipe.image})\n\n`;
            }

            // 来源链接
            if (recipe.sourceUrl) {
                output += `---\n\n`;
                output += `**原始来源**: [${recipe.sourceName || '查看原文'}](${recipe.sourceUrl})\n`;
            }

            complete({
                success: true,
                message: `成功获取食谱详情: ${recipe.title}`,
                data: output
            });

        } catch (err) {
            debugLog('获取详情失败', { error: err.message });
            complete({
                success: false,
                message: `获取食谱详情失败: ${err.message}`,
                data: ""
            });
        }
    }

    // ==========================================================================
    // 第四部分：ShowAPI 中国菜谱功能
    // ==========================================================================

    /**
     * 功能 3：中国菜谱搜索
     * API: ShowAPI 1164-1 或 1164-4（根据参数动态切换）
     * 
     * @param {Object} params - 搜索参数
     */
    async function searchChineseRecipe(params) {
        try {
            debugLog('开始搜索中国菜谱', params);

            // 1. 参数验证 - 至少提供type或cpName
            if ((!params.type || params.type.trim().length === 0) && (!params.cpName || params.cpName.trim().length === 0)) {
                throw new Error("缺少必填参数: 至少提供type（分类）或cpName（菜名）。");
            }

            // 2. 环境变量验证
            const appKey = safeGetEnv("SHOWAPI_APPKEY");

            debugLog('ShowAPI认证信息', { appKey: appKey.substring(0, 8) + '***' });

            // 3. 确定端点
            let endpoint = API_CONFIG.SHOWAPI.ENDPOINTS.SEARCH;
            if (!params.type && params.cpName) {
                endpoint = API_CONFIG.SHOWAPI.ENDPOINTS.SEARCH_BY_NAME;
            }

            // 4. 构建URL（appKey置于query）
            const url = `${API_CONFIG.SHOWAPI.BASE_URL}${endpoint}?appKey=${encodeURIComponent(appKey)}`;

            // 5. 构建form body object
            const formBody = {};
            if (params.type) formBody.type = params.type;
            if (params.cpName) formBody.cpName = params.cpName;
            formBody.page = params.page || 1;
            formBody.maxResults = params.maxResults || 20;

            // 6. 发起POST请求（form object）
            const response = await makeRequest(url, 'POST', {}, formBody, 'form');

            debugLog('ShowAPI响应', { resCode: response.showapi_res_code });

            // 7. 业务逻辑状态校验
            if (response.showapi_res_code !== 0) {
                let errorMsg = `ShowAPI 业务错误 (代码: ${response.showapi_res_code})`;
                errorMsg += ` | 描述: ${response.showapi_res_error || '未知错误'}`;

                if (response.showapi_res_code === -1004) {
                    errorMsg += `\n\n提示：API密钥验证失败。请检查：\n`;
                    errorMsg += `1. SHOWAPI_APPKEY 是否正确配置\n`;
                    errorMsg += `2. API密钥是否已过期或被禁用\n`;
                    errorMsg += `3. 是否已购买该接口的调用次数\n`;
                    errorMsg += `4. 登录 https://www.showapi.com/ 检查账户状态`;
                }

                throw new Error(errorMsg);
            }

            const body = response.showapi_res_body || {};
            const datas = body.datas || [];

            debugLog('解析结果', { totalNum: body.allNum, returnedNum: datas.length });

            // 8. 处理空结果
            if (datas.length === 0) {
                return complete({
                    success: true,
                    message: `未检索到匹配的中餐菜谱${params.type ? '（分类：' + params.type + '）' : ''}${params.cpName ? '（菜名：' + params.cpName + '）' : ''}。建议：1) 检查参数；2) 尝试其他关键词；3) 调用 get_chinese_categories 查看分类`,
                    data: ""
                });
            }

            // 9. 格式化输出
            let output = `# 中国菜谱检索结果\n\n`;
            if (params.type) output += `**分类**: ${params.type}\n`;
            if (params.cpName) output += `**菜名**: ${params.cpName}\n`;
            output += `**找到结果**: ${body.allNum || datas.length} 条菜谱\n`;
            output += `**当前页**: ${params.page || 1}/${body.allPage || 1}\n`;
            output += `**当前显示**: ${datas.length} 条\n\n`;
            output += `---\n\n`;

            datas.forEach((item, index) => {
                output += `## ${index + 1}. ${item.cpName}\n\n`;

                // 分类信息
                if (item.type) {
                    output += `**分类**: ${item.type}\n\n`;
                }

                // 简介
                if (item.des) {
                    output += `**简介**: ${item.des}\n\n`;
                }

                // 原料配方
                if (item.yl && item.yl.length > 0) {
                    output += `### 原料配方\n\n`;
                    item.yl.forEach(y => {
                        const unit = y.ylUnit ? ` ${y.ylUnit}` : '';
                        output += `- ${y.ylName}${unit}\n`;
                    });
                    output += `\n`;
                }

                // 烹饪步骤
                if (item.steps && item.steps.length > 0) {
                    output += `### 烹饪步骤\n\n`;
                    item.steps.forEach(step => {
                        output += `**步骤 ${step.orderNum}**: ${step.content}\n\n`;
                    });
                }

                // 厨师贴士
                if (item.tip) {
                    output += `### 厨师贴士\n\n`;
                    output += `${item.tip}\n\n`;
                }

                output += `---\n\n`;
            });

            // 分页提示
            if (body.allPage && body.allPage > 1) {
                output += `\n**分页信息**: 当前第 ${params.page || 1} 页，共 ${body.allPage} 页。可通过修改 page 参数查看其他页。\n`;
            }

            complete({
                success: true,
                message: `成功检索到 ${datas.length} 条中国菜谱`,
                data: output
            });

        } catch (err) {
            debugLog('搜索中国菜谱失败', { error: err.message });
            complete({
                success: false,
                message: `中国菜谱搜索失败: ${err.message}`,
                data: ""
            });
        }
    }

    /**
     * 功能 4：获取中国菜谱分类体系
     * API: ShowAPI 1164-2
     * 
     */
    async function getChineseCategories() {
        try {
            debugLog('开始获取中国菜谱分类');

            // 1. 环境变量验证
            const appKey = safeGetEnv("SHOWAPI_APPKEY");

            debugLog('ShowAPI认证信息', { appKey: appKey.substring(0, 8) + '***' });

            // 2. 构建URL（appKey置于query）
            const url = `${API_CONFIG.SHOWAPI.BASE_URL}${API_CONFIG.SHOWAPI.ENDPOINTS.CATEGORIES}?appKey=${encodeURIComponent(appKey)}`;

            // 3. 发起GET请求（无body）
            const response = await makeRequest(url, 'GET');

            debugLog('ShowAPI分类响应', { resCode: response.showapi_res_code });

            // 4. 业务逻辑状态校验
            if (response.showapi_res_code !== 0) {
                let errorMsg = `ShowAPI 业务错误 (代码: ${response.showapi_res_code})`;
                errorMsg += ` | 描述: ${response.showapi_res_error || '未知错误'}`;

                if (response.showapi_res_code === -1004) {
                    errorMsg += `\n\n提示：API密钥验证失败。请检查环境变量配置。`;
                }

                throw new Error(errorMsg);
            }

            const body = response.showapi_res_body || {};

            debugLog('分类数据获取成功', { categoryCount: Object.keys(body).filter(k => k !== 'ret_code' && k !== 'flag').length });

            // 5. 格式化分类树
            let output = `# 中国菜谱分类体系\n\n`;
            output += `本分类采用三级结构，使用时请选择一级或二级分类作为 type 参数。\n\n`;
            output += `---\n\n`;

            // 定义分类顺序（用于有序展示）
            const categoryOrder = [
                '热门专题',
                '蛋奶豆制品',
                '蔬菜水果',
                '水产',
                '肉类',
                '米面干果腌咸',
                '烘焙甜品饮料',
                '汤粥主食',
                '口味特色'
            ];

            // 遍历一级分类
            for (const level1 of categoryOrder) {
                if (body[level1]) {
                    output += `## ${level1}\n\n`;

                    const level2Data = body[level1];
                    for (const level2 in level2Data) {
                        output += `### ${level2}\n\n`;

                        const level3Array = level2Data[level2];
                        if (Array.isArray(level3Array) && level3Array.length > 0) {
                            // 将三级分类分组显示，每行5个
                            const chunked = [];
                            for (let i = 0; i < level3Array.length; i += 5) {
                                chunked.push(level3Array.slice(i, i + 5));
                            }
                            chunked.forEach(chunk => {
                                output += `${chunk.join(' • ')}\n\n`;
                            });
                        }
                    }

                    output += `---\n\n`;
                }
            }

            // 添加其他未列出的分类
            for (const key in body) {
                if (key !== 'ret_code' && key !== 'flag' && !categoryOrder.includes(key)) {
                    output += `## ${key}\n\n`;
                    const level2Data = body[key];
                    for (const level2 in level2Data) {
                        output += `### ${level2}\n\n`;
                        const level3Array = level2Data[level2];
                        if (Array.isArray(level3Array) && level3Array.length > 0) {
                            const chunked = [];
                            for (let i = 0; i < level3Array.length; i += 5) {
                                chunked.push(level3Array.slice(i, i + 5));
                            }
                            chunked.forEach(chunk => {
                                output += `${chunk.join(' • ')}\n\n`;
                            });
                        }
                    }
                    output += `---\n\n`;
                }
            }

            output += `\n**使用提示**:\n`;
            output += `- 搜索时使用一级分类（如"蛋奶豆制品"、"热门专题"）或二级分类（如"蛋类"、"家常菜"）作为 type 参数\n`;
            output += `- 三级分类主要用于了解更详细的子分类，不直接用作搜索参数\n`;
            output += `- 示例：search_chinese_recipe(type="蛋类") 或 search_chinese_recipe(cpName="宫保鸡丁")\n`;

            complete({
                success: true,
                message: "成功获取中国菜谱分类体系",
                data: output
            });

        } catch (err) {
            debugLog('获取分类体系失败', { error: err.message });
            complete({
                success: false,
                message: `获取分类体系失败: ${err.message}`,
                data: ""
            });
        }
    }

    // ==========================================================================
    // 第五部分：网页提取功能
    // ==========================================================================

    /**
     * 功能 5：从第三方网页提取食谱
     * 使用 Jina Reader API 进行智能内容提取
     * 
     * @param {Object} params - 包含URL的参数对象
     */
    async function extractRecipeFromUrl(params) {
        try {
            debugLog('开始提取网页食谱', params);

            // 1. 参数验证
            if (!params.url || params.url.trim().length === 0) {
                throw new Error("缺少必填参数: url（网页链接地址）");
            }

            const targetUrl = params.url.trim();

            // 2. URL 格式验证
            if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                throw new Error("URL 格式错误：必须以 http:// 或 https:// 开头");
            }

            // 3. 获取 Jina API Key（可选）
            const jinaKey = safeGetEnv("JINA_READER_KEY", false);

            debugLog('Jina配置', { hasKey: !!jinaKey, targetUrl });

            // 4. 构建请求头
            const headers = {
                'Accept': 'text/markdown'
            };

            if (jinaKey) {
                headers['Authorization'] = `Bearer ${jinaKey}`;
            }

            // 5. 构建 Jina Reader URL
            const jinaUrl = `${API_CONFIG.JINA.BASE_URL}/${targetUrl}`;

            // 6. 发起请求（使用文本模式）
            const response = await client.newRequest()
                .url(jinaUrl)
                .method('GET')
                .headers(headers)
                .build()
                .execute();

            if (!response.isSuccessful()) {
                throw new Error(`Jina Reader 解析失败 (状态码: ${response.statusCode})`);
            }

            let content = response.content || "";

            debugLog('提取完成', { contentLength: content.length });

            // 7. 处理空内容
            if (content.trim().length === 0) {
                throw new Error("提取到的内容为空，可能该网页不支持解析或需要登录访问");
            }

            // 8. 内容长度控制（防止过长）
            const maxLength = 15000;
            let truncated = false;
            if (content.length > maxLength) {
                content = content.substring(0, maxLength);
                truncated = true;
            }

            // 9. 格式化输出
            let output = `# 网页食谱提取结果\n\n`;
            output += `**来源网址**: ${targetUrl}\n`;
            output += `**提取时间**: ${new Date().toLocaleString('zh-CN')}\n`;
            if (truncated) {
                output += `**注意**: 内容过长，已截取前 ${maxLength} 字符\n`;
            }
            output += `\n---\n\n`;
            output += content;

            if (truncated) {
                output += `\n\n---\n\n`;
                output += `**内容已截断** - 如需查看完整内容，请直接访问原网页。\n`;
            }

            complete({
                success: true,
                message: `成功提取网页内容${truncated ? '（已截断）' : ''}`,
                data: output
            });

        } catch (err) {
            debugLog('提取网页失败', { error: err.message });
            complete({
                success: false,
                message: `网页提取失败: ${err.message}`,
                data: ""
            });
        }
    }

    // ==========================================================================
    // 第六部分：连通性测试
    // ==========================================================================

    /**
     * 格式化测试报告
     */
    function formatTestReport(results) {
        let report = '## 食谱搜索 API 连通性测试\n\n';
        report += '| API | 状态 | 配置 |\n';
        report += '| :--- | :--- | :--- |\n';
        
        results.forEach(r => {
            const status = r.configured ? (r.keyPreview || '已配置') : '未配置';
            report += `| ${r.name} | ${r.configured ? '✅' : '❌'} | ${status} |\n`;
        });
        
        return report;
    }

    /**
     * 测试 API 连通性
     */
    async function testRecipeAPIs() {
        const results = [];
        
        // 测试 Spoonacular
        const spoonKey = safeGetEnv("SPOONACULAR_API_KEY", false);
        results.push({
            name: 'Spoonacular (国际食谱)',
            configured: !!spoonKey,
            keyPreview: spoonKey ? `${spoonKey.substring(0, 8)}***` : null
        });
        
        // 测试 ShowAPI
        const showKey = safeGetEnv("SHOWAPI_APPKEY", false);
        results.push({
            name: 'ShowAPI (中国菜谱)',
            configured: !!showKey,
            keyPreview: showKey ? `${showKey.substring(0, 8)}***` : null
        });
        
        // 测试 Jina Reader
        const jinaKey = safeGetEnv("JINA_READER_KEY", false);
        results.push({
            name: 'Jina Reader (网页提取)',
            configured: !!jinaKey,
            keyPreview: jinaKey ? `${jinaKey.substring(0, 8)}***` : null
        });
        
        const configuredCount = results.filter(r => r.configured).length;
        const message = configuredCount === 0 
            ? '所有 API 均未配置，请在 Operit 设置 → 环境变量中添加相应密钥'
            : `已配置 ${configuredCount}/3 个 API`;
        
        return complete({
            success: configuredCount > 0,
            message: message,
            data: formatTestReport(results)
        });
    }

    // ==========================================================================
    // 第七部分：模块导出
    // ==========================================================================

    return {
        search_global_recipe: searchGlobalRecipe,
        get_global_recipe_details: getGlobalRecipeDetails,
        search_chinese_recipe: searchChineseRecipe,
        get_chinese_categories: getChineseCategories,
        extract_recipe_from_url: extractRecipeFromUrl,
        test: testRecipeAPIs
    };
})();

/**
 * ==============================================================================
 * 工具导出定义
 * ==============================================================================
 */
exports.search_global_recipe = recipe_master.search_global_recipe;
exports.get_global_recipe_details = recipe_master.get_global_recipe_details;
exports.search_chinese_recipe = recipe_master.search_chinese_recipe;
exports.get_chinese_categories = recipe_master.get_chinese_categories;
exports.extract_recipe_from_url = recipe_master.extract_recipe_from_url;
exports.test = recipe_master.test;