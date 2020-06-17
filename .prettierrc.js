module.exports = {
    arrowParens: 'always',
    bracketSpacing: true,
    endOfLine: 'lf',
    printWidth: 100,
    quoteProps: 'consistent',
    semi: false,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'all',
    useTabs: false,
    overrides: [
        {
            files: '*.md',
            options: {
                tabWidth: 2,
            },
        },
    ],
}
