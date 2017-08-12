module.exports = function (grunt) {
    var _distPath = "../src/home/webapp/test/";
    var _confPath = "../src/home/webapp/conf";
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        exec: {
            webpack: 'webpack'
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        /* 清除临时和编译目标文件夹 */
        clean: {
            web: {
                src: [_distPath, _confPath]
            },
            options: {
                force: true
            }
        },
        copy: {
            main: {
                files: [
                    // includes files within path
//	      {expand: true, src: ['path/*'], dest: 'dest/', filter: 'isFile'},

                    // includes files within path and its sub-directories
//	      {expand: true, src: ['path/**'], dest: 'dest/'},

                    // makes all src relative to cwd
                    {expand: true, cwd: 'src/home/resources/', src: ['**'], dest: _distPath},
                    {expand: true, cwd: 'src/home/conf/', src: ['app.json'], dest: _confPath}

                    // flattens results to a single level
//	      {expand: true, flatten: true, src: ['conf/**'], dest: _distPath, filter: 'isFile'}
                ],
            },
        }
    });
    //命令行执行工具
    grunt.loadNpmTasks('grunt-exec');
    // 加载包含 "uglify" 任务的插件。
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean'); //清除工具
    grunt.loadNpmTasks('grunt-contrib-copy');

    // 默认被执行的任务列表。
    grunt.registerTask('default', ['exec', 'clean:web', 'copy']);

};