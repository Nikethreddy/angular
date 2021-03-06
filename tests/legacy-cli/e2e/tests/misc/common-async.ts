import { readdirSync } from 'fs';
import { installPackage } from '../../utils/packages';
import { ng } from '../../utils/process';
import { appendToFile, expectFileToExist, prependToFile, replaceInFile } from '../../utils/fs';
import { expectToFail } from '../../utils/utils';

export default function () {
  // TODO(architect): The common chunk seems to have a different name in devkit/build-angular.
  // Investigate, validate, then delete this test.
  return;

  const commonFile = 'dist/test-project/common.chunk.js';
  let oldNumberOfFiles = 0;
  return (
    Promise.resolve()
      .then(() => ng('build'))
      .then(() => (oldNumberOfFiles = readdirSync('dist/test-project').length))
      .then(() => ng('generate', 'module', 'lazyA', '--routing'))
      .then(() => ng('generate', 'module', 'lazyB', '--routing'))
      .then(() =>
        prependToFile(
          'src/app/app.module.ts',
          `
      import { RouterModule } from '@angular/router';
    `,
        ),
      )
      .then(() =>
        replaceInFile(
          'src/app/app.module.ts',
          'imports: [',
          `imports: [
      RouterModule.forRoot([{ path: "lazyA", loadChildren: "./lazy-a/lazy-a.module#LazyAModule" }]),
      RouterModule.forRoot([{ path: "lazyB", loadChildren: "./lazy-b/lazy-b.module#LazyBModule" }]),
    `,
        ),
      )
      .then(() => ng('build'))
      .then(() => readdirSync('dist').length)
      .then((currentNumberOfDistFiles) => {
        if (oldNumberOfFiles >= currentNumberOfDistFiles) {
          throw new Error('A bundle for the lazy module was not created.');
        }
        oldNumberOfFiles = currentNumberOfDistFiles;
      })
      .then(() => installPackage('moment'))
      .then(() =>
        appendToFile(
          'src/app/lazy-a/lazy-a.module.ts',
          `
      import * as moment from 'moment';
      console.log(moment);
    `,
        ),
      )
      .then(() => ng('build'))
      .then(() => readdirSync('dist/test-project').length)
      .then((currentNumberOfDistFiles) => {
        if (oldNumberOfFiles != currentNumberOfDistFiles) {
          throw new Error('The build contains a different number of files.');
        }
      })
      .then(() =>
        appendToFile(
          'src/app/lazy-b/lazy-b.module.ts',
          `
      import * as moment from 'moment';
      console.log(moment);
    `,
        ),
      )
      .then(() => ng('build'))
      .then(() => expectFileToExist(commonFile))
      .then(() => readdirSync('dist/test-project').length)
      .then((currentNumberOfDistFiles) => {
        if (oldNumberOfFiles >= currentNumberOfDistFiles) {
          throw new Error(
            `The build contains the wrong number of files. The test for '${commonFile}' to exist should have failed.`,
          );
        }
        oldNumberOfFiles = currentNumberOfDistFiles;
      })
      .then(() => ng('build', '--no-common-chunk'))
      .then(() => expectToFail(() => expectFileToExist(commonFile)))
      .then(() => readdirSync('dist/test-project').length)
      .then((currentNumberOfDistFiles) => {
        if (oldNumberOfFiles <= currentNumberOfDistFiles) {
          throw new Error(
            `The build contains the wrong number of files. The test for '${commonFile}' not to exist should have failed.`,
          );
        }
      })
      // Check for AoT and lazy routes.
      .then(() => ng('build', '--aot'))
      .then(() => readdirSync('dist/test-project').length)
      .then((currentNumberOfDistFiles) => {
        if (oldNumberOfFiles != currentNumberOfDistFiles) {
          throw new Error('AoT build contains a different number of files.');
        }
      })
  );
}
