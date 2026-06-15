import path from "node:path";
import fs from "node:fs";

const DIR_PATH = path.resolve();
const WHITE_LIST = [
    ".vitepress",
    "node_modules",
    ".idea",
    "assets",
];

const isDirectory = (path) => fs.lstatSync(path).isDirectory();
const intersections = (arr1, arr2) =>
    Array.from(new Set(arr1.filter((item) => !new Set(arr2).has(item))));

// 提取数字前缀
const getOrderFromName = (name, isIndex = false) => {
    // index 文件优先级最高，排在第一位
    if (isIndex) return 0;
    const match = name.match(/^(\d+)\./);
    return match ? parseInt(match[1]) : 999999;
};

// 清理名称中的数字前缀
const cleanName = (name, isIndex = false) => {
    if (isIndex) {
        // index.md 显示为自定义名称
        return "📖 概览";
    }
    return name.replace(/^\d+\./, "").replace(/\.md$/, "");
};

// 判断是否是 index.md
const isIndexFile = (filename) => {
    return filename === "index.md" || filename === "index";
};

// 排序函数
function sortSidebarItems(items) {
    if (!items || !items.length) return items;
    
    // 处理所有项，保存排序信息
    items.forEach(item => {
        const isIndex = item._isIndex || false;
        item._order = getOrderFromName(item.text, isIndex);
        item.text = cleanName(item.text, isIndex);
        if (item.items) {
            item.items = sortSidebarItems(item.items);
        }
    });
    
    // 按 _order 排序
    items.sort((a, b) => a._order - b._order);
    
    // 删除临时字段
    items.forEach(item => {
        delete item._order;
        delete item._isIndex;
    });
    
    return items;
}

function getList(params, path1, pathname) {
    const res = [];
    
    for (let file in params) {
        const dir = path.join(path1, params[file]);
        const isDir = isDirectory(dir);
        
        if (isDir) {
            // 读取文件夹内的内容
            const files = fs.readdirSync(dir);
            const filteredFiles = intersections(files, WHITE_LIST);
            
            // 检查文件夹内是否有 index.md
            const hasIndex = filteredFiles.some(f => isIndexFile(f));
            
            res.push({
                text: params[file],
                collapsible: true,
                items: getList(filteredFiles, dir, `${pathname}/${params[file]}`),
                _hasIndex: hasIndex,
            });
        } else {
            const name = path.basename(params[file]);
            const suffix = path.extname(params[file]);
            if (suffix !== ".md") continue;
            
            const isIndex = isIndexFile(name);
            
            res.push({
                text: name,
                link: `${pathname}/${name}`,
                _isIndex: isIndex,
            });
        }
    }
    
    return sortSidebarItems(res);
}

export const set_sidebar = (pathname) => {
    const dirPath = path.join(DIR_PATH, pathname);
    if (!fs.existsSync(dirPath)) {
        console.warn(`目录不存在: ${dirPath}`);
        return [];
    }
    
    const files = fs.readdirSync(dirPath);
    const items = intersections(files, WHITE_LIST);
    return getList(items, dirPath, pathname);
};