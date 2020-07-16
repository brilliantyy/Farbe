const fs = require('fs')
const path = require('path')

function deleteDir (dirPath) {
    const files = fs.readdirSync(dirPath)

    files.forEach(file => {
        const filePath = path.resolve(dirPath, file)
        const stat = fs.statSync(filePath)
        if (stat.isDirectory()) {
            deleteDir(filePath)
        } else {
            fs.unlinkSync(filePath)
        }
    })
    fs.rmdirSync(dirPath)
}

module.exports = deleteDir