/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { ArchitectCommand } from '../models/architect-command';
import { Arguments } from '../models/interface';
import { Schema as DeployCommandSchema } from './deploy';

const BuilderMissing = `
Cannot find "deploy" target for the specified project.

You should add a package that implements deployment capabilities for your
favorite platform.

For example:
  ng add @angular/fire
  ng add @azure/ng-deploy

Find more packages on npm https://www.npmjs.com/search?q=ng%20deploy
`;

export class DeployCommand extends ArchitectCommand<DeployCommandSchema> {
  public override readonly target = 'deploy';
  public override readonly missingTargetError = BuilderMissing;

  public override async initialize(
    options: DeployCommandSchema & Arguments,
  ): Promise<number | void> {
    if (!options.help) {
      return super.initialize(options);
    }
  }
}
