#!/usr/bin/env node

const program = require('commander')
const CFonts = require('cfonts')
const chalk = require('chalk')

const createProject = require('../command/create')

program.name('farbe')
        .version('0.1.0')

program.command('create <project-name>')
        .description('Create a new project into a <project-name> directory')
        .action(projectName => {
            if (!projectName) {
                program.help()
                return
            }
            showLogo()

            createProject(projectName)
        })

program.parse(process.argv)

function showLogo() {
    CFonts.say('Farbe', {
        font: 'simple',
        align: 'left',
        colors: ['yellowBright'],
        letterSpacing: 1, 
        lineHeight: 1,
        space: true,
        maxLength: '0',
    })
}
