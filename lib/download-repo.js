const download = require('download-git-repo')
const path = require('path')
const ora = require('ora')

const repoMap = {
    'Vue': 'github:brilliantyy/Farbe#master',
    'React': 'brilliantyy/Farbe#master',
}

module.exports = function (type, target) {
    target = path.join(target || '.', '.tmp')

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