interface Point {
  x: number;
  y: number;
}

function computeDistance(_point: Point) { /*...*/ }

const obj = { x: 1, y: 2, z: 3 };
computeDistance(obj); // OK

//@ts-expect-error: Object literal may only specify known properties, and
// 'z' does not exist in type 'Point'. (2353)
computeDistance({ x: 1, y: 2, z: 3 });

computeDistance({x: 1, y: 2}); // OK
