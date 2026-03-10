/* METADATA
{
    "name": "medical_exam_search",
    "version": "1.0",
    "display_name": {
        "zh": "西医题库搜题",
        "en": "Medical Exam Question Search"
    },
    "description": {
        "zh": "医学题库搜题工具包。基于云服务器 66,096 题西医题库，支持关键词/语义/混合三种搜索模式，提供随机练习及题库统计功能。支持自定义 API 地址。",
        "en": "Medical exam question search toolkit. 66,096 questions with keyword/semantic/hybrid search modes, random practice, and statistics. Supports custom API URL."
    },
    "env": [
        {
            "name": "MEDICAL_EXAM_API_URL",
            "description": {
                "zh": "医学题库API地址。默认：https://xy.newapi.com.cn/api",
                "en": "Medical exam API URL. Default: https://xy.newapi.com.cn/api"
            },
            "required": false
        }
    ],
    "author": "Operit AI",
    "category": "Admin",
    "tools": [
        {
            "name": "search",
            "description": {
                "zh": "搜索医学题目。支持三种搜索模式：keyword（关键词精确匹配）、semantic（语义理解）、hybrid（混合搜索）。可按题型筛选。",
                "en": "Search medical exam questions with keyword/semantic/hybrid modes and question type filtering."
            },
            "parameters": [
                {
                    "name": "query",
                    "description": { "zh": "搜索关键词或问题描述", "en": "Search query" },
                    "type": "string",
                    "required": true
                },
                {
                    "name": "top_k",
                    "description": { "zh": "返回结果数量（1-50），默认10", "en": "Number of results (1-50). Default: 10" },
                    "type": "number",
                    "required": false,
                    "default": 10
                },
                {
                    "name": "question_type",
                    "description": { "zh": "题型筛选：单选题/多选题/判断题/填空题/简答题/名词解释", "en": "Question type filter" },
                    "type": "string",
                    "required": false
                },
                {
                    "name": "search_mode",
                    "description": { "zh": "搜索模式：keyword/semantic/hybrid，默认semantic", "en": "Search mode. Default: semantic" },
                    "type": "string",
                    "required": false,
                    "default": "semantic"
                }
            ]
        },
        {
            "name": "random",
            "description": {
                "zh": "随机获取练习题。可指定题目数量和题型，适合刷题练习。",
                "en": "Get random practice questions with optional type filtering."
            },
            "parameters": [
                {
                    "name": "count",
                    "description": { "zh": "题目数量（1-20），默认5", "en": "Number of questions (1-20). Default: 5" },
                    "type": "number",
                    "required": false,
                    "default": 5
                },
                {
                    "name": "question_type",
                    "description": { "zh": "题型筛选（可选）", "en": "Question type filter (optional)" },
                    "type": "string",
                    "required": false
                }
            ]
        },
        {
            "name": "get_stats",
            "description": {
                "zh": "获取题库统计信息。返回总题数、文件数、索引状态等。",
                "en": "Get knowledge base statistics including total questions, files, and index status."
            },
            "parameters": []
        },
        {
            "name": "test",
            "description": {
                "zh": "API 连通性测试。验证题库服务器是否可访问，返回延迟和服务状态。",
                "en": "API connectivity test. Verifies server accessibility and returns latency and service status."
            },
            "parameters": []
        }
    ]
}
*/

