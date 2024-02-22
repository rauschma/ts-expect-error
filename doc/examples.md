# Use cases for checking `@ts-expect-error`

This approach is similar to `assert.throws()` in that type checking doesn’t fail if everything is as expected.

## `https://exploringjs.com/tackling-ts/ch_any-unknown.html`

```ts
function func(value: unknown) {
  // @ts-expect-error: Object is of type 'unknown'.
  value.toFixed(2);

  // Type assertion:
  (value as number).toFixed(2); // OK
}
```

```ts
function func(value: unknown) {
  // @ts-expect-error: Object is of type 'unknown'.
  value * 5;

  if (value === 123) { // equality
    // %inferred-type: 123
    value;

    value * 5; // OK
  }
}
```

```ts
function func(value: unknown) {
  // @ts-expect-error: Object is of type 'unknown'.
  value.length;

  if (typeof value === 'string') { // type guard
    // %inferred-type: string
    value;

    value.length; // OK
  }
}
```

```ts
function func(value: unknown) {
  // @ts-expect-error: Object is of type 'unknown'.
  value.test('abc');

  assertIsRegExp(value);

  // %inferred-type: RegExp
  value;

  value.test('abc'); // OK
}

/** An assertion function */
function assertIsRegExp(arg: unknown): asserts arg is RegExp {
  if (! (arg instanceof RegExp)) {
    throw new TypeError('Not a RegExp: ' + arg);
  }
}
```

## `https://exploringjs.com/tackling-ts/ch_book-notation.html`

```ts
assert.throws(
  // @ts-expect-error: Object is possibly 'null'. (2531)
  () => null.myProperty,
  TypeError);
```

## `https://exploringjs.com/tackling-ts/ch_class-definitions.html`

```ts
class PersonPrivateProperty {
  private name: string;
  constructor(name: string) {
    this.name = name;
  }
  sayHello() {
    return `Hello ${this.name}!`;
  }
}

const john = new PersonPrivateProperty('John');

assert.equal(
  john.sayHello(), 'Hello John!');

// @ts-expect-error: Property 'name' is private and only accessible
// within class 'PersonPrivateProperty'. (2341)
john.name;

assert.deepEqual(
  Object.keys(john),
  ['name']);
```

```ts
class PrivatePerson {
  private name: string;
  constructor(name: string) {
    this.name = name;
  }
  sayHello() {
    return `Hello ${this.name}!`;
  }
}
class PrivateEmployee extends PrivatePerson {
  private company: string;
  constructor(name: string, company: string) {
    super(name);
    this.company = company;
  }
  sayHello() {
    // @ts-expect-error: Property 'name' is private and only
    // accessible within class 'PrivatePerson'. (2341)
    return `Hello ${this.name} from ${this.company}!`;
  }  
}
```

## `https://exploringjs.com/tackling-ts/ch_class-related-types.html`

```ts
class Color {
  name: string;
  private branded = true;
  constructor(name: string) {
    this.name = name;
  }
}
class Person {
  name: string;
  private branded = true;
  constructor(name: string) {
    this.name = name;
  }
}

const person: Person = new Person('Jane');

// @ts-expect-error: Type 'Person' is not assignable to type 'Color'.
//   Types have separate declarations of a private property
//   'branded'. (2322)
const color: Color = person;
```

## `https://exploringjs.com/tackling-ts/ch_classes-as-values.html`

```ts
interface Class<T> {
  new(...args: any[]): T;
}
function cast<T>(AnyClass: Class<T>, obj: any): T {
  if (! (obj instanceof AnyClass)) {
    throw new Error(`Not an instance of ${AnyClass.name}: ${obj}`)
  }
  return obj;
}
class TypeSafeMap {
  #data = new Map<any, any>();
  get<T>(key: Class<T>) {
    const value = this.#data.get(key);
    return cast(key, value);
  }
  set<T>(key: Class<T>, value: T): this {
    cast(key, value); // runtime check
    this.#data.set(key, value);
    return this;
  }
  has(key: any) {
    return this.#data.has(key);
  }
}
const map = new TypeSafeMap();

map.set(RegExp, /abc/);

// %inferred-type: RegExp
const re = map.get(RegExp);

// Static and dynamic error!
assert.throws(
  // @ts-expect-error: Argument of type '"abc"' is not assignable
  // to parameter of type 'Date'.
  () => map.set(Date, 'abc'));
```

