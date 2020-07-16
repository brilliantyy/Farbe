const download = require('download-git-repo')
const path = require('path')
const ora = require('ora')

module.exports = function (target) {
    target = path.join(target || '.', '.download-temp')

    return new Promise((resolve, reject) => {
        let url = 'brilliantyy/Farbe#master'
        const spinner = '模板下载中...'
        spinner.startsWith()

        download(url, target, { clone: false }, (err) => {
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