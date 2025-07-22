const fs = require('fs');
const path = require('path');

const articlesDir = path.join(__dirname, 'articles');
const postsJsonPath = path.join(__dirname, 'posts.json');

// 1. articlesディレクトリからマークダウンファイルの一覧を取得
const articleFiles = fs.readdirSync(articlesDir).filter(file => file.endsWith('.md'));

// 2. 各ファイルの更新日時を取得し、新しい順にソート
const posts = articleFiles.map(file => {
    const filePath = path.join(articlesDir, file);
    const stats = fs.statSync(filePath);
    return {
        file: `articles/${file}`,
        mtime: stats.mtime.getTime() // 更新日時をミリ秒で取得
    };
}).sort((a, b) => b.mtime - a.mtime); // 降順（新しいものが先頭）にソート

// 3. mtimeプロパティを削除して、最終的なJSONオブジェクトを作成
const finalPosts = posts.map(post => ({
    file: post.file
}));

// 4. posts.jsonファイルに書き出す
fs.writeFileSync(postsJsonPath, JSON.stringify(finalPosts, null, 4));

console.log(`Successfully generated posts.json with ${finalPosts.length} articles.`);
