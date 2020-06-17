let oxError = (message: string) => {
    return {
        stack: new Error().stack.replace(/^Error: (\n *at .*){2}/, message),
    }
}

/**
 * expectError
 *
 * Usage:
 *      // Expect any error
 *      expectError(() => {})
 *
 *      // Expect an error whose text matches the given pattern or regex(p)
 *      expectError(() => {}).toMatch('...')
 */
export let expectError = (actual: () => any) => {
    let errorText = ''

    try {
        actual()
    } catch (e) {
        errorText += e
    }

    if (errorText === '') {
        throw oxError('function did not throw')
    }

    const toMatchOrNotToMatch = (goal: 'match' | 'not') => (pattern: string | RegExp) => {
        let matching = !!errorText.match(pattern)
        if (goal == 'match' && !matching) {
            throw oxError(`(${errorText}), error does not match (${pattern})`)
        } else if (goal == 'not' && matching) {
            throw oxError(`(${errorText}), error DOES match (${pattern})`)
        }
    }

    return {
        not: {
            toMatch: toMatchOrNotToMatch('not'),
        },
        toMatch: toMatchOrNotToMatch('match'),
    }
}
