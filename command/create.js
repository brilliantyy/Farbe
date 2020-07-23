const path = require('path')
const glob = require('glob')
const fs = require('fs')
const inquirer = require('inquirer')
const rm = require('rimraf')
const download = require('../lib/download-repo')
const generator = require('../lib/generator')
const cwd = process.cwd()

let next = null

function createDirectory () {
    next.then(projectName => {
        return inquirer.prompt([
            {
                type: 'list',
                name: 'projectType',
                message: '请选择项目类型：',
                choices: [
                    'Vue',
                    'React'
                ]
            }
        ]).then(answer => {
            const projectType = answer.projectType
            return Promise.resolve({ projectName, projectType })
        })
    }).then(({ projectName, projectType }) => {
        if (projectName !== '.') {
            fs.mkdirSync(projectName)
        }

        // return download(projectType, projectName).then(template => {
        //     return {
        //         projectName,
        //         template,
        //         projectType
        //     }
        // })
        return Promise.resolve({ projectName, projectType })
    }).then(context => {
        return inquirer.prompt([
            {
                name: 'projectName',
                message: '项目名称',
                default: context.projectName
            },
            {
                name: 'projectVersion',
                message: '版本号',
                default: '1.0.0'
            },
            {
                name: 'projectDescription',
                message: '项目描述',
                default: `A ${context.projectType} project`
            }
        ]).then(answer => {
            // return {
            //     ...context,
            //     metaData: {
            //         ...answer
            //     }
            // }
            let next = null
            switch (context.projectType) {
                case 'Vue':
                    next = inquirer.prompt([
                        {
                            name: 'useVuex',
                            message: '是否使用 Vuex ？',
                            default: true
                        },
                        {
                            name: 'useElementUI',
                            message: '是否使用 Element-UI ？',
                            default: true
                        },
                        {
                            type: 'list',
                            name: 'apiLib',
                            message: '请选择请求库：',
                            choices: [
                                'axios',
                                'umi-request'
                            ]
                        }
                    ]).then(answer => {
                        Object.keys(answer).forEach(option => {
                            context[option] = answer[option]
                        })
                        return Promise.resolve(context)
                    })
                    break;
                case 'React':
                    next = inquirer.prompt([

                    ]).then(answer => {
                        Object.keys(answer).forEach(option => {
                            context[option] = answer[option]
                        })
                        return Promise.resolve(context)
                    })
                    break;
            }
            return next
        })
    }).then(context => {
        console.log('开始生成文件', context)

        return generator(context)
    }).then(context => {
        console.log('创建成功')
    }).catch(err => {
        console.log(err)
    })
}

module.exports = (projectName) => {
    const fileList = glob.sync('*')
    const rootName = path.basename(cwd)

    if (fileList.length) {
        const exitsSameNameDir = fileList.filter(file => {
            const fileName = path.resolve(cwd, file)
            const isDir = fs.statSync(fileName).isDirectory()
            return projectName === file && isDir 
        }).length
    
        if (!!exitsSameNameDir) {
            next = inquirer.prompt([
                {
                    name: 'isReplace',
                    message: `同名文件夹${projectName}已存在，是否覆盖？`,
                    type: 'confirm',
                    default: true
                }
            ]).then(answer => {
                if (answer.isReplace) {
                    try {
                        rm.sync(path.resolve(cwd, projectName))
                        return Promise.resolve(projectName)
                    } catch (error) {
                        return Promise.reject()
                    }
                } else {
                    return Promise.reject()
                }
            })
        } else {
            next = Promise.resolve(projectName)
        }
    
    } else if (rootName === projectName) {
        next = inquirer.prompt([
            {
                name: 'justInPlace',
                message: '项目名称与当前目录名称相同，是否直接在当前目录下创建新项目？',
                type: 'confirm',
                default: true
            }
        ]).then(answer => {
            return Promise.resolve(answer.justInPlace ? '.' : projectName)
        })
    } else {
        next = Promise.resolve(projectName)
    }

    next && createDirectory()
}