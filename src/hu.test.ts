import { fromTiles, isNormalHu, isSets, isPairs, isPairsWithHog } from './hu';
test('empty', ()=>{
  expect(fromTiles([])).toStrictEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
});
test('ones', ()=>{
  expect(fromTiles([0, 1, 2, 3])).toStrictEqual([4, 0, 0, 0, 0, 0, 0, 0, 0]);
});
test('straight', ()=>{
  expect(fromTiles([0, 4, 8, 12, 16, 20, 24, 28, 32])).toStrictEqual([1, 1, 1, 1, 1, 1, 1, 1, 1]);
});
test('qlbd', ()=>{
  expect(isNormalHu([3, 1, 1, 1, 1, 1, 1, 1, 3])).toBe(false);
})
test('qlbd1', ()=>{
  expect(isNormalHu([4, 1, 1, 1, 1, 1, 1, 1, 3])).toBe(true);
})
test('qlbd2', ()=>{
  expect(isNormalHu([3, 2, 1, 1, 1, 1, 1, 1, 3])).toBe(true);
})
test('qlbd3', ()=>{
  expect(isNormalHu([3, 1, 2, 1, 1, 1, 1, 1, 3])).toBe(true);
})
test('qlbd4', ()=>{
  expect(isNormalHu([3, 1, 1, 2, 1, 1, 1, 1, 3])).toBe(true);
})
test('qlbd5', ()=>{
  expect(isNormalHu([3, 1, 1, 1, 2, 1, 1, 1, 3])).toBe(true);
})
test('qlbd6', ()=>{
  expect(isNormalHu([3, 1, 1, 1, 1, 2, 1, 1, 3])).toBe(true);
})
test('qlbd7', ()=>{
  expect(isNormalHu([3, 1, 1, 1, 1, 1, 2, 1, 3])).toBe(true);
})
test('qlbd8', ()=>{
  expect(isNormalHu([3, 1, 1, 1, 1, 1, 1, 2, 3])).toBe(true);
})
test('qlbd9', ()=>{
  expect(isNormalHu([3, 1, 1, 1, 1, 1, 1, 1, 4])).toBe(true);
})
test('lqd', ()=>{
  expect(isNormalHu([0, 2, 2, 2, 2, 2, 2, 2, 0])).toBe(true);
})
test('sjg', ()=>{
  expect(isSets([3, 3, 3, 3, 0, 0, 0, 0, 0])).toBe(true);
})
test('stsh', ()=>{
  expect(isSets([4, 4, 4, 0, 0, 0, 0, 0, 0])).toBe(true);
})
test('sbg1', ()=>{
  expect(isSets([1, 2, 3, 3, 2, 1, 0, 0, 0])).toBe(true);
})
test('sbg2', ()=>{
  expect(isSets([1, 1, 2, 1, 2, 1, 2, 1, 1])).toBe(true);
})
test('0s0p', ()=>{
  expect(isPairs([0, 0, 0, 0, 0, 0, 0, 0, 0])).toBe(false);
})
test('1s0p', ()=>{
  expect(isPairs([3, 0, 0, 0, 0, 0, 0, 0, 0])).toBe(false);
})
test('2s0p', ()=>{
  expect(isPairs([3, 3, 0, 0, 0, 0, 0, 0, 0])).toBe(false);
})
test('3s0p', ()=>{
  expect(isPairs([3, 3, 3, 0, 0, 0, 0, 0, 0])).toBe(false);
})
test('4s0p', ()=>{
  expect(isPairs([3, 3, 3, 3, 0, 0, 0, 0, 0])).toBe(false);
})
test('5s0p', ()=>{
  expect(isPairs([3, 3, 3, 3, 3, 0, 0, 0, 0])).toBe(false);
})
test('0s1p', ()=>{
  expect(isPairs([0, 0, 0, 0, 0, 0, 0, 0, 2])).toBe(true);
})
test('1s1p', ()=>{
  expect(isPairs([3, 0, 0, 0, 0, 0, 0, 0, 2])).toBe(true);
})
test('2s1p', ()=>{
  expect(isPairs([3, 3, 0, 0, 0, 0, 0, 0, 2])).toBe(false);
})
test('3s1p', ()=>{
  expect(isPairs([3, 3, 3, 0, 0, 0, 0, 0, 2])).toBe(false);
})
test('4s1p', ()=>{
  expect(isPairs([3, 3, 3, 3, 0, 0, 0, 0, 2])).toBe(false);
})
test('5s1p', ()=>{
  expect(isPairs([3, 3, 3, 3, 3, 0, 0, 0, 2])).toBe(false);
})
test('0s2p', ()=>{
  expect(isPairs([0, 0, 0, 0, 0, 0, 0, 2, 2])).toBe(false);
})
test('1s2p', ()=>{
  expect(isPairs([3, 0, 0, 0, 0, 0, 0, 2, 2])).toBe(false);
})
test('2s2p', ()=>{
  expect(isPairs([3, 3, 0, 0, 0, 0, 0, 2, 2])).toBe(false);
})
test('3s2p', ()=>{
  expect(isPairs([3, 3, 3, 0, 0, 0, 0, 2, 2])).toBe(false);
})
test('4s2p', ()=>{
  expect(isPairs([3, 3, 3, 3, 0, 0, 0, 2, 2])).toBe(false);
})
test('5s2p', ()=>{
  expect(isPairs([3, 3, 3, 3, 3, 0, 0, 2, 2])).toBe(false);
})
test('0s3p', ()=>{
  expect(isPairs([0, 0, 0, 0, 0, 0, 2, 2, 2])).toBe(false);
})
test('1s3p', ()=>{
  expect(isPairs([3, 0, 0, 0, 0, 0, 2, 2, 2])).toBe(false);
})
test('2s3p', ()=>{
  expect(isPairs([3, 3, 0, 0, 0, 0, 2, 2, 2])).toBe(false);
})
test('3s3p', ()=>{
  expect(isPairs([3, 3, 3, 0, 0, 0, 2, 2, 2])).toBe(false);
})
test('4s3p', ()=>{
  expect(isPairs([3, 3, 3, 3, 0, 0, 2, 2, 2])).toBe(false);
})
test('5s3p', ()=>{
  expect(isPairs([3, 3, 3, 3, 3, 0, 2, 2, 2])).toBe(false);
})
test('0s4p', ()=>{
  expect(isPairs([0, 0, 0, 0, 0, 2, 2, 2, 2])).toBe(true);
})
test('1s4p', ()=>{
  expect(isPairs([3, 0, 0, 0, 0, 2, 2, 2, 2])).toBe(true);
})
test('2s4p', ()=>{
  expect(isPairs([3, 3, 0, 0, 0, 2, 2, 2, 2])).toBe(false);
})
test('3s4p', ()=>{
  expect(isPairs([3, 3, 3, 0, 0, 2, 2, 2, 2])).toBe(false);
})
test('4s4p', ()=>{
  expect(isPairs([3, 3, 3, 3, 0, 2, 2, 2, 2])).toBe(false);
})
test('5s4p', ()=>{
  expect(isPairs([3, 3, 3, 3, 3, 2, 2, 2, 2])).toBe(false);
})
test('disallow-hog-13', ()=>{
  expect(isPairs([4, 2, 2, 2, 2, 2, 0, 0, 0])).toBe(false);
});
test('allow-hog-13', ()=>{
  expect(isPairsWithHog([4, 2, 2, 2, 2, 2, 0, 0, 0])).toBe(true);
});
test('disallow-hog-16', ()=>{
  expect(isPairs([4, 2, 2, 2, 2, 2, 3, 0, 0])).toBe(false);
});
test('allow-hog-16', ()=>{
  expect(isPairsWithHog([4, 2, 2, 2, 2, 2, 3, 0, 0])).toBe(true);
});