```ts
interface Class<T> {
  new(...args: any[]): T;
}
abstract class Shape {
}
class Circle extends Shape {
    // ···
}

// @ts-expect-error: Type 'typeof Shape' is not assignable to type
// 'Class<Shape>'.
//   Cannot assign an abstract constructor type to a non-abstract
//   constructor type. (2322)
const shapeClasses1: Array<Class<Shape>> = [Circle, Shape];
```

## `https://exploringjs.com/tackling-ts/ch_computing-with-types-overview.html`

```ts
type ObjectTypeA = {
  propA: bigint,
  sharedProp: string,
}
type ObjectTypeB = {
  propB: boolean,
  sharedProp: string,
}

type Union = ObjectTypeA | ObjectTypeB;

function func(arg: Union) {
  // string
  arg.sharedProp;
  // @ts-expect-error: Property 'propB' does not exist on type 'Union'.
  arg.propB; // error

  if ('propB' in arg) {
    // ObjectTypeB
    arg;

    // boolean
    arg.propB;
  }
}
```

## `https://exploringjs.com/tackling-ts/ch_enum-alternatives.html`

```ts
type NoYesStrings = 'No' | 'Yes';

function toGerman2(value: NoYesStrings): string {
  switch (value) {
    case 'No':
      return 'Nein';
    case 'Yes':
      return 'Ja';
  }
}
assert.equal(toGerman2('No'), 'Nein');
assert.equal(toGerman2('Yes'), 'Ja');

// @ts-expect-error: Function lacks ending return statement and
// return type does not include 'undefined'. (2366)
function toGerman3(value: NoYesStrings): string {
  switch (value) {
    case 'Yes':
      return 'Ja';
  }
}

class UnsupportedValueError extends Error {
  constructor(value: never) {
    super('Unsupported value: ' + value);
  }
}

function toGerman4(value: NoYesStrings): string {
  switch (value) {
    case 'Yes':
      return 'Ja';
    default:
      // @ts-expect-error: Argument of type '"No"' is not
      // assignable to parameter of type 'never'. (2345)
      throw new UnsupportedValueError(value);
  }
}
```

```ts
// @ts-expect-error: A 'const' assertions can only be applied to references to enum
// members, or string, number, boolean, array, or object literals. (1355)
let letSymbol2 = Symbol('letSymbol2') as const;
```

```ts
const spanishNo = Symbol('no');
const spanishSí = Symbol('sí');
type Spanish = typeof spanishNo | typeof spanishSí;

const englishNo = Symbol('no');
const englishYes = Symbol('yes');
type English = typeof englishNo | typeof englishYes;

const spanishWord: Spanish = spanishNo;
// @ts-expect-error: Type 'unique symbol' is not assignable to type 'English'. (2322)
const englishWord: English = spanishNo;
```

```ts
interface NumberValue3 {
  kind: 'number-value';
  numberValue: number;
}
interface Addition3 {
  kind: 'addition';
  operand1: SyntaxTree3;
  operand2: SyntaxTree3;
}
type SyntaxTree3 = NumberValue3 | Addition3;

const tree: SyntaxTree3 = {
  kind: 'addition',
  operand1: {
    kind: 'number-value',
    numberValue: 1,
  },
  operand2: {
    kind: 'addition',
    operand1: {
      kind: 'number-value',
      numberValue: 2,
    },
    operand2: {
      kind: 'number-value',
      numberValue: 3,
    },
  }
};

function getNumberValue(tree: SyntaxTree3) {
  // %inferred-type: SyntaxTree3
  tree;

  // @ts-expect-error: Property 'numberValue' does not exist on type 'SyntaxTree3'.
  // Property 'numberValue' does not exist on type 'Addition3'.(2339)
  tree.numberValue;

  if (tree.kind === 'number-value') {
    // %inferred-type: NumberValue3
    tree;
    return tree.numberValue; // OK!
  }
  return null;
}
```

```ts
class Color {
  static red = new Color();
  static green = new Color();
  static blue = new Color();
}

// @ts-expect-error: Function lacks ending return statement and return type
// does not include 'undefined'. (2366)
function toGerman(color: Color): string { // (A)
  switch (color) {
    case Color.red:
      return 'rot';
    case Color.green:
      return 'grün';
    case Color.blue:
      return 'blau';
  }
}

assert.equal(toGerman(Color.blue), 'blau');
```

