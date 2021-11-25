module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    reporters: [
        'default',
        ['jest-summary-reporter', { 'failuresOnly': false }]
    ],
    roots: ['test']
};
