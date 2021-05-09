import { Ping } from './ping';

test('ping 127.0.0.1', async () => {
  const res =  await Ping.probe('127.0.0.1');
  expect(res.alive).toBeTruthy();
});
