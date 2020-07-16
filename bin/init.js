#!/usr/bin/env node

const commander = require('commander')
const path = require('path')
const glob = require('glob')
const fs = require('fs')
const chalk = require('chalk')
const inquirer = require('inquirer')

const remove = require('../lib/remove')

commander.name('farbe create')
        .usage('<project-name>')
        .parse(process.argv)

const projectName = commander.rawArgs[2]
if (!projectName) {
    commander.help()
    return
}

const fileList = glob.sync('*')
console.log(fileList)
let next = null
let rootName = path.basename(process.cwd())

if (fileList.length) {
    const exitsSameNameDir = fileList.filter(file => {
        const fileName = path.resolve(process.cwd(), file)
        // console.log(fileName)
        const isDir = fs.statSync(fileName).isDirectory()
        return projectName === file && isDir 
    }).length

    if (!!exitsSameNameDir) {
        next = inquirer.prompt([
            {
                name: 'isReplace',
                message: `同名项目${projectName}已存在，是否覆盖？`,
                type: 'confirm',
                default: true
            }
        ]).then(answer => {
            if (answer.isReplace) {
                remove(path.resolve(process.cwd(), projectName))
                rootName = projectName
                return Promise.resolve(projectName)
            } else {
                next = null
            }
        })
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
        if (projectName !== '.') {
            fs.mkdirSync(projectName)
        }
    })
}
