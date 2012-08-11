
var DBHandle = require('./db.js').DBProvider;
exports.db = new DBHandle('localhost',27017);
exports.commonArgs = {
    title:"周斌的博客",
    keywords:"技术 PHP CSS DIV jQuery MySQL NoSQL Mongodb Nodejs 网站 网站开发 PHP工程师 Java Linux Ubuntu Bink Bink2 Zerver Zerver2",
    description:"周斌的博客专门为您提供PHP Mysql C# Linux Java css javascript和等网站开发与优化技术的专业技术博客"
}
exports.functions = require('./function.js');




