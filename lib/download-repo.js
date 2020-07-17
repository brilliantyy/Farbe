const download = require('download-git-repo')
const path = require('path')
const ora = require('ora')

const repoMap = {
    'vue': 'brilliantyy/Farbe#master',
    'react': 'brilliantyy/Farbe#master',
}

module.exports = function (type, target) {
    target = path.join(target || '.', '')

    return new Promise((resolve, reject) => {
        const spinner = ora('正在下载项目模板...')
        spinner.start()

        download(repoMap[type], target, (err) => {
            if (err) {
                spinner.fail()
                reject(err)
            } else {
                spinner.succeed()
                resolve(target)
            }
        })
    })
}