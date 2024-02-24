
// @ts-expect-error: There actually is no error!
const result1 = 3 + 4;

// @ts-expect-error: Operator '+' cannot be applied to types 'boolean' and
// 'boolean'.
const result2 = false + true;