## `https://exploringjs.com/tackling-ts/ch_enums.html`

```ts
enum NoYes {
  No = 'No',
  Yes = 'Yes',
}
function func(x: NoYes.No) { // (A)
  return x;
}

func(NoYes.No); // OK

// @ts-expect-error: Argument of type '"No"' is not assignable to
// parameter of type 'NoYes.No'.
func('No');

// @ts-expect-error: Argument of type 'NoYes.Yes' is not assignable to
// parameter of type 'NoYes.No'.
func(NoYes.Yes);
```

```ts
enum NoYesStr {
  No = 'No',
  // @ts-expect-error: Computed values are not permitted in
  // an enum with string valued members.
  Yes = ['Y', 'e', 's'].join(''),
}
```

```ts
enum NoYes { No='No', Yes='Yes' }

console.log(NoYes.No);
console.log(NoYes.Yes);

// Output:
// 'No'
// 'Yes'

function func(noYes: NoYes) {}

// @ts-expect-error: Argument of type '"abc"' is not assignable
// to parameter of type 'NoYes'.
func('abc');

// @ts-expect-error: Argument of type '"Yes"' is not assignable
// to parameter of type 'NoYes'.
func('Yes'); // (A)
```

```ts
enum Globalness {
  Global = 'g',
  notGlobal = '',
}

function createRegExp(source: string, globalness = Globalness.notGlobal) {
  return new RegExp(source, 'u' + globalness);
}

assert.deepEqual(
  createRegExp('abc', Globalness.Global),
  /abc/ug);

assert.deepEqual(
  // @ts-expect-error: Argument of type '"g"' is not assignable to parameter of type 'Globalness | undefined'. (2345)
  createRegExp('abc', 'g'), // error
  /abc/ug);
```

```ts
enum NoYes {
  No = 'No',
  Yes = 'Yes',
}

function toGerman1(value: NoYes) {
  switch (value) {
    case NoYes.No:
      return 'Nein';
    case NoYes.Yes:
      return 'Ja';
    default:
      throw new TypeError('Unsupported value: ' + JSON.stringify(value));
  }
}

assert.throws(
  // @ts-expect-error: Argument of type '"Maybe"' is not assignable to
  // parameter of type 'NoYes'.
  () => toGerman1('Maybe'),
  /^TypeError: Unsupported value: "Maybe"$/);
```

## `https://exploringjs.com/tackling-ts/ch_special-values.html`

```ts
type StreamValue = null | string;

interface InputStream {
  getNextLine(): StreamValue;
}

function countComments(is: InputStream) {
  let commentCount = 0;
  while (true) {
    const line = is.getNextLine();
    // @ts-expect-error: Object is possibly 'null'.(2531)
    if (line.startsWith('#')) { // (A)
      commentCount++;
    }
    if (line === null) break;
  }
  return commentCount;
}
```

```ts
interface A {
  one: number;
  two: number;
}
interface B {
  three: number;
  four: number;
}
type Union = A | B;

function func(x: Union) {
  // @ts-expect-error: Property 'two' does not exist on type 'Union'.
  // Property 'two' does not exist on type 'B'.(2339)
  console.log(x.two); // error
  
  if ('one' in x) { // discriminating check
    console.log(x.two); // OK
  }
}
```

## `https://exploringjs.com/tackling-ts/ch_type-assertions.html`

```ts
const data: object = ['a', 'b', 'c']; // (A)

// @ts-expect-error: Property 'length' does not exist on type 'object'.
data.length; // (B)

assert.equal(
  (data as Array<string>).length, 3); // (C)
```

```js
type Dict = {[k:string]: any};

function getPropertyValue(dict: unknown, key: string): any {
  if (typeof dict === 'object' && dict !== null && key in dict) {
    // %inferred-type: object
    dict;

    // @ts-expect-error: Element implicitly has an 'any' type because
    // expression of type 'string' can't be used to index type '{}'.
    // [...]
    dict[key];
    
    return (dict as Dict)[key]; // (A)
  } else {
    throw new Error();
  }
}
```

```ts
const theName = 'Jane' as (null | string);

// @ts-expect-error: Object is possibly 'null'.
theName.length;

assert.equal(
  theName!.length, 4); // OK
```

