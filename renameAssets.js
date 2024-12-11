const fs = require('fs').promises;
const path = require('path');

// 生成简单文件名的计数器
let fileCounter = 1;

// 检查文件名是否包含编码字符
function isEncodedFilename(filename) {
    return /_[A-F0-9]{2}_[A-F0-9]{2}_/.test(filename);
}

// 生成简单的文件名
function generateSimpleName(oldName) {
    // 保留原始扩展名
    const ext = path.extname(oldName);
    // 生成新的基础名称
    const newBaseName = `file${fileCounter}`;
    fileCounter++;
    return newBaseName + ext;
}

async function renameFiles() {
    try {
        const assetsDir = path.join(process.cwd(), 'public', 'assets');
        const gameDataPath = path.join(process.cwd(), 'src', 'data', 'gameData.js');

        // 确保文件存在
        try {
            await fs.access(gameDataPath);
            await fs.access(assetsDir);
        } catch (error) {
            console.error('错误：无法访问必要的文件或目录');
            console.error(`请确保以下路径存在：\n- ${assetsDir}\n- ${gameDataPath}`);
            return;
        }

        let gameDataContent = await fs.readFile(gameDataPath, 'utf8');
        const changes = [];
        
        async function processDirectory(dirPath) {
            const files = await fs.readdir(dirPath, { withFileTypes: true });
            
            for (const file of files) {
                const fullPath = path.join(dirPath, file.name);
                
                if (file.isDirectory()) {
                    await processDirectory(fullPath);
                } else {
                    let shouldRename = false;
                    let newName = file.name;

                    // 检查是否以下划线开头
                    if (file.name.startsWith('_')) {
                        newName = newName.substring(1);
                        shouldRename = true;
                    }

                    // 检查是否包含编码字符
                    if (isEncodedFilename(newName)) {
                        newName = generateSimpleName(newName);
                        shouldRename = true;
                    }

                    if (shouldRename) {
                        const newPath = path.join(dirPath, newName);
                        const relativePath = path.relative(assetsDir, fullPath);
                        const newRelativePath = path.relative(assetsDir, newPath);
                        
                        // 重命名文件
                        await fs.rename(fullPath, newPath);
                        
                        changes.push({
                            old: relativePath.replace(/\\/g, '/'),
                            new: newRelativePath.replace(/\\/g, '/'),
                            oldName: file.name,
                            newName: newName
                        });
                        
                        console.log(`重命名: ${file.name} -> ${newName}`);
                    }
                }
            }
        }

        // 开始处理
        await processDirectory(assetsDir);
        
        // 更新 gameData.js 中的所有路径
        changes.forEach(change => {
            const oldPathPattern = new RegExp(change.old.replace(/\./g, '\\.'), 'g');
            gameDataContent = gameDataContent.replace(oldPathPattern, change.new);
        });
        
        // 保存更新后的 gameData.js
        await fs.writeFile(gameDataPath, gameDataContent, 'utf8');
        
        console.log('\n处理完成！');
        console.log(`- 共处理 ${changes.length} 个文件`);
        console.log('- 文件重命名对照表:');
        changes.forEach(change => {
            console.log(`  ${change.oldName} -> ${change.newName}`);
        });
        console.log('- gameData.js 已更新');

    } catch (error) {
        console.error('发生错误:', error);
        console.error(error.stack);
    }
}

// 执行重命名操作
renameFiles(); 