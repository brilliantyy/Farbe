#!/usr/bin/env node

const program = require('commander')
const path = require('path')
const glob = require('glob')
const fs = require('fs')
const CFonts = require('cfonts')
const chalk = require('chalk')
const inquirer = require('inquirer')

const deleteDir = require('../lib/delete')
const download = require('../lib/download-repo')

program.name('farbe')
        .usage('<project-name>')
        .parse(process.argv)

const projectName = program.rawArgs[2]
if (!projectName) {
    program.help()
    return
}

CFonts.say('Farbe', {
    font: 'simple',
    align: 'left',
    colors: ['yellowBright'],
    letterSpacing: 1, 
    lineHeight: 1,
    space: true,
    maxLength: '0',
})

const fileList = glob.sync('*')
let next = null
let rootName = path.basename(process.cwd())

if (fileList.length) {
    const exitsSameNameDir = fileList.filter(file => {
        const fileName = path.resolve(process.cwd(), file)
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
                deleteDir(path.resolve(process.cwd(), projectName))
                rootName = projectName
                return Promise.resolve(projectName)
            } else {
                return Promise.reject()
            }
        })
    } else {
        rootName = projectName
        next = Promise.resolve(projectName)
    }

} else if (rootName === projectName) {
    rootName = '.'
    next = inquirer.prompt([
        {
            name: 'createInCurrentDir',
            message: '项目名称与当前目录名称相同，是否直接在当前目录下创建新项目？',
            type: 'confirm',
            default: true
        }
    ]).then(answer => {
        return Promise.resolve(answer.createInCurrentDir ? '.' : projectName)
    })
} else {
    rootName = projectName
    next = Promise.resolve(projectName)
}

next && createProjectDir()

function createProjectDir () {
    next.then(projectName => {
        return inquirer.prompt([
            {
                type: 'list',
                name: 'projectType',
                message: '请选择项目类型：',
                choices: [
                    'Vue',
                    'React'
                ],
                filter: (val) => { return val.toLowerCase() }
            }
        ]).then(answer => {
            const projectType = answer.projectType
            return Promise.resolve({ projectName, projectType })
        })
    }).then(({ projectName }) => {
        if (projectName !== '.') {
            fs.mkdirSync(projectName)
        }

        return download(projectType, projectName).then(template => {
            return {
                projectName,
                template
            }
        })
    }).then(context => {
        return inquirer.prompt([
            {
                name: 'projectName',
                message: '项目名称',
                default: context.name
            },
            {
                name: 'projectVersion',
                message: '版本号',
                default: '1.0.0'
            },
            {
                name: 'projectDescription',
                message: '项目描述',
                default: ''
            }
        ]).then(answer => {

        })
    }).then(context => {
        console.log('开始生成文件')
        return generator(context)
    }).then(context => {
        console.log('创建成功')
    }).catch(err => {})
}