```ts
class Point1 {
  // @ts-expect-error: Property 'x' has no initializer and is not definitely
  // assigned in the constructor.
  x: number;

  // @ts-expect-error: Property 'y' has no initializer and is not definitely
  // assigned in the constructor.
  y: number;

  constructor() {
    this.initProperties();
  }
  initProperties() {
    this.x = 0;
    this.y = 0;
  }
}
```

```ts
class Point1 {
  // @ts-expect-error: Property 'x' has no initializer and is not definitely
  // assigned in the constructor.
  x: number;

  // @ts-expect-error: Property 'y' has no initializer and is not definitely
  // assigned in the constructor.
  y: number;

  constructor() {
    this.initProperties();
  }
  initProperties() {
    this.x = 0;
    this.y = 0;
  }
}
```

## `https://exploringjs.com/tackling-ts/ch_type-guards-assertion-functions.html`

```ts
type FirstOrSecond =
  | {first: string}
  | {second: string};

function func(firstOrSecond: FirstOrSecond) {
  // @ts-expect-error: Property 'second' does not exist on
  // type 'FirstOrSecond'. [...]
  if (firstOrSecond.second !== undefined) {
    // ···
  }
}
```

```ts
function func(obj: object) {
  if ('name' in obj) {
    // %inferred-type: object
    obj;

    // @ts-expect-error: Property 'name' does not exist on type 'object'.
    obj.name;
  }
}
```

## `https://exploringjs.com/tackling-ts/ch_typescript-essentials.html`

```ts
// @ts-expect-error: Parameter 'num' implicitly has an 'any' type. (7006)
function toString(num) {
  return String(num);
}
```

```ts
function stringify123(callback: (num: number) => string) {
  return callback(123);
}

// @ts-expect-error: Argument of type 'NumberConstructor' is not
// assignable to parameter of type '(num: number) => string'.
//   Type 'number' is not assignable to type 'string'.(2345)
stringify123(Number);
```

```ts
function f3(): void {
  // @ts-expect-error: Type '"abc"' is not assignable to type 'void'. (2322)
  return 'abc';
}
```

```ts
// @ts-expect-error: Type 'null' is not assignable to type 'number'. (2322)
let maybeNumber: number = null;
maybeNumber = 123;
```

```ts
function stringify123(
  callback: null | ((num: number) => string)) {
  const num = 123;
  if (callback === null) { // (A)
    callback = String;
  }
  return callback(num); // (B)
}

assert.equal(
  stringify123(null),
  '123');

// @ts-expect-error: Expected 1 arguments, but got 0. (2554)
assert.throws(() => stringify123());
```

```ts
function f3(x: undefined | number) { return x }

assert.equal(f3(123), 123); // OK
assert.equal(f3(undefined), undefined); // OK

// @ts-expect-error: Expected 1 arguments, but got 0. (2554)
f3(); // can’t omit
```

## `https://exploringjs.com/tackling-ts/ch_typing-arrays.html`

```ts
function func(p: [number, number]) {
  return p;
}
// %inferred-type: number[]
const pair1 = [1, 2];

// @ts-expect-error: Argument of type 'number[]' is not assignable to
// parameter of type '[number, number]'. [...]
func(pair1);
```

```ts
// %inferred-type: number[]
const arr = [123];

// @ts-expect-error: Argument of type '"abc"' is not assignable to
// parameter of type 'number'. (2345)
arr.push('abc');
```

```ts
// %inferred-type: readonly ["igneous", "metamorphic", "sedimentary"]
const rockCategories =
  ['igneous', 'metamorphic', 'sedimentary'] as const;

// @ts-expect-error: Property 'push' does not exist on type
// 'readonly ["igneous", "metamorphic", "sedimentary"]'. (2339)
rockCategories.push('sand');
```

```ts
let arr = [1, 2] as const;

arr = [1, 2]; // OK

// @ts-expect-error: Type '3' is not assignable to type '2'. (2322)
arr = [1, 3];
```

```ts
let arr = [1, 2] as const;

// @ts-expect-error: Cannot assign to '1' because it is a read-only
// property. (2540)
arr[1] = 3;
```

```ts
const messages: [string] = ['Hello'];

// @ts-expect-error: Tuple type '[string]' of length '1' has no element
// at index '1'. (2493)
const message = messages[1];
```

## `https://exploringjs.com/tackling-ts/ch_typing-functions.html`

```ts
function trim2(str: undefined|string): string {
  // Internal type of str:
  // %inferred-type: string | undefined
  str;

  if (str === undefined) {
    return '';
  }
  return str.trim();
}

// External type of trim2:
// %inferred-type: (str: string | undefined) => string
trim2;

assert.equal(
  trim2('\n  abc \t'), 'abc');

// @ts-expect-error: Expected 1 arguments, but got 0. (2554)
trim2(); // (A)

assert.equal(
  trim2(undefined), ''); // OK!
```

```ts
function toIsoString(this: Date): string {
    return this.toISOString();
}

// @ts-expect-error: Argument of type '"abc"' is not assignable to
// parameter of type 'Date'. (2345)
assert.throws(() => toIsoString.call('abc')); // (A) error

toIsoString.call(new Date()); // (B) OK

const obj = { toIsoString };
// @ts-expect-error: The 'this' context of type
// '{ toIsoString: (this: Date) => string; }' is not assignable to
// method's 'this' of type 'Date'. [...]
assert.throws(() => obj.toIsoString()); // error
obj.toIsoString.call(new Date()); // OK
```

```ts
interface Customer {
  id: string;
  fullName: string;
}
const jane = {id: '1234', fullName: 'Jane Bond'};
const lars = {id: '5678', fullName: 'Lars Croft'};
const idToCustomer = new Map<string, Customer>([
  ['1234', jane],
  ['5678', lars],
]);

function getFullName(customerOrMap: Customer): string; // (A)
function getFullName( // (B)
  customerOrMap: Map<string, Customer>, id: string): string;
function getFullName( // (C)
  customerOrMap: Customer | Map<string, Customer>,
  id?: string
): string {
  ⎡return '';⎤// ···
}

// @ts-expect-error: Argument of type 'Map<string, Customer>' is not
// assignable to parameter of type 'Customer'. [...]
getFullName(idToCustomer); // missing ID

// @ts-expect-error: Argument of type '{ id: string; fullName: string; }'
// is not assignable to parameter of type 'Map<string, Customer>'.
// [...]
getFullName(lars, '5678'); // ID not allowed
```

```ts
interface Customer {
  id: string;
  fullName: string;
}
const jane = {id: '1234', fullName: 'Jane Bond'};
const lars = {id: '5678', fullName: 'Lars Croft'};
const idToCustomer = new Map<string, Customer>([
  ['1234', jane],
  ['5678', lars],
]);

interface GetFullName {
  (customerOrMap: Customer): string;
  (customerOrMap: Map<string, Customer>, id: string): string;
}

const getFullName: GetFullName = (
  customerOrMap: Customer | Map<string, Customer>,
  id?: string
): string => {
  if (customerOrMap instanceof Map) {
    if (id === undefined) throw new Error();
    const customer = customerOrMap.get(id);
    if (customer === undefined) {
      throw new Error('Unknown ID: ' + id);
    }
    customerOrMap = customer;
  } else {
    if (id !== undefined) throw new Error();
  }
  return customerOrMap.fullName;
}

assert.equal(
  getFullName(idToCustomer, '1234'), 'Jane Bond');

assert.equal(
  getFullName(lars), 'Lars Croft');

// @ts-expect-error: Argument of type 'Map<string, Customer>' is not assignable to parameter of type 'Customer'. [...]
assert.throws(() => getFullName(idToCustomer)); // missing ID

// @ts-expect-error: Argument of type '{ id: string; fullName: string; }' is not assignable to parameter of type 'Map<string, Customer>'. [...]
assert.throws(() => getFullName(lars, '5678')); // ID not allowed
```

```ts
// @ts-expect-error: Type '(x: string) => string' is not assignable to
// type '() => string'. (2322)
const trg3: () => string = (x: string) => 'abc';
```

## `https://exploringjs.com/tackling-ts/ch_typing-objects.html`

```ts
function func2(x: object) { }
// @ts-expect-error: Argument of type '"abc"' is not assignable to
// parameter of type 'object'. (2345)
func2('abc');
```

```ts
// @ts-expect-error: Type '() => number' is not assignable to
// type '() => string'.
//   Type 'number' is not assignable to type 'string'. (2322)
const obj1: Object = { toString() { return 123 } };
```

