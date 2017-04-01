fis.match('*', {
    release: false
})

fis.match('*(jsptpl*.js)', {
    release: "$1",
    deploy: fis.plugin('local-deliver', {
        to: "dist"
    }),
    optimizer: fis.plugin('uglify-js')
})
fis.match('**{jsptpl}.min.js', {optimizer: fis.plugin('uglify-js')})
//===================== 忽略规则  ===================
fis.set('project.ignore', [
    '**/nbproject/**',
    'dist/**',
    '**/bat/**',
    'node_modules/**',
    '.git/**',
    '.svn/**',
    "**conf.js",
    '**.bat'
]);