const MedicalExamSearch = (function () {
    // =========================================================================
    // 配置与常量
    // =========================================================================
    const http = OkHttp.newClient();
    const LOG_TAG = '[MedicalExam]';
    
    const VALID_QUESTION_TYPES = ['单选题', '多选题', '判断题', '填空题', '简答题', '名词解释'];
    const VALID_SEARCH_MODES = ['keyword', 'semantic', 'hybrid'];
    
    const MODE_LABELS = {
        'keyword': '关键词搜索（精确匹配）',
        'semantic': '语义搜索（智能理解）',
        'hybrid': '混合搜索（精确+语义）'
    };

    // =========================================================================
    // 工具函数
    // =========================================================================
    function getApiBase() {
        const envUrl = (typeof getEnv === 'function') ? getEnv('MEDICAL_EXAM_API_URL') : undefined;
        return (envUrl && envUrl.trim()) ? envUrl.trim().replace(/\/+$/, '') : 'https://xy.newapi.com.cn/api';
    }

    function clamp(value, min, max, defaultVal) {
        if (value === undefined || value === null || isNaN(value)) return defaultVal;
        const num = Math.floor(Number(value));
        return Math.max(min, Math.min(max, num));
    }

    function truncate(text, maxLen) {
        if (!text || text.length <= maxLen) return text || '';
        return text.substring(0, maxLen) + '...';
    }

    // =========================================================================
    // HTTP 请求
    // =========================================================================
    async function httpRequest(method, endpoint, body) {
        const url = getApiBase() + endpoint;
        
        try {
            const reqBuilder = http.newRequest()
                .url(url)
                .method(method)
                .header('Content-Type', 'application/json')
                .header('Accept', 'application/json');
            
            if (body) {
                reqBuilder.body(JSON.stringify(body), 'json');
            }
            
            const response = await reqBuilder.build().execute();
            
            if (!response.isSuccessful()) {
                const errText = response.text().substring(0, 500);
                throw new Error(`HTTP ${response.statusCode()}: ${errText}`);
            }
            
            return response.json();
        } catch (e) {
            throw new Error(`请求失败: ${e.message}`);
        }
    }

    // =========================================================================
    // 结果格式化
    // =========================================================================
    function formatSearchResults(data, query) {
        const { results, search_mode, stats } = data;
        
        const lines = [
            `## 医学题库搜索结果`,
            ``,
            `**查询**: ${query}`,
            `**搜索模式**: ${MODE_LABELS[search_mode] || search_mode}`,
            `**耗时**: ${stats.time_ms}ms | **找到**: ${stats.found}/${stats.total_questions}题`,
            ``
        ];
        
        if (!results || results.length === 0) {
            lines.push('未找到相关题目。建议：');
            lines.push('- 更换搜索关键词');
            lines.push('- 切换搜索模式');
            lines.push('- 取消题型筛选');
            return lines.join('\n');
        }
        
        lines.push(`---`);
        lines.push(``);
        
        results.forEach((item, index) => {
            const scoreDisplay = (item.score * 100).toFixed(1) + '%';
            
            lines.push(`### ${index + 1}. ${item.question_type} | 匹配度: ${scoreDisplay}`);
            lines.push(``);
            
            if (item.context_before) {
                lines.push(`[前文] ${truncate(item.context_before, 150)}`);
                lines.push(``);
            }
            
            lines.push(item.content);
            
            if (item.context_after) {
                lines.push(``);
                lines.push(`[后文] ${truncate(item.context_after, 150)}`);
            }
            
            if (item.source) {
                lines.push(``);
                lines.push(`> 来源: ${item.source}`);
            }
            
            lines.push(``);
            lines.push(`---`);
            lines.push(``);
        });
        
        return lines.join('\n');
    }

    function formatRandomResults(data) {
        const { results } = data;
        
        const lines = [
            `## 随机练习题`,
            ``,
            `**题目数量**: ${results.length}`,
            ``,
            `---`,
            ``
        ];
        
        results.forEach((item, index) => {
            lines.push(`### ${index + 1}. ${item.question_type}`);
            lines.push(``);
            lines.push(item.content);
            
            if (item.source) {
                lines.push(``);
                lines.push(`> 来源: ${item.source}`);
            }
            
            lines.push(``);
            lines.push(`---`);
            lines.push(``);
        });
        
        return lines.join('\n');
    }

    function formatStats(data) {
        const lines = [
            `## 医学题库统计`,
            ``,
            `- **总题数**: ${data.total_questions}`,
            `- **源文件数**: ${data.total_files}`,
            `- **索引状态**: ${data.optimized ? '✅ 已优化' : '⬜ 未优化'}`,
            `- **向量维度**: ${data.vector_dim}`
        ];
        
        return lines.join('\n');
    }

    // =========================================================================
    // 核心业务逻辑
    // =========================================================================
    async function searchCore(params) {
        const query = params.query;
        if (!query || !query.trim()) {
            throw new Error("参数 'query' 不能为空");
        }
        
        const top_k = clamp(params.top_k, 1, 50, 10);
        const question_type = params.question_type && VALID_QUESTION_TYPES.includes(params.question_type) 
            ? params.question_type 
            : '';
        const search_mode = params.search_mode && VALID_SEARCH_MODES.includes(params.search_mode)
            ? params.search_mode
            : 'semantic';
        
        if (typeof sendIntermediateResult === 'function') {
            sendIntermediateResult({ success: true, message: '正在搜索题目...' });
        }
        
        const data = await httpRequest('POST', '/search', {
            query: query.trim(),
            top_k,
            question_type,
            search_mode
        });
        
        return {
            success: true,
            message: `找到 ${data.results ? data.results.length : 0} 条结果`,
            data: formatSearchResults(data, query),
            raw_data: data
        };
    }

    async function randomCore(params) {
        const count = clamp(params.count, 1, 20, 5);
        const question_type = params.question_type && VALID_QUESTION_TYPES.includes(params.question_type)
            ? params.question_type
            : '';
        
        const queryParams = new URLSearchParams();
        queryParams.append('count', count);
        if (question_type) {
            queryParams.append('question_type', question_type);
        }
        
        const url = getApiBase() + '/random?' + queryParams.toString();
        
        try {
            const response = await http.newRequest()
                .url(url)
                .method('GET')
                .header('Accept', 'application/json')
                .build().execute();
            
            if (!response.isSuccessful()) {
                throw new Error(`HTTP ${response.statusCode()}`);
            }
            
            const data = response.json();
            
            return {
                success: true,
                message: `获取 ${data.results ? data.results.length : 0} 道随机题目`,
                data: formatRandomResults(data),
                raw_data: data
            };
        } catch (e) {
            throw new Error(`随机题目获取失败: ${e.message}`);
        }
    }

    async function getStatsCore(params) {
        const url = getApiBase() + '/stats';
        
        try {
            const response = await http.newRequest()
                .url(url)
                .method('GET')
                .header('Accept', 'application/json')
                .build().execute();
            
            if (!response.isSuccessful()) {
                throw new Error(`HTTP ${response.statusCode()}`);
            }
            
            const data = response.json();
            
            return {
                success: true,
                message: `题库共 ${data.total_questions} 题`,
                data: formatStats(data),
                raw_data: data
            };
        } catch (e) {
            throw new Error(`统计信息获取失败: ${e.message}`);
        }
    }

    // =========================================================================
    // 连通性测试
    // =========================================================================
    async function testCore() {
        const url = getApiBase() + '/stats';
        const start = Date.now();
        try {
            const response = await http.newRequest()
                .url(url)
                .method('GET')
                .header('Accept', 'application/json')
                .build().execute();
            const latency = Date.now() - start;
            if (response.isSuccessful()) {
                const data = response.json();
                complete({
                    success: true,
                    message: `✅ 题库服务器连通正常 | 延迟 ${latency}ms | 共 ${data.total_questions || '?'} 题`,
                    data: { latency_ms: latency, api_base: getApiBase(), total_questions: data.total_questions }
                });
            } else {
                complete({ success: false, message: `⚠️ 服务器响应异常: HTTP ${response.statusCode()} | 延迟 ${latency}ms` });
            }
        } catch (e) {
            complete({ success: false, message: `❌ 连接失败: ${e.message} | API 地址: ${getApiBase()}` });
        }
    }

    // =========================================================================
    // Wrapper（统一错误处理）
    // =========================================================================
    async function wrap(func, params, label) {
        try {
            const result = await func(params || {});
            complete(result);
        } catch (error) {
            console.error(`${LOG_TAG} ${label} 失败: ${error.message}`);
            complete({
                success: false,
                message: `${label} 失败: ${error.message}`,
                error_stack: error.stack
            });
        }
    }

    // =========================================================================
    // 公开接口
    // =========================================================================
    return {
        search:    function (p) { return wrap(searchCore, p, '题目搜索'); },
        random:    function (p) { return wrap(randomCore, p, '随机练习'); },
        get_stats: function (p) { return wrap(getStatsCore, p, '统计查询'); },
        test:      function ()  { return testCore(); }
    };
})();

// =========================================================================
// 模块导出
// =========================================================================
exports.search    = MedicalExamSearch.search;
exports.random    = MedicalExamSearch.random;
exports.get_stats = MedicalExamSearch.get_stats;
exports.test      = MedicalExamSearch.test;
