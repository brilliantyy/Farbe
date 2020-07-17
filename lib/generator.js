const fs = require('fs')
const path = require('path')
const rm = require('rimraf').sync
const Metalsmith = require('metalsmith')
const Handlebars = require('handlebars')
const deleteDir = require('../delete')

module.exports = (context) => {
    const metaData = context.metaData
    const src = context.template
    const dest = './' + context.projectName

    if (!src) {
        return Promise.reject(new Error('无效的source'))
    }

    return new Promise((resolve, reject) => {
        const metalsmith = Metalsmith(process.cwd())
            .metadata(metaData)
            .clean(false)
            .source(src)
            .destination(dest)

        metalsmith.use((files, metalsmith, done) => {
            const meta = metalsmith.metadata()
            Object.keys(files).forEach(fileName => {
                if (fileName.split('.').pop().toLowerCase() !== 'png') {
                    const t = files[fileName].contents.toString()
                    files[fileName].contents = new Buffer.from(Handlebars.compile(t)(meta), 'UTF-8')
                }
            })
            done()
        }).build(err => {
            rm(src)
            err ? reject(err) : resolve(context)
        })   
    })
}

