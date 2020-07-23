const rm = require('rimraf').sync
const Metalsmith = require('metalsmith')
const Handlebars = require('handlebars')

module.exports = (context) => {
    const { metaData, template, projectName } = context
    const dest = './' + projectName

    if (!template) {
        return Promise.reject(new Error('无效的模板数据'))
    }

    return new Promise((resolve, reject) => {
        const metalsmith = Metalsmith(process.cwd())
            .metadata(metaData)
            .clean(false)
            .source(template)
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
            rm(template)
            err ? reject(err) : resolve(context)
        })   
    })
}

