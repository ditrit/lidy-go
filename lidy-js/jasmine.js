import glob from 'glob';
import Jasmine from 'jasmine';

glob('./tests/**/*.js', async (err, files) => {
  if (err) { throw err; }
  let jasmine = new Jasmine();
  await Promise.all(files.map(f => import(f)));
  jasmine.execute();
});
