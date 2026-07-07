/**
 * This file is used to import all the passport strategies and export the passport instance
 * because `tsup` will not bundle the strategies if they are not imported in this file.
 */
import './jwt.strategy';
import './google.strategy';

import passport from 'passport';

export default passport;
