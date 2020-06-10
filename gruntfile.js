'use strict'

var path = require('path')

module.exports = function(grunt) {
    var pkg = grunt.file.readJSON('package.json')

    var paths = {
        app: path.join(path.resolve(), '/app'),
        test: path.join(path.resolve(), '/test/**/*.js'),
    }

    var notify = {
        test: {
            options: {
                title: pkg.name + ': Test',
                message: 'Finished!',
            },
        },
        success: {
            options: {
                title: pkg.name + ': Success',
                message: '## Already! ##',
            },
        },
    }

    var shell = {
        exec: {
            command: 'node app',
        },
        verpatch: {
            command:
                'npm version --no-git-tag-version patch && git add -A && git commit -a -m "Version Patch Updated"',
        },
        verminor: {
            command:
                'npm version --no-git-tag-version minor && git add -A && git commit -a -m "Version Minor Updated"',
        },
        vermajor: {
            command:
                'npm version --no-git-tag-version major && git add -A && git commit -a -m "Version Major Updated"',
        },
        deploy: {
            command: 'npm publish',
        },
        gitflowrelease: {
            command: 'git flow release start ' + pkg.version,
        },
        gitflowreleasefinish: {
            command: 'git flow release finish -m <%= pkg.version %> ' + pkg.version,
        },
    }

    var clean = {
        src: [
            path.resolve() + '/*.log',
            path.resolve() + '/*.txt',
            path.resolve() + '/*.zip',
            path.resolve() + '/*.heapsnapshot',
        ],
    }

    var mochaTest = {
        test: {
            options: {
                reporter: 'spec',
                captureFile: 'results.txt',
                timeout: 1000,
            },
            src: ['<%= paths.test %>'],
        },
    }

    var watch = {
        debug: {
            files: ['<%= paths.app %>/**/*.js', '<%= paths.test %>'],
            tasks: ['env:debugtest', 'mochaTest', 'env:debugdev'],
        },
        js: {
            files: ['<%= paths.app %>/**/*.js', '<%= paths.test %>'],
            tasks: ['env:test', 'mochaTest', 'env:dev'],
        },
    }

    var nodemon = {
        default: {
            script: '<%= paths.app %>/index.js',
            options: {
                cwd: path.resolve(),
                watch: ['<%= paths.app %>'],
                ignore: ['node_modules'],
                delay: 1000,
                livereload: true,
            },
        },
    }

    var concurrent = {
        debug: {
            tasks: ['nodemon', 'watch:debug'],
        },
        default: {
            tasks: ['nodemon', 'watch:js'],
        },
        options: {
            logConcurrentOutput: true,
        },
    }

    grunt.initConfig({
        pkg: pkg,
        env: {
            debugdev: {
                NODE_ENV: 'development',
                DEBUG: path.basename(path.resolve()),
            },
            debugtest: {
                NODE_ENV: 'test',
                DEBUG: path.basename(path.resolve()),
            },
            dev: {
                NODE_ENV: 'development',
            },
            test: {
                NODE_ENV: 'test',
            },
        },
        mochaTest: mochaTest,
        notify: notify,
        shell: shell,
        paths: paths,
        clean: clean,
        watch: watch,
        nodemon: nodemon,
        concurrent: concurrent,
    })

    require('load-grunt-tasks')(grunt)

    grunt.registerTask('compile', ['clean'])

    grunt.registerTask('test', ['env:test', 'compile', 'mochaTest', 'notify:test'])
    grunt.registerTask('debug-test', ['env:debugtest', 'compile', 'mochaTest', 'notify:test'])

    grunt.registerTask('dev', ['compile', 'env:dev', 'notify:success', 'watch:js'])
    grunt.registerTask('debug-dev', ['compile', 'env:debugdev', 'notify:success', 'watch:debug'])

    grunt.registerTask('default', ['test', 'env:dev', 'notify:success', 'nodemon'])

    grunt.registerTask('version', ['shell:verpatch'])
    grunt.registerTask('version:minor', ['shell:verminor'])
    grunt.registerTask('version:major', ['shell:vermajor'])

    grunt.registerTask('deploy', ['test', 'shell:deploy'])

    grunt.registerTask('release', ['test', 'shell:gitflowrelease', 'notify:success'])
    grunt.registerTask('release:finish', ['shell:gitflowreleasefinish', 'deploy', 'notify:success'])
}