```ts
// @ts-expect-error: Duplicate identifier 'PersonAlias'. (2300)
type PersonAlias = {first: string};
// @ts-expect-error: Duplicate identifier 'PersonAlias'. (2300)
type PersonAlias = {last: string};
```

```ts
interface I1 {
  [key: string]: boolean;

  // @ts-expect-error: Property 'myProp' of type 'number' is not assignable
  // to string index type 'boolean'. (2411)
  myProp: number;
  
  // @ts-expect-error: Property 'myMethod' of type '() => string' is not
  // assignable to string index type 'boolean'. (2411)
  myMethod(): string;
}
```

```ts
interface Point {
  x: number;
  y: number;
}

function computeDistance(point: Point) { /*...*/ }

const obj = { x: 1, y: 2, z: 3 };
computeDistance(obj); // OK

// @ts-expect-error: Argument of type '{ x: number; y: number; z: number; }'
// is not assignable to parameter of type 'Point'.
//   Object literal may only specify known properties, and 'z' does not
//   exist in type 'Point'. (2345)
computeDistance({ x: 1, y: 2, z: 3 }); // error

computeDistance({x: 1, y: 2}); // OK
```

```ts
interface Person {
  first: string;
  middle?: string;
  last: string;
}
function computeFullName(person: Person) { /*...*/ }

// @ts-expect-error: Argument of type '{ first: string; mdidle: string;
// last: string; }' is not assignable to parameter of type 'Person'.
//   Object literal may only specify known properties, but 'mdidle'
//   does not exist in type 'Person'. Did you mean to write 'middle'?
computeFullName({first: 'Jane', mdidle: 'Cecily', last: 'Doe'});
```

```ts
interface Empty { }
interface OneProp {
  myProp: number;
}

// @ts-expect-error: Type '{ myProp: number; anotherProp: number; }' is not
// assignable to type 'OneProp'.
//   Object literal may only specify known properties, and
//   'anotherProp' does not exist in type 'OneProp'. (2322)
const a: OneProp = { myProp: 1, anotherProp: 2 };
const b: Empty = {myProp: 1, anotherProp: 2}; // OK
```

```ts
interface WithoutProperties {
  [key: string]: never;
}

// @ts-expect-error: Type 'number' is not assignable to type 'never'. (2322)
const a: WithoutProperties = { prop: 1 };
const b: WithoutProperties = {}; // OK
```

```ts
interface Point {
  x: number;
  y: number;
}

function computeDistance1(point: Point) { /*...*/ }

// @ts-expect-error: Argument of type '{ x: number; y: number; z: number; }'
// is not assignable to parameter of type 'Point'.
//   Object literal may only specify known properties, and 'z' does not
//   exist in type 'Point'. (2345)
computeDistance1({ x: 1, y: 2, z: 3 });
```

```ts
interface Incrementor {
  inc(): void
}
function createIncrementor(start = 0): Incrementor {
  return {
    // @ts-expect-error: Type '{ counter: number; inc(): void; }' is not
    // assignable to type 'Incrementor'.
    //   Object literal may only specify known properties, and
    //   'counter' does not exist in type 'Incrementor'. (2322)
    counter: start,
    inc() {
      // @ts-expect-error: Property 'counter' does not exist on type
      // 'Incrementor'. (2339)
      this.counter++;
    },
  };
}

function createIncrementor2(start = 0): Incrementor {
  return {
    counter: start,
    inc() {
      // @ts-expect-error: Property 'counter' does not exist on type
      // 'Incrementor'. (2339)
      this.counter++;
    },
  } as Incrementor;
}
```

```ts
interface Interf {
  prop1?: string;
  prop2: undefined | string; 
}

const obj1: Interf = { prop1: undefined, prop2: undefined };

const obj2: Interf = { prop2: undefined };

// @ts-expect-error: Property 'prop2' is missing in type '{}' but required
// in type 'Interf'. (2741)
const obj3: Interf = { };
```

```ts
interface MyInterface {
  readonly prop: number;
}

const obj: MyInterface = {
  prop: 1,
};

console.log(obj.prop); // OK

// @ts-expect-error: Cannot assign to 'prop' because it is a read-only
// property. (2540)
obj.prop = 2;
```
