import './setup'

const testsContext = require.context('./', true, /-test\.js$/)

// TODO uncomment and fix failing tests
// console.error = (...args) => { throw new Error('console.error was called!\n\n' + args.join(' ')) }
// console.warn = (...args) => { throw new Error('console.warn was called!\n\n' + args.join(' ')) }

testsContext.keys().forEach(testsContext